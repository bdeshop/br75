import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaBars,
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaCrown,
  FaUserFriends,
  FaHandshake,
  FaPhone,
  FaBook,
  FaComments,
  FaMobileAlt,
  FaFacebook,
  FaEnvelope,
  FaWhatsapp,
  FaTelegram,
  FaInstagram,
  FaTwitter,
  FaCoins,
  FaSignOutAlt,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";
import { MdSupportAgent } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import {
  FiBell,
  FiUser,
  FiLock,
  FiCheckCircle,
  FiFileText,
  FiTrendingUp,
  FiUsers,
  FiLogOut,
  FiRefreshCw,
  FiGlobe,
  FiKey,
  FiCreditCard
} from "react-icons/fi";
import { MdSportsSoccer } from "react-icons/md";
import axios from "axios";
import logo from "../../assets/logo.png";
import slot_img from "../../assets/slots.png";
import casino_img from "../../assets/casino.png";
import banner from "../../assets/banner.jpg";
import play_img from "../../assets/play.png";
import profile_img from "../../assets/profile.png";
import toast, { Toaster } from "react-hot-toast";
import { useAuth } from "../../App";
import { LanguageContext } from "../../context/LanguageContext";
import telegram_icon from "../../assets/social_icon/telegram.png";
import whatsapp_icon from "../../assets/social_icon/whatsapp.png";
import home_img from "../../assets/home.png";
import menu_img from "../../assets/menu.png";
import sports_img from "../../assets/sports.png";
import offers_img from "../../assets/offers.png";
import refer_img from "../../assets/refer.png";
const APK_FILE = "https://bir75.com/Bir75.apk";
import BD_FLAG from "../../assets/flag/Flag-Bangladesh.webp";
import US_FLAG from "../../assets/flag/us.webp";
import { FiPower } from "react-icons/fi";

// ── Helper ───────────────────────────────────────────────────────────────────
const getFullImageUrl = (imagePath, baseUrl) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${cleanPath}`;
};

// ── Currency/Language Dropdown ────────────────────────────────────────────────
const CurrencyLangButton = ({
  isBangla, onSelectEnglish, onSelectBangla,
  dropdownOpen, setDropdownOpen, dropdownRef,
  userBalance, isLoggedIn,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localIsLoggedIn, setLocalIsLoggedIn] = useState(false);
  const [localUserBalance, setLocalUserBalance] = useState(null);
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("usertoken");
      const user = localStorage.getItem("user");
      const loggedIn = !!(token && user);
      setLocalIsLoggedIn(loggedIn);
      if (loggedIn && user) {
        try { setLocalUserBalance(JSON.parse(user)?.balance || 0); }
        catch { setLocalUserBalance(0); }
      } else {
        setLocalUserBalance(null);
      }
    };
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);

  const finalIsLoggedIn = isLoggedIn !== undefined ? isLoggedIn : localIsLoggedIn;
  const finalBalance   = userBalance  !== undefined ? userBalance  : localUserBalance;

  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("user");
    if (typeof axios !== "undefined") delete axios.defaults.headers.common["Authorization"];
    setDropdownOpen(false);
    setShowLogoutConfirm(false);
    window.location.href = "/";
  };

  const LogoutConfirmPopup = () => {
    if (!showLogoutConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-8">
        <div className="bg-white rounded-lg w-full max-w-[320px] shadow-2xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-gray-900 text-xl font-medium mb-4 text-left">
              {isBangla ? "নিশ্চিতি" : t.logoutConfirmTitle || "Confirm"}
            </h3>
            <p className="text-gray-600 text-[15px] leading-relaxed text-left mb-8">
              {isBangla
                ? "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?"
                : t.logoutConfirmMessage || "Are you sure you want to logout?"}
            </p>
            <div className="flex justify-end gap-6">
              <button
                onClick={() => { setShowLogoutConfirm(false); setIsLogoutHovered(false); }}
                className="text-gray-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-gray-50 px-2 py-1 rounded"
              >
                {isBangla ? "বাতিল" : t.cancel || "Cancel"}
              </button>
              <button
                onClick={handleLogout}
                className="text-blue-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-blue-50 px-2 py-1 rounded"
              >
                {isBangla ? "নিশ্চিত" : t.confirm || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <LogoutConfirmPopup />
      <div style={{ position: "relative" }} ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-[6px] p-[6px_10px] cursor-pointer text-white transition-opacity hover:opacity-80"
          aria-label="Currency and Language"
        >
          <span className="w-[30px] h-[30px] rounded-full overflow-hidden flex items-center justify-center border-[1.5px] border-white/40 shrink-0">
            <img
              src={isBangla ? BD_FLAG : US_FLAG}
              alt={isBangla ? "BD" : "EN"}
              className="w-full h-full object-cover block"
            />
          </span>
        </button>

        {dropdownOpen && (
          <div className="absolute top-[calc(100%+12px)] p-[10px] right-0 min-w-[340px] bg-[#1c1c1c] rounded-[4px] shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[99999] overflow-hidden border border-[#2d2d2d] space-y-5">
            <div className="flex items-center justify-between py-[14px_16px_10px]">
              <span className="text-[13px] text-[#efefef] font-medium">
                {t.language || "Currency and Language"}
              </span>
              <button
                onClick={() => setDropdownOpen(false)}
                className="bg-transparent border-none text-[#999] cursor-pointer hover:text-white transition-colors"
              >
                <IoClose size={20} />
              </button>
            </div>

            {finalIsLoggedIn && finalBalance !== null && (
              <div className="flex flex-col items-center py-6 bg-[#161616] rounded-[5px]">
                <div className="w-[48px] h-[48px] rounded-full border-[3px] border-[#008a5e] flex items-center justify-center mb-2">
                  <span className="text-[#008a5e] text-xl font-bold">৳</span>
                </div>
                <span className="text-[15px] text-white font-semibold">
                  ৳ {parseFloat(finalBalance || 0).toFixed(2)}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">{t.mainWallet || "Available Balance"}</span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={onSelectEnglish}
                className={`flex-1 py-[10px] rounded-[2px] border-none cursor-pointer font-medium text-[14px] transition-all duration-200 ${
                  !isBangla ? "bg-theme_color2 text-white shadow-inner" : "bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#353535]"
                }`}
              >
                English
              </button>
              <button
                onClick={onSelectBangla}
                className={`flex-1 py-[10px] rounded-[2px] border-none cursor-pointer font-medium text-[14px] transition-all duration-200 ${
                  isBangla ? "bg-theme_color2 text-white shadow-inner" : "bg-[#2d2d2d] text-[#a0a0a0] hover:bg-[#353535]"
                }`}
              >
                বাংলা
              </button>
            </div>

            {finalIsLoggedIn && (
              <div className="border-t border-[#2d2d2d] pt-3 pb-2">
                <button
                  onClick={() => { setShowLogoutConfirm(true); setIsLogoutHovered(true); }}
                  onMouseEnter={() => setIsLogoutHovered(true)}
                  onMouseLeave={() => { if (!showLogoutConfirm) setIsLogoutHovered(false); }}
                  className={`w-full flex items-center justify-center gap-2 py-[10px] rounded-[2px] border transition-all duration-200 cursor-pointer ${
                    isLogoutHovered || showLogoutConfirm
                      ? "bg-[#d32f2f] border-[#d32f2f] text-white"
                      : "border-[#3d3d3d] bg-[#353535] text-[#e0e0e0] hover:bg-[#d32f2f] hover:border-[#d32f2f] hover:text-white"
                  }`}
                >
                  <FiLogOut size={16} />
                  <span>{t.logout || "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ─── Main Header Component ────────────────────────────────────────────────────
export const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const base_url    = import.meta.env.VITE_API_KEY_Base_URL;

  const { t, language, changeLanguage } = useContext(LanguageContext);
  const isBangla = language.code === "bn";

  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [promotions, setPromotions] = useState(
    JSON.parse(localStorage.getItem("promotions")) || []
  );
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [gameLoading, setGameLoading] = useState(false);
  const [showSignupPopup, setShowSignupPopup] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const [showMobileAppBanner, setShowMobileAppBanner] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loadingSocialLinks, setLoadingSocialLinks] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const [isRefreshingCoinBalance, setIsRefreshingCoinBalance] = useState(false);

  // ── NEW: activeMenu for the desktop collapsed-sidebar click ─────────────────
  // This is passed as `externalActiveMenu` to <Sidebar> so it highlights/opens
  // the correct category after the sidebar is expanded.
  const [sidebarActiveMenu, setSidebarActiveMenu] = useState(null);

  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    const saved = localStorage.getItem("isBalanceHidden");
    return saved !== null ? saved === "true" : true;
  });

  const navigate   = useNavigate();
  const dropdownRef = useRef(null);
  const popupRef    = useRef(null);

  // ── Language handlers ───────────────────────────────────────────────────────
  const handleSelectEnglish = () => {
    const nextLang = { code: "en", name: "English", flag: US_FLAG };
    changeLanguage(nextLang);
    localStorage.setItem("language", "en");
    window.dispatchEvent(new StorageEvent("storage", { key: "language", newValue: "en" }));
    setLangDropdownOpen(false);
  };

  const handleSelectBangla = () => {
    const nextLang = {
      code: "bn", name: "বাংলা",
      flag: "https://images.5849492029.com//TCG_PROD_IMAGES/COUNTRY_FLAG/CIRCLE/BD.svg",
    };
    changeLanguage(nextLang);
    localStorage.setItem("language", "bn");
    window.dispatchEvent(new StorageEvent("storage", { key: "language", newValue: "bn" }));
    setLangDropdownOpen(false);
  };

  const isMobileDevice = () => window.innerWidth < 768;

  const checkBannerVisibility = () => {
    if (!isMobileDevice()) return false;
    const bannerHiddenUntil   = localStorage.getItem("mobileAppBannerHiddenUntil");
    const downloadHiddenUntil = localStorage.getItem("mobileAppDownloadHiddenUntil");
    if (downloadHiddenUntil && Date.now() < parseInt(downloadHiddenUntil)) return false;
    if (bannerHiddenUntil   && Date.now() < parseInt(bannerHiddenUntil))   return false;
    return true;
  };

  // ── Fetch helpers ───────────────────────────────────────────────────────────
  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branding`);
      if (response.data.success && response.data.data?.logo) {
        const logoUrl = response.data.data.logo.startsWith("http")
          ? response.data.data.logo
          : `${API_BASE_URL}${response.data.data.logo.startsWith("/") ? "" : "/"}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
      }
    } catch {
      setDynamicLogo(logo);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      setLoadingSocialLinks(true);
      const response = await axios.get(`${API_BASE_URL}/api/social-links`);
      if (response.data.success && response.data.data) {
        const mappedLinks = response.data.data.map((link) => {
          let icon, title;
          switch (link.platform.toLowerCase()) {
            case "whatsapp":  icon = <FaWhatsapp  className="w-4 h-4 mr-2" />; title = t.whatsapp;  break;
            case "email":     icon = <FaEnvelope  className="w-4 h-4 mr-2" />; title = t.email;     break;
            case "facebook":  icon = <FaFacebook  className="w-4 h-4 mr-2" />; title = t.facebook;  break;
            case "instagram": icon = <FaInstagram className="w-4 h-4 mr-2" />; title = t.instagram; break;
            case "telegram":  icon = <FaTelegram  className="w-4 h-4 mr-2" />; title = t.telegram;  break;
            case "twitter": case "x": icon = <FaTwitter className="w-4 h-4 mr-2" />; title = t.twitter; break;
            default:          icon = <FaWhatsapp  className="w-4 h-4 mr-2" />; title = link.platform;
          }
          return { ...link, icon, title };
        });
        setSocialLinks(mappedLinks);
      } else {
        setSocialLinks([
          { platform: "whatsapp", url: "https://wa.me/+4407386588951", title: t.whatsapp, icon: <FaWhatsapp className="w-4 h-4 mr-2" /> },
          { platform: "email",    url: "mailto:support@yourdomain.com", title: t.email,    icon: <FaEnvelope className="w-4 h-4 mr-2" /> },
          { platform: "facebook", url: "https://facebook.com/yourpage", title: t.facebook, icon: <FaFacebook className="w-4 h-4 mr-2" /> },
        ]);
      }
    } catch {
      setSocialLinks([
        { platform: "whatsapp", url: "https://wa.me/+4407386588951", title: t.whatsapp, icon: <FaWhatsapp className="w-4 h-4 mr-2" /> },
        { platform: "email",    url: "mailto:support@yourdomain.com", title: t.email,    icon: <FaEnvelope className="w-4 h-4 mr-2" /> },
      ]);
    } finally {
      setLoadingSocialLinks(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      if (response.data?.data?.length > 0) {
        const apiCategories = response.data.data.map((cat) => ({ ...cat, image: cat.image || null }));
        setCategories(apiCategories);
        localStorage.setItem("categories", JSON.stringify(apiCategories));
      } else {
        setCategories([]);
        localStorage.setItem("categories", JSON.stringify([]));
      }
    } catch {
      setCategories([]);
      localStorage.setItem("categories", JSON.stringify([]));
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/promotions`);
      if (response.data) {
        setPromotions(response.data.data);
        localStorage.setItem("promotions", JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.error("Failed to fetch promotions:", err);
    }
  };

  const fetchProviders = async (categoryName) => {
    try {
      setSidebarLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/providers/${categoryName}`);
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]);
      }
    } catch {
      setProviders([]);
    } finally {
      setSidebarLoading(false);
    }
  };

  const fetchExclusiveGames = async () => {
    try {
      setSidebarLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/menu-games`);
      let gamesData = [];
      if (response.data?.data) gamesData = response.data.data;
      else if (Array.isArray(response.data)) gamesData = response.data;
      const exclusiveGamesData = gamesData.filter((game) => {
        if (!game) return false;
        const categoryName = (game.categoryname || game.category || game.categoryName || "").toLowerCase();
        const gameName     = (game.name || game.gameName || "").toLowerCase();
        return categoryName.includes("exclusive") || categoryName.includes("exlusive") ||
               gameName.includes("exclusive")     || gameName.includes("exlusive");
      });
      setExclusiveGames(exclusiveGamesData);
      setProviders([]);
    } catch {
      setExclusiveGames([]);
    } finally {
      setSidebarLoading(false);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem("usertoken");
    const user  = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
      verifyToken(token);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
    }
  };

  const verifyToken = async (token) => {
    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        setIsLoggedIn(true);
      }
    } catch {
      console.error("Token verification failed");
    }
  };

  const refreshBalance = async () => {
    if (!isLoggedIn) return;
    try {
      setIsRefreshingBalance(true);
      const token = localStorage.getItem("usertoken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
      }
    } catch {
      toast.error(t.failedRefreshBalance);
    } finally {
      setIsRefreshingBalance(false);
    }
  };

  const refreshCoinBalance = async () => {
    if (!isLoggedIn) return;
    try {
      setIsRefreshingCoinBalance(true);
      const token = localStorage.getItem("usertoken");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (response.data.success) {
        setUserData(response.data.data);
        localStorage.setItem("user", JSON.stringify(response.data.data));
        toast.success(t.coinBalanceRefreshed);
      }
    } catch {
      toast.error(t.failedRefreshCoinBalance);
    } finally {
      setIsRefreshingCoinBalance(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    delete axios.defaults.headers.common["Authorization"];
    setProfileDropdownOpen(false);
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const handleCategoryClick = (category) => {
    if (activeMenu === category.name) {
      setActiveMenu(null);
      setProviders([]);
      setExclusiveGames([]);
    } else {
      setActiveMenu(category.name);
      if (category.name?.toLowerCase() === "exclusive") fetchExclusiveGames();
      else if (category.name) fetchProviders(category.name);
    }
  };

  const handleProviderClick = (provider) => {
    if (activeMenu) {
      navigate(`/games?category=${activeMenu.toLowerCase()}&provider=${provider.name.toLowerCase()}`);
      setSidebarOpen(false);
    }
  };

  const { user } = useAuth();
  const handleGameClick = (game) => {
    if (!user) { navigate("/login"); return; }
    navigate(`/game/${game.gameId}`);
  };

  const handleContactClick = (url) => { if (url) window.open(url, "_blank"); };

  const downloadFileAtURL = (url) => {
    const fileName = url.split("/").pop();
    const aTag = document.createElement("a");
    aTag.href = url;
    aTag.setAttribute("download", fileName);
    document.body.appendChild(aTag);
    aTag.click();
    aTag.remove();
    toast.success(t.apkDownloadStarted);
  };

  const handleCloseBanner = () => {
    const hideUntil = Date.now() + 10 * 60 * 1000;
    localStorage.setItem("mobileAppBannerHiddenUntil", hideUntil.toString());
    setShowMobileAppBanner(false);
  };

  const toggleBalanceVisibility = () => {
    const newState = !isBalanceHidden;
    setIsBalanceHidden(newState);
    localStorage.setItem("isBalanceHidden", newState);
  };

  const getGameImageUrl = (game) => {
    if (!game) return "";
    const imagePath = game.portraitImage || game.image || game.thumbnail || "";
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  const translateCategoryName = (name) => {
    if (!name) return name;
    return t[name.toLowerCase()] || name;
  };

  // ── NEW: called by the desktop collapsed <Sidebar> when a category icon is clicked ──
  // Opens the full sidebar in Header and marks that category as active
  const handleExpandAndActivate = async (category) => {
    // 1. Open the full sidebar
    setSidebarOpen(true);

    // 2. Set the active menu so the Sidebar highlights it
    setSidebarActiveMenu(category.name);

    // 3. Also drive the Header-internal category state (providers list etc.)
    setActiveMenu(category.name);
    if (category.name?.toLowerCase() === "exclusive") {
      await fetchExclusiveGames();
    } else if (category.name) {
      await fetchProviders(category.name);
    }
  };

  const menuItems = [
    { id: "notifications",               label: t.notifications,                          icon: <FiBell />,        path: "/member/inbox/notification" },
    { id: "personal-info",               label: t.personalInfo,                           icon: <FiUser />,        path: "/member/profile/info" },
    { id: "login-security",              label: t.loginSecurity,                          icon: <FiLock />,        path: "/member/profile/account" },
    { id: "transaction-password",        label: t.transactionPassword || "Transaction Password",      icon: <FiLock />,        path: "/member/transaction-password" },
    { id: "reset-transaction-password",  label: t.resetTransactionPassword || "Reset Transaction Password", icon: <FiCreditCard />, path: "/member/profile/reset-trx-password" },
    { id: "verification",                label: t.verification,                           icon: <FiCheckCircle />, path: "/member/profile/verify" },
    { id: "transactions",                label: t.transactions,                           icon: <FiFileText />,    path: "/member/transaction-records" },
    { id: "betting-records",             label: t.bettingRecords,                         icon: <MdSportsSoccer />,path: "/member/betting-records/settled" },
    { id: "turnover",                    label: t.turnover,                               icon: <FiTrendingUp />,  path: "/member/turnover/uncomplete" },
    { id: "referral",                    label: t.myReferral,                             icon: <FiUsers />,       path: "/referral-program/details" },
    { id: "bonuses",                     label: t.bonuses_text || "Bonuses",              icon: <FaGift />,        path: "/member/bonuses" },
  ];

  const bottomMenuItems = [
    { title: t.vipClub,         icon: <FaCrown       className="w-5 h-5 min-w-[20px]" />, subItems: [], path: "/vip-club" },
    { title: t.referralProgram, icon: <FaUserFriends className="w-5 h-5 min-w-[20px]" />, subItems: [], path: "/referral-program" },
    { title: t.affiliate,       icon: <FaHandshake   className="w-5 h-5 min-w-[20px]" />, subItems: [], onClick: () => { window.location.href = "https://m-affiliate.bir75.com"; } },
    { title: t.appDownload,     icon: <FaMobileAlt   className="w-5 h-5 min-w-[20px]" />, subItems: [], onClick: () => downloadFileAtURL(APK_FILE) },
    { title: t.contactUs,       icon: <FaPhone       className="w-5 h-5 min-w-[20px]" />, subItems: [], isContact: true },
  ];

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) setSidebarOpen(false);
    fetchCategories();
    if (!promotions.length) fetchPromotions();
    checkAuthStatus();
    fetchBrandingData();
    fetchSocialLinks();
    const hasShownSignupPopup = localStorage.getItem("hasShownSignupPopup");
    if (isLoggedIn && !hasShownSignupPopup) {
      setShowSignupPopup(true);
      localStorage.setItem("hasShownSignupPopup", "true");
    }
    const timer = setTimeout(() => { if (checkBannerVisibility()) setShowMobileAppBanner(true); }, 2000);
    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setProfileDropdownOpen(false);
      if (popupRef.current   && !popupRef.current.contains(event.target))    setShowSignupPopup(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // When the sidebar is closed externally, reset sidebarActiveMenu so it doesn't
  // re-activate stale state next time the sidebar opens naturally.
  useEffect(() => {
    if (!sidebarOpen) {
      setSidebarActiveMenu(null);
    }
  }, [sidebarOpen]);

  const LogoutConfirmPopup = () => {
    if (!showLogoutConfirm) return null;
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-8">
        <div className="bg-white rounded-lg w-full max-w-[320px] shadow-2xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-gray-900 text-xl font-medium mb-4 text-left">
              {isBangla ? "নিশ্চিতি" : t.logoutConfirmTitle || "Confirm"}
            </h3>
            <p className="text-gray-600 text-[15px] leading-relaxed text-left mb-8">
              {isBangla
                ? "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?"
                : t.logoutConfirmMessage || "Are you sure you want to logout?"}
            </p>
            <div className="flex justify-end gap-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-gray-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-gray-50 px-2 py-1 rounded"
              >
                {isBangla ? "বাতিল" : t.cancel || "Cancel"}
              </button>
              <button
                onClick={logout}
                className="text-blue-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-blue-50 px-2 py-1 rounded"
              >
                {isBangla ? "নিশ্চিত" : t.confirm || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Toaster />
      <LogoutConfirmPopup />
      <header className="flex justify-between items-center px-1 py-2 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white border-b border-[#333] relative z-[1000]">
        <div className="flex items-center space-x-4 md:space-x-7">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-icon_color md:flex hidden p-3 cursor-pointer bg-[#303232] rounded-[2px] hover:bg-[#333]"
          >
            <FaBars size={18} />
          </button>
          <a href="/">
            <img src={dynamicLogo} alt="Logo" className="w-[80px] md:w-[95px]" />
          </a>
          <NavLink to="/slots" className="md:flex hidden items-center space-x-2 text-[13px] font-[400] text-gray-400 hover:text-yellow-400">
            <img src={slot_img} alt="Slots" className="h-5 w-5" />
            <span>{t.slots}</span>
          </NavLink>
          <NavLink to="/casino" className="md:flex hidden items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400">
            <img src={casino_img} alt="Casino" className="h-5 w-5" />
            <span>{t.casino}</span>
          </NavLink>
          <NavLink to="/sports" className="md:flex hidden items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400">
            <img src={sports_img} alt="Sports" className="h-5 w-5" />
            <span>{t.sports}</span>
          </NavLink>
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="md:flex hidden cursor-pointer items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400"
              >
                <img src={profile_img} alt="Profile" className="h-5 w-5" />
                <span>{t.profile}</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute top-[170%] left-0 mt-2 w-80 bg-[#111] rounded-b-[3px] shadow-xl z-50 text-white">
                  <div className="flex items-center gap-3 p-4 border-b border-[#333]">
                    <div className="rounded-full bg-gray-600 flex items-center justify-center text-xl font-bold">
                      <img
                        src="https://img.b112j.com/bj/h5/assets/v3/images/member-menu/member-avatar.png?v=1755600713311&source=drccdnsrc"
                        className="w-[40px]"
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="font-[500] text-sm">{t.username}: {userData?.username || "N/A"}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.playerId}: {userData?.player_id || "N/A"}</div>
                    </div>
                  </div>
                  <div className="flex flex-col py-3">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.id}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                          activeTab === item.id
                            ? "bg-[#222] text-white"
                            : "text-gray-300 hover:bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] hover:text-white"
                        }`}
                        onClick={() => { setActiveTab(item.id); setProfileDropdownOpen(false); }}
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                  <div className="border-t border-[#333] p-3">
                    <button
                      className="flex items-center justify-center gap-2 w-full py-2 text-sm rounded-md border border-[#333] text-gray-300 hover:bg-[#222] hover:text-white transition cursor-pointer"
                      onClick={() => setShowLogoutConfirm(true)}
                    >
                      <FiLogOut /> {t.logout}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 md:space-x-3">
          {isLoggedIn ? (
            <>
              <div className="hidden md:flex items-center rounded overflow-hidden gap-2">
                <div className="bg-box_bg rounded-[5px] h-10 border-[1px] border-gray-800 flex items-center">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm bg-[#1f1f1f] text-white">
                    <img
                      src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/currency-type/bdt.png?v=1755600713311&source=drccdnsrc"
                      className="w-4 h-4"
                      alt="BDT"
                    />
                    <span className="min-w-[60px]">
                      {isBalanceHidden ? "******" : parseFloat(userData?.balance || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    className="px-3 py-2 hover:bg-[#444] cursor-pointer text-white transition-colors duration-200 border-l border-gray-800"
                    onClick={toggleBalanceVisibility}
                    aria-label={isBalanceHidden ? t.showBalance : t.hideBalance}
                  >
                    {isBalanceHidden ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                  </button>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <NavLink
                    to="/member/withdraw"
                    className="text-white text-[12px] md:text-sm px-5 py-2 border-[1px] bg-[#FF9700] cursor-pointer border-gray-700 rounded hover:bg-[#333] transition-all duration-200"
                  >
                    {t.withdrawal}
                  </NavLink>
                  <NavLink
                    to="/member/deposit"
                    className="bg-red-500 text-[12px] md:text-sm px-5 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
                  >
                    {t.deposit}
                  </NavLink>
                </div>
              </div>

              <div className="md:hidden flex pl-[10px] items-center gap-2">
                <div className="bg-box_bg rounded-[5px] border-[1px] border-gray-800 flex items-center">
                  <div className="flex items-center space-x-2 px-3 py-2 text-sm">
                    <img
                      src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/currency-type/bdt.png?v=1755600713311&source=drccdnsrc"
                      className="w-4 h-4"
                      alt="BDT"
                    />
                    <span className="text-white min-w-[40px]">
                      {isBalanceHidden ? "******" : parseFloat(userData?.balance || 0).toFixed(2)}
                    </span>
                  </div>
                  <button
                    className="px-3 py-2 hover:bg-[#444] cursor-pointer text-white transition-colors duration-200 border-l border-gray-800"
                    onClick={toggleBalanceVisibility}
                    aria-label={isBalanceHidden ? t.showBalance : t.hideBalance}
                  >
                    {isBalanceHidden ? <FaEye size={16} /> : <FaEyeSlash size={16} />}
                  </button>
                </div>
                <NavLink
                  to="/member/deposit"
                  className="bg-red-500 text-[12px] px-3 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
                >
                  {t.deposit}
                </NavLink>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="bg-red-500 text-white p-2 rounded-full transition-all duration-300 flex items-center justify-center shadow-md active:scale-95"
                  aria-label="Logout"
                >
                  <FiPower size={20} strokeWidth={2.5} />
                </button>
              </div>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-white text-[12px] md:text-sm px-5 py-2 border-[1px] cursor-pointer border-blue-500 rounded transition-all duration-200"
              >
                {t.login}
              </NavLink>
              <NavLink
                to="/register"
                className="bg-theme_color text-[12px] md:text-sm px-5 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
              >
                {t.signup}
              </NavLink>
            </>
          )}

          <div className="hidden md:block">
            <CurrencyLangButton
              isBangla={isBangla}
              onSelectEnglish={handleSelectEnglish}
              onSelectBangla={handleSelectBangla}
              dropdownOpen={langDropdownOpen}
              setDropdownOpen={setLangDropdownOpen}
              dropdownRef={langDropdownRef}
            />
          </div>
        </div>
      </header>

      {/* ── Mobile / full-width Sidebar ───────────────────────────────────────── */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:w-80 no-scrollbar overflow-y-auto pb-[100px] bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white z-40 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "shadow-2xl" : "w-0 -translate-x-full"
        }`}
        style={{ marginTop: "56px" }}
      >
        <div className="px-[10px] flex justify-end items-center">
          <button onClick={() => setSidebarOpen(false)} className="cursor-pointer p-2 rounded-[3px] z-50">
            <IoClose size={22} />
          </button>
        </div>

        <div className={`w-full md:w-80 transition-opacity duration-300 ${sidebarOpen ? "opacity-100" : "opacity-0"}`}>
          <div className="w-full flex justify-start items-center px-4 border-b-[1px] border-gray-700 pt-4 pb-3 md:sticky top-0 left-0 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e]]">
            <a href="https://wa.me/+4407386588951" target="_blank" rel="noopener noreferrer" className="block w-full">
              <span className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] border-[1px] border-blue-500 text-[16px] px-2 py-2.5 mt-3 rounded-[3px] text-center flex justify-center items-center gap-3 cursor-pointer hover:bg-[#2a2a2a] transition">
                <MdSupportAgent className="text-white text-[20px]" />
                <span className="text-[13px]">{t.liveChat}</span>
              </span>
            </a>
          </div>

          {/* Language toggle in sidebar */}
          <div className="px-4 py-3 border-b border-[#2a2a2a]">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{t.language || "Language"}</span>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectEnglish}
                  style={{
                    padding: "6px 14px", borderRadius: "2px", border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: "12px",
                    background: !isBangla ? "#14805E" : "#2a2a2a",
                    color:      !isBangla ? "#fff"    : "#888",
                    transition: "all 0.2s",
                  }}
                >
                  English
                </button>
                <button
                  onClick={handleSelectBangla}
                  style={{
                    padding: "6px 14px", borderRadius: "2px", border: "none", cursor: "pointer",
                    fontWeight: 600, fontSize: "12px",
                    background: isBangla ? "#14805E" : "#2a2a2a",
                    color:      isBangla ? "#fff"    : "#888",
                    transition: "all 0.2s",
                  }}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </div>

          <div className="p-[10px]">
            <img className="w-full" src={banner} alt="" />
          </div>

          {/* Download App */}
          <div className="px-2 mt-4">
            <button
              className="flex items-center p-3 rounded w-full bg-gradient-to-r from-theme_color/20 to-theme_color/10 text-theme_color cursor-pointer hover:bg-theme_color/30 transition-all duration-200 border border-theme_color/30"
              onClick={() => downloadFileAtURL(APK_FILE)}
            >
              <FaMobileAlt className="w-6 h-6 min-w-[24px]" />
              <div className="flex items-center ml-3 w-full">
                <span className="text-sm font-semibold flex-grow">{t.downloadAppNow}</span>
                <FaChevronRight className="text-xs" />
              </div>
            </button>
          </div>

          {/* Dynamic Categories */}
          <div className="space-y-1 px-2 mt-[15px]">
            {isLoadingCategories && (
              <div className="text-center py-4 text-gray-400 text-sm">{t.loadingCategories}</div>
            )}
            {!isLoadingCategories && categories.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm">No categories available</div>
            )}
            {categories.map((category, index) => (
              <div key={category._id || index}>
                <div
                  className={`flex items-center p-3 rounded cursor-pointer hover:text-gray-500 text-gray-400 transition-colors duration-200 ${
                    activeMenu === category.name ? "bg-[#ffffff10]" : ""
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.image ? (
                    <img
                      src={getFullImageUrl(category.image, API_BASE_URL)}
                      alt={category.name}
                      className="w-5 h-5 min-w-[20px] object-contain"
                    />
                  ) : (
                    <div className="w-5 h-5 min-w-[20px]"></div>
                  )}
                  <div className="flex items-center ml-3 w-full">
                    <span className="text-sm flex-grow whitespace-nowrap font-semibold text-gray-200">
                      {translateCategoryName(category.name)}
                    </span>
                    {activeMenu === category.name ? (
                      <FaChevronDown className="text-xs transition-transform duration-200" />
                    ) : (
                      <FaChevronRight className="text-xs transition-transform duration-200" />
                    )}
                  </div>
                </div>

                <div
                  className={`overflow-y-auto transition-all duration-300 ease-in-out ${
                    activeMenu === category.name ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  {activeMenu === category.name && (
                    <div className="ml-2 mt-1 mb-2">
                      {sidebarLoading ? (
                        <div className="p-4 text-center text-[12px] text-gray-400">{t.loading}</div>
                      ) : category.name?.toLowerCase() === "exclusive" ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-2 p-2">
                          {exclusiveGames.map((game, gameIndex) => (
                            <div
                              key={gameIndex}
                              className="flex flex-col items-center rounded-[3px] transition-all cursor-pointer group"
                              onClick={() => handleGameClick(game)}
                            >
                              <div className="game-image-container w-full mb-2">
                                <img
                                  src={getGameImageUrl(game)}
                                  alt={game.name || game.gameName}
                                  className="game-image rounded-[6px] transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => { e.target.src = "https://via.placeholder.com/100x133?text=Game"; }}
                                />
                              </div>
                              <div className="w-full pt-1">
                                <span className="text-xs text-gray-400 truncate block text-center">
                                  {game.name || game.gameName || "Game"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {providers.map((provider, providerIndex) => (
                            <div
                              key={providerIndex}
                              className="flex items-center p-2 rounded cursor-pointer hover:bg-[#333] transition-colors duration-200"
                              onClick={() => handleProviderClick(provider)}
                            >
                              {provider.image && (
                                <img
                                  src={getFullImageUrl(provider.image, API_BASE_URL)}
                                  alt={provider.name}
                                  className="w-6 h-6 mr-2 object-contain"
                                  onError={(e) => { e.target.style.display = "none"; }}
                                />
                              )}
                              <span className="text-xs text-gray-400">{provider.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-[#222424] my-4 mx-2"></div>
          <div className="px-2 mb-2">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm font-medium">{t.promotions}</span>
              <NavLink to="/promotions" className="text-xs text-theme_color2 underline cursor-pointer">
                {t.viewAll}
              </NavLink>
            </div>
          </div>

          <div className="border-t border-[#222424] my-4 mx-2"></div>
          <div className="space-y-1 px-2">
            {bottomMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded text-gray-200 cursor-pointer hover:text-gray-300 transition-colors duration-200 ${
                    activeMenu === item.title ? "bg-[#222]" : ""
                  }`}
                  onClick={() => {
                    if (item.isContact) setActiveMenu(activeMenu === item.title ? null : item.title);
                    else if (item.onClick) item.onClick();
                    else if (item.path) { navigate(item.path); setSidebarOpen(false); }
                    else setActiveMenu(activeMenu === item.title ? null : item.title);
                  }}
                >
                  <span className="text-yellow_theme">{item.icon}</span>
                  <div className="flex items-center ml-3 w-full">
                    <span className="text-sm flex-grow whitespace-nowrap">{item.title}</span>
                    <div className="flex items-center">
                      {item.isContact && activeMenu === item.title ? (
                        <FaChevronDown className="text-xs text-gray-200 transition-transform duration-200" />
                      ) : item.isContact ? (
                        <FaChevronRight className="text-xs text-gray-200 transition-transform duration-200" />
                      ) : null}
                    </div>
                  </div>
                </div>

                {item.isContact && activeMenu === item.title && (
                  <div className="pl-3 mb-2 space-y-2 animate-fadeIn">
                    {loadingSocialLinks ? (
                      <div className="p-2 text-center">
                        <div className="text-xs text-gray-200">{t.loadingContactOptions}</div>
                      </div>
                    ) : socialLinks.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 p-2">
                        {socialLinks.map((contact, contactIndex) => {
                          let bgColor = "", iconColor = "", textColor = "";
                          switch (contact.platform.toLowerCase()) {
                            case "whatsapp":  bgColor = "bg-gradient-to-r from-green-900/20 to-green-700/10";  iconColor = "text-green-400";  textColor = "text-green-300";  break;
                            case "email":     bgColor = "bg-gradient-to-r from-blue-900/20 to-blue-700/10";    iconColor = "text-blue-400";   textColor = "text-blue-300";   break;
                            case "facebook":  bgColor = "bg-gradient-to-r from-indigo-900/20 to-indigo-700/10";iconColor = "text-indigo-400"; textColor = "text-indigo-300"; break;
                            case "instagram": bgColor = "bg-gradient-to-r from-pink-900/20 to-purple-700/10";  iconColor = "text-pink-400";   textColor = "text-pink-300";   break;
                            case "telegram":  bgColor = "bg-gradient-to-r from-sky-900/20 to-sky-700/10";      iconColor = "text-sky-400";    textColor = "text-sky-300";    break;
                            case "twitter": case "x": bgColor = "bg-gradient-to-r from-gray-900/20 to-gray-700/10"; iconColor = "text-gray-400"; textColor = "text-gray-300"; break;
                            default:          bgColor = "bg-gradient-to-r from-gray-900/20 to-gray-700/10";    iconColor = "text-gray-400";   textColor = "text-gray-300";
                          }
                          return (
                            <div
                              key={contactIndex}
                              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer ${bgColor} border border-opacity-30 hover:scale-105 transition-all duration-200 hover:shadow-lg`}
                              onClick={() => handleContactClick(contact.url)}
                            >
                              <div className="mb-2"><span className={`text-2xl ${iconColor}`}>{contact.icon}</span></div>
                              <span className={`text-xs font-medium ${textColor}`}>{contact.title}</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 p-2">
                        {[
                          { url: "https://wa.me/+4407386588951",          icon: <FaWhatsapp  className="text-2xl text-green-400"  />, label: t.whatsapp,  bg: "from-green-900/20 to-green-700/10",   border: "border-green-700/30",   text: "text-green-300"  },
                          { url: "mailto:support@yourdomain.com",          icon: <FaEnvelope  className="text-2xl text-blue-400"   />, label: t.email,     bg: "from-blue-900/20 to-blue-700/10",     border: "border-blue-700/30",    text: "text-blue-300"   },
                          { url: "https://facebook.com",                   icon: <FaFacebook  className="text-2xl text-indigo-400" />, label: t.facebook,  bg: "from-indigo-900/20 to-indigo-700/10", border: "border-indigo-700/30",  text: "text-indigo-300" },
                          { url: "https://instagram.com",                  icon: <FaInstagram className="text-2xl text-pink-400"   />, label: t.instagram, bg: "from-pink-900/20 to-purple-700/10",   border: "border-pink-700/30",    text: "text-pink-300"   },
                          { url: "https://t.me/bajiman",                   icon: <FaTelegram  className="text-2xl text-sky-400"    />, label: t.telegram,  bg: "from-sky-900/20 to-sky-700/10",       border: "border-sky-700/30",     text: "text-sky-300"    },
                          { url: "https://twitter.com",                    icon: <FaTwitter   className="text-2xl text-gray-400"   />, label: t.twitter,   bg: "from-gray-900/20 to-gray-700/10",     border: "border-gray-700/30",    text: "text-gray-300"   },
                        ].map((s, si) => (
                          <div
                            key={si}
                            className={`flex flex-col items-center p-3 rounded-lg cursor-pointer bg-gradient-to-r ${s.bg} border ${s.border} hover:scale-105 transition-all duration-200 hover:shadow-lg`}
                            onClick={() => window.open(s.url, "_blank")}
                          >
                            <div className="mb-2">{s.icon}</div>
                            <span className={`text-xs font-medium ${s.text}`}>{s.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="h-10"></div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-50 z-30 md:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile App Download Banner */}
      {showMobileAppBanner && isMobileDevice() && (
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
                onClick={() => {
                  const hideUntil = Date.now() + 10 * 60 * 1000;
                  localStorage.setItem("mobileAppBannerHiddenUntil", hideUntil.toString());
                  setShowMobileAppBanner(false);
                  setTimeout(() => window.location.reload(), 100);
                }}
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

      {/* Mobile Bottom Nav */}
      <div
        className="md:hidden fixed bottom-0 border-t-[2px] font-semibold border-blue-500 left-0 right-0 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] z-50"
        style={showMobileAppBanner ? { bottom: "80px" } : {}}
      >
        <div className="flex justify-around items-end px-1">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex flex-col items-center cursor-pointer justify-center p-2 text-sm text-white hover:text-yellow-400 transition-colors min-w-[60px]">
            <img src={menu_img} alt="Menu" className="h-6 w-6 mb-1" />
            <span className="text-[11px] whitespace-nowrap">{t.menu}</span>
          </button>

          <div
            onClick={() => { isLoggedIn ? navigate("/promotions") : navigate("/login"); setSidebarOpen(false); }}
            className="flex flex-col items-center justify-center p-2 text-xs text-white hover:text-yellow-400 transition-colors cursor-pointer min-w-[60px]"
          >
            <img src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/favorite.png?v=1757670016214&source=drccdnsrc" alt="Promotions" className="h-6 w-6 mb-1" />
            <span className="text-[11px] whitespace-nowrap">{t.promotions}</span>
          </div>

          <div className="relative shrink-0" style={{ top: "-20px" }}>
            <NavLink to="/" className="flex flex-col items-center justify-center text-white text-sm transition-colors" onClick={() => setSidebarOpen(false)}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#166E5B", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #1a2344", boxShadow: "0 4px 16px rgba(22,163,74,0.55)" }}>
                <img src={home_img} alt="Home" className="h-6 w-6" />
              </div>
              <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.home}</span>
            </NavLink>
          </div>

          <div
            onClick={() => { isLoggedIn ? navigate("referral-program/details") : navigate("/login"); setSidebarOpen(false); }}
            className="flex flex-col items-center justify-center p-2 text-xs text-white hover:text-yellow-400 transition-colors cursor-pointer min-w-[60px]"
          >
            <img src={refer_img} alt="Refer" className="h-6 w-6 mb-1" />
            <span className="text-[11px] whitespace-nowrap">{t.refer || "Refer"}</span>
          </div>

          {isLoggedIn ? (
            <NavLink to="/my-profile" className="flex flex-col items-center justify-center p-2 text-sm text-white hover:text-yellow-400 transition-colors min-w-[60px]" onClick={() => setSidebarOpen(false)}>
              <img src={profile_img} alt="Profile" className="h-6 w-6 mb-1" />
              <span className="text-[11px] whitespace-nowrap">{t.profile}</span>
            </NavLink>
          ) : (
            <div onClick={() => navigate("/login")} className="flex flex-col items-center justify-center p-2 text-sm text-white hover:text-yellow-400 transition-colors cursor-pointer min-w-[60px]">
              <img src={profile_img} alt="Profile" className="h-6 w-6 mb-1" />
              <span className="text-[11px] whitespace-nowrap">{t.profile}</span>
            </div>
          )}
        </div>
      </div>

      {/* Floating social buttons */}
      <div className="fixed bottom-32 md:bottom-20 right-4 z-[1000] flex flex-col gap-2">
        <a href="https://t.me/bajiman" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 animate-bounce hover:animate-pulse" aria-label="Join Telegram Channel" style={{ animationDelay: "0.1s" }}>
          <img src={telegram_icon} className="w-[65px] md:w-[80px]" alt="" />
        </a>
        <a href="https://wa.me/+4407386588951" target="_blank" rel="noopener noreferrer" className="transition-all duration-300 animate-bounce hover:animate-pulse" aria-label="Contact Support on WhatsApp" style={{ animationDelay: "0.2s" }}>
          <img src={whatsapp_icon} className="w-[65px] md:w-[80px]" alt="" />
        </a>
      </div>

      {/* Signup Success Popup */}
      {showSignupPopup && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.4)] bg-opacity-70 backdrop-blur-md flex items-center justify-center z-[10000] p-4">
          <div ref={popupRef} className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-6 max-w-md w-full relative">
            <button onClick={() => setShowSignupPopup(false)} className="absolute -top-3 -right-3 bg-[#333] hover:bg-[#444] text-white cursor-pointer hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex justify-center mb-6">
              <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="30" cy="30" r="28" fill="#1a1a1a" stroke="#00cc00" strokeWidth="4" />
                <path d="M25 30L27 32L35 24" stroke="#00cc00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="text-white text-center text-lg font-semibold mb-2">{t.signupSuccess}</h2>
            <p className="text-gray-300 text-xs md:text-[15px] text-center mb-6">{t.signupSuccessMessage}</p>
            <NavLink to="/member/deposit" className="bg-theme_color text-center hover:bg-theme_color/90 text-[14px] text-white font-medium py-3 px-4 rounded-md transition-colors w-full block">
              {t.depositNow}
            </NavLink>
          </div>
        </div>
      )}

      {/* Game Loading Spinner */}
      {gameLoading && (
        <div className="fixed inset-0 bg-[rgba(0,0,0,0.7)] flex items-center justify-center z-[1000]">
          <div className="flex flex-col items-center">
            <div className="relative mb-8">
              <img src={logo} alt="Loading..." className="w-20 h-20 object-contain animate-pulse" />
              <div className="absolute -inset-4 border-4 border-theme_color border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .game-image-container { position: relative; width: 100%; height: 0; padding-bottom: 133.33%; overflow: hidden; border-radius: 6px; }
        .game-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeInUp { animation: fadeInUp 0.2s ease-out forwards; }
      `}</style>
    </>
  );
};

// ── IMPORTANT: wherever you render <Sidebar /> (e.g. in Layout.jsx or App.jsx),
// pass the two new props like this:
//
//   <Sidebar
//     sidebarOpen={sidebarOpen}
//     onCategorySelect={handleCategorySelect}
//     onExpandAndActivate={handleExpandAndActivate}   // ← NEW
//     externalActiveMenu={sidebarActiveMenu}           // ← NEW
//   />
//
// Both `handleExpandAndActivate` and `sidebarActiveMenu` are defined inside
// the Header component above and must be forwarded down from the parent that
// owns both Header and Sidebar, OR you can lift the state up / use context.