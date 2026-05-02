// TransactionPassword.tsx
import React, { useState, useContext, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiMail, 
  FiLock,
  FiKey,
  FiSave,
  FiShield,
  FiArrowLeft,
  FiUserPlus,
  FiRefreshCw
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiAlertCircle } from "react-icons/fi";

// Mode Selection Card Component
const ModeCard = ({ icon: Icon, title, description, buttonText, onClick, isActive, isExisting, t }) => (
  <div 
    className={`relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer
      ${isActive 
        ? 'bg-gradient-to-br from-[#F9BC20]/20 to-[#F9BC20]/5 border border-[#F9BC20]' 
        : 'bg-[#1E1E2E]/50 border border-gray-700/50 hover:border-gray-600'
      }`}
    onClick={onClick}
  >
    <div className="p-4 sm:p-5">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300
        ${isActive ? 'bg-[#F9BC20]/20' : 'bg-[#F9BC20]/10'}`}>
        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isActive ? 'text-[#F9BC20]' : 'text-[#F9BC20]/70'}`} />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-3">{description}</p>
      {isExisting && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full mb-2">
          <FiCheck className="w-2.5 h-2.5 text-green-400" />
          <span className="text-[9px] sm:text-xs text-green-400">{t.passwordSet || "Password Set"}</span>
        </div>
      )}
      <button
        className={`w-full py-2 rounded-lg font-semibold transition-all duration-300 text-xs sm:text-sm
          ${isActive 
            ? 'bg-[#F9BC20] text-gray-900 hover:shadow-lg hover:shadow-[#F9BC20]/25' 
            : 'bg-gray-700/50 text-white hover:bg-gray-700'
          }`}
      >
        {buttonText}
      </button>
    </div>
  </div>
);

// No Email Screen
const NoEmailScreen = ({ onNavigate, t }) => (
  <div className="bg-[#13131F]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden">
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#F9BC20]/10 to-transparent"></div>
      <div className="relative px-4 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base sm:text-lg font-semibold text-white">
          {t.transactionPassword || "Transaction Password"}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          {t.secureYourAccount || "Secure your account with transaction password"}
        </p>
      </div>
    </div>
    
    <div className="p-5 sm:p-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
        <FiMail className="w-8 h-8 text-amber-500" />
      </div>
      
      <h3 className="text-base font-semibold text-white mb-1.5">
        {t.emailAddressRequired || "Email Address Required"}
      </h3>
      
      <p className="text-xs text-gray-400 mb-5 max-w-xs mx-auto">
        {t.emailRequiredDesc || "You need to add an email address to your account before setting up a transaction password. This is required for security verification."}
      </p>
      
      <button
        onClick={() => onNavigate('/member/profile/info')}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 text-xs sm:text-sm"
      >
        <FiUserPlus size={14} />
        {t.addEmailNow || "Add Email Now"}
      </button>
    </div>
  </div>
);

const TransactionPassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTransactionPasswordSet, setIsTransactionPasswordSet] = useState(false);
  
  const [mode, setMode] = useState(null);
  
  // Set Password Form
  const [setNewPassword, setSetNewPassword] = useState("");
  const [setConfirmPassword, setSetConfirmPassword] = useState("");
  const [showSetNewPassword, setShowSetNewPassword] = useState(false);
  const [showSetConfirmPassword, setShowSetConfirmPassword] = useState(false);
  const [isSetLoading, setIsSetLoading] = useState(false);
  
  // Update Password Form
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
      
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (userResponse.data.success) {
        setUserData(userResponse.data.data);
      }
      
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

  const handleStartSet = () => {
    setMode('set');
    setSetNewPassword("");
    setSetConfirmPassword("");
  };

  const handleStartUpdate = () => {
    setMode('update');
    setUpdateCurrentPassword("");
    setUpdateNewPassword("");
    setUpdateConfirmPassword("");
  };

  const handleBackToMode = () => {
    setMode(null);
    setSetNewPassword("");
    setSetConfirmPassword("");
    setUpdateCurrentPassword("");
    setUpdateNewPassword("");
    setUpdateConfirmPassword("");
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    
    if (!setNewPassword || !setConfirmPassword) {
      toast.error(t.pleaseEnterNewPassword || "Please enter new transaction password");
      return;
    }

    if (setNewPassword !== setConfirmPassword) {
      toast.error(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    if (setNewPassword.length < 4) {
      toast.error(t.passwordMinLength4 || "Transaction password must be at least 4 characters");
      return;
    }

    if (setNewPassword.length > 20) {
      toast.error(t.passwordMaxLength20 || "Transaction password cannot exceed 20 characters");
      return;
    }

    setIsSetLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/set-transaction-password`, {
        transactionPassword: setNewPassword,
        confirmTransactionPassword: setConfirmPassword
      });
      
      if (response.data.success) {
        toast.success(t.transactionPasswordSetSuccess || "Transaction password set successfully!");
        setIsTransactionPasswordSet(true);
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || (t.failedToSetPassword || "Failed to set password"));
      }
    } catch (error) {
      console.error('Error setting password:', error);
      const errorMessage = error.response?.data?.message || (t.failedToSetPassword || "Failed to set password");
      toast.error(errorMessage);
    } finally {
      setIsSetLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    
    if (!updateCurrentPassword) {
      toast.error(t.currentPasswordRequired || "Current transaction password is required");
      return;
    }

    if (!updateNewPassword || !updateConfirmPassword) {
      toast.error(t.pleaseEnterNewPassword || "Please enter new transaction password");
      return;
    }

    if (updateNewPassword !== updateConfirmPassword) {
      toast.error(t.passwordsDoNotMatch || "New passwords do not match");
      return;
    }

    if (updateNewPassword.length < 4) {
      toast.error(t.passwordMinLength4 || "Transaction password must be at least 4 characters");
      return;
    }

    if (updateNewPassword.length > 20) {
      toast.error(t.passwordMaxLength20 || "Transaction password cannot exceed 20 characters");
      return;
    }

    setIsUpdateLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/update-transaction-password`, {
        currentPassword: updateCurrentPassword,
        newPassword: updateNewPassword,
        confirmNewPassword: updateConfirmPassword
      });
      
      if (response.data.success) {
        toast.success(t.transactionPasswordUpdatedSuccess || "Transaction password updated successfully!");
        
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || (t.failedToUpdatePassword || "Failed to update password"));
      }
    } catch (error) {
      console.error('Error updating password:', error);
      const errorMessage = error.response?.data?.message || (t.failedToUpdatePassword || "Failed to update password");
      toast.error(errorMessage);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const renderModeSelection = () => (
    <div className="bg-[#13131F]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden shadow-xl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9BC20]/10 to-transparent"></div>
        <div className="relative px-4 py-3 sm:px-5 sm:py-4">
          <button 
            onClick={() => navigate('/profile')}
            className="text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 text-xs transition-colors group"
          >
            <FiArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.backToProfile || "Back to Profile"}</span>
          </button>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {t.transactionPassword || "Transaction Password"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isTransactionPasswordSet 
              ? (t.updateTransactionPasswordDesc || "Update your transaction password for enhanced security")
              : (t.setTransactionPasswordDesc || "Set up transaction password to secure your withdrawals")}
          </p>
        </div>
      </div>
      
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <ModeCard
            icon={FiKey}
            title={t.setTransactionPassword || "Set Transaction Password"}
            description={t.setTransactionPasswordDescCard || "Create a new transaction password for withdrawals and sensitive operations."}
            buttonText={isTransactionPasswordSet ? (t.resetPassword || "Reset Password") : (t.setNewPasswordBtn || "Set New Password")}
            onClick={handleStartSet}
            isActive={mode === 'set'}
            isExisting={isTransactionPasswordSet}
            t={t}
          />
          
          {isTransactionPasswordSet && (
            <ModeCard
              icon={FiRefreshCw}
              title={t.updatePassword || "Update Password"}
              description={t.updatePasswordDesc || "Change your existing transaction password to a new one."}
              buttonText={t.updatePasswordBtn || "Update Password"}
              onClick={handleStartUpdate}
              isActive={mode === 'update'}
              isExisting={false}
              t={t}
            />
          )}
        </div>
        
        <div className="mt-4 p-3 bg-[#1E1E2E]/50 rounded-lg border border-gray-800/50">
          <div className="flex items-center gap-1.5 text-[#F9BC20] mb-1.5">
            <FiShield size={12} />
            <span className="text-xs font-medium">{t.securityGuidelines || "Security Guidelines"}</span>
          </div>
          <ul className="text-[10px] text-gray-400 space-y-1 list-disc list-inside">
            <li>{t.securityGuideline1 || "Used for withdrawals and sensitive account operations"}</li>
            <li>{t.securityGuideline2 || "Must be 4-20 characters (numbers or letters only)"}</li>
            <li>{t.securityGuideline3 || "Cannot reuse recent passwords for security"}</li>
            <li>{t.securityGuideline4 || "Keep it confidential and never share with anyone"}</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderSetPasswordForm = () => (
    <div className="bg-[#13131F]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden shadow-xl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9BC20]/10 to-transparent"></div>
        <div className="relative px-4 py-3 sm:px-5 sm:py-4">
          <button 
            onClick={handleBackToMode}
            className="text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 text-xs transition-colors group"
          >
            <FiArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.back || "Back"}</span>
          </button>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {t.setTransactionPassword || "Set Transaction Password"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {t.createSecurePasswordDesc || "Create a secure password for your transactions"}
          </p>
        </div>
      </div>
      
      <div className="p-4 sm:p-5">
        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {t.newTransactionPassword || "New Transaction Password"}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={14} />
              </div>
              <input
                type={showSetNewPassword ? "text" : "password"}
                value={setNewPassword}
                onChange={(e) => setSetNewPassword(e.target.value)}
                className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-500 
                  focus:outline-none focus:border-[#F9BC20] focus:ring-1 focus:ring-[#F9BC20]/30 transition-all duration-200 text-xs sm:text-sm"
                placeholder={t.enterNewTransactionPassword || "Enter new transaction password"}
                required
                minLength={4}
                maxLength={20}
                disabled={isSetLoading}
              />
              <button
                type="button"
                onClick={() => setShowSetNewPassword(!showSetNewPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showSetNewPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {t.passwordHint || "4-20 characters, numbers or letters only"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {t.confirmTransactionPassword || "Confirm Transaction Password"}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={14} />
              </div>
              <input
                type={showSetConfirmPassword ? "text" : "password"}
                value={setConfirmPassword}
                onChange={(e) => setSetConfirmPassword(e.target.value)}
                className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-500 
                  focus:outline-none focus:border-[#F9BC20] focus:ring-1 focus:ring-[#F9BC20]/30 transition-all duration-200 text-xs sm:text-sm"
                placeholder={t.confirmYourPassword || "Confirm your password"}
                required
                disabled={isSetLoading}
              />
              <button
                type="button"
                onClick={() => setShowSetConfirmPassword(!showSetConfirmPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showSetConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          {setNewPassword && setConfirmPassword && (
            <div className={`flex items-center gap-1.5 text-xs ${setNewPassword === setConfirmPassword ? 'text-green-400' : 'text-red-400'}`}>
              {setNewPassword === setConfirmPassword ? (
                <>
                  <FiCheck size={12} />
                  <span>{t.passwordsMatch || "Passwords match"}</span>
                </>
              ) : (
                <>
                  <FiAlertCircle size={12} />
                  <span>{t.passwordsDoNotMatch || "Passwords do not match"}</span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleBackToMode}
              disabled={isSetLoading}
              className="flex-1 bg-gray-700/50 text-white py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm font-medium"
            >
              {t.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSetLoading || !setNewPassword || !setConfirmPassword || setNewPassword !== setConfirmPassword}
              className="flex-1 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2 rounded-lg font-semibold 
                hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              {isSetLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>{t.setting || "Setting..."}</span>
                </>
              ) : (
                <>
                  <FiSave size={13} />
                  <span>{t.setPassword || "Set Password"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderUpdatePasswordForm = () => (
    <div className="bg-[#13131F]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden shadow-xl">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#F9BC20]/10 to-transparent"></div>
        <div className="relative px-4 py-3 sm:px-5 sm:py-4">
          <button 
            onClick={handleBackToMode}
            className="text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 text-xs transition-colors group"
          >
            <FiArrowLeft size={11} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t.back || "Back"}</span>
          </button>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {t.updateTransactionPassword || "Update Transaction Password"}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {t.updatePasswordDescForm || "Enter your current password and create a new one"}
          </p>
        </div>
      </div>
      
      <div className="p-4 sm:p-5">
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {t.currentTransactionPassword || "Current Transaction Password"}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={14} />
              </div>
              <input
                type={showUpdateCurrentPassword ? "text" : "password"}
                value={updateCurrentPassword}
                onChange={(e) => setUpdateCurrentPassword(e.target.value)}
                className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-500 
                  focus:outline-none focus:border-[#F9BC20] focus:ring-1 focus:ring-[#F9BC20]/30 transition-all duration-200 text-xs sm:text-sm"
                placeholder={t.enterCurrentPassword || "Enter current password"}
                required
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateCurrentPassword(!showUpdateCurrentPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showUpdateCurrentPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {t.newTransactionPassword || "New Transaction Password"}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiKey className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={14} />
              </div>
              <input
                type={showUpdateNewPassword ? "text" : "password"}
                value={updateNewPassword}
                onChange={(e) => setUpdateNewPassword(e.target.value)}
                className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-500 
                  focus:outline-none focus:border-[#F9BC20] focus:ring-1 focus:ring-[#F9BC20]/30 transition-all duration-200 text-xs sm:text-sm"
                placeholder={t.enterNewTransactionPassword || "Enter new transaction password"}
                required
                minLength={4}
                maxLength={20}
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateNewPassword(!showUpdateNewPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showUpdateNewPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">
              {t.passwordHint || "4-20 characters, numbers or letters only"}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">
              {t.confirmTransactionPassword || "Confirm Transaction Password"}
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={14} />
              </div>
              <input
                type={showUpdateConfirmPassword ? "text" : "password"}
                value={updateConfirmPassword}
                onChange={(e) => setUpdateConfirmPassword(e.target.value)}
                className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-10 py-2 text-white placeholder-gray-500 
                  focus:outline-none focus:border-[#F9BC20] focus:ring-1 focus:ring-[#F9BC20]/30 transition-all duration-200 text-xs sm:text-sm"
                placeholder={t.confirmYourPassword || "Confirm your password"}
                required
                disabled={isUpdateLoading}
              />
              <button
                type="button"
                onClick={() => setShowUpdateConfirmPassword(!showUpdateConfirmPassword)}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showUpdateConfirmPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
              </button>
            </div>
          </div>

          {updateNewPassword && updateConfirmPassword && (
            <div className={`flex items-center gap-1.5 text-xs ${updateNewPassword === updateConfirmPassword ? 'text-green-400' : 'text-red-400'}`}>
              {updateNewPassword === updateConfirmPassword ? (
                <>
                  <FiCheck size={12} />
                  <span>{t.passwordsMatch || "Passwords match"}</span>
                </>
              ) : (
                <>
                  <FiAlertCircle size={12} />
                  <span>{t.passwordsDoNotMatch || "Passwords do not match"}</span>
                </>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleBackToMode}
              disabled={isUpdateLoading}
              className="flex-1 bg-gray-700/50 text-white py-2 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-xs sm:text-sm font-medium"
            >
              {t.cancel || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isUpdateLoading || !updateCurrentPassword || !updateNewPassword || !updateConfirmPassword || updateNewPassword !== updateConfirmPassword}
              className="flex-1 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2 rounded-lg font-semibold 
                hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-1.5 text-xs sm:text-sm"
            >
              {isUpdateLoading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>{t.updating || "Updating..."}</span>
                </>
              ) : (
                <>
                  <FiSave size={13} />
                  <span>{t.updatePasswordBtn || "Update Password"}</span>
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
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#16213E] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#F9BC20]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const hasEmail = userData?.email && userData.email.trim() !== "";

  return (
    <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#16213E] text-white">
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

        <div className="flex-1 overflow-auto">
          <div className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-3 sm:px-4 pt-14 sm:pt-16 pb-6">
            
            {!hasEmail && <NoEmailScreen onNavigate={navigate} t={t} />}
            
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