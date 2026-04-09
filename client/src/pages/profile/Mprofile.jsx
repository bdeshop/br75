import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FiBell, FiUser, FiLock, FiCheckCircle, 
  FiFileText, FiChevronRight, FiEye, 
  FiRefreshCw, FiShield, FiCopy, FiGift, FiTrendingUp, FiUsers
} from "react-icons/fi";
import { MdSportsSoccer } from "react-icons/md";
import { Header } from "../../components/header/Header";
import user_img from "../../assets/user.png";

const Mprofile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(false);
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const token = localStorage.getItem("usertoken");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  if (loading) return <div className="bg-[#111111] h-screen" />;

  const signupDate = userData?.createdAt?.$date 
    ? new Date(userData.createdAt.$date).toISOString().split('T')[0] 
    : "N/A";

  return (
    <section>
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="min-h-screen font-anek bg-[#111111] pb-[100px] text-white selection:bg-emerald-500/30">
        
        <div className="flex items-center justify-between p-4 ">
          <h1 className="text-lg font-medium">প্রোফাইল</h1>
        </div>

        <div className="max-w-md mx-auto px-4 pt-4">
          
          {/* USER INFO */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <img src={user_img} alt="Profile" className="w-12 h-12 rounded-full object-cover bg-emerald-900/30" />
              <div>
                <p className="text-gray-500 text-[11px] mb-0.5">সম্পূর্ণ লিগ্যাল নাম</p>
                <h2 className="text-sm font-medium flex items-center gap-1.5">
                  {userData?.fullName} <FiCopy className="text-gray-500 text-[10px]" />
                </h2>
              </div>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-[11px] mb-0.5">ব্যবহারকারীর নাম</p>
              <p className="text-sm font-medium flex items-center justify-end gap-1.5">
                {userData?.username} <FiCopy className="text-gray-500 text-[10px]" />
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-[11px] mb-6">সাইন আপ এর তারিখ : {signupDate}</p>

          {/* ACTIONS */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => navigate("/member/withdraw")} className="py-3 rounded-md bg-[#222222] border border-gray-800 text-gray-300 font-semibold text-sm">উইথড্র</button>
            <button onClick={() => navigate("/member/deposit")} className="py-3 rounded-md bg-[#008d5d] text-white font-semibold text-sm">ডিপোজিট</button>
          </div>

          {/* WALLET */}
          <div className="bg-gradient-to-br from-[#132a21] to-[#0f0f0f] rounded-xl p-5 border border-white/5 mb-6">
            <p className="text-gray-400 text-[11px] mb-1.5">মেইন ওয়ালেট</p>
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

          {/* MENU LIST WITH NAVIGATION */}
          <div className="space-y-1">
            <MenuItem 
              icon={<FiBell className="text-white" />} 
              label="নোটিফিকেশন" 
              onClick={() => navigate("/member/inbox/notification")}
            />
            <MenuItem 
              icon={<FiGift className="text-emerald-500" />} 
              label="বোনাস" 
              onClick={() => navigate("/member/bonuses")} 
            />
            <MenuItem 
              icon={<FiUser className="text-gray-400" />} 
              label="ব্যক্তিগত তথ্য" 
              onClick={() => navigate("/member/profile/info")}
            />
            <MenuItem 
              icon={<FiLock className="text-gray-400" />} 
              label="লগইন & সিকিউরিটি" 
              onClick={() => navigate("/member/profile/account")}
            />
            <MenuItem 
              icon={<FiShield className="text-gray-400" />} 
              label="ভেরিফিকেশন" 
              onClick={() => navigate("/member/profile/verify")}
            />
             <MenuItem 
              icon={<FiTrendingUp className="text-gray-400" />} 
              label="টার্নওভার" 
              onClick={() => navigate("/member/turnover/uncomplete")}
            />
            <MenuItem 
              icon={<FiFileText className="text-gray-400" />} 
              label="ট্রানজেকশন রেকর্ডস" 
              onClick={() => navigate("/member/transaction-records")}
            />
            <MenuItem 
              icon={<MdSportsSoccer className="text-gray-400 text-xl" />} 
              label="বেটিং রেকর্ডস" 
              onClick={() => navigate("/member/betting-records/settled")}
            />
            <MenuItem 
              icon={<FiUsers className="text-gray-400" />} 
              label="মাই রেফারেল" 
              onClick={() => navigate("/referral-program/details")}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

// Reusable Menu Component with onClick handler
const MenuItem = ({ icon, label, badge, onClick }) => (
  <div 
    onClick={onClick}
    className="flex items-center justify-between py-4 border-b border-gray-800/40 cursor-pointer transition-colors px-1"
  >
    <div className="flex items-center gap-4">
      <span className="text-lg">{icon}</span>
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