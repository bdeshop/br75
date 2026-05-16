import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaBars,
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
import BD_FLAG from "../../assets/flag/Flag-Bangladesh.webp";
import US_FLAG from "../../assets/flag/us.webp";
import { FiPower } from "react-icons/fi";

const APK_FILE = "https://bir75.com/Bir75.apk";

// Helper function
const getFullImageUrl = (imagePath, baseUrl) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  const cleanPath = imagePath.startsWith("/") ? imagePath.substring(1) : imagePath;
  return `${baseUrl}/${cleanPath}`;
};

// Currency/Language Dropdown Component
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

// Main Header Component
export const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const { t, language, changeLanguage } = useContext(LanguageContext);
  const isBangla = language.code === "bn";

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const [showMobileAppBanner, setShowMobileAppBanner] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(() => {
    const saved = localStorage.getItem("isBalanceHidden");
    return saved !== null ? saved === "true" : true;
  });

  // ── Unclaimed bonus count ──────────────────────────────────────────────────
  const [unclaimedBonusCount, setUnclaimedBonusCount] = useState(0);
  // ── Unread notification count ──────────────────────────────────────────────
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  // ───────────────────────────────────────────────────────────────────────────

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const popupRef = useRef(null);

  // Language handlers
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
    const bannerHiddenUntil = localStorage.getItem("mobileAppBannerHiddenUntil");
    const downloadHiddenUntil = localStorage.getItem("mobileAppDownloadHiddenUntil");
    if (downloadHiddenUntil && Date.now() < parseInt(downloadHiddenUntil)) return false;
    if (bannerHiddenUntil && Date.now() < parseInt(bannerHiddenUntil)) return false;
    return true;
  };

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

  // ── Fetch total unclaimed bonus count (cash + betting + level) ─────────────
  const fetchUnclaimedBonusCount = async (token) => {
    if (!token) return;
    try {
      const [cashRes, bettingRes, levelRes] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/user/cash-bonus/available`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/user/betting-bonus/unclaimed`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/user/level-bonus/status`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      let count = 0;
      if (cashRes.status === "fulfilled" && cashRes.value.data?.success) {
        count += cashRes.value.data.data?.bonuses?.length || 0;
      }
      if (bettingRes.status === "fulfilled" && bettingRes.value.data?.success) {
        count += bettingRes.value.data.data?.bonuses?.length || 0;
      }
      if (levelRes.status === "fulfilled" && levelRes.value.data?.success) {
        count += levelRes.value.data.data?.pendingBonuses?.length || 0;
      }
      setUnclaimedBonusCount(count);
    } catch (err) {
      console.error("Error fetching unclaimed bonus count:", err);
    }
  };

  // ── Fetch unread notification count ───────────────────────────────────────
// ── Fetch unread notification count ───────────────────────────────────────
const fetchUnreadNotificationCount = async (token) => {
  if (!token) return;
  try {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    const user = JSON.parse(userStr);
    const userId = user?.id || user?._id;
    
    if (!userId) {
      console.error("No user ID found");
      return;
    }
    
    // Use the correct endpoint with userId parameter
    const response = await axios.get(`${API_BASE_URL}/api/user/notifications/unread-count/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data.success) {
      setUnreadNotificationCount(response.data.data?.count || 0);
    }
  } catch (err) {
    console.error("Error fetching unread notification count:", err);
    setUnreadNotificationCount(0);
  }
};
  // ───────────────────────────────────────────────────────────────────────────

  const checkAuthStatus = () => {
    const token = localStorage.getItem("usertoken");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      setUserData(JSON.parse(user));
      verifyToken(token);
      fetchUnclaimedBonusCount(token);
      // ── NEW: fetch notification count on auth ──
      fetchUnreadNotificationCount(token);
    } else {
      setIsLoggedIn(false);
      setUserData(null);
      setUnclaimedBonusCount(0);
      setUnreadNotificationCount(0);
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

  const logout = () => {
    localStorage.removeItem("usertoken");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserData(null);
    setUnclaimedBonusCount(0);
    setUnreadNotificationCount(0);
    delete axios.defaults.headers.common["Authorization"];
    setProfileDropdownOpen(false);
    setShowLogoutConfirm(false);
    navigate("/");
  };

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

  // ── Badge component ─────────────────────────────────────────────────────────
  const BonusBadge = ({ count }) => {
    if (!count || count <= 0) return null;
    return (
      <span
        className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-[5px] rounded-full text-[10px] font-bold leading-none bg-red-500 text-white shadow-md"
        style={{ boxShadow: "0 0 6px rgba(239,68,68,0.7)" }}
      >
        {count > 99 ? "99+" : count}
      </span>
    );
  };
  // ───────────────────────────────────────────────────────────────────────────

  // ── Combined badge count for the profile icon (bonus + notifications) ──────
  const totalHeaderBadgeCount = unclaimedBonusCount + unreadNotificationCount;
  // ───────────────────────────────────────────────────────────────────────────

  const menuItems = [
    // ── notifications now has badge: "notification" ──
    { id: "notifications", label: t.notifications, icon: <FiBell />, path: "/member/inbox/notification", badgeType: "notification" },
    { id: "personal-info", label: t.personalInfo, icon: <FiUser />, path: "/member/profile/info" },
    { id: "login-security", label: t.loginSecurity, icon: <FiLock />, path: "/member/profile/account" },
    { id: "transaction-password", label: t.transactionPassword || "Transaction Password", icon: <FiLock />, path: "/member/transaction-password" },
    { id: "reset-transaction-password", label: t.resetTransactionPassword || "Reset Transaction Password", icon: <FiCreditCard />, path: "/member/profile/reset-trx-password" },
    { id: "verification", label: t.verification, icon: <FiCheckCircle />, path: "/member/profile/verify" },
    { id: "transactions", label: t.transactions, icon: <FiFileText />, path: "/member/transaction-records" },
    { id: "betting-records", label: t.bettingRecords, icon: <MdSportsSoccer />, path: "/member/betting-records/settled" },
    { id: "turnover", label: t.turnover, icon: <FiTrendingUp />, path: "/member/turnover/uncomplete" },
    { id: "referral", label: t.myReferral, icon: <FiUsers />, path: "/referral-program/details" },
    // ── bonuses badge ──
    { id: "bonuses", label: t.bonuses_text || "Bonuses", icon: <FaGift />, path: "/member/bonuses", badgeType: "bonus" },
  ];

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) setSidebarOpen(false);
    checkAuthStatus();
    fetchBrandingData();
    const timer = setTimeout(() => { if (checkBannerVisibility()) setShowMobileAppBanner(true); }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ── Re-fetch counts whenever localStorage changes (e.g. after visiting bonus/notification pages) ──
  useEffect(() => {
    const handleStorage = () => {
      const token = localStorage.getItem("usertoken");
      if (token) {
        fetchUnclaimedBonusCount(token);
        fetchUnreadNotificationCount(token);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);
  // ───────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setProfileDropdownOpen(false);
      if (popupRef.current && !popupRef.current.contains(event.target)) setShowLogoutConfirm(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) setLangDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // ── Helper: resolve badge count for a menu item ────────────────────────────
  const getMenuBadgeCount = (item) => {
    if (item.badgeType === "bonus") return unclaimedBonusCount;
    if (item.badgeType === "notification") return unreadNotificationCount;
    return 0;
  };
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Toaster />
      <LogoutConfirmPopup />
      
      <header className="flex justify-between items-center px-1 py-2 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white border-b border-[#333] relative z-[1000]">
        <div className="flex items-center space-x-4 md:space-x-7">
          {/* Menu Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-icon_color md:flex hidden p-3 cursor-pointer bg-[#303232] rounded-[2px] hover:bg-[#333]"
          >
            <FaBars size={18} />
          </button>
          
          {/* Logo */}
          <a href="/">
            <img src={dynamicLogo} alt="Logo" className="w-[80px] md:w-[95px]" />
          </a>
          
          {/* Navigation Links */}
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
          
          {/* Profile Dropdown for Desktop */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              {/* Profile button — badge shows total (bonus + notifications) */}
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="md:flex hidden cursor-pointer items-center space-x-2 text-gray-400 text-[13px] font-[400] hover:text-yellow-400 relative"
              >
                <span className="relative">
                  <img src={profile_img} alt="Profile" className="h-5 w-5" />
                  {/* ── Combined badge on profile icon ── */}
                  {totalHeaderBadgeCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[16px] h-[16px] px-[4px] rounded-full text-[9px] font-bold leading-none bg-red-500 text-white"
                      style={{ boxShadow: "0 0 5px rgba(239,68,68,0.8)" }}
                    >
                      {totalHeaderBadgeCount > 99 ? "99+" : totalHeaderBadgeCount}
                    </span>
                  )}
                </span>
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
                    {menuItems.map((item) => {
                      const badgeCount = getMenuBadgeCount(item);
                      return (
                        <NavLink
                          key={item.id}
                          to={item.path}
                          className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                            activeTab === item.id
                              ? "bg-[#222] text-white"
                              : "text-gray-300 hover:bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] hover:text-white"
                          }`}
                          onClick={() => {
                            setActiveTab(item.id);
                            setProfileDropdownOpen(false);
                            // Re-fetch counts after visiting bonus or notification page
                            if (item.id === "bonuses" || item.id === "notifications") {
                              setTimeout(() => {
                                const token = localStorage.getItem("usertoken");
                                if (token) {
                                  fetchUnclaimedBonusCount(token);
                                  fetchUnreadNotificationCount(token);
                                }
                              }, 2000);
                            }
                          }}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                          {/* ── Badge for bonus OR notification items ── */}
                          {badgeCount > 0 && (
                            <span
                              className="inline-flex items-center justify-center min-w-[20px] h-[20px] px-[6px] rounded-full text-[10px] font-bold leading-none bg-red-500 text-white ml-auto"
                              style={{ boxShadow: "0 0 6px rgba(239,68,68,0.7)" }}
                            >
                              {badgeCount > 99 ? "99+" : badgeCount}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
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

        {/* Right Side - User Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {isLoggedIn ? (
            <>
              {/* Balance Display for Desktop */}
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
                
                {/* Withdraw & Deposit Buttons */}
                <div className="flex justify-center items-center gap-2">
                  <button
                   onClick={()=>{navigate("/member/withdraw")}}
                    className="text-white text-[12px] md:text-sm px-5 py-2 border-[1px] bg-[#FF9700] cursor-pointer border-gray-700 rounded hover:bg-[#333] transition-all duration-200"
                  >
                    {t.withdrawal}
                  </button>
                  <NavLink
                    to="/member/deposit"
                    className="bg-red-500 text-[12px] md:text-sm px-5 py-2 rounded-[3px] hover:bg-theme_color/80 transition-all duration-200 cursor-pointer font-medium text-white"
                  >
                    {t.deposit}
                  </NavLink>
                </div>
              </div>

              {/* Mobile Balance & Actions */}
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
              {/* Login/Register for non-logged in users */}
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

          {/* Language/Currency Dropdown */}
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

      {/* Mobile Bottom Navigation Bar */}
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
            onClick={() => { isLoggedIn ? navigate("/promotions") : navigate("/login"); }}
            className="flex flex-col items-center justify-center p-2 text-xs text-white hover:text-yellow-400 transition-colors cursor-pointer min-w-[60px]"
          >
            <img src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/menu-type/favorite.png?v=1757670016214&source=drccdnsrc" alt="Promotions" className="h-6 w-6 mb-1" />
            <span className="text-[11px] whitespace-nowrap">{t.promotions}</span>
          </div>

          <div className="relative shrink-0" style={{ top: "-20px" }}>
            <NavLink to="/" className="flex flex-col items-center justify-center text-white text-sm transition-colors">
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#166E5B", display: "flex", alignItems: "center", justifyContent: "center", border: "4px solid #1a2344", boxShadow: "0 4px 16px rgba(22,163,74,0.55)" }}>
                <img src={home_img} alt="Home" className="h-6 w-6" />
              </div>
              <span className="text-[11px] mt-0.5 whitespace-nowrap">{t.home}</span>
            </NavLink>
          </div>

          <div
            onClick={() => { isLoggedIn ? navigate("/referral-program/details") : navigate("/login"); }}
            className="flex flex-col items-center justify-center p-2 text-xs text-white hover:text-yellow-400 transition-colors cursor-pointer min-w-[60px]"
          >
            <img src={refer_img} alt="Refer" className="h-6 w-6 mb-1" />
            <span className="text-[11px] whitespace-nowrap">{t.refer || "Refer"}</span>
          </div>

          {/* Mobile Profile with combined badge (bonus + notifications) */}
          {isLoggedIn ? (
            <NavLink to="/my-profile" className="flex flex-col items-center justify-center p-2 text-sm text-white hover:text-yellow-400 transition-colors min-w-[60px] relative">
              <span className="relative">
                <img src={profile_img} alt="Profile" className="h-6 w-6 mb-1" />
                {totalHeaderBadgeCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-[3px] rounded-full text-[9px] font-bold leading-none bg-red-500 text-white"
                    style={{ boxShadow: "0 0 5px rgba(239,68,68,0.8)" }}
                  >
                    {totalHeaderBadgeCount > 99 ? "99+" : totalHeaderBadgeCount}
                  </span>
                )}
              </span>
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
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse { animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce { animation: bounce 1s infinite; }
      `}</style>
    </>
  );
};