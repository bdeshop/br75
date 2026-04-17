import React, { useState, useEffect } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaGift,
  FaCrown,
  FaUserFriends,
  FaHandshake,
} from "react-icons/fa";
import { MdSupportAgent } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen,  // ← Make sure this is in props
  onCategorySelect, 
  onExpandAndActivate, 
  activeCategory 
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Sync active category from parent to local state AND fetch content
  useEffect(() => {
    if (activeCategory !== undefined && activeCategory !== null) {
      setActiveMenu(activeCategory);
      // Fetch content for the active category when it changes
      const category = categories.find(cat => cat.name === activeCategory);
      if (category) {
        fetchCategoryContent(category);
      }
    }
  }, [activeCategory, categories]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Function to fetch content based on category
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
    
    // If sidebar is closed: tell parent to open it and activate this category
    if (!sidebarOpen) {
      console.log("Sidebar closed, calling onExpandAndActivate");
      if (onExpandAndActivate) {
        await onExpandAndActivate(category);
      }
      return;
    }

    // Normal behaviour when sidebar is open
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

  // Function to close sidebar - with error checking
  const closeSidebar = () => {
    console.log("Closing sidebar", { setSidebarOpen: typeof setSidebarOpen });
    if (setSidebarOpen && typeof setSidebarOpen === 'function') {
      setSidebarOpen(false);
    } else {
      console.error("setSidebarOpen is not a function", setSidebarOpen);
    }
  };

  const secondaryMenuItems = [
    {
      title: "Promotions",
      icon: <FaGift className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Welcome Bonus", "Reload Bonus", "Cashback"],
      path: "/promotions"
    },
    {
      title: "VIP Club",
      icon: <FaCrown className="w-5 h-5 min-w-[20px]" />,
      subItems: ["VIP Levels", "Exclusive Rewards", "Personal Manager"],
      path: "/vip-club"
    },
    {
      title: "Referral program",
      icon: <FaUserFriends className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Invite Friends", "Earn Commission", "Bonus Terms"],
      path: "/referral-program"
    },
    {
      title: "Affiliate",
      icon: <FaHandshake className="w-5 h-5 min-w-[20px]" />,
      subItems: ["Join Program", "Marketing Tools", "Commission Rates"],
      onClick: () => { window.location.href = "https://m-affiliate.bir75.com"; }
    },
  ];

  // Desktop Sidebar Content
  const DesktopSidebar = () => (
    <div
      className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white overflow-y-auto
        transition-all duration-300 ease-in-out px-2
        ${sidebarOpen ? "w-75" : "w-15 -translate-x-full md:translate-x-0"}`}
    >
      {/* Live Chat button */}
      <div
        className={`w-full flex justify-start items-center px-4 pt-4 pb-3 transition-all duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0 h-0 p-0 mb-0"
        }`}
      >
        {sidebarOpen ? (
          <a 
            href="https://wa.me/+4407386588951" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-theme_gray p-2 rounded-[3px] text-center flex justify-center items-center gap-3 w-full hover:bg-opacity-80 transition"
          >
            <MdSupportAgent className="text-white text-[20px]" />
            <span className="text-[13px]">24/7 Live Chat</span>
          </a>
        ) : (
          <a 
            href="https://wa.me/+4407386588951" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-theme_gray p-2 rounded-[3px] text-center flex justify-center items-center gap-3 w-full"
          >
            <MdSupportAgent className="text-white text-[20px]" />
          </a>
        )}
      </div>

      {/* Banner Image */}
      {sidebarOpen && (
        <div className="p-[10px]">
          <img
            className="w-full rounded"
            src="https://img.b112j.com/upload/h5Announcement/image_182702.jpg"
            alt="Promotion Banner"
          />
        </div>
      )}

      {/* Categories Section */}
      <div className="space-y-1 mt-[15px]">
        {categories.map((category) => (
          <div key={category._id}>
            <div
              className={`flex items-center p-3 rounded cursor-pointer hover:text-gray-500 text-gray-400 transition-colors duration-200 ${
                activeMenu === category.name ? "bg-[#ffffff10] text-white" : ""
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
                <div className="w-5 h-5 min-w-[20px] bg-gray-700 rounded"></div>
              )}
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ${
                  sidebarOpen ? "ml-3 w-full" : "w-0"
                }`}
              >
                <span className="text-sm flex-grow whitespace-nowrap font-medium">
                  {category.name}
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
                <div className="ml-8 mt-1 mb-2">
                  {isLoading ? (
                    <div className="p-4 text-center text-[12px] text-gray-400">
                      Loading...
                    </div>
                  ) : category.name?.toLowerCase() === "exclusive" ? (
                    <div className="grid grid-cols-2 gap-2 p-2">
                      {exclusiveGames.length === 0 ? (
                        <div className="col-span-2 text-center text-gray-400 py-4">
                          No exclusive games found
                        </div>
                      ) : (
                        exclusiveGames.map((game, gameIndex) => (
                          <div
                            key={gameIndex}
                            className="flex flex-col items-center rounded-[3px] transition-all cursor-pointer group"
                            onClick={() => handleGameClick(game)}
                          >
                            <div className="game-image-container w-full mb-2">
                              <img
                                src={getFullImageUrl(game.portraitImage || game.image)}
                                alt={game.name || game.gameName}
                                className="game-image rounded-[6px] transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => { 
                                  e.target.src = "https://via.placeholder.com/100x133?text=Game"; 
                                }}
                              />
                            </div>
                            <div className="w-full pt-1">
                              <span className="text-xs text-gray-400 truncate block text-center">
                                {game.name || game.gameName || "Game"}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {providers.length === 0 && !isLoading ? (
                        <div className="text-center text-gray-400 py-4">
                          No providers found
                        </div>
                      ) : (
                        providers.map((provider, providerIndex) => (
                          <div
                            key={providerIndex}
                            className="flex items-center p-2 rounded cursor-pointer hover:bg-[#333] transition-colors duration-200"
                            onClick={() => handleProviderClick(provider)}
                          >
                            {provider.image && (
                              <img
                                src={getFullImageUrl(provider.image)}
                                alt={provider.name}
                                className="w-6 h-6 mr-2 object-contain"
                                onError={(e) => { 
                                  e.target.style.display = "none"; 
                                }}
                              />
                            )}
                            <span className="text-xs text-gray-400 hover:text-white">
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
        className={`border-t border-[#222424] my-4 mx-2 transition-all duration-300 ${
          sidebarOpen ? "opacity-100" : "opacity-0"
        }`}
      ></div>

      {/* Promotions label */}
      <div
        className={`px-2 mb-2 transition-all duration-300 overflow-hidden ${
          sidebarOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex justify-between items-center p-2">
          <span className="text-sm font-medium text-gray-300">Promotions</span>
          <a href="/promotions" className="text-xs text-theme_color2 underline cursor-pointer hover:text-opacity-80">
            View all
          </a>
        </div>
      </div>

      {/* Secondary menu items */}
      <div className="space-y-1">
        {secondaryMenuItems.map((item, index) => (
          <div key={index}>
            <div
              className={`flex items-center p-3 rounded text-gray-400 cursor-pointer hover:text-gray-300 transition-colors duration-200 ${
                activeMenu === item.title ? "bg-[#ffffff10] text-white" : ""
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
                <span className="text-sm flex-grow whitespace-nowrap font-medium">
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
                <div className="ml-8 mt-1 mb-2 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <div
                      key={subIndex}
                      className={`p-2 text-xs rounded cursor-pointer hover:bg-[#333] transition-colors duration-200 ${
                        activeSubMenu === subItem ? "bg-[#333] text-white" : "text-gray-400"
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

  // Mobile Sidebar (full width overlay)
  const MobileSidebar = () => (
    <>
      {/* Backdrop overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}
      
      {/* Mobile sidebar panel - full width */}
      <div
        className={`fixed top-0 left-0 h-full w-full md:hidden bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ marginTop: "56px" }}
      >
        {/* Close button - fixed at top right */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] px-4 py-3 flex justify-end items-center border-b border-gray-700">
          <button 
            onClick={closeSidebar} 
            className="cursor-pointer p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
            aria-label="Close sidebar"
          >
            <IoClose size={24} className="text-white" />
          </button>
        </div>

        <div className="w-full pb-20">
          {/* Live Chat */}
          <div className="w-full flex justify-start items-center px-4 pt-4 pb-3">
            <a href="https://wa.me/+4407386588951" target="_blank" rel="noopener noreferrer" className="block w-full">
              <span className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] border-[1px] border-blue-500 text-[16px] px-2 py-2.5 rounded-[3px] text-center flex justify-center items-center gap-3 cursor-pointer hover:bg-[#2a2a2a] transition">
                <MdSupportAgent className="text-white text-[20px]" />
                <span className="text-[13px]">24/7 Live Chat</span>
              </span>
            </a>
          </div>

          {/* Banner */}
          <div className="px-4 py-2">
            <img
              className="w-full rounded"
              src="https://img.b112j.com/upload/h5Announcement/image_182702.jpg"
              alt="Promotion Banner"
            />
          </div>

          {/* Categories for Mobile */}
          <div className="space-y-1 px-4 mt-4">
            <h3 className="text-lg font-semibold text-white mb-3 px-2">Categories</h3>
            {categories.map((category) => (
              <div key={category._id}>
                <div
                  className={`flex items-center p-3 rounded cursor-pointer transition-colors duration-200 ${
                    activeMenu === category.name 
                      ? "bg-[#ffffff10] text-white" 
                      : "text-gray-400 hover:text-gray-300 hover:bg-[#ffffff05]"
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
                    <div className="w-5 h-5 min-w-[20px] bg-gray-700 rounded"></div>
                  )}
                  <div className="flex items-center justify-between ml-3 w-full">
                    <span className="text-sm flex-grow font-semibold">
                      {category.name}
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
                    <div className="ml-8 mt-1 mb-2">
                      {isLoading ? (
                        <div className="p-4 text-center text-[12px] text-gray-400">Loading...</div>
                      ) : category.name?.toLowerCase() === "exclusive" ? (
                        <div className="grid grid-cols-2 gap-3 p-2">
                          {exclusiveGames.map((game, gameIndex) => (
                            <div
                              key={gameIndex}
                              className="flex flex-col items-center rounded-[3px] transition-all cursor-pointer group"
                              onClick={() => handleGameClick(game)}
                            >
                              <div className="game-image-container w-full mb-2">
                                <img
                                  src={getFullImageUrl(game.portraitImage || game.image)}
                                  alt={game.name || game.gameName}
                                  className="game-image rounded-[6px]"
                                />
                              </div>
                              <span className="text-xs text-gray-400 text-center truncate w-full">
                                {game.name || game.gameName || "Game"}
                              </span>
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
                                  src={getFullImageUrl(provider.image)}
                                  alt={provider.name}
                                  className="w-6 h-6 mr-2 object-contain"
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

          {/* Divider */}
          <div className="border-t border-[#222424] my-4 mx-4"></div>
          
          {/* Promotions Section */}
          <div className="px-4 mb-2">
            <div className="flex justify-between items-center p-2">
              <span className="text-sm font-medium text-gray-300">Promotions</span>
              <a href="/promotions" className="text-xs text-theme_color2 underline cursor-pointer">
                View all
              </a>
            </div>
          </div>

          {/* Secondary Menu for Mobile */}
          <div className="space-y-1 px-4">
            {secondaryMenuItems.map((item, index) => (
              <div key={index}>
                <div
                  className={`flex items-center p-3 rounded text-gray-400 cursor-pointer transition-colors duration-200 ${
                    activeMenu === item.title ? "bg-[#ffffff10] text-white" : "hover:text-gray-300 hover:bg-[#ffffff05]"
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
                    <span className="text-sm flex-grow whitespace-nowrap font-medium">
                      {item.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  if (isLoading && categories.length === 0) {
    return (
      <div
        className={`fixed md:block hidden md:relative min-h-[calc(100vh-56px)] no-scrollbar border-r border-[#222424] z-20 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white overflow-y-auto
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-75" : "w-20 -translate-x-full py-4 md:translate-x-0"}`}
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
      
      <style jsx>{`
        .game-image-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 133.33%;
          overflow: hidden;
          border-radius: 6px;
        }
        .game-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
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