import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiBell, FiUser, FiLock, FiCheckCircle, 
  FiFileText, FiChevronRight, FiEye, 
  FiRefreshCw, FiShield, FiCopy, FiGift, FiTrendingUp, FiUsers, FiLogOut,
  FiKey, FiCreditCard, FiLock as FiLockPassword
} from "react-icons/fi";
import { MdSportsSoccer } from "react-icons/md";
import { Header } from "../../components/header/Header";
import { LanguageContext } from "../../context/LanguageContext";
import user_img from "../../assets/user.png";

const Mprofile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const token = localStorage.getItem("usertoken");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { t } = useContext(LanguageContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const res = await axios.get(`${base_url}/api/user/my-information`);
        if (res.data.success) {
          setUserData(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, base_url]);

  // Logout function - clears token and redirects to login
  const handleLogout = () => {
    localStorage.removeItem("usertoken");
    // Remove authorization header
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  // Function to show logout confirmation
  const [redcolorconfired, setRedColorConfired] = useState(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(true);
    setRedColorConfired(true);
  };

  // Function to cancel logout - restores original background
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
    setRedColorConfired(false); // Reset the red background state
  };

  if (loading) return <div className="bg-[#111111] h-screen" />;

  const signupDate = userData?.createdAt 
    ? new Date(userData.createdAt).toISOString().split('T')[0] 
    : "N/A";

  // Logout confirmation popup component
  const LogoutConfirmPopup = () => {
    if (!showLogoutConfirm) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100000] p-8">
        <div className="bg-white rounded-lg w-full max-w-[320px] shadow-2xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-gray-900 text-xl font-medium mb-4 text-left">
              {t.logoutConfirmTitle || "নিশ্চিতি"}
            </h3>
            <p className="text-gray-600 text-[15px] leading-relaxed text-left mb-8">
              {t.logoutConfirmMessage || "আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?"}
            </p>
            <div className="flex justify-end gap-6">
              <button
                onClick={cancelLogout}
                className="text-gray-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-gray-50 px-2 py-1 rounded"
              >
                {t.cancel || "বাতিল"}
              </button>
              <button
                onClick={handleLogout}
                className="text-blue-500 font-semibold text-[14px] uppercase tracking-wide hover:bg-blue-50 px-2 py-1 rounded"
              >
                {t.confirm || "নিশ্চিত"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen font-anek bg-[#111111] pb-[100px] text-white selection:bg-emerald-500/30">
        
        <div className="flex items-center justify-between p-4 ">
          <h1 className="text-lg font-medium">{t.profile || "প্রোফাইল"}</h1>
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          
          {/* USER INFO */}
          <div className="flex items-start justify-start gap-[30px] mb-2">
            <div className="flex items-center gap-3">
              <img src={user_img} alt="Profile" className="w-12 h-12 rounded-full object-cover bg-emerald-900/30" />
          
            </div>
            <div className="flex justify-start items-center gap-[50px]">
             {userData?.fullName && (
                <div>
                  <p className="text-orange-200 text-[11px] mb-0.5">{t.fullLegalName || "সম্পূর্ণ লিগ্যাল নাম"}</p>
                  <h2 className="text-sm font-medium flex items-center gap-1.5">
                    {userData?.fullName} <FiCopy className="text-gray-500 text-[10px]" />
                  </h2>
                </div>
              )}
           <div>
               <p className="text-gray-500 text-[11px] mb-0.5">{t.username || "ব্যবহারকারীর নাম"}</p>
              <p className="text-sm font-medium flex items-center justify-end gap-1.5">
                {userData?.username} <FiCopy className="text-gray-500 text-[10px]" />
              </p>
           </div>
            </div>
          </div>

          <p className="text-gray-500 text-[11px] mb-6">
            {t.signupDateLabel || "সাইন আপ এর তারিখ"} : {signupDate}
          </p>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => navigate("/member/withdraw")} className="py-3 rounded-md bg-[#FF9700]/80 border border-gray-800 text-white font-bold text-[16px]">
              {t.withdrawal || "উইথড্র"}
            </button>
            <button onClick={() => navigate("/member/deposit")} className="py-3 rounded-md bg-red-500 text-white font-bold text-[16px]">
              {t.deposit || "ডিপোজিট"}
            </button>
          </div>

          {/* WALLET */}
          <div className="bg-gradient-to-br from-[#132a21] to-[#0f0f0f] rounded-xl p-5 border border-white/5 mb-6">
            <p className="text-gray-400 text-[11px] mb-1.5">{t.mainWallet || "মেইন ওয়ালেট"}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#00c87f] rounded-full flex items-center justify-center text-[11px] text-black font-bold">৳</div>
                <span className="text-xl font-bold">{showBalance ? userData?.balance?.toLocaleString() : "● ● ● ● ● ● ● ●"}</span>
              </div>
              <div className="flex gap-4 text-gray-400">
                <FiEye className="cursor-pointer" onClick={() => setShowBalance(!showBalance)} />
                <FiRefreshCw className="cursor-pointer" />
              </div>
            </div>
          </div>

          {/* MENU LIST WITH DIFFERENT BACKGROUND COLORS */}
          <div className="space-y-3">
            <MenuItem 
              icon={<FiBell className="text-yellow_theme" />} 
              label={t.notifications || "নোটিফিকেশন"} 
              onClick={() => navigate("/member/inbox/notification")}
              bgColor="bg-gradient-to-r from-purple-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiGift className="text-yellow_theme" />} 
              label={t.bonuses_text || "বোনাস"} 
              onClick={() => navigate("/member/bonuses")}
              bgColor="bg-gradient-to-r from-pink-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiUser className="text-yellow_theme" />} 
              label={t.personalInfo || "ব্যক্তিগত তথ্য"} 
              onClick={() => navigate("/member/profile/info")}
              bgColor="bg-gradient-to-r from-blue-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiLock className="text-yellow_theme" />} 
              label={t.loginSecurity || "লগইন & সিকিউরিটি"} 
              onClick={() => navigate("/member/profile/account")}
              bgColor="bg-gradient-to-r from-green-900/20 to-transparent"
            />
        
            
            <MenuItem 
              icon={<FiShield className="text-yellow_theme" />} 
              label={t.verification || "ভেরিফিকেশন"} 
              onClick={() => navigate("/member/profile/verify")}
              bgColor="bg-gradient-to-r from-cyan-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiTrendingUp className="text-yellow_theme" />} 
              label={t.turnover || "টার্নওভার"} 
              onClick={() => navigate("/member/turnover/uncomplete")}
              bgColor="bg-gradient-to-r from-orange-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiFileText className="text-yellow_theme" />} 
              label={t.transactions || "ট্রানজেকশন রেকর্ডস"} 
              onClick={() => navigate("/member/transaction-records")}
              bgColor="bg-gradient-to-r from-red-900/20 to-transparent"
            />
            <MenuItem 
              icon={<MdSportsSoccer className="text-yellow_theme text-xl" />} 
              label={t.bettingRecords || "বেটিং রেকর্ডস"} 
              onClick={() => navigate("/member/betting-records/settled")}
              bgColor="bg-gradient-to-r from-emerald-900/20 to-transparent"
            />
            <MenuItem 
              icon={<FiUsers className="text-yellow_theme" />} 
              label={t.myReferral || "মাই রেফারেল"} 
              onClick={() => navigate("/referral-program/details")}
              bgColor="bg-gradient-to-r from-indigo-900/20 to-transparent"
            />
                    
            {/* Transaction Password Menu */}
            <MenuItem 
              icon={<FiLockPassword className="text-yellow_theme" />} 
              label={t.transactionPassword || "ট্রানজেকশন পাসওয়ার্ড"} 
              onClick={() => navigate("/member/transaction-password")}
              bgColor="bg-gradient-to-r from-teal-900/20 to-transparent"
            />
            {/* NEW: Reset Transaction Password */}
            <MenuItem 
              icon={<FiCreditCard className="text-yellow_theme" />} 
              label={t.resetTransactionPassword || "রিসেট ট্রানজেকশন পাসওয়ার্ড"} 
              onClick={() => navigate("/member/profile/reset-trx-password")}
              bgColor="bg-gradient-to-r from-amber-900/20 to-transparent"
            />
            
            {/* LOGOUT MENU ITEM - Now calls confirmLogout function */}
            <MenuItem 
              icon={<FiLogOut />} 
              label={t.logout || "লগআউট"} 
              onClick={confirmLogout}
              bgColor={redcolorconfired ? "bg-red-500" : "bg-gradient-to-r from-gray-900/20 to-transparent"}
            />
          </div>

        </div>
      </div>
      
      {/* Logout Confirmation Popup */}
      <LogoutConfirmPopup />
    </section>
  );
};

// Reusable Menu Component with onClick handler and custom background
const MenuItem = ({ icon, label, badge, onClick, bgColor = "" }) => (
  <div 
    onClick={onClick}
    className={`flex items-center justify-between py-3 border-[1px] border-gray-800/40 cursor-pointer transition-colors px-4 rounded-lg ${bgColor} hover:brightness-110`}
  >
    <div className="flex items-center gap-4">
      <span className="text-lg text-yellow_theme">{icon}</span>
      <span className="text-[14px] text-gray-200 font-medium">{label}</span>
      {badge && (
        <span className="bg-[#ff0000] text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {badge}
        </span>
      )}
    </div>
    <FiChevronRight className="text-gray-600 text-xl" />
  </div>
);

export default Mprofile;