// TransactionPassword.js
import React, { useState, useContext, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiCheck, 
  FiX, 
  FiEye, 
  FiEyeOff, 
  FiMail, 
  FiLock,
  FiKey,
  FiSave,
  FiInfo
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IoIosArrowBack } from "react-icons/io";
import { FiAlertCircle } from "react-icons/fi";

const TransactionPassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransactionPasswordSet, setIsTransactionPasswordSet] = useState(false);
  
  // Mode: 'set' for first time, 'update' for updating existing
  const [mode, setMode] = useState(null);
  
  // Set Password Form States
  const [setNewPassword, setSetNewPassword] = useState("");
  const [setConfirmPassword, setSetConfirmPassword] = useState("");
  const [showSetNewPassword, setShowSetNewPassword] = useState(false);
  const [showSetConfirmPassword, setShowSetConfirmPassword] = useState(false);
  const [isSetLoading, setIsSetLoading] = useState(false);
  
  // Update Password Form States
  const [updateCurrentPassword, setUpdateCurrentPassword] = useState("");
  const [updateNewPassword, setUpdateNewPassword] = useState("");
  const [updateConfirmPassword, setUpdateConfirmPassword] = useState("");
  const [showUpdateCurrentPassword, setShowUpdateCurrentPassword] = useState(false);
  const [showUpdateNewPassword, setShowUpdateNewPassword] = useState(false);
  const [showUpdateConfirmPassword, setShowUpdateConfirmPassword] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const { language, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Check user data and transaction password status
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
      
      // Check transaction password status
      const statusResponse = await axios.get(`${API_BASE_URL}/api/user/transaction-password-status`);
      if (statusResponse.data.success) {
        setIsTransactionPasswordSet(statusResponse.data.data.isSet);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('usertoken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Start Set flow (first time)
  const handleStartSet = () => {
    setMode('set');
    setSetNewPassword("");
    setSetConfirmPassword("");
  };

  // Start Update flow (existing password - requires current password)
  const handleStartUpdate = () => {
    setMode('update');
    setUpdateCurrentPassword("");
    setUpdateNewPassword("");
    setUpdateConfirmPassword("");
  };

  // Go back to mode selection
  const handleBackToMode = () => {
    setMode(null);
    // Reset set form
    setSetNewPassword("");
    setSetConfirmPassword("");
    // Reset update form
    setUpdateCurrentPassword("");
    setUpdateNewPassword("");
    setUpdateConfirmPassword("");
  };

  // Set Transaction Password (first time setup - uses /set-transaction-password endpoint)
  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (!setNewPassword || !setConfirmPassword) {
      toast.error("Please enter new transaction password");
      return;
    }

    if (setNewPassword !== setConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (setNewPassword.length < 4) {
      toast.error("Transaction password must be at least 4 characters");
      return;
    }

    if (setNewPassword.length > 20) {
      toast.error("Transaction password cannot exceed 20 characters");
      return;
    }

    setIsSetLoading(true);
    try {
      // Using separate SET endpoint - no current password needed
      const response = await axios.post(`${API_BASE_URL}/api/user/set-transaction-password`, {
        transactionPassword: setNewPassword,
        confirmTransactionPassword: setConfirmPassword
      });
      
      console.log("Set password response:", response.data);
      
      if (response.data.success) {
        toast.success("Transaction password set successfully!");
        setIsTransactionPasswordSet(true);
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to set password");
      }
    } catch (error) {
      console.error('Error setting password:', error);
      const errorMessage = error.response?.data?.message || "Failed to set password";
      toast.error(errorMessage);
    } finally {
      setIsSetLoading(false);
    }
  };

  // Update Transaction Password (needs current password - uses /update-transaction-password endpoint)
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!updateCurrentPassword) {
      toast.error("Current transaction password is required");
      return;
    }

    if (!updateNewPassword || !updateConfirmPassword) {
      toast.error("Please enter new transaction password");
      return;
    }

    if (updateNewPassword !== updateConfirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (updateNewPassword.length < 4) {
      toast.error("Transaction password must be at least 4 characters");
      return;
    }

    if (updateNewPassword.length > 20) {
      toast.error("Transaction password cannot exceed 20 characters");
      return;
    }

    setIsUpdateLoading(true);
    try {
      // Using separate UPDATE endpoint - requires current password
      const response = await axios.post(`${API_BASE_URL}/api/user/update-transaction-password`, {
        currentPassword: updateCurrentPassword,
        newPassword: updateNewPassword,
        confirmNewPassword: updateConfirmPassword
      });
      
      console.log("Update password response:", response.data);
      
      if (response.data.success) {
        toast.success("Transaction password updated successfully!");
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.message || "Failed to update password";
      toast.error(errorMessage);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  // Render No Email Screen with responsive styling
  const renderNoEmailScreen = () => (
    <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
        <button 
          onClick={() => navigate('/profile')}
          className="text-gray-800 hover:text-gray-900 flex items-center gap-2 mb-2 text-sm sm:text-base"
        >
          <IoIosArrowBack size={16} className="sm:w-4 sm:h-4" /> Back to Profile
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Transaction Password
        </h2>
      </div>
      
      <div className="p-6 sm:p-8 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <FiMail className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-500" />
        </div>
        
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
          Email Address Required
        </h3>
        
        <p className="text-xs sm:text-sm text-gray-400 mb-6 max-w-sm mx-auto">
          You need to add an email address to your account before setting up a transaction password. This is required for security verification.
        </p>
        
        <button
          onClick={() => navigate('/member/profile/info')}
          className="bg-theme_color text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
        >
          <FiMail size={16} className="sm:w-4 sm:h-4" /> Add Email Now
        </button>
      </div>
    </div>
  );

  // Render Mode Selection with responsive styling
  const renderModeSelection = () => (
    <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Transaction Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">
          {isTransactionPasswordSet 
            ? "Update your transaction password"
            : "Set up transaction password for secure withdrawals"}
        </p>
      </div>
      
      <div className="p-4 sm:p-6">
        {!isTransactionPasswordSet ? (
          // First time setup
          <div className="text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-theme_color/20 flex items-center justify-center">
              <FiLock className="w-7 h-7 sm:w-8 sm:h-8 text-theme_color" />
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-white mb-2">
              No Transaction Password Set
            </h3>
            
            <p className="text-xs sm:text-sm text-gray-400 mb-6">
              Setting up a transaction password adds an extra layer of security for withdrawals and other sensitive operations.
            </p>
            
            <button
              onClick={handleStartSet}
              className="bg-theme_color text-gray-900 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <FiKey size={16} className="sm:w-4 sm:h-4" /> Set Transaction Password
            </button>
          </div>
        ) : (
          // Has password - options
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
              <div className="flex items-center gap-2 text-green-400 mb-1 sm:mb-2">
                <FiCheck size={14} className="sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Password Set</span>
              </div>
            </div>
            
            <button
              onClick={handleStartUpdate}
              className="w-full bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiSave size={16} className="sm:w-4 sm:h-4" /> Update Transaction Password
            </button>
          </div>
        )}
        
        {/* Info Box */}
        <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-[#1a1c1d] rounded-lg border border-gray-700">
          <div className="flex items-center gap-1.5 sm:gap-2 text-theme_color mb-1.5 sm:mb-2">
            <FiInfo size={14} className="sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium">About Transaction Password</span>
          </div>
          <ul className="text-[10px] sm:text-xs text-gray-400 space-y-0.5 sm:space-y-1 list-disc list-inside">
            <li>Used for withdrawals and sensitive account operations</li>
            <li>Must be 4-20 characters (numbers or letters)</li>
            <li>Cannot reuse recent passwords</li>
            <li>Keep it secure and don't share with anyone</li>
          </ul>
        </div>
      </div>
    </div>
  );

  // Render Set Password Form (First Time Setup)
  const renderSetPasswordForm = () => (
    <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
        <button 
          onClick={handleBackToMode}
          className="text-gray-800 hover:text-gray-900 flex items-center gap-2 mb-2 text-sm sm:text-base"
        >
          <IoIosArrowBack size={16} className="sm:w-4 sm:h-4" /> Back
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Set Transaction Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">
          Create your transaction password
        </p>
      </div>
      
      <div className="p-4 sm:p-6">
        <form onSubmit={handleSetPassword}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              New Transaction Password
            </label>
            <div className="relative">
              <input
                type={showSetNewPassword ? "text" : "password"}
                value={setNewPassword}
                onChange={(e) => setSetNewPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Enter new transaction password"
                required
                minLength={4}
                maxLength={20}
                disabled={isSetLoading}
              />
              <button
                type="button"
                onClick={() => setShowSetNewPassword(!showSetNewPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showSetNewPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              4-20 characters, numbers or letters
            </p>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              Confirm Transaction Password
            </label>
            <div className="relative">
              <input
                type={showSetConfirmPassword ? "text" : "password"}
                value={setConfirmPassword}
                onChange={(e) => setSetConfirmPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Confirm your password"
                required
                disabled={isSetLoading}
              />
              <button
                type="button"
                onClick={() => setShowSetConfirmPassword(!showSetConfirmPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showSetConfirmPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {setNewPassword && setConfirmPassword && (
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
              {setNewPassword === setConfirmPassword ? (
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

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleBackToMode}
              disabled={isSetLoading}
              className="flex-1 bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSetLoading || !setNewPassword || !setConfirmPassword || setNewPassword !== setConfirmPassword}
              className="flex-1 bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isSetLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="text-sm sm:text-base">Setting...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} className="sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Set Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Render Update Password Form (Requires Current Password)
  const renderUpdatePasswordForm = () => (
    <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
      <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
        <button 
          onClick={handleBackToMode}
          className="text-gray-800 hover:text-gray-900 flex items-center gap-2 mb-2 text-sm sm:text-base"
        >
          <IoIosArrowBack size={16} className="sm:w-4 sm:h-4" /> Back
        </button>
        <h2 className="text-base sm:text-xl font-semibold text-gray-900">
          Update Transaction Password
        </h2>
        <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">
          Enter current and new transaction password
        </p>
      </div>
      
      <div className="p-4 sm:p-6">
        <form onSubmit={handleUpdatePassword}>
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              Current Transaction Password
            </label>
            <div className="relative">
              <input
                type={showUpdateCurrentPassword ? "text" : "password"}
                value={updateCurrentPassword}
                onChange={(e) => setUpdateCurrentPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Enter current password"
                required
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateCurrentPassword(!showUpdateCurrentPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showUpdateCurrentPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          <div className="mb-3 sm:mb-4">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              New Transaction Password
            </label>
            <div className="relative">
              <input
                type={showUpdateNewPassword ? "text" : "password"}
                value={updateNewPassword}
                onChange={(e) => setUpdateNewPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Enter new transaction password"
                required
                minLength={4}
                maxLength={20}
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateNewPassword(!showUpdateNewPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showUpdateNewPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
              4-20 characters, numbers or letters
            </p>
          </div>

          <div className="mb-5 sm:mb-6">
            <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
              Confirm Transaction Password
            </label>
            <div className="relative">
              <input
                type={showUpdateConfirmPassword ? "text" : "password"}
                value={updateConfirmPassword}
                onChange={(e) => setUpdateConfirmPassword(e.target.value)}
                className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                placeholder="Confirm your password"
                required
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateConfirmPassword(!showUpdateConfirmPassword)}
                className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
              >
                {showUpdateConfirmPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
              </button>
            </div>
          </div>

          {/* Password Match Indicator */}
          {updateNewPassword && updateConfirmPassword && (
            <div className="mb-3 sm:mb-4 text-xs sm:text-sm">
              {updateNewPassword === updateConfirmPassword ? (
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

          <div className="flex gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleBackToMode}
              disabled={isUpdateLoading}
              className="flex-1 bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdateLoading || !updateCurrentPassword || !updateNewPassword || !updateConfirmPassword || updateNewPassword !== updateConfirmPassword}
              className="flex-1 bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {isUpdateLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span className="text-sm sm:text-base">Updating...</span>
                </>
              ) : (
                <>
                  <FiSave size={16} className="sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Update Password</span>
                </>
              )}
            </button>
          </div>
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

  // Check if user has email
  const hasEmail = userData?.email && userData.email.trim() !== "";

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
            
            {/* No Email Screen */}
            {!hasEmail && renderNoEmailScreen()}
            
            {/* Has Email - Show appropriate content */}
            {hasEmail && (
              <>
                {mode === null && renderModeSelection()}
                {mode === 'set' && renderSetPasswordForm()}
                {mode === 'update' && renderUpdatePasswordForm()}
              </>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionPassword;