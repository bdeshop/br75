// UpdatePassword.js
import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiLock,
  FiSave,
  FiArrowLeft,
  FiInfo,
  FiAlertCircle,
  FiKey,
  FiLogOut
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdatePassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Show/hide password states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const { language, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Logout function
  const logoutUser = () => {
    // Clear all auth tokens and user data
    localStorage.removeItem('usertoken');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Clear axios default header
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect to login page
    navigate('/login');
  };

  useEffect(() => {
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const token = localStorage.getItem('usertoken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user information
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (userResponse.data.success) {
        setUserData(userResponse.data.data);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      if (error.response?.status === 401) {
        logoutUser();
      }
    } finally {
      setLoading(false);
    }
  };

  // Update Account Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please enter new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (newPassword.length > 50) {
      toast.error("Password cannot exceed 50 characters");
      return;
    }

    if (currentPassword === newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/change-password`, {
        currentPassword: currentPassword,
        newPassword: newPassword,
        confirmNewPassword: confirmPassword
      });
      
      if (response.data.success) {
        toast.success("Password updated successfully! Please login again.", {
          autoClose: 2000
        });
        
        // Logout after 2 seconds
        setTimeout(() => {
          logoutUser();
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to update password");
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || "Failed to update password");
      setIsLoading(false);
    }
  };

  // Forgot Password Handler
  const handleForgotPassword = async () => {
    if (!userData?.email) {
      toast.error("No email address found. Please contact support.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/forgot-password`, { 
        email: userData.email 
      });
      
      if (response.data.success) {
        toast.success("Password reset instructions sent to your email!");
      } else {
        toast.error(response.data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error('Error sending forgot password:', error);
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  // Render Update Password Form
  const renderUpdateForm = () => (
    <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Update Account Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">
          Enter your current password and choose a new one
        </p>
      </div>
      
      <div className="p-4 sm:p-6">
        <form onSubmit={handleUpdatePassword}>
          {/* Current Password */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Enter current password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showCurrentPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Enter new password"
                required
                minLength={6}
                maxLength={50}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showNewPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              6-50 characters
            </p>
          </div>

          {/* Confirm Password */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Confirm your new password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {newPassword && confirmPassword && (
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
              {newPassword === confirmPassword ? (
                <div className="flex items-center gap-1.5 sm:gap-2 text-green-400">
                  <FiCheck size={14} className="sm:w-4 sm:h-4" /> Passwords match
                </div>
              ) : (
                <div className="flex items-center gap-1.5 sm:gap-2 text-red-400">
                  <FiAlertCircle size={14} className="sm:w-4 sm:h-4" /> Passwords do not match
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full bg-theme_color text-gray-900 py-3 cursor-pointer sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-sm sm:text-sm">Updating...</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-sm">Update Password</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
         
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto transition-all duration-300">
          <div className="mx-auto w-full min-h-screen max-w-md px-3 sm:px-4 pt-[60px] sm:pt-[80px] pb-6 sm:pb-8">
            
            {/* Update Password Form */}
            {renderUpdateForm()}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePassword;