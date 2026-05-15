import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import { FiAward, FiX } from "react-icons/fi";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

const Referprogramme = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const bonusHistory = [
    { name: "**antokhan**", amount: "21.85 BDT", date: "2026-02-01 01:07:23" },
    { name: "**isajid2**", amount: "20.94 BDT", date: "2026-02-01 01:07:42" },
    { name: "**isajid2**", amount: "17.71 BDT", date: "2026-02-01 01:08:42" },
    { name: "**Siam 6**", amount: "25.56 BDT", date: "2026-02-01 01:08:54" },
    { name: "**vickyyt12**", amount: "24.83 BDT", date: "2026-02-01 01:07:02" },
    { name: "**likhonm**", amount: "177.84 BDT", date: "2026-02-01 01:08:48" },
    { name: "**8127658**", amount: "23.24 BDT", date: "2026-02-01 01:07:25" },
  ];

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("usertoken");
    const userinfo = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (token && userinfo?.id) {
      setIsLoggedIn(true);
      fetchUserData(token, userinfo.id);
    } else {
      setIsLoggedIn(false);
      setLoading(false);
    }
  };

  const fetchUserData = async (token, userId) => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${base_url}/api/user/all-information/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUserData(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error(err.response?.data?.message || "Internal server error");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!isLoggedIn) {
      toast.error("Please login to refer friends!");
      setTimeout(() => {
        window.location.href = '/login';
      }, 1500);
      return;
    }

    if (!userData?.referralCode) {
      toast.error("Referral code not available. Please try again.");
      return;
    }

    const referralLink = `https://bir75.com/register?ref=${userData.referralCode}`;
    
    // Try to use the Web Share API first
    if (navigator.share) {
      navigator.share({
        title: 'Join me on Bir75!',
        text: `Use my referral code ${userData.referralCode} to sign up and get 50 BDT bonus!`,
        url: referralLink,
      })
      .then(() => toast.success('Shared successfully!'))
      .catch((error) => {
        console.log('Sharing failed:', error);
        // Fallback to clipboard copy
        copyToClipboard(referralLink);
      });
    } else {
      // Fallback to clipboard copy
      copyToClipboard(referralLink);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(
          <div className="flex flex-col items-start">
            <span className="font-semibold">Referral link copied!</span>
            <span className="text-xs text-gray-300 truncate max-w-[200px]">{text}</span>
          </div>,
          {
            duration: 3000,
            icon: '📋',
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }
        );
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy referral link');
      });
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#141515] text-gray-300">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 h-[calc(100vh-56px)] overflow-y-auto flex items-center justify-center">
            <div className="relative w-24 h-24 flex justify-center items-center">
              <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public content for non-logged in users
  if (!isLoggedIn) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-[#141515] text-gray-300">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 h-[calc(100vh-56px)] overflow-y-auto custom-scrollbar pb-20 relative">
            
            {/* Hero Banner */}
            <div className="w-full">
              <img 
                src="https://img.b112j.com/upload/announcement/image_239107.jpg" 
                alt="Refer a Friend Banner" 
                className="w-full object-cover max-h-[400px]"
              />
            </div>

            <div className="max-w-6xl mx-auto p-4 pl-[50px] space-y-6 mt-4">
              
              {/* Login Required Banner */}
              <div className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-xl p-8 sm:p-12 text-center border border-gray-700">
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="bg-green-500/20 p-4 rounded-full">
                    <FiAward className="text-green-500 text-5xl sm:text-6xl" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    Login Required
                  </h2>
                  <p className="text-gray-300 text-sm sm:text-base max-w-md">
                    Please login to refer friends, earn 50 BDT per referral, track your earnings, and participate in the referral program!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <button 
                      onClick={() => window.location.href = '/login'}
                      className="bg-green-600 hover:bg-green-700 px-6 py-2.5 rounded-md text-white font-medium transition-colors"
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => window.location.href = '/register'}
                      className="bg-transparent border border-green-600 hover:bg-green-600/10 px-6 py-2.5 rounded-md text-green-500 font-medium transition-colors"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Program Info Section - Public */}
              <div className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold">How does our Referral Program work?</h2>
                    <p className="text-gray-400 text-sm mt-1">You can earn cash rewards up to three referral tiers when you refer your friends.</p>
                    <p className="text-gray-400 text-sm">Invite your friends to join together and be entitled for lifetime cash rewards each time your friends place a bet.</p>
                  </div>
                  <button 
                    onClick={() => setShowRulesModal(true)}
                    className="border border-gray-600 px-8 py-2 rounded text-sm hover:bg-gray-800 transition"
                  >
                    Rules
                  </button>
                </div>

                {/* Reward Ratios */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                    <div className="flex gap-10">
                      <span>Turnover Range <span className="text-yellow-500 ml-2">More Than 100</span></span>
                      <span>Deposit Range <span className="text-yellow-500 ml-2">More Than 0</span></span>
                      <span>Winloss Range <span className="text-yellow-500 ml-2">More Than 0</span></span>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-gray-800 p-1 rounded"><FaChevronLeft /></button>
                      <button className="bg-gray-800 p-1 rounded"><FaChevronRight /></button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#262626] p-3 rounded flex justify-between items-center border-l-4 border-yellow-500">
                      <span className="text-sm font-medium">Tier 1</span>
                      <span className="text-yellow-500 font-bold">0.1%</span>
                    </div>
                    <div className="bg-[#262626] p-3 rounded flex justify-between items-center">
                      <span className="text-sm font-medium">Tier 2</span>
                      <span className="text-yellow-500 font-bold">0.05%</span>
                    </div>
                    <div className="bg-[#262626] p-3 rounded flex justify-between items-center">
                      <span className="text-sm font-medium">Tier 3</span>
                      <span className="text-yellow-500 font-bold">0.01%</span>
                    </div>
                  </div>
                </div>

                {/* Bonus Info Box */}
                <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">৳50</div>
                    <p className="text-white text-sm font-medium">Instant Bonus Per Referral!</p>
                    <p className="text-gray-300 text-xs mt-1">You get ৳50 for every friend who registers using your code</p>
                  </div>
                </div>
              </div>

              {/* Steps Section - Public */}
              <div className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-8 border border-gray-800">
                <h2 className="text-xl font-bold mb-8">How to earn more rewards</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Step 1 */}
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-yellow-500 opacity-80">1</span>
                    <div className="relative">
                      <p className="font-bold text-sm">Send an invitation</p>
                      <p className="text-xs text-gray-500">to start your referral journey</p>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-1.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step1" />
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-yellow-500 opacity-80">2</span>
                    <div className="relative">
                      <p className="font-bold text-sm">Friend registration</p>
                      <p className="text-xs text-gray-500">with your referral code</p>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-2.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step2" />
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex items-center gap-4">
                    <span className="text-6xl font-black text-yellow-500 opacity-80">3</span>
                    <div className="relative">
                      <p className="font-bold text-sm leading-tight">Earn ৳50 instantly</p>
                      <p className="text-xs text-gray-500">and start earning unlimited cash daily</p>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-3.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard & Recent Bonus - Public */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Leaderboard */}
                <div className="lg:col-span-4 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
                  <h2 className="text-lg font-bold mb-6">Referral leaderboard</h2>
                  <div className="flex justify-around items-end pt-10 pb-4">
                    {/* 2nd Place */}
                    <div className="text-center">
                      <div className="relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-yellow-600 px-2 rounded-full">Second place</span>
                        <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-16 h-16 rounded-full border-2 border-gray-500 p-1" alt="avatar" />
                      </div>
                      <p className="text-xs mt-2 text-gray-400">kamr****sans...</p>
                      <p className="text-xs text-yellow-500 font-bold">30,818.53</p>
                    </div>
                    {/* 1st Place */}
                    <div className="text-center scale-110">
                      <div className="relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-600 px-2 rounded-full">First place</span>
                        <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-20 h-20 rounded-full border-2 border-green-500 p-1" alt="avatar" />
                      </div>
                      <p className="text-xs mt-2 text-gray-400">rakib***108</p>
                      <p className="text-xs text-green-500 font-bold">36,237.11</p>
                    </div>
                    {/* 3rd Place */}
                    <div className="text-center">
                      <div className="relative">
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-orange-700 px-2 rounded-full">Third place</span>
                        <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-16 h-16 rounded-full border-2 border-gray-500 p-1" alt="avatar" />
                      </div>
                      <p className="text-xs mt-2 text-gray-400">tar****74</p>
                      <p className="text-xs text-yellow-500 font-bold">8,855.79</p>
                    </div>
                  </div>
                </div>

                {/* Recent Winners Table */}
                <div className="lg:col-span-8 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">Who received the bonus?</h2>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="space-y-1">
                    {bonusHistory.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-3 items-center py-2 text-xs border-b border-gray-800 last:border-0">
                        <span className="text-gray-400">{item.name}</span>
                        <span className="text-yellow-500 font-bold text-center">{item.amount}</span>
                        <span className="text-gray-500 text-right italic">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sticky Footer Button - Redirects to login */}
            <div className="p-4 backdrop-blur-md z-50 flex justify-center">
              <button 
                onClick={() => {
                  toast.error("Please login to refer friends!");
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 1500);
                }}
                className="bg-[#008d5d] hover:bg-[#00a870] text-white font-bold py-3 px-20 rounded shadow-xl transition-all uppercase text-sm active:scale-[0.98]"
              >
                Refer a friend now
              </button>
            </div>

            <Footer />
          </div>
        </div>

        {/* Rules Modal for non-logged in users */}
        {showRulesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="relative bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-xl max-w-md w-full mx-4 shadow-2xl border border-gray-700 animate-fadeIn">
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FiAward className="text-green-500" />
                  Referral Program Rules
                </h3>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-lg p-4 text-center border border-green-500/30">
                  <div className="text-3xl font-bold text-green-400 mb-1">৳50</div>
                  <p className="text-white text-sm font-medium">Instant Bonus Per Referral!</p>
                  <p className="text-gray-300 text-xs mt-1">You get ৳50 for every friend who registers using your code</p>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    How It Works
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>Share your unique referral code with friends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>Friend registers using your referral code</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>You instantly receive ৳50 in your wallet</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>Friend also gets a welcome bonus</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400 font-bold">✓</span>
                      <span>Continue earning tiered rewards on their activity</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                    Important Terms
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Each user can only be referred once</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Referral bonus is credited after successful registration</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>No minimum withdrawal limit for referral earnings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Fraudulent referrals will result in account suspension</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Bonuses are non-transferable and cannot be exchanged for cash</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-400">•</span>
                      <span>Maximum 50 referrals per day to prevent abuse</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-400 text-xs flex items-start gap-2">
                    <span className="font-bold">ℹ️</span>
                    <span>The ৳50 bonus is automatically added to your account as soon as your referred friend completes registration. You can track all your referral earnings in the dashboard above.</span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end p-4 border-t border-gray-700">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md text-white font-medium transition-colors"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Container */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    );
  }

  // Logged in user content
  return (
    <div className="h-screen overflow-hidden font-poppins bg-[#141515] text-gray-300">
      {/* Toast Container */}
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 h-[calc(100vh-56px)] overflow-y-auto custom-scrollbar pb-20 relative">
          
          {/* Hero Banner */}
          <div className="w-full">
            <img 
              src="https://img.b112j.com/upload/announcement/image_239107.jpg" 
              alt="Refer a Friend Banner" 
              className="w-full object-cover max-h-[400px]"
            />
          </div>

          <div className="max-w-6xl mx-auto p-4 pl-[50px] space-y-6 mt-4">
            
            {/* Program Info Section */}
            <div className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">How does our Referral Program work?</h2>
                  <p className="text-gray-400 text-sm mt-1">You can earn cash rewards up to three referral tiers when you refer your friends.</p>
                  <p className="text-gray-400 text-sm">Invite your friends to join together and be entitled for lifetime cash rewards each time your friends place a bet.</p>
                </div>
                <button 
                  onClick={() => setShowRulesModal(true)}
                  className="border border-gray-600 px-8 py-2 rounded text-sm hover:bg-gray-800 transition"
                >
                  Rules
                </button>
              </div>

              {/* Reward Ratios */}
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                  <div className="flex gap-10">
                    <span>Turnover Range <span className="text-yellow-500 ml-2">More Than 100</span></span>
                    <span>Deposit Range <span className="text-yellow-500 ml-2">More Than 0</span></span>
                    <span>Winloss Range <span className="text-yellow-500 ml-2">More Than 0</span></span>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-gray-800 p-1 rounded"><FaChevronLeft /></button>
                    <button className="bg-gray-800 p-1 rounded"><FaChevronRight /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#262626] p-3 rounded flex justify-between items-center border-l-4 border-yellow-500">
                    <span className="text-sm font-medium">Tier 1</span>
                    <span className="text-yellow-500 font-bold">0.1%</span>
                  </div>
                  <div className="bg-[#262626] p-3 rounded flex justify-between items-center">
                    <span className="text-sm font-medium">Tier 2</span>
                    <span className="text-yellow-500 font-bold">0.05%</span>
                  </div>
                  <div className="bg-[#262626] p-3 rounded flex justify-between items-center">
                    <span className="text-sm font-medium">Tier 3</span>
                    <span className="text-yellow-500 font-bold">0.01%</span>
                  </div>
                </div>
              </div>

              {/* User's Referral Stats (Only visible when logged in) */}
              {userData && (
                <div className="mt-6 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                  <h3 className="text-sm font-semibold text-green-400 mb-2">Your Referral Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Referral Code</p>
                      <p className="text-sm font-mono font-bold text-white">{userData.referralCode || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Referrals</p>
                      <p className="text-lg font-bold text-white">{userData.referralUsers?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Total Earnings</p>
                      <p className="text-lg font-bold text-green-400">৳{(userData.referralUsers?.length * 50) || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Bonus Per Referral</p>
                      <p className="text-lg font-bold text-yellow-400">৳50</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bonus Info Box */}
              <div className="mt-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">৳50</div>
                  <p className="text-white text-sm font-medium">Instant Bonus Per Referral!</p>
                  <p className="text-gray-300 text-xs mt-1">You get ৳50 for every friend who registers using your code</p>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-8 border border-gray-800">
              <h2 className="text-xl font-bold mb-8">How to earn more rewards</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-black text-yellow-500 opacity-80">1</span>
                  <div className="relative">
                    <p className="font-bold text-sm">Send an invitation</p>
                    <p className="text-xs text-gray-500">to start your referral journey</p>
                    <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-1.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step1" />
                  </div>
                </div>
                {/* Step 2 */}
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-black text-yellow-500 opacity-80">2</span>
                  <div className="relative">
                    <p className="font-bold text-sm">Friend registration</p>
                    <p className="text-xs text-gray-500">with your referral code</p>
                    <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-2.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step2" />
                  </div>
                </div>
                {/* Step 3 */}
                <div className="flex items-center gap-4">
                  <span className="text-6xl font-black text-yellow-500 opacity-80">3</span>
                  <div className="relative">
                    <p className="font-bold text-sm leading-tight">Earn ৳50 instantly</p>
                    <p className="text-xs text-gray-500">and start earning unlimited cash daily</p>
                    <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/referral-program-flowch-3.png?v=1769501762237&source=drccdnsrc" className="w-16 mt-2" alt="step3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Leaderboard & Recent Bonus */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Leaderboard */}
              <div className="lg:col-span-4 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
                <h2 className="text-lg font-bold mb-6">Referral leaderboard</h2>
                <div className="flex justify-around items-end pt-10 pb-4">
                  {/* 2nd Place */}
                  <div className="text-center">
                    <div className="relative">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-yellow-600 px-2 rounded-full">Second place</span>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-16 h-16 rounded-full border-2 border-gray-500 p-1" alt="avatar" />
                    </div>
                    <p className="text-xs mt-2 text-gray-400">kamr****sans...</p>
                    <p className="text-xs text-yellow-500 font-bold">30,818.53</p>
                  </div>
                  {/* 1st Place */}
                  <div className="text-center scale-110">
                    <div className="relative">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-600 px-2 rounded-full">First place</span>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-20 h-20 rounded-full border-2 border-green-500 p-1" alt="avatar" />
                    </div>
                    <p className="text-xs mt-2 text-gray-400">rakib***108</p>
                    <p className="text-xs text-green-500 font-bold">36,237.11</p>
                  </div>
                  {/* 3rd Place */}
                  <div className="text-center">
                    <div className="relative">
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] bg-orange-700 px-2 rounded-full">Third place</span>
                      <img src="https://img.b112j.com/bj/h5/assets/v3/images/referral-program/avatar8.png?v=1769501762237&source=drccdnsrc" className="w-16 h-16 rounded-full border-2 border-gray-500 p-1" alt="avatar" />
                    </div>
                    <p className="text-xs mt-2 text-gray-400">tar****74</p>
                    <p className="text-xs text-yellow-500 font-bold">8,855.79</p>
                  </div>
                </div>
              </div>

              {/* Recent Winners Table */}
              <div className="lg:col-span-8 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-lg p-6 border border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold">Who received the bonus?</h2>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
                <div className="space-y-1">
                  {bonusHistory.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 items-center py-2 text-xs border-b border-gray-800 last:border-0">
                      <span className="text-gray-400">{item.name}</span>
                      <span className="text-yellow-500 font-bold text-center">{item.amount}</span>
                      <span className="text-gray-500 text-right italic">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sticky Footer Button - For logged in users */}
          <div className="p-4 backdrop-blur-md z-50 flex justify-center">
            <button 
              onClick={copyReferralLink}
              className="bg-[#008d5d] hover:bg-[#00a870] text-white font-bold py-3 px-20 rounded shadow-xl transition-all uppercase text-sm active:scale-[0.98]"
            >
              Refer a friend now (Earn ৳50)
            </button>
          </div>

          <Footer />
        </div>
      </div>

      {/* Rules Modal for logged in users */}
      {showRulesModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] rounded-xl max-w-xl w-full mx-4 shadow-2xl border border-gray-700 animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <FiAward className="text-green-500" />
                Referral Program Rules
              </h3>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-r from-green-500/20 to-green-600/10 rounded-lg p-4 text-center border border-green-500/30">
                <div className="text-3xl font-bold text-green-400 mb-1">৳50</div>
                <p className="text-white text-sm font-medium">Instant Bonus Per Referral!</p>
                <p className="text-gray-300 text-xs mt-1">You get ৳50 for every friend who registers using your code</p>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  How It Works
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Share your unique referral code with friends</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Friend registers using your referral code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>You instantly receive ৳50 in your wallet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Friend also gets a welcome bonus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Continue earning tiered rewards on their activity</span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                  Important Terms
                </h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Each user can only be referred once</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Referral bonus is credited after successful registration</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>No minimum withdrawal limit for referral earnings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Fraudulent referrals will result in account suspension</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Bonuses are non-transferable and cannot be exchanged for cash</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>Maximum 50 referrals per day to prevent abuse</span>
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-xs flex items-start gap-2">
                  <span className="font-bold">ℹ️</span>
                  <span>The ৳50 bonus is automatically added to your account as soon as your referred friend completes registration. You can track all your referral earnings in the dashboard above.</span>
                </p>
              </div>
            </div>

            <div className="flex justify-end p-4 border-t border-gray-700">
              <button
                onClick={() => setShowRulesModal(false)}
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-md text-white font-medium transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Referprogramme;