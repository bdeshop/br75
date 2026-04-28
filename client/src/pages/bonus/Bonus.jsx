import React, { useState, useEffect, useContext, useRef } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiChevronDown, FiBell, FiExternalLink, FiClock, FiGift, FiCheckCircle, FiXCircle, FiAlertCircle, FiCalendar, FiStar, FiAward, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaMoneyBillWave, FaCalendarAlt, FaTag, FaInfoCircle, FaCalendarWeek, FaChartLine, FaCoins, FaExchangeAlt, FaCrown, FaMedal, FaGem, FaRocket, FaGift as FaGiftIcon } from "react-icons/fa";
import { MdCalendarMonth, MdEmojiEvents } from "react-icons/md";
import axios from "axios";
import logo from "../../assets/logo.png";
import { LanguageContext } from "../../context/LanguageContext";
import toast, { Toaster } from 'react-hot-toast';
import { GoTrophy } from "react-icons/go";

const Bonus = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [bonuses, setBonuses] = useState([]);
  const [stats, setStats] = useState({
    totalAvailable: 0,
    totalBonusAmount: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [claimingBonusId, setClaimingBonusId] = useState(null);
  const [claimingBettingBonusId, setClaimingBettingBonusId] = useState(null);
  const [bettingBonuses, setBettingBonuses] = useState([]);
  const [bettingStats, setBettingStats] = useState({
    totalUnclaimed: 0,
    totalBonusAmount: 0,
    totalBetAmount: 0
  });
  const [loadingBetting, setLoadingBetting] = useState(true);
  
  // Level Up Bonus States
  const [levelData, setLevelData] = useState(null);
  const [loadingLevel, setLoadingLevel] = useState(true);
  const [claimingLevelBonus, setClaimingLevelBonus] = useState(null);
  const [claimingAllLevels, setClaimingAllLevels] = useState(false);
  
  // Carousel/slide state for levels
  const [levelCarouselIndex, setLevelCarouselIndex] = useState(0);
  const carouselRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  // Get language context
  const { language, t } = useContext(LanguageContext);
  
  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('usertoken');
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch available cash bonuses
  const fetchBonuses = async () => {
    try {
      if (!token) {
        setError(t?.pleaseLoginToViewBonuses || "Please login to view bonuses");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${base_url}/api/user/cash-bonus/available`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Bonuses response:", response.data);
      
      if (response.data.success) {
        setBonuses(response.data.data.bonuses || []);
        setStats(response.data.data.stats || {
          totalAvailable: 0,
          totalBonusAmount: 0,
          expiringSoon: 0
        });
      } else {
        setError(response.data.message || (t?.failedToFetchBonuses || "Failed to fetch bonuses"));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (t?.failedToFetchBonuses || "Failed to fetch bonuses");
      setError(errorMessage);
      console.error("Error fetching bonuses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available betting bonuses (weekly & monthly)
  const fetchBettingBonuses = async () => {
    try {
      if (!token) {
        setLoadingBetting(false);
        return;
      }
      
      setLoadingBetting(true);
      
      const response = await axios.get(`${base_url}/api/user/betting-bonus/unclaimed`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Betting bonuses response:", response.data);
      
      if (response.data.success) {
        setBettingBonuses(response.data.data.bonuses || []);
        setBettingStats(response.data.data.stats || {
          totalUnclaimed: 0,
          totalBonusAmount: 0,
          totalBetAmount: 0
        });
      }
    } catch (err) {
      console.error("Error fetching betting bonuses:", err);
    } finally {
      setLoadingBetting(false);
    }
  };

  // Fetch level up bonus status
  const fetchLevelBonusStatus = async () => {
    try {
      if (!token) {
        setLoadingLevel(false);
        return;
      }
      
      setLoadingLevel(true);
      
      console.log("Fetching level bonus status...");
      const response = await axios.get(`${base_url}/api/user/level-bonus/status`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("Level bonus status response:", response.data);
      
      if (response.data.success) {
        setLevelData(response.data.data);
        console.log("Level data set:", response.data.data);
        console.log("Pending bonuses:", response.data.data.pendingBonuses);
        console.log("Has pending bonuses:", response.data.data.pendingBonuses?.length > 0);
        
        // Set carousel index to current level position
        if (response.data.data.allLevels && response.data.data.currentLevel) {
          const currentLevelObj = response.data.data.allLevels.find(l => l.isCurrent);
          if (currentLevelObj) {
            const currentIndex = response.data.data.allLevels.findIndex(l => l.level === currentLevelObj.level);
            if (currentIndex !== -1) {
              // Set index so current level is in the middle for desktop, visible for mobile
              setLevelCarouselIndex(Math.max(0, currentIndex - 1));
            }
          }
        }
      } else {
        console.log("Level bonus API returned success false:", response.data);
      }
    } catch (err) {
      console.error("Error fetching level bonus status:", err);
      console.error("Error details:", err.response?.data);
    } finally {
      setLoadingLevel(false);
    }
  };

  // Claim level up bonus
  const claimLevelBonus = async (level) => {
    setClaimingLevelBonus(level);
    try {
      const response = await axios.post(
        `${base_url}/api/user/level-bonus/claim/${level}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh all data
        await fetchLevelBonusStatus();
        await fetchBonuses();
        await fetchBettingBonuses();
        
        // Update user balance in localStorage
        if (response.data.data.balanceAfter) {
          const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
          updatedUser.balance = response.data.data.balanceAfter;
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        toast.error(response.data.message || "Failed to claim level bonus");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to claim level bonus";
      toast.error(errorMessage);
      console.error("Error claiming level bonus:", err);
    } finally {
      setClaimingLevelBonus(null);
    }
  };

  // Claim all pending level bonuses
  const claimAllLevelBonuses = async () => {
    setClaimingAllLevels(true);
    try {
      const response = await axios.post(
        `${base_url}/api/user/level-bonus/claim-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        // Refresh all data
        await fetchLevelBonusStatus();
        await fetchBonuses();
        await fetchBettingBonuses();
        
        // Update user balance in localStorage
        if (response.data.data.balanceAfter) {
          const updatedUser = JSON.parse(localStorage.getItem('user') || '{}');
          updatedUser.balance = response.data.data.balanceAfter;
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        toast.error(response.data.message || "Failed to claim level bonuses");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to claim level bonuses";
      toast.error(errorMessage);
      console.error("Error claiming all level bonuses:", err);
    } finally {
      setClaimingAllLevels(false);
    }
  };

  // Claim a cash bonus directly
  const claimBonus = async (bonusId, bonusTitle, bonusAmount) => {
    setClaimingBonusId(bonusId);
    try {
      const response = await axios.post(
        `${base_url}/api/user/cash-bonus/claim/${bonusId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || "Bonus claimed successfully!");
        await fetchBonuses();
        // Update user balance in localStorage
        if (response.data.data.balanceAfter) {
          const updatedUser = { ...user, balance: response.data.data.balanceAfter };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        toast.error(response.data.message || "Failed to claim bonus");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to claim bonus";
      toast.error(errorMessage);
      console.error("Error claiming bonus:", err);
    } finally {
      setClaimingBonusId(null);
    }
  };

  // Claim a betting bonus (weekly/monthly)
  const claimBettingBonus = async (bonusId, bonusType, bonusAmount) => {
    setClaimingBettingBonusId(bonusId);
    try {
      const response = await axios.post(
        `${base_url}/api/user/betting-bonus/claim/${bonusId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        toast.success(response.data.message || `${bonusType.charAt(0).toUpperCase() + bonusType.slice(1)} bonus claimed successfully!`);
        await fetchBettingBonuses();
        await fetchBonuses(); // Refresh cash bonuses as balance changed
        // Update user balance in localStorage
        if (response.data.data.balanceAfter) {
          const updatedUser = { ...user, balance: response.data.data.balanceAfter };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        toast.error(response.data.message || "Failed to claim bonus");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to claim bonus";
      toast.error(errorMessage);
      console.error("Error claiming betting bonus:", err);
    } finally {
      setClaimingBettingBonusId(null);
    }
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Mouse/Touch drag handlers for carousel
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Scroll to specific position
  const scrollCarousel = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 220; // Width of one card + gap
    const newScrollLeft = direction === 'left' 
      ? carouselRef.current.scrollLeft - scrollAmount
      : carouselRef.current.scrollLeft + scrollAmount;
    
    carouselRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // Load bonuses on component mount
  useEffect(() => {
    if (token) {
      fetchBonuses();
      fetchBettingBonuses();
      fetchLevelBonusStatus();
    } else {
      setLoading(false);
      setLoadingBetting(false);
      setLoadingLevel(false);
      setError(t?.pleaseLoginToViewBonuses || "Please login to view bonuses");
    }
  }, [token]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return t?.noExpiry || "No expiry";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return (t?.todayAt || 'Today at') + ' ' + date.toLocaleTimeString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      return t?.invalidDate || "Invalid date";
    }
  };

  // Get days left until expiry
  const getDaysLeft = (expiresAt, noExpiry) => {
    if (noExpiry) return null;
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    return diffDays;
  };

  // Get days left for betting bonus (3 days validity)
  const getBettingDaysLeft = (distributionDate) => {
    if (!distributionDate) return null;
    
    const now = new Date();
    const expiryDate = new Date(distributionDate);
    expiryDate.setDate(expiryDate.getDate() + 3); // 3 days validity
    
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 0;
    return diffDays;
  };

  // Get urgency class based on days left
  const getUrgencyClass = (daysLeft) => {
    if (daysLeft === null) return "text-gray-400";
    if (daysLeft <= 1) return "text-red-400";
    if (daysLeft <= 3) return "text-yellow-400";
    if (daysLeft <= 7) return "text-orange-400";
    return "text-green-400";
  };

  // Get bonus type display name
  const getBonusTypeName = (type) => {
    const types = {
      special_event: "Special Event",
      welcome_bonus: "Welcome Bonus",
      loyalty_reward: "Loyalty Reward",
      compensation: "Compensation",
      promotional: "Promotional",
      referral: "Referral",
      achievement: "Achievement"
    };
    return types[type] || type?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || "Bonus";
  };

  // Get bonus type icon
  const getBonusTypeIcon = (type) => {
    const icons = {
      special_event: "🎉",
      welcome_bonus: "👋",
      loyalty_reward: "🏆",
      compensation: "🤝",
      promotional: "📢",
      referral: "🔗",
      achievement: "⭐"
    };
    return icons[type] || "🎁";
  };

  // Get betting bonus icon
  const getBettingBonusIcon = (type) => {
    return type === 'weekly' ? <FaCalendarWeek className="text-blue-400" /> : <MdCalendarMonth className="text-purple-400" />;
  };

  // Get betting bonus display name
  const getBettingBonusName = (type) => {
    return type === 'weekly' ? "Weekly Betting Bonus" : "Monthly Betting Bonus";
  };

  const isLoading = loading || loadingBetting || loadingLevel;

  // Check if there are no bonuses at all
  const hasNoBonuses = bonuses.length === 0 && bettingBonuses.length === 0 && (!levelData || levelData.pendingBonuses?.length === 0) && !isLoading && token;

  // Debug log for level data
  console.log("Debug - Level Data State:", {
    token: !!token,
    levelData: levelData,
    hasLevelData: !!levelData,
    pendingBonuses: levelData?.pendingBonuses,
    pendingCount: levelData?.pendingBonuses?.length,
    showLevelSection: token && levelData
  });

  if (isLoading && bonuses.length === 0 && bettingBonuses.length === 0 && !levelData) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="w-full overflow-y-auto flex items-center justify-center">
            <div className='w-full p-[20px] flex justify-center items-center'>
              <div className="relative w-24 h-24 flex justify-center items-center">
                <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden w-full font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      <Toaster 
        toastOptions={{ 
          style: { 
            background: '#1a1a1a', 
            color: '#fff', 
            border: '1px solid #333' 
          },
          duration: 3000
        }} 
      />
      
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] w-full">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto w-full transition-all duration-300">
          {/* Main Content Area */}
          <div className="mx-auto overflow-y-auto pb-[100px] w-full max-w-screen-xl px-4 md:px-[50px] py-6">
            
            {/* ==================== LEVEL UP BONUS SECTION ==================== */}
            {/* ALWAYS SHOW level section if user is logged in and we have level data */}
            {token && (
              <div className="mb-6 rounded-xl bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] overflow-hidden">
                <div className="p-4 sm:p-5">
                  {/* Loading state for level data */}
                  {loadingLevel ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-gray-400">Loading level data...</span>
                    </div>
                  ) : levelData ? (
                    <>
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                            <GoTrophy className="text-yellow-500 text-2xl" />
                          </div>
                          <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                              Level Up Bonuses
                            </h2>
                            <p className="text-xs text-gray-400 mt-1">
                              Reach higher levels to unlock bigger bonuses
                            </p>
                          </div>
                        </div>
                        
                        {levelData.pendingBonuses && levelData.pendingBonuses.length > 0 && (
                          <button
                            onClick={claimAllLevelBonuses}
                            disabled={claimingAllLevels}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {claimingAllLevels ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaGiftIcon className="text-sm" />
                            )}
                            Claim All ({levelData.pendingBonuses.length})
                          </button>
                        )}
                      </div>
                      
                      {/* No Level Data Message */}
                      {!levelData && !loadingLevel && (
                        <div className="text-center py-8">
                          <p className="text-gray-400">No level data available. Start betting to earn level bonuses!</p>
                        </div>
                      )}
                      
                      {/* Current Level Card */}
                      {levelData && (
                        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg p-4 mb-4">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="text-4xl">{levelData.currentLevel?.icon || "🎯"}</div>
                              <div>
                                <p className="text-xs text-gray-400">Current Level</p>
                                <h3 className="text-xl font-bold text-white">
                                  {levelData.currentLevel?.name || "Bronze"} <span className="text-sm text-gray-400">(Level {levelData.currentLevel?.level || 1})</span>
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  Total Lifetime Bet: ৳{levelData.stats?.totalLifetimeBet?.toLocaleString() || 0}
                                </p>
                              </div>
                            </div>
                            
                            {levelData.nextLevel && (
                              <div className="flex-1 w-full md:max-w-md ">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                  <span>Progress to {levelData.nextLevel.name}</span>
                                  <span className="text-yellow-400">{Math.floor(levelData.nextLevel.progress)}%</span>
                                </div>
                                <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                                  <div 
                                    className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                    style={{ width: `${levelData.nextLevel.progress}%` }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs mt-1">
                                  <span className="text-gray-500">Need: ৳{levelData.nextLevel.remainingBet?.toLocaleString()}</span>
                                  <span className="text-green-400">Next Bonus: ৳{levelData.nextLevel.bonusAmount?.toLocaleString()}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Pending Level Bonuses */}
                      {levelData && levelData.pendingBonuses && levelData.pendingBonuses.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                            <FiAward className="text-yellow-500" />
                            Unclaimed Level Bonuses ({levelData.pendingBonuses.length})
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {levelData.pendingBonuses.map((bonus) => (
                              <div 
                                key={bonus.id || bonus.level}
                                className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{bonus.levelIcon || "🎁"}</span>
                                    <div>
                                      <p className="text-sm font-medium text-white">
                                        Level {bonus.level}: {bonus.levelName}
                                      </p>
                                      <p className="text-xs text-yellow-400">
                                        ৳{bonus.bonusAmount?.toLocaleString()} Bonus
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => claimLevelBonus(bonus.level)}
                                    disabled={claimingLevelBonus === bonus.level}
                                    className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg text-xs font-medium transition-all duration-300 disabled:opacity-50"
                                  >
                                    {claimingLevelBonus === bonus.level ? (
                                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      "Claim"
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* All Levels Grid - Draggable Carousel */}
                      {levelData && levelData.allLevels && (
                        <div className="">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                              <FaCrown className="text-yellow-500" />
                              All Level Requirements
                            </h3>
                            
                            {/* Navigation Arrows - only show on desktop */}
                            <div className="hidden md:flex gap-2">
                              <button
                                onClick={() => scrollCarousel('left')}
                                className="p-1 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all"
                              >
                                <FiChevronLeft className="text-white text-sm" />
                              </button>
                              <button
                                onClick={() => scrollCarousel('right')}
                                className="p-1 rounded-full bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-all"
                              >
                                <FiChevronRight className="text-white text-sm" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Draggable Horizontal Scroll Carousel */}
                          <div className="relative">
                            <div 
                              ref={carouselRef}
                              className="flex gap-2 py-[20px] overflow-x-auto scroll-smooth pb-2 hide-scrollbar cursor-grab active:cursor-grabbing"
                              style={{ 
                                scrollbarWidth: 'none', 
                                msOverflowStyle: 'none',
                                userSelect: 'none'
                              }}
                              onMouseDown={handleMouseDown}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseUp}
                              onTouchStart={handleTouchStart}
                              onTouchMove={handleTouchMove}
                              onTouchEnd={handleTouchEnd}
                            >
                              {levelData.allLevels?.map((level, idx) => {
                                const isClaimed = level.status === 'claimed';
                                const isPending = level.status === 'pending';
                                const isCurrent = level.isCurrent;
                                const isLocked = level.status === 'locked';
                                const isAvailable = level.status === 'available';
                                
                                return (
                                  <div 
                                    key={level.level}
                                    className={`flex-shrink-0 w-[140px] p-3 rounded-lg text-center transition-all ${
                                      isCurrent 
                                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/70 scale-105 shadow-lg shadow-yellow-500/20' 
                                        : isClaimed 
                                          ? 'bg-green-500/10 border border-green-500/30'
                                          : isPending
                                            ? 'bg-yellow-500/10 border border-yellow-500/30 animate-pulse'
                                            : isAvailable
                                              ? 'bg-blue-500/10 border border-blue-500/30'
                                              : 'bg-[#1a1a1a] border border-[#2a2a2a] opacity-60'
                                    }`}
                                  >
                                    <div className="text-3xl">{level.icon}</div>
                                    <p className="text-sm font-medium mt-2">{level.name}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">৳{level.minBet?.toLocaleString()}</p>
                                    <p className="text-[11px] text-yellow-400 font-semibold">+৳{level.bonusAmount?.toLocaleString()}</p>
                                    <div className="mt-2">
                                      {isClaimed && (
                                        <span className="text-[10px] text-green-400 flex items-center justify-center gap-1">
                                          <FiCheckCircle className="text-[10px]" /> Claimed
                                        </span>
                                      )}
                                      {isPending && (
                                        <span className="text-[10px] text-yellow-400 flex items-center justify-center gap-1">
                                          <FiAward className="text-[10px]" /> Ready!
                                        </span>
                                      )}
                                      {isCurrent && (
                                        <span className="text-[10px] text-orange-400 flex items-center justify-center gap-1">
                                          <FaCrown className="text-[10px]" /> Current
                                        </span>
                                      )}
                                      {isLocked && (
                                        <span className="text-[10px] text-gray-500">Locked</span>
                                      )}
                                      {isAvailable && !isClaimed && !isPending && !isCurrent && (
                                        <span className="text-[10px] text-blue-400">Available</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {/* Gradient fade edges for carousel - hide on mobile */}
                            <div className="hidden md:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1a1a1a] to-transparent pointer-events-none"></div>
                            <div className="hidden md:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1a1a1a] to-transparent pointer-events-none"></div>
                          </div>
                          
                          {/* Scroll hint - shows on mobile */}
                          <div className="md:hidden text-center mt-2">
                            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                              <FiChevronLeft className="text-xs" /> Swipe to see more <FiChevronRight className="text-xs" />
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">No level data available. Start betting to earn level bonuses!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col pt-[25px] lg:pt-[50px] sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div>
                <h1 className="text-[18px] md:text-xl sm:text-[22px] font-[600] text-white flex items-center gap-2">
                  <FiGift className="text-yellow-500" />
                  {t?.availableBonuses || "Available Bonuses"}
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  {t?.claimCashBonuses || "Claim cash bonuses and betting rewards directly to your account"}
                </p>
              </div>
            </div>

            {!token ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222] mb-3 sm:mb-4">
                  <FiBell className="text-lg sm:text-xl text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">{t?.authenticationRequired || "Authentication Required"}</h3>
                <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">{t?.pleaseLoginToViewBonuses || "Please log in to view and claim your bonuses"}</p>
                <a 
                  href="/login" 
                  className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
                >
                  {t?.signIn || "Sign In"}
                </a>
              </div>
            ) : (
              <>
                {/* Show No Bonus Message when both are empty */}
                {hasNoBonuses ? (
                  <div className="rounded-lg p-6 sm:p-10 text-center max-w-md mx-auto">
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#222] mb-4">
                      <FiGift className="text-2xl sm:text-3xl text-gray-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium mb-2 text-gray-300">
                      {t?.noBonusesAvailable || "No Bonuses Available"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {t?.noBonusesMessage || "You don't have any bonuses available at the moment. Check back later for new offers and rewards!"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Cash Bonuses Section */}
                    <div className="mb-8">
                      {bonuses.length === 0 ? (
                        <></>
                      ) : (
                        <>
                          {/* Cash Bonuses List */}
                          <div className="space-y-3 sm:space-y-4">
                            {bonuses.map((bonus) => {
                              const daysLeft = getDaysLeft(bonus.expiresAt, bonus.noExpiry);
                              const urgencyClass = getUrgencyClass(daysLeft);
                              const isExpiringSoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
                              
                              return (
                                <div 
                                  key={bonus.id} 
                                  className={`bg-gradient-to-br from-[#1a1a1a] to-[#151515] border ${isExpiringSoon ? 'border-yellow-500/30' : 'border-[#2a2a2a]'} rounded-lg overflow-hidden transition-all hover:border-[#3a3a3a] hover:shadow-md`}
                                >
                                  <div 
                                    className="p-3 sm:p-4 cursor-pointer"
                                    onClick={() => toggleDropdown(bonus.id)}
                                  >
                                    <div className="flex items-start">
                                      {/* Bonus Icon */}
                                      <div className="flex-shrink-0 mr-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                                          <span className="text-xl sm:text-2xl">{getBonusTypeIcon(bonus.bonusType)}</span>
                                        </div>
                                      </div>
                                      
                                      {/* Bonus Info */}
                                      <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <div>
                                            <h2 className="text-sm sm:text-base font-[600] text-white">{bonus.title}</h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                              <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                ৳{bonus.amount.toLocaleString()}
                                              </span>
                                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <FaTag className="text-[10px]" />
                                                {getBonusTypeName(bonus.bonusType)}
                                              </span>
                                              {!bonus.noExpiry && bonus.expiresAt && (
                                                <span className={`text-xs flex items-center gap-1 ${urgencyClass}`}>
                                                  <FiClock className="text-[10px]" />
                                                  {daysLeft === 0 ? (t?.expired || "Expired") : daysLeft === 1 ? (t?.expiresToday || "Expires today") : `${daysLeft} ${t?.daysLeft || "days left"}`}
                                                </span>
                                              )}
                                              {bonus.noExpiry && (
                                                <span className="text-xs text-green-400 flex items-center gap-1">
                                                  <FiClock className="text-[10px]" />
                                                  {t?.neverExpires || "Never expires"}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                claimBonus(bonus.id, bonus.title, bonus.amount);
                                              }}
                                              disabled={claimingBonusId === bonus.id}
                                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {claimingBonusId === bonus.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                t?.claimNow || "Claim Now"
                                              )}
                                            </button>
                                            <FiChevronDown
                                              className={`text-gray-500 text-base sm:text-lg transition-transform duration-300 ${
                                                openDropdowns[bonus.id] ? "rotate-180" : ""
                                              }`}
                                            />
                                          </div>
                                        </div>
                                        
                                        <p className="text-gray-400 mt-2 text-xs sm:text-sm">
                                          {bonus.description}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Expanded Details */}
                                    {openDropdowns[bonus.id] && (
                                      <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{t?.bonusDetails || "Bonus Details"}</p>
                                            <ul className="space-y-1 text-xs">
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">{t?.amount || "Amount"}:</span>
                                                <span className="text-yellow-400 font-medium">৳{bonus.amount.toLocaleString()}</span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">{t?.type || "Type"}:</span>
                                                <span>{getBonusTypeName(bonus.bonusType)}</span>
                                              </li>
                                              {bonus.occasion && (
                                                <li className="flex justify-between">
                                                  <span className="text-gray-400">{t?.occasion || "Occasion"}:</span>
                                                  <span>{bonus.occasion}</span>
                                                </li>
                                              )}
                                            </ul>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">{t?.validity || "Validity"}</p>
                                            <ul className="space-y-1 text-xs">
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">{t?.created || "Created"}:</span>
                                                <span>{formatDate(bonus.createdAt)}</span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">{t?.expires || "Expires"}:</span>
                                                <span className={urgencyClass}>
                                                  {bonus.noExpiry ? (t?.never || "Never") : formatDate(bonus.expiresAt)}
                                                </span>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Betting Bonuses Section */}
                    <div>
                      {bettingBonuses.length === 0 ? (
                        <></>
                      ) : (
                        <>
                          {/* Betting Bonuses List */}
                          <div className="space-y-3 sm:space-y-4">
                            {bettingBonuses.map((bonus) => {
                              const daysLeft = getBettingDaysLeft(bonus.distributionDate);
                              const urgencyClass = getUrgencyClass(daysLeft);
                              const isExpiringSoon = daysLeft !== null && daysLeft <= 2 && daysLeft > 0;
                              
                              return (
                                <div 
                                  key={bonus.id} 
                                  className={`bg-gradient-to-br from-[#1a1a1a] to-[#151515] border ${isExpiringSoon ? 'border-red-500/30' : 'border-[#2a2a2a]'} rounded-lg overflow-hidden transition-all hover:border-[#3a3a3a] hover:shadow-md`}
                                >
                                  <div 
                                    className="p-3 sm:p-4 cursor-pointer"
                                    onClick={() => toggleDropdown(`betting-${bonus.id}`)}
                                  >
                                    <div className="flex items-start">
                                      {/* Bonus Icon */}
                                      <div className="flex-shrink-0 mr-3">
                                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                                          bonus.bonusType === 'weekly' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                                        }`}>
                                          {bonus.bonusType === 'weekly' ? (
                                            <FaCalendarWeek className="text-blue-400 text-xl sm:text-2xl" />
                                          ) : (
                                            <MdCalendarMonth className="text-purple-400 text-xl sm:text-2xl" />
                                          )}
                                        </div>
                                      </div>
                                      
                                      {/* Bonus Info */}
                                      <div className="flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                          <div>
                                            <h2 className="text-sm sm:text-base font-[600] text-white">
                                              {getBettingBonusName(bonus.bonusType)}
                                            </h2>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                              <span className="text-xs text-yellow-400 flex items-center gap-1">
                                                ৳{bonus.amount.toLocaleString()}
                                              </span>
                                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <FaChartLine className="text-[10px]" />
                                                {bonus.bonusRate} of ৳{bonus.betAmount.toLocaleString()}
                                              </span>
                                              <span className={`text-xs flex items-center gap-1 ${urgencyClass}`}>
                                                <FiClock className="text-[10px]" />
                                                {daysLeft === 0 ? "Expired" : daysLeft === 1 ? "Expires today" : `${daysLeft} days left`}
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                claimBettingBonus(bonus.id, bonus.bonusType, bonus.amount);
                                              }}
                                              disabled={claimingBettingBonusId === bonus.id}
                                              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {claimingBettingBonusId === bonus.id ? (
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              ) : (
                                                "Claim Now"
                                              )}
                                            </button>
                                            <FiChevronDown
                                              className={`text-gray-500 text-base sm:text-lg transition-transform duration-300 ${
                                                openDropdowns[`betting-${bonus.id}`] ? "rotate-180" : ""
                                              }`}
                                            />
                                          </div>
                                        </div>
                                        
                                        <p className="text-gray-400 mt-2 text-xs sm:text-sm">
                                          {bonus.bonusType === 'weekly' 
                                            ? `You earned this bonus from your weekly betting activity. Based on your bet amount of ৳${bonus.betAmount.toLocaleString()}, you receive 0.8% as bonus.`
                                            : `You earned this bonus from your monthly betting activity. Based on your bet amount of ৳${bonus.betAmount.toLocaleString()}, you receive 0.5% as bonus.`
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Expanded Details */}
                                    {openDropdowns[`betting-${bonus.id}`] && (
                                      <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Bonus Details</p>
                                            <ul className="space-y-1 text-xs">
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Bonus Amount:</span>
                                                <span className="text-yellow-400 font-medium">৳{bonus.amount.toLocaleString()}</span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Bet Amount:</span>
                                                <span className="text-blue-400">৳{bonus.betAmount.toLocaleString()}</span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Bonus Rate:</span>
                                                <span>{bonus.bonusRate}</span>
                                              </li>
                                              {bonus.weekNumber && (
                                                <li className="flex justify-between">
                                                  <span className="text-gray-400">Period:</span>
                                                  <span>Week {bonus.weekNumber}, {bonus.year}</span>
                                                </li>
                                              )}
                                              {bonus.monthName && (
                                                <li className="flex justify-between">
                                                  <span className="text-gray-400">Period:</span>
                                                  <span>{bonus.monthName} {bonus.year}</span>
                                                </li>
                                              )}
                                            </ul>
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Validity</p>
                                            <ul className="space-y-1 text-xs">
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Distributed:</span>
                                                <span>{formatDate(bonus.distributionDate)}</span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Expires:</span>
                                                <span className={urgencyClass}>
                                                  {(() => {
                                                    const expiryDate = new Date(bonus.distributionDate);
                                                    expiryDate.setDate(expiryDate.getDate() + 3);
                                                    return formatDate(expiryDate);
                                                  })()}
                                                </span>
                                              </li>
                                              <li className="flex justify-between">
                                                <span className="text-gray-400">Valid Period:</span>
                                                <span>3 days from distribution</span>
                                              </li>
                                            </ul>
                                          </div>
                                        </div>
                                        
                                        {daysLeft <= 1 && daysLeft > 0 && (
                                          <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded text-center">
                                            <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                                              <FiAlertCircle /> This bonus expires soon! Claim it now.
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bonus;