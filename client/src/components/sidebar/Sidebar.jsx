import React, { useState, useEffect, useContext } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaCrown,
  FaUserFriends,
  FaHandshake,
  FaGlobe,
  FaMobileAlt,
} from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";

// Flag images
const BD_FLAG = "https://flagcdn.com/w320/bd.png";
const US_FLAG = "https://flagcdn.com/w320/us.png";

// APK Download URL
const APK_FILE = "https://bir75.com/Bir75.apk";

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen,
  onCategorySelect, 
  onExpandAndActivate, 
  activeCategory,
  externalActiveMenu
}) => {
  const { t, language, changeLanguage } = useContext(LanguageContext);
  const isBangla = language?.code === "bn";
  
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showMobileAppBanner, setShowMobileAppBanner] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Check if device is mobile
  const isMobileDevice = () => window.innerWidth < 768;

  // Check if mobile app banner should be shown
  const checkBannerVisibility = () => {
    if (!isMobileDevice()) return false;
    const bannerHiddenUntil = localStorage.getItem("mobileAppBannerHiddenUntil");
    const downloadHiddenUntil = localStorage.getItem("mobileAppDownloadHiddenUntil");
    if (downloadHiddenUntil && Date.now() < parseInt(downloadHiddenUntil)) return false;
    if (bannerHiddenUntil && Date.now() < parseInt(bannerHiddenUntil)) return false;
    return true;
  };

  // Download APK file
  const downloadFileAtURL = (url) => {
    const fileName = url.split("/").pop();
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
  };

  // Close mobile app banner
  const handleCloseBanner = () => {
    const hideUntil = Date.now() + 10 * 60 * 1000; // 10 minutes
    localStorage.setItem("mobileAppBannerHiddenUntil", hideUntil.toString());
    setShowMobileAppBanner(false);
  };

  // Handle Chrome browser opening
  const handleOpenInChrome = () => {
    const hideUntil = Date.now() + 10 * 60 * 1000;
    localStorage.setItem("mobileAppBannerHiddenUntil", hideUntil.toString());
    setShowMobileAppBanner(false);
    setTimeout(() => window.location.reload(), 100);
  };

  const handleSelectEnglish = () => {
    changeLanguage({ code: "en", name: "English", flag: US_FLAG });
    localStorage.setItem("language", "en");
    window.dispatchEvent(new StorageEvent("storage", { key: "language", newValue: "en" }));
    setLangDropdownOpen(false);
  };

  const handleSelectBangla = () => {
    changeLanguage({ code: "bn", name: "বাংলা", flag: BD_FLAG });
    localStorage.setItem("language", "bn");
    window.dispatchEvent(new StorageEvent("storage", { key: "language", newValue: "bn" }));
    setLangDropdownOpen(false);
  };

  // Sync active category from parent to local state AND fetch content
  useEffect(() => {
    // Use externalActiveMenu if provided (from Header), otherwise use activeCategory
    const menuToActivate = externalActiveMenu !== undefined && externalActiveMenu !== null 
      ? externalActiveMenu 
      : activeCategory;
    
    if (menuToActivate !== undefined && menuToActivate !== null) {
      setActiveMenu(menuToActivate);
      const category = categories.find(cat => cat.name === menuToActivate);
      if (category) {
        fetchCategoryContent(category);
      }
    }
  }, [activeCategory, categories, externalActiveMenu]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Check banner visibility on mount and when sidebar opens/closes
  useEffect(() => {
    if (sidebarOpen && isMobileDevice()) {
      const timer = setTimeout(() => {
        if (checkBannerVisibility()) setShowMobileAppBanner(true);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setShowMobileAppBanner(false);
    }
  }, [sidebarOpen]);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      if (response.data?.data?.length > 0) {
        setCategories(response.data.data);
        localStorage.setItem("categories", JSON.stringify(response.data.data));
      } else {
        const fallbackCategories = [
          { _id: "1", name: "Sports", image: null },
          { _id: "2", name: "Casino", image: null },
          { _id: "3", name: "Slots", image: null },
          { _id: "4", name: "Live Casino", image: null },
          { _id: "5", name: "Fishing", image: null },
          { _id: "6", name: "Exclusive", image: null },
        ];
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      const cached = localStorage.getItem("categories");
      if (cached) {
        setCategories(JSON.parse(cached));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviders = async (categoryName) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/providers/${categoryName}`);
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]);
        return response.data.data;
      } else {
        setProviders([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExclusiveGames = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/menu-games`);
      let gamesData = [];
      if (response.data?.data) gamesData = response.data.data;
      else if (Array.isArray(response.data)) gamesData = response.data;
      
      const exclusiveGamesData = gamesData.filter((game) => {
        if (!game) return false;
        const categoryName = (game.categoryname || game.category || game.categoryName || "").toLowerCase();
        const gameName = (game.name || game.gameName || "").toLowerCase();
        return categoryName.includes("exclusive") || categoryName.includes("exlusive") ||
               gameName.includes("exclusive") || gameName.includes("exlusive");
      });
      setExclusiveGames(exclusiveGamesData);
      setProviders([]);
    } catch (error) {
      console.error("Error fetching exclusive games:", error);
      setExclusiveGames([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategoryContent = async (category) => {
    if (!category) return;
    
    if (category.name?.toLowerCase() === "exclusive") {
      await fetchExclusiveGames();
    } else {
      await fetchProviders(category.name);
    }
  };

  const toggleMenu = async (title, category) => {
    if (activeMenu === title) {
      setActiveMenu(null);
      setActiveSubMenu(null);
      setProviders([]);
      setExclusiveGames([]);
    } else {
      setActiveMenu(title);
      setActiveSubMenu(null);
      if (category && category.name) {
        await fetchCategoryContent(category);
      }
    }
  };

  const toggleSubMenu = (subItem) => {
    setActiveSubMenu(activeSubMenu === subItem ? null : subItem);
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleCategoryItemClick = async (category) => {
    console.log("Category clicked:", category.name);
    
    if (!sidebarOpen) {
      console.log("Sidebar closed, calling onExpandAndActivate");
      if (onExpandAndActivate) {
        await onExpandAndActivate(category);
      }
      return;
    }

    if (activeMenu === category.name) {
      setActiveMenu(null);
      setActiveSubMenu(null);
      setProviders([]);
      setExclusiveGames([]);
    } else {
      setActiveMenu(category.name);
      setActiveSubMenu(null);
      await fetchCategoryContent(category);
    }
    
    handleCategoryClick(category);
  };

  const handleProviderClick = (provider) => {
    if (activeMenu) {
      window.location.href = `/games?category=${activeMenu.toLowerCase()}&provider=${provider.name.toLowerCase()}`;
    }
  };

  const handleGameClick = (game) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = "/login";
      return;
    }
    window.location.href = `/game/${game.gameId || game._id}`;
  };

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const closeSidebar = () => {
    if (setSidebarOpen && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    }
  };

  // Translate category name
  const translateCategoryName = (name) => {
    if (!name) return name;
    const key = name.toLowerCase();
    return t[key] || name;
  };

  // Language Switcher Component for Desktop
  const LanguageSwitcherDesktop = () => (
    <div className="relative">
      <button
        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
        className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/50"
      >
        <div className="flex items-center gap-2">
          <FaGlobe className="text-gray-400 text-sm" />
          <span className="text-sm text-gray-300">{isBangla ? "বাংলা" : "English"}</span>
        </div>
        <FaChevronDown className={`text-xs text-gray-400 transition-transform duration-200 ${langDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      {langDropdownOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setLangDropdownOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 overflow-hidden">
            <button
              onClick={handleSelectEnglish}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                !isBangla 
                  ? "bg-theme_color2/20 text-white" 
                  : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
            >
              <img src={US_FLAG} alt="English" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-sm font-medium">English</span>
              {!isBangla && (
                <span className="ml-auto text-xs text-green-400">✓</span>
              )}
            </button>
            <button
              onClick={handleSelectBangla}
              className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all duration-200 ${
                isBangla 
                  ? "bg-theme_color2/20 text-white" 
                  : "hover:bg-gray-700 text-gray-300 hover:text-white"
              }`}
            >
              <img src={BD_FLAG} alt="বাংলা" className="w-5 h-5 rounded-full object-cover" />
              <span className="text-sm font-medium">বাংলা</span>
              {isBangla && (
                <span className="ml-auto text-xs text-green-400">✓</span>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Language Switcher Component for Mobile
  const LanguageSwitcherMobile = () => (
    <div className="flex gap-2">
      <button
        onClick={handleSelectEnglish}
        className={`flex items-center gap-2 px-3 py-2 rounded-[5px] border-[1px] transition-all duration-200 ${
          !isBangla 
            ? "bg-theme_color2 text-white shadow-md border-theme_color2" 
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
        }`}
      >
        <img src={US_FLAG} alt="English" className="w-5 h-5 rounded-full object-cover" />
        <span className="text-sm font-medium">EN</span>
      </button>
      <button
        onClick={handleSelectBangla}
        className={`flex items-center gap-2 px-3 py-2 rounded-[5px] border-[1px] transition-all duration-200 ${
          isBangla 
            ? "bg-theme_color2 text-white shadow-md border-theme_color2" 
            : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"
        }`}
      >
        <img src={BD_FLAG} alt="বাংলা" className="w-5 h-5 rounded-full object-cover" />
        <span className="text-sm font-medium">BN</span>
      </button>
    </div>
  );

  const secondaryMenuItems = [
    {
      title: t.promotions || "Promotions",
      icon: <FaGift className="w-5 h-5 min-w-[20px]" />,
      subItems: [t.welcomeBonus || "Welcome Bonus", t.reloadBonus || "Reload Bonus", t.cashback || "Cashback"],
      path: "/promotions"
    },
    {
      title: t.vipClub || "VIP Club",
      icon: <FaCrown className="w-5 h-5 min-w-[20px]" />,
      subItems: [t.vipLevels || "VIP Levels", t.exclusiveRewards || "Exclusive Rewards", t.personalManager || "Personal Manager"],
      path: "/vip-club"
    },
    {
      title: t.referralProgram || "Referral program",
      icon: <FaUserFriends className="w-5 h-5 min-w-[20px]" />,
      subItems: [t.inviteFriends || "Invite Friends", t.earnCommission || "Earn Commission", t.bonusTerms || "Bonus Terms"],
      path: "/referral-program"
    },
    {
      title: t.affiliate || "Affiliate",
      icon: <FaHandshake className="w-5 h-5 min-w-[20px]" />,
      subItems: [t.joinProgram || "Join Program", t.marketingTools || "Marketing Tools", t.commissionRates || "Commission Rates"],
      onClick: () => { window.location.href = "https://affiliate.bir75.com"; }
    },
    {
      title: t.lottery || "Lottery",
      icon: (
        <svg className="w-5 h-5 min-w-[20px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <path d="M22 21v-2a4 4 0 0 0-4-4" />
          <path d="M6 3 4 5l2 2" />
          <path d="M18 3l2 2-2 2" />
          <path d="M12 3v2" />
        </svg>
      ),
      subItems: [t.lotteryResults || "Lottery Results", t.buyTickets || "Buy Tickets", t.winningHistory || "Winning History"],
      path: "/lottery"
    },
    {
      title: t.appDownload || "App Download",
      icon: <FaMobileAlt className="w-5 h-5 min-w-[20px]" />,
      subItems: [],
      onClick: () => downloadFileAtURL(APK_FILE)
    },
  ];

  // Desktop Sidebar Content
  const DesktopSidebar = () => (
    <div
      className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white overflow-y-auto
        transition-all duration-300 ease-in-out px-3
        ${sidebarOpen ? "w-72" : "w-16 -translate-x-full md:translate-x-0"}`}
    >
      {/* Language Switcher - Desktop */}
      <div className={`w-full pt-4 pb-3 transition-all duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0 h-0 p-0 mb-0 overflow-hidden"}`}>
        {sidebarOpen && <LanguageSwitcherDesktop />}
      </div>

  <div
  className={`w-full flex justify-start items-center transition-all duration-300 ${
    sidebarOpen ? "px-0 pb-3" : "px-0 pb-3"
  }`}
>
  <a
    href="https://tawk.to/chat/6a07172310830f1c38f6947a/1jolr4piu"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      backgroundSize: '200% auto',
      animation: 'gradient-move 4s linear infinite',
    }}
    className={`
      group relative flex items-center justify-center w-full p-2.5 rounded-[8px] 
      font-bold text-white transition-all duration-500 overflow-hidden
      /* High-Vibrance Gradient */
      bg-gradient-to-r from-[#bef264] via-[#22d3ee] to-[#bef264]
      /* Bright Neon Glow */
      shadow-[0_0_20px_-5px_rgba(190,242,100,0.8)]
      hover:shadow-[0_0_30px_0px_rgba(34,211,238,0.7)]
      hover:scale-[1.02]
    `}
  >
    {/* Keyframe Definition (Inline Style Hack if you can't edit CSS files) */}
    <style>{`
      @keyframes gradient-move {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
      }
    `}</style>

    <span className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

    {sidebarOpen ? (
      <div className="relative flex items-center gap-3">
        <span className="text-[15px] font-extrabold tracking-tight drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.3)]">
          {t.liveChat || "Let's Talk"}
        </span>
        <span className="text-xl transition-transform duration-300 group-hover:translate-x-1.5 drop-shadow-md">
          →
        </span>
      </div>
    ) : (
      <MdSupportAgent className="relative text-white text-[22px] drop-shadow-md" />
    )}
  </a>
</div>
      {/* Banner Image */}
      {sidebarOpen && (
        <div className="py-3">
          <img
            className="w-full rounded-xl shadow-lg"
            src="https://img.b112j.com/upload/h5Announcement/image_182702.jpg"
            alt="Promotion Banner"
          />
        </div>
      )}

      {/* App Download Button - Desktop */}
      {sidebarOpen && (
        <div className="py-2">
          <button
            onClick={() => downloadFileAtURL(APK_FILE)}
            className="flex items-center justify-center gap-3 w-full p-2.5 rounded-[10px] bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 border border-theme_color2/30 hover:bg-theme_color2/30 transition-all duration-200"
          >
            <FaMobileAlt className="text-theme_color2 text-[18px]" />
            <span className="text-[13px] font-medium">{t.downloadAppNow || "Download App Now"}</span>
          </button>
        </div>
      )}

      {/* Categories Section */}
      <div className="space-y-1 mt-2">
        {categories.map((category) => (
          <div key={category._id}>
            <div
              className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeMenu === category.name 
                  ? "bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
              onClick={() => handleCategoryItemClick(category)}
            >
              {category.image ? (
                <img
                  src={getFullImageUrl(category.image)}
                  alt={category.name}
                  className="w-5 h-5 min-w-[20px] object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-5 h-5 min-w-[20px] bg-gray-700 rounded-md"></div>
              )}
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  sidebarOpen ? "ml-3 w-full" : "w-0"
                }`}
              >
                <span className="text-sm text-yellow_theme flex-grow whitespace-nowrap font-medium">
                  {translateCategoryName(category.name)}
                </span>
                {category.name?.toLowerCase() !== "exclusive" && (
                  activeMenu === category.name ? (
                    <FaChevronDown className="text-xs transition-transform duration-200" />
                  ) : (
                    <FaChevronRight className="text-xs transition-transform duration-200" />
                  )
                )}
              </div>
            </div>

            {/* Submenu - Providers or Exclusive Games */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarOpen && activeMenu === category.name
                  ? "max-h-screen"
                  : "max-h-0"
              }`}
            >
              {sidebarOpen && activeMenu === category.name && (
                <div className="mt-1 mb-2">
                  {isLoading ? (
                    <div className="p-4 text-center text-[12px] text-gray-400">
                      <div className="inline-block w-4 h-4 border-2 border-gray-500 border-t-theme_color2 rounded-full animate-spin mr-2"></div>
                      {t.loading || "Loading..."}
                    </div>
                  ) : category.name?.toLowerCase() === "exclusive" ? (
                    <div className="max-h-[400px] overflow-y-auto pr-1">
                      <div className="grid grid-cols-2 gap-2 p-1">
                        {exclusiveGames.length === 0 ? (
                          <div className="col-span-2 text-center text-gray-500 py-4 text-xs">
                            {t.noExclusiveGames || "No exclusive games found"}
                          </div>
                        ) : (
                          exclusiveGames.map((game, gameIndex) => (
                            <div
                              key={gameIndex}
                              className="flex flex-col items-center rounded-lg transition-all cursor-pointer group hover:scale-105"
                              onClick={() => handleGameClick(game)}
                            >
                              <div className="game-image-container w-full mb-1">
                                <img
                                  src={getFullImageUrl(game.portraitImage || game.image)}
                                  alt={game.name || game.gameName}
                                  className="game-image rounded-lg shadow-md transition-transform duration-300 group-hover:shadow-xl"
                                  onError={(e) => { 
                                    e.target.src = "https://via.placeholder.com/100x133?text=Game"; 
                                  }}
                                />
                              </div>
                              <div className="w-full pt-1">
                                <span className="text-xs text-gray-400 truncate block text-center group-hover:text-gray-300">
                                  {game.name || game.gameName || "Game"}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {providers.length === 0 && !isLoading ? (
                        <div className="text-center text-gray-500 py-3 text-xs">
                          {t.noProviders || "No providers found"}
                        </div>
                      ) : (
                        providers.map((provider, providerIndex) => (
                          <div
                            key={providerIndex}
                            className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-white/10 transition-all duration-200"
                            onClick={() => handleProviderClick(provider)}
                          >
                            {provider.image && (
                              <img
                                src={getFullImageUrl(provider.image)}
                                alt={provider.name}
                                className="w-6 h-6 mr-2 object-contain rounded"
                                onError={(e) => { 
                                  e.target.style.display = "none"; 
                                }}
                              />
                            )}
                            <span className="text-xs text-gray-400 hover:text-gray-200 transition-colors">
                              {provider.name}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div
        className={`border-t border-gray-700/50 my-4 mx-1 transition-all duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Promotions label */}
      <div
        className={`px-1 mb-2 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-2">
          <span className="text-sm font-semibold text-gray-300">{t.promotions || "Promotions"}</span>
          <a href="/promotions" className="text-xs text-theme_color2 hover:text-theme_color2/80 underline cursor-pointer transition-colors">
            {t.viewAll || "View all"}
          </a>
        </div>
      </div>

      {/* Secondary menu items */}
      <div className="space-y-1">
        {secondaryMenuItems.map((item, index) => (
          <div key={index}>
            <div
              className={`flex items-center p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeMenu === item.title 
                  ? "bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else if (item.path) {
                  window.location.href = item.path;
                } else {
                  toggleMenu(item.title, { name: item.title });
                }
              }}
            >
              <span className="text-yellow_theme">{item.icon}</span>
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  sidebarOpen ? "ml-3 w-full" : "w-0"
                }`}
              >
                <span className="text-sm flex-grow whitespace-nowrap text-yellow_theme font-medium">
                  {item.title}
                </span>
                {item.subItems.length > 0 && (
                  activeMenu === item.title ? (
                    <FaChevronDown className="text-xs transition-transform duration-200" />
                  ) : (
                    <FaChevronRight className="text-xs transition-transform duration-200" />
                  )
                )}
              </div>
            </div>

            {/* Secondary Submenu */}
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarOpen && activeMenu === item.title && item.subItems.length > 0
                  ? "max-h-96"
                  : "max-h-0"
              }`}
            >
              {sidebarOpen && (
                <div className="ml-9 mt-1 mb-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`p-2 text-xs rounded-lg cursor-pointer transition-all duration-200 ${
                        activeSubMenu === subItem 
                          ? "bg-theme_color2/20 text-white" 
                          : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
                      }`}
                      onClick={() => toggleSubMenu(subItem)}
                    >
                      {subItem}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="h-10"></div>
    </div>
  );

  // Mobile Sidebar - FULL WIDTH (100% of screen)
  const MobileSidebar = () => (
    <>
      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}
      
      {/* Mobile sidebar panel - FULL WIDTH */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:hidden bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white z-50 transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ marginTop: "56px" }}
      >
        {/* Header with Language Switcher and Close Button */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#121212]/95 via-[#1a2344]/95 to-[#1e2b5e]/95 backdrop-blur-sm px-4 py-3 border-b border-gray-700/50">
          <div className="flex justify-between items-center">
            <LanguageSwitcherMobile />
            <button 
              onClick={closeSidebar} 
              className="cursor-pointer p-2 rounded-full transition-all duration-200"
              aria-label="Close sidebar"
            >
              <IoClose size={22} className="text-white" />
            </button>
          </div>
        </div>

        <div className="w-full pb-20">
          {/* Live Chat */}
          <div className="w-full flex justify-start items-center px-4 pt-4 pb-3">
            <a href="https://wa.me/+4407386588951" target="_blank" rel="noopener noreferrer" className="block w-full">
              <span className="bg-theme_color2 text-[15px] px-4 py-3 rounded-[10px] text-center flex justify-center items-center gap-3 cursor-pointer transition-all duration-200 shadow-md">
                <MdSupportAgent className="text-white text-[22px]" />
                <span className="text-[14px] font-medium">{t.liveChat || "24/7 Live Chat"}</span>
              </span>
            </a>
          </div>

          {/* Banner */}
          <div className="px-4 py-2">
            <img
              className="w-full rounded-xl shadow-lg"
              src="https://img.b112j.com/upload/h5Announcement/image_182702.jpg"
              alt="Promotion Banner"
            />
          </div>

          {/* App Download Button - Mobile */}
          <div className="px-4 py-2">
            <button
              onClick={() => downloadFileAtURL(APK_FILE)}
              className="flex items-center justify-center gap-3 w-full p-3 rounded-[10px] bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 border border-theme_color2/30 hover:bg-theme_color2/30 transition-all duration-200"
            >
              <FaMobileAlt className="text-theme_color2 text-[20px]" />
              <span className="text-[14px] font-medium">{t.downloadAppNow || "Download App Now"}</span>
            </button>
          </div>

          {/* Categories for Mobile */}
          <div className="space-y-1 px-4 mt-4">
            <h3 className="text-base font-bold text-white mb-3 px-1 border-l-3 border-theme_color2 pl-2">
              {t.categories || "Categories"}
            </h3>
            {categories.map((category) => (
              <div key={category._id}>
                <div
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeMenu === category.name 
                      ? "bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 text-white shadow-sm" 
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                  onClick={() => handleCategoryItemClick(category)}
                >
                  {category.image ? (
                    <img
                      src={getFullImageUrl(category.image)}
                      alt={category.name}
                      className="w-5 h-5 min-w-[20px] object-contain"
                    />
                  ) : (
                    <div className="w-5 h-5 min-w-[20px] bg-gray-700 rounded-md"></div>
                  )}
                  <div className="flex items-center justify-between ml-3 w-full">
                    <span className="text-sm flex-grow font-medium text-yellow_theme">
                      {translateCategoryName(category.name)}
                    </span>
                    {category.name?.toLowerCase() !== "exclusive" && (
                      activeMenu === category.name ? (
                        <FaChevronDown className="text-xs transition-transform duration-200" />
                      ) : (
                        <FaChevronRight className="text-xs transition-transform duration-200" />
                      )
                    )}
                  </div>
                </div>

                {/* Mobile Submenu */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    activeMenu === category.name ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  {activeMenu === category.name && (
                    <div className="mt-1 mb-2">
                      {isLoading ? (
                        <div className="p-4 text-center text-[12px] text-gray-400">
                          <div className="inline-block w-4 h-4 border-2 border-gray-500 border-t-theme_color2 rounded-full animate-spin mr-2"></div>
                          {t.loading || "Loading..."}
                        </div>
                      ) : category.name?.toLowerCase() === "exclusive" ? (
                        <div className="max-h-[500px] overflow-y-auto pr-1">
                          <div className="grid grid-cols-2 gap-3 p-1">
                            {exclusiveGames.length === 0 ? (
                              <div className="col-span-2 text-center text-gray-500 py-4 text-xs">
                                {t.noExclusiveGames || "No exclusive games found"}
                              </div>
                            ) : (
                              exclusiveGames.map((game, gameIndex) => (
                                <div
                                  key={gameIndex}
                                  className="flex flex-col items-center rounded-xl transition-all cursor-pointer group hover:scale-105"
                                  onClick={() => handleGameClick(game)}
                                >
                                  <div className="game-image-container w-full mb-1">
                                    <img
                                      src={getFullImageUrl(game.portraitImage || game.image)}
                                      alt={game.name || game.gameName}
                                      className="game-image rounded-xl shadow-md"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-400 text-center truncate w-full group-hover:text-gray-300">
                                    {game.name || game.gameName || "Game"}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {providers.length === 0 && !isLoading ? (
                            <div className="text-center text-gray-500 py-3 text-xs">
                              {t.noProviders || "No providers found"}
                            </div>
                          ) : (
                            providers.map((provider, providerIndex) => (
                              <div
                                key={providerIndex}
                                className="flex items-center p-2.5 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-200"
                                onClick={() => handleProviderClick(provider)}
                              >
                                {provider.image && (
                                  <img
                                    src={getFullImageUrl(provider.image)}
                                    alt={provider.name}
                                    className="w-6 h-6 mr-3 object-contain rounded"
                                  />
                                )}
                                <span className="text-xs text-gray-400 hover:text-gray-200">
                                  {provider.name}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700/50 my-4 mx-4"></div>
          
          {/* Promotions Section */}
          <div className="px-4 mb-2">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm font-semibold text-gray-300">{t.promotions || "Promotions"}</span>
              <a href="/promotions" className="text-xs text-theme_color2 hover:text-theme_color2/80 underline cursor-pointer transition-colors">
                {t.viewAll || "View all"}
              </a>
            </div>
          </div>

          {/* Secondary Menu for Mobile */}
          <div className="space-y-1 px-4">
            {secondaryMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeMenu === item.title 
                      ? "bg-gradient-to-r from-theme_color2/20 to-theme_color2/10 text-white shadow-sm" 
                      : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                  }`}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.path) {
                      window.location.href = item.path;
                    } else {
                      toggleMenu(item.title, { name: item.title });
                    }
                  }}
                >
                  <span className="text-yellow_theme">{item.icon}</span>
                  <div className="flex items-center ml-3 w-full">
                    <span className="text-sm flex-grow text-yellow_theme whitespace-nowrap font-medium">
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile App Download Banner - Bottom Floating */}
      {showMobileAppBanner && isMobileDevice() && sidebarOpen && (
        <div className="fixed bottom-0 left-0 right-0 flex justify-center items-end bg-[rgba(0,0,0,0.7)] border-t border-[#333] z-[10001] shadow-lg">
          <div className="w-full flex flex-col items-center p-4 relative">
            <button
              onClick={handleCloseBanner}
              className="absolute top-2 right-2 text-gray-700 bg-white rounded-full p-1 border border-gray-600 shadow-md"
            >
              <IoClose size={18} />
            </button>
            <div className="text-center mb-4 pt-2">
              <h3 className="text-white text-[13px] w-[96%] font-bold leading-tight">
                {isBangla
                  ? "২০০ টাকা বোনাস পেতে সর্বশেষ আপডেট APP ডাউনলোড করুন"
                  : "Download latest APP update to get 200 taka bonus"}
              </h3>
            </div>
            <div className="flex w-full max-w-md space-x-3 items-end pb-2">
              <div className="relative flex-1">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ff0000] text-white text-[10px] px-2 py-0.5 rounded-full z-20 border border-white shadow-sm whitespace-nowrap">
                  {isBangla ? "অধিক সুবিধা" : "More benefits"}
                </span>
                <button
                  onClick={() => downloadFileAtURL(APK_FILE)}
                  className="w-full py-2.5 rounded-full font-bold text-[#333] text-sm tracking-tight bg-gradient-to-b from-[#ffffff] via-[#e0e0e0] to-[#b8b8b8] shadow-[0_3px_0_rgb(140,140,140),inset_0_1px_0_rgba(255,255,255,1)] active:translate-y-[1px] active:shadow-[0_2px_0_rgb(140,140,140)] transition-all"
                >
                  APP
                </button>
              </div>
              <button
                onClick={handleOpenInChrome}
                className="flex-1 py-2.5 rounded-full font-bold text-[#222] text-sm bg-gradient-to-b from-[#ffdb4d] via-[#f7b500] to-[#d99e00] shadow-[0_3px_0_rgb(180,130,0),inset_0_1px_0_rgba(255,255,255,0.6)] active:translate-y-[1px] active:shadow-[0_2px_0_rgb(180,130,0)] transition-all"
              >
                {isBangla ? "Chrome-এ খুলুন" : "Open in Chrome"}
              </button>
            </div>
            <button onClick={handleCloseBanner} className="mt-2 text-white text-xs underline opacity-80 pb-1">
              {isBangla ? "H5 ব্যবহার চালিয়ে যান" : "Continue using H5"}
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (isLoading && categories.length === 0) {
    return (
      <div
        className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white overflow-y-auto
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-72" : "w-16 -translate-x-full py-4 md:translate-x-0"}`}
      >
        <div className="p-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-3 mb-2">
              <div className="w-5 h-5 bg-gray-700 rounded animate-pulse"></div>
              {sidebarOpen && (
                <div className="ml-3 w-full">
                  <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
      
      <style>{`
        .game-image-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 133.33%;
          overflow: hidden;
          border-radius: 12px;
        }
        .game-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        /* Custom scrollbar for exclusive games section */
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default Sidebar;