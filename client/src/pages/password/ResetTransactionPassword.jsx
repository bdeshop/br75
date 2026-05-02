// ResetTransactionPassword.tsx
import React, { useState, useContext, useRef, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { 
  FiAlertCircle, 
  FiCheck, 
  FiEye, 
  FiEyeOff, 
  FiMail, 
  FiLock,
  FiRefreshCw,
  FiSend,
  FiSave,
  FiArrowLeft,
  FiInfo,
  FiSmartphone,
  FiShield,
  FiKey,
  FiHelpCircle,
  FiUserPlus,
  FiAlertTriangle
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// OTP Input Component
const OtpBoxes = ({ value, onChange, disabled, t }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = value.split("");
    arr[index] = digit;
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const arr = value.split("");
      if (arr[index]) {
        arr[index] = "";
        onChange(arr.join("").padEnd(6, "").slice(0, 6));
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const prev = value.split("");
        prev[index - 1] = "";
        onChange(prev.join("").padEnd(6, "").slice(0, 6));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const nextFocus = Math.min(pasted.length, 5);
    inputRefs.current[nextFocus]?.focus();
  };

  return (
    <div className="flex gap-2 sm:gap-3 justify-center my-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-semibold 
            bg-[#1E1E2E] rounded-lg text-white outline-none transition-all duration-200
            ${value[i] ? 'border-2 border-[#F9BC20] ring-2 ring-[#F9BC20]/30' : 'border border-gray-700/50 hover:border-gray-600'}
            focus:border-[#F9BC20] focus:ring-2 focus:ring-[#F9BC20]/30`}
        />
      ))}
    </div>
  );
};

// Tab Component
const TabButton = ({ id, label, icon: Icon, active, onClick, t }) => (
  <button
    onClick={onClick}
    className={`group relative flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-300
      ${active 
        ? 'text-[#F9BC20]' 
        : 'text-gray-400 hover:text-gray-200'
      }`}
  >
    <Icon size={15} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`} />
    <span>{label}</span>
    {active && (
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/60 rounded-full" />
    )}
  </button>
);

// No Email Warning
const NoEmailWarning = ({ onNavigate, t }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
      <FiAlertTriangle className="text-amber-500 w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{t.emailNotSet || "Email Not Set"}</h3>
    <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
      {t.emailNotSetDesc || "You haven't added an email address to your account yet. Please set up your email first to reset your transaction password."}
    </p>
    <button
      onClick={onNavigate}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 text-sm"
    >
      <FiUserPlus size={15} />
      {t.setUpEmailNow || "Set Up Email Now"}
    </button>
  </div>
);

// No Mobile Warning
const NoMobileWarning = ({ onNavigate, t }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
      <FiSmartphone className="text-amber-500 w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{t.mobileNotSet || "Mobile Number Not Set"}</h3>
    <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
      {t.mobileNotSetDesc || "You haven't added a mobile number to your account yet. Please set up your mobile number first to reset your transaction password."}
    </p>
    <button
      onClick={onNavigate}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 text-sm"
    >
      <FiSmartphone size={15} />
      {t.setUpMobileNow || "Set Up Mobile Now"}
    </button>
  </div>
);

// No Transaction Password Warning - User cannot reset because they never set it
const NoTransactionPasswordWarning = ({ onNavigate, t }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
      <FiLock className="text-blue-500 w-8 h-8" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{t.noTransactionPasswordSet || "No Transaction Password Set"}</h3>
    <p className="text-sm text-gray-400 mb-5 max-w-xs mx-auto">
      {t.noTransactionPasswordSetDesc || "You haven't set up a transaction password yet. Please set one up first before resetting it."}
    </p>
    <button
      onClick={onNavigate}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 px-5 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 text-sm"
    >
      <FiKey size={15} />
      {t.setTransactionPasswordBtn || "Set Transaction Password"}
    </button>
  </div>
);

const ResetTransactionPassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("request");
  const [resetToken, setResetToken] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  
  // Email fields
  const [email, setEmail] = useState("");
  const [hasEmail, setHasEmail] = useState(false);
  
  // Mobile fields
  const [phone, setPhone] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const [mobileResetToken, setMobileResetToken] = useState(null);
  
  // Common fields
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPasswordSet, setIsTransactionPasswordSet] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const { language, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    checkTransactionPasswordStatus();
  }, []);

  const checkTransactionPasswordStatus = async () => {
    const token = localStorage.getItem('usertoken');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await axios.get(`${API_BASE_URL}/api/user/transaction-password-status`);
      if (response.data.success) {
        setIsTransactionPasswordSet(response.data.data.isSet);
      }
      
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (userResponse.data.success) {
        const user = userResponse.data.data;
        setUserData(user);
        
        const userEmail = user.email || "";
        setEmail(userEmail);
        setHasEmail(!!userEmail && userEmail.trim() !== "");
        
        const userPhone = user.phone || "";
        setPhone(userPhone);
        setHasPhone(!!userPhone && userPhone.trim() !== "");
      }
    } catch (error) {
      console.error('Error checking transaction password status:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('usertoken');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format mobile number - ensures it starts with 01
  const formatMobileNumber = (rawPhone) => {
    let cleaned = rawPhone.replace(/\D/g, '');
    
    if (cleaned.startsWith('880')) {
      cleaned = '0' + cleaned.slice(3);
    } else if (cleaned.length === 10 && cleaned.startsWith('1')) {
      cleaned = '0' + cleaned;
    }
    
    if (cleaned.length === 11 && cleaned.startsWith('01')) {
      return cleaned;
    }
    return cleaned;
  };

  const handleRequestEmailOTP = async (e) => {
    e.preventDefault();
    
    // Check if transaction password is set first
    if (!isTransactionPasswordSet) {
      toast.error(t.noTransactionPasswordError || "You haven't set a transaction password yet. Please set one first.");
      setTimeout(() => navigate('/member/transaction-password'), 2000);
      return;
    }
    
    if (!email) {
      toast.error(t.emailRequired || "Please enter your email address");
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      toast.error(t.validEmailRequired || "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/forgot-transaction-password`, { email });
      
      if (response.data.success) {
        let token = response.data.data?.resetToken || response.data.resetToken;
        setResetToken(token);
        setStep("verify");
        setCountdown(60);
        toast.success(t.otpSentToEmail || "OTP sent to your email!");
        
        if (import.meta.env.DEV && (response.data.data?.devOtp || response.data.devOtp)) {
          toast.info(`${t.devOtp || "Development OTP"}: ${response.data.data?.devOtp || response.data.devOtp}`, { autoClose: 10000 });
        }
      } else {
        toast.error(response.data.message || (t.failedToSendOTP || "Failed to send OTP"));
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast.error(error.response?.data?.message || (t.failedToSendOTP || "Failed to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestMobileOTP = async (e) => {
    e.preventDefault();
    
    // Check if transaction password is set first
    if (!isTransactionPasswordSet) {
      toast.error(t.noTransactionPasswordError || "You haven't set a transaction password yet. Please set one first.");
      setTimeout(() => navigate('/member/transaction-password'), 2000);
      return;
    }
    
    if (!phone) {
      toast.error(t.phoneRequired || "Please enter your phone number");
      return;
    }

    const formattedPhone = formatMobileNumber(phone);
    const phoneRegex = /^01[3-9]\d{8}$/;
    
    if (!phoneRegex.test(formattedPhone)) {
      toast.error(t.validPhoneRequired || "Please enter a valid Bangladeshi phone number (e.g., 01XXXXXXXXX)");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/forgot-transaction-password-mobile`, { 
        phone: formattedPhone
      });
      
      if (response.data.success) {
        let token = response.data.data?.resetToken || response.data.resetToken;
        setMobileResetToken(token);
        setResetToken(token);
        setStep("verify");
        setCountdown(60);
        toast.success(`${t.otpSentToMobile || "OTP sent to"} ${formattedPhone}!`);
        
        if (import.meta.env.DEV && (response.data.data?.devOtp || response.data.devOtp)) {
          toast.info(`${t.devOtp || "Development OTP"}: ${response.data.data?.devOtp || response.data.devOtp}`, { autoClose: 10000 });
        }
      } else {
        toast.error(response.data.message || (t.failedToSendOTP || "Failed to send OTP"));
      }
    } catch (error) {
      console.error('Error requesting mobile OTP:', error);
      toast.error(error.response?.data?.message || (t.failedToSendOTP || "Failed to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.replace(/\s/g, "").length !== 6) {
      toast.error(t.validOTPRequired || "Please enter a valid 6-digit OTP");
      return;
    }

    if (!resetToken) {
      toast.error(t.sessionExpired || "Session expired. Please try again.");
      setStep("request");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = activeTab === "email" 
        ? `${API_BASE_URL}/api/user/verify-transaction-otp`
        : `${API_BASE_URL}/api/user/verify-transaction-mobile-otp`;
      
      const response = await axios.post(endpoint, {
        resetToken,
        otp: otp.replace(/\s/g, "")
      });
      
      if (response.data.success) {
        setStep("reset");
        toast.success(t.otpVerifiedSuccess || "OTP verified! Now set your new transaction password.");
      } else {
        toast.error(response.data.message || (t.invalidOTP || "Invalid OTP"));
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || (t.invalidOTP || "Invalid OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error(t.enterNewPassword || "Please enter new transaction password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t.passwordsDoNotMatch || "Passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      toast.error(t.passwordMinLength4 || "Transaction password must be at least 4 characters");
      return;
    }

    if (newPassword.length > 20) {
      toast.error(t.passwordMaxLength20 || "Transaction password cannot exceed 20 characters");
      return;
    }

    if (!resetToken) {
      toast.error(t.sessionExpired || "Session expired. Please try again.");
      setStep("request");
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = activeTab === "email"
        ? `${API_BASE_URL}/api/user/reset-transaction-password`
        : `${API_BASE_URL}/api/user/reset-transaction-password-mobile`;
      
      const response = await axios.post(endpoint, {
        resetToken,
        newPassword,
        confirmPassword
      });
      
      if (response.data.success) {
        toast.success(t.passwordResetSuccess || "Transaction password reset successfully!");
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || (t.failedToResetPassword || "Failed to reset password"));
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || (t.failedToResetPassword || "Failed to reset password"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.info(`${t.waitSeconds || "Please wait"} ${countdown} ${t.secondsBeforeRequest || "seconds before requesting again"}`);
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (activeTab === "email") {
        if (!email) {
          toast.error(t.emailRequired || "Email is required");
          return;
        }
        response = await axios.post(`${API_BASE_URL}/api/user/forgot-transaction-password`, { email });
      } else {
        const cleanPhone = formatMobileNumber(phone);
        if (!cleanPhone) {
          toast.error(t.phoneRequired || "Phone number is required");
          return;
        }
        response = await axios.post(`${API_BASE_URL}/api/user/resend-transaction-mobile-otp`, { 
          resetToken 
        });
      }
      
      if (response.data.success) {
        let token = response.data.data?.resetToken || response.data.resetToken;
        if (token) {
          if (activeTab === "email") setResetToken(token);
          else setMobileResetToken(token);
          setResetToken(token);
        }
        setOtp("");
        setCountdown(60);
        toast.success(`${t.otpResent || "OTP resent to your"} ${activeTab === "email" ? (t.email || "email") : (t.mobileNumber || "mobile number")}!`);
        
        if (import.meta.env.DEV && (response.data.data?.devOtp || response.data.devOtp)) {
          toast.info(`${t.devOtp || "Development OTP"}: ${response.data.data?.devOtp || response.data.devOtp}`, { autoClose: 10000 });
        }
      } else {
        toast.error(response.data.message || (t.failedToResendOTP || "Failed to resend OTP"));
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(error.response?.data?.message || (t.failedToResendOTP || "Failed to resend OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "verify") {
      setStep("request");
      setOtp("");
    } else if (step === "reset") {
      setStep("verify");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleNavigateToProfileInfo = () => {
    navigate('/member/profile/info');
  };

  const handleNavigateToSetPassword = () => {
    navigate('/member/transaction-password');
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    let digits = value.replace(/\D/g, '');
    
    if (digits.startsWith('880')) {
      digits = '0' + digits.slice(3);
    }
    
    if (digits.length > 11) {
      digits = digits.slice(0, 11);
    }
    
    setPhone(digits);
  };

  const renderEmailRequestForm = () => (
    <form onSubmit={handleRequestEmailOTP} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t.emailAddress || "Email Address"}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiMail className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={16} />
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 
              focus:outline-none focus:border-[#F9BC20] focus:ring-2 focus:ring-[#F9BC20]/30 transition-all duration-200 text-sm"
            placeholder={t.enterRegisteredEmail || "Enter your registered email"}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !hasEmail || !isTransactionPasswordSet}
        className="w-full bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2.5 rounded-lg font-semibold 
          hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{t.sendingOTP || "Sending OTP..."}</span>
          </>
        ) : (
          <>
            <FiSend size={14} />
            <span>{t.sendOTPToEmail || "Send OTP to Email"}</span>
          </>
        )}
      </button>
    </form>
  );

  const renderMobileRequestForm = () => (
    <form onSubmit={handleRequestMobileOTP} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t.mobileNumber || "Mobile Number"}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSmartphone className="text-gray-500 group-focus-within:text-[#F9BC20] transition-colors" size={16} />
          </div>
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg pl-9 pr-3 py-2.5 text-white placeholder-gray-500 
              focus:outline-none focus:border-[#F9BC20] focus:ring-2 focus:ring-[#F9BC20]/30 transition-all duration-200 text-sm"
            placeholder="01XXXXXXXXX"
            required
            disabled={isLoading}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
          <FiInfo size={11} />
          {t.mobileNumberHint || "Enter 11-digit Bangladeshi mobile number starting with 01"}
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !hasPhone || !isTransactionPasswordSet}
        className="w-full bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2.5 rounded-lg font-semibold 
          hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center gap-2 text-sm"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{t.sendingOTP || "Sending OTP..."}</span>
          </>
        ) : (
          <>
            <FiSend size={14} />
            <span>{t.sendOTPToMobile || "Send OTP to Mobile"}</span>
          </>
        )}
      </button>
    </form>
  );

  const renderVerifyForm = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F9BC20]/10 flex items-center justify-center">
          <FiShield className="text-[#F9BC20] w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">{t.verificationRequired || "Verification Required"}</h3>
        <p className="text-xs text-gray-400">
          {t.weSentCodeTo || "We sent a 6-digit code to your"} {activeTab === "email" ? (t.emailAddress || "email address") : (t.mobileNumber || "mobile number")}
        </p>
      </div>
      
      <OtpBoxes
        value={otp}
        onChange={setOtp}
        disabled={isLoading}
        t={t}
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
        >
          {t.back || "Back"}
        </button>
        <button
          type="submit"
          disabled={isLoading || otp.replace(/\s/g, "").length !== 6}
          className="flex-1 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2.5 rounded-lg font-semibold 
            hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{t.verifying || "Verifying..."}</span>
            </>
          ) : (
            <>
              <FiCheck size={14} />
              <span>{t.verifyOTP || "Verify OTP"}</span>
            </>
          )}
        </button>
      </div>

      <div className="text-center pt-1">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={isLoading || countdown > 0}
          className="text-[#F9BC20] hover:text-[#F9BC20]/80 text-xs flex items-center justify-center gap-1.5 w-full 
            disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FiRefreshCw size={12} className={countdown > 0 ? "animate-spin" : ""} />
          {countdown > 0 ? `${t.resendOTPIn || "Resend OTP in"} ${countdown}s` : (t.resendOTP || "Resend OTP")}
        </button>
      </div>
    </form>
  );

  const renderResetForm = () => (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-[#F9BC20]/10 flex items-center justify-center">
          <FiKey className="text-[#F9BC20] w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">{t.setNewPasswordTitle || "Set New Password"}</h3>
        <p className="text-xs text-gray-400">{t.createStrongPassword || "Create a strong transaction password"}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t.newTransactionPassword || "New Transaction Password"}
        </label>
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 
              focus:outline-none focus:border-[#F9BC20] focus:ring-2 focus:ring-[#F9BC20]/30 transition-all duration-200 text-sm"
            placeholder={t.enterNewTransactionPassword || "Enter new transaction password"}
            required
            minLength={4}
            maxLength={20}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showNewPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1.5">{t.passwordHint || "4-20 characters, numbers or letters"}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {t.confirmTransactionPassword || "Confirm Transaction Password"}
        </label>
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-[#1E1E2E] border border-gray-700/50 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 
              focus:outline-none focus:border-[#F9BC20] focus:ring-2 focus:ring-[#F9BC20]/30 transition-all duration-200 text-sm"
            placeholder={t.confirmYourPassword || "Confirm your password"}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      {newPassword && confirmPassword && (
        <div className={`flex items-center gap-1.5 text-sm ${newPassword === confirmPassword ? 'text-green-400' : 'text-red-400'}`}>
          {newPassword === confirmPassword ? (
            <>
              <FiCheck size={14} />
              <span>{t.passwordsMatch || "Passwords match"}</span>
            </>
          ) : (
            <>
              <FiAlertCircle size={14} />
              <span>{t.passwordsDoNotMatch || "Passwords do not match"}</span>
            </>
          )}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={handleBack}
          disabled={isLoading}
          className="flex-1 bg-gray-700/50 text-white py-2.5 rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 text-sm font-medium"
        >
          {t.back || "Back"}
        </button>
        <button
          type="submit"
          disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          className="flex-1 bg-gradient-to-r from-[#F9BC20] to-[#F9BC20]/80 text-gray-900 py-2.5 rounded-lg font-semibold 
            hover:shadow-lg hover:shadow-[#F9BC20]/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 text-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{t.resettingPassword || "Resetting..."}</span>
            </>
          ) : (
            <>
              <FiSave size={14} />
              <span>{t.resetPasswordBtn || "Reset Password"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#16213E] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F9BC20]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If user hasn't set transaction password, show warning and prevent reset
  if (!isTransactionPasswordSet) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#0F0F1A] via-[#1A1A2E] to-[#16213E] text-white">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="dark" />
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 overflow-auto">
            <div className="max-w-md mx-auto px-4 pt-20 pb-8">
              <NoTransactionPasswordWarning onNavigate={handleNavigateToSetPassword} t={t} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
          <div className="max-w-md mx-auto px-4 pt-16 pb-8">
            
            {/* Main Card */}
            <div className="bg-[#13131F]/80 backdrop-blur-sm border border-gray-800/50 rounded-xl overflow-hidden shadow-xl">
              
              {/* Header Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F9BC20]/10 to-transparent"></div>
                <div className="relative px-4 py-3">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="text-gray-400 hover:text-white flex items-center gap-1.5 mb-2 text-xs transition-colors group"
                  >
                    <FiArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>{t.backToProfile || "Back to Profile"}</span>
                  </button>
                  <h2 className="text-lg font-bold text-white">
                    {t.resetTransactionPasswordTitle || "Reset Transaction Password"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {step === "request" && (t.chooseMethodDesc || "Choose a method to receive verification code")}
                    {step === "verify" && (t.enterCodeDesc || "Enter the verification code sent to you")}
                    {step === "reset" && (t.createNewPasswordDesc || "Create your new transaction password")}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              {step === "request" && (
                <div className="border-b border-gray-800/50 px-2">
                  <div className="flex">
                    <TabButton 
                      id="email" 
                      label={t.email || "Email"} 
                      icon={FiMail} 
                      active={activeTab === "email"} 
                      onClick={() => {
                        setActiveTab("email");
                        setStep("request");
                        setOtp("");
                        setResetToken(null);
                      }}
                      t={t}
                    />
                    <TabButton 
                      id="mobile" 
                      label={t.mobile || "Mobile"} 
                      icon={FiSmartphone} 
                      active={activeTab === "mobile"} 
                      onClick={() => {
                        setActiveTab("mobile");
                        setStep("request");
                        setOtp("");
                        setResetToken(null);
                      }}
                      t={t}
                    />
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="p-4">
                {step === "request" && (
                  <>
                    {activeTab === "email" && (
                      hasEmail ? renderEmailRequestForm() : <NoEmailWarning onNavigate={handleNavigateToProfileInfo} t={t} />
                    )}
                    {activeTab === "mobile" && (
                      hasPhone ? renderMobileRequestForm() : <NoMobileWarning onNavigate={handleNavigateToProfileInfo} t={t} />
                    )}

                    {/* Info Card */}
                    {((activeTab === "email" && hasEmail) || (activeTab === "mobile" && hasPhone)) && (
                      <div className="mt-5 p-3 bg-[#1E1E2E]/50 rounded-lg border border-gray-800/50">
                        <div className="flex items-center gap-1.5 text-[#F9BC20] mb-1.5">
                          <FiLock size={12} />
                          <span className="text-xs font-medium">{t.aboutTransactionPassword || "About Transaction Password"}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          {t.transactionPasswordInfo || "Transaction password is used for sensitive operations like withdrawals and transfers. You are resetting your existing transaction password."}
                        </p>
                      </div>
                    )}

                    {activeTab === "mobile" && hasPhone && (
                      <div className="mt-3 p-2.5 bg-blue-900/20 rounded-lg border border-blue-800/30">
                        <div className="flex items-center gap-1.5 text-blue-400 mb-0.5">
                          <FiInfo size={11} />
                          <span className="text-[10px] font-medium">{t.note || "Note"}</span>
                        </div>
                        <p className="text-[10px] text-gray-400">
                          {t.mobileVerificationNote || "Make sure your mobile number is verified. Standard SMS rates may apply."}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {step === "verify" && renderVerifyForm()}
                {step === "reset" && renderResetForm()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetTransactionPassword;