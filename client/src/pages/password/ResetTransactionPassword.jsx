// ResetTransactionPassword.js
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
  FiInfo
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LanguageContext } from "../../context/LanguageContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// OTP Input Component with responsive styling
const OtpBoxes = ({ value, onChange, disabled }) => {
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
    <div className="flex gap-2 sm:gap-3 justify-center my-3 sm:my-4">
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
          className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-medium 
            bg-[#222] rounded-lg text-white outline-none transition-all duration-150
            ${value[i] ? 'border-theme_color border-2' : 'border border-gray-700'}`}
          onFocus={(e) => (e.target.style.borderColor = "#F9BC20")}
          onBlur={(e) => (e.target.style.borderColor = value[i] ? "#F9BC20" : "#444")}
        />
      ))}
    </div>
  );
};

const ResetTransactionPassword = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("request"); // request, verify, reset
  const [resetToken, setResetToken] = useState(null);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransactionPasswordSet, setIsTransactionPasswordSet] = useState(false);
  
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const { language, t } = useContext(LanguageContext);
  const navigate = useNavigate();

  // Check if user has transaction password set
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
      
      // Also get user email
      const userResponse = await axios.get(`${API_BASE_URL}/api/user/my-information`);
      if (userResponse.data.success) {
        setUserData(userResponse.data.data);
        setEmail(userResponse.data.data.email || "");
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

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/forgot-transaction-password`, { email });
      
      console.log("Full response:", response.data);
      
      if (response.data.success) {
        // Check different response structures
        let token = null;
        if (response.data.data && response.data.data.resetToken) {
          token = response.data.data.resetToken;
        } else if (response.data.resetToken) {
          token = response.data.resetToken;
        }
        
        console.log("Reset token:", token);
        setResetToken(token);
        setStep("verify");
        toast.success("OTP sent to your email!");
        
        // For development - show OTP if available
        const devOtp = response.data.data?.devOtp || response.data.devOtp;
        if (import.meta.env.DEV && devOtp) {
          toast.info(`Development OTP: ${devOtp}`, { autoClose: 10000 });
        }
      } else {
        toast.error(response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error('Error requesting OTP:', error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.replace(/\s/g, "").length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!resetToken) {
      toast.error("Session expired. Please try again.");
      setStep("request");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/verify-transaction-otp`, {
        resetToken,
        otp: otp.replace(/\s/g, "")
      });
      
      console.log("Verify OTP response:", response.data);
      
      if (response.data.success) {
        setStep("reset");
        toast.success("OTP verified! Now set your new transaction password.");
      } else {
        toast.error(response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Transaction Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter new transaction password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Transaction password must be at least 4 characters");
      return;
    }

    if (newPassword.length > 20) {
      toast.error("Transaction password cannot exceed 20 characters");
      return;
    }

    if (!resetToken) {
      toast.error("Session expired. Please try again.");
      setStep("request");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/reset-transaction-password`, {
        resetToken,
        newPassword,
        confirmPassword
      });
      
      console.log("Reset password response:", response.data);
      
      if (response.data.success) {
        toast.success("Transaction password reset successfully!");
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (!email) {
      toast.error("Email is required");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/user/forgot-transaction-password`, { email });
      
      console.log("Resend OTP response:", response.data);
      
      if (response.data.success) {
        // Check different response structures
        let token = null;
        if (response.data.data && response.data.data.resetToken) {
          token = response.data.data.resetToken;
        } else if (response.data.resetToken) {
          token = response.data.resetToken;
        }
        
        setResetToken(token);
        setOtp("");
        toast.success("OTP resent to your email!");
        
        const devOtp = response.data.data?.devOtp || response.data.devOtp;
        if (import.meta.env.DEV && devOtp) {
          toast.info(`Development OTP: ${devOtp}`, { autoClose: 10000 });
        }
      } else {
        toast.error(response.data.message || "Failed to resend OTP");
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
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

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-theme_color"></div>
          </div>
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
            <div className="bg-[#161616] border border-gray-800 rounded-lg overflow-hidden">
              
              {/* Header with responsive styling */}
              <div className="bg-[#F9BC20] px-4 py-3 sm:px-6 sm:py-4">
                <button 
                  onClick={() => navigate('/profile')}
                  className="text-gray-800 hover:text-gray-900 flex items-center gap-2 mb-2 text-sm sm:text-base"
                >
                  <FiArrowLeft size={16} className="sm:w-4 sm:h-4" /> Back to Profile
                </button>
                <h2 className="text-base sm:text-xl font-semibold text-gray-900">
                  Reset Transaction Password
                </h2>
                <p className="text-xs sm:text-sm text-gray-700 mt-0.5 sm:mt-1">
                  {step === "request" && "Enter your email to receive OTP"}
                  {step === "verify" && "Enter the OTP sent to your email"}
                  {step === "reset" && "Set your new transaction password"}
                </p>
              </div>

              {/* Body with responsive styling */}
              <div className="p-4 sm:p-6">
                {/* Step 1: Request OTP */}
                {step === "request" && (
                  <form onSubmit={handleRequestOTP}>
                    <div className="mb-5 sm:mb-6">
                      <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                        placeholder="Enter your registered email"
                        required
                        disabled={isLoading}
                      />
                      {!email && userData?.email && (
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                          Using: {userData.email}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                          </svg>
                          <span className="text-sm sm:text-base">Sending...</span>
                        </>
                      ) : (
                        <>
                          <FiSend size={16} className="sm:w-4 sm:h-4" />
                          <span className="text-sm sm:text-base">Send OTP</span>
                        </>
                      )}
                    </button>

                    {/* Info about transaction password */}
                    <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-[#1a1c1d] rounded-lg border border-gray-700">
                      <div className="flex items-center gap-1.5 sm:gap-2 text-theme_color mb-1.5 sm:mb-2">
                        <FiLock size={14} className="sm:w-4 sm:h-4" />
                        <span className="text-xs sm:text-sm font-medium">About Transaction Password</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed">
                        Transaction password is used for sensitive operations like withdrawals. 
                        {isTransactionPasswordSet 
                          ? " You are resetting your existing transaction password."
                          : " You are setting up your transaction password for the first time."}
                      </p>
                    </div>
                  </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === "verify" && (
                  <form onSubmit={handleVerifyOTP}>
                    <div className="mb-5 sm:mb-6">
                      <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 text-center">
                        Enter Verification Code
                      </label>
                      <p className="text-[10px] sm:text-xs text-gray-500 text-center mb-3 sm:mb-4">
                        We sent a 6-digit code to {email}
                      </p>
                      
                      <OtpBoxes
                        value={otp}
                        onChange={setOtp}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLoading}
                        className="flex-1 bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || otp.replace(/\s/g, "").length !== 6}
                        className="flex-1 bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            <span className="text-sm sm:text-base">Verifying...</span>
                          </>
                        ) : (
                          <>
                            <FiCheck size={16} className="sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Verify</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="text-center mt-3 sm:mt-4">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-theme_color hover:text-theme_color/80 text-xs sm:text-sm flex items-center justify-center gap-1 w-full"
                      >
                        <FiRefreshCw size={12} className="sm:w-3 sm:h-3" /> Resend OTP
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Reset Password */}
                {step === "reset" && (
                  <form onSubmit={handleResetPassword}>
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2">
                        New Transaction Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                          placeholder="Enter new transaction password"
                          required
                          minLength={4}
                          maxLength={20}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
                        >
                          {showNewPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
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
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full bg-[#222] border border-gray-700 rounded px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base text-white focus:outline-none focus:border-theme_color"
                          placeholder="Confirm your password"
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-2 sm:right-3 top-2 sm:top-3 text-gray-400 hover:text-white"
                        >
                          {showConfirmPassword ? <FiEyeOff size={18} className="sm:w-4 sm:h-4" /> : <FiEye size={18} className="sm:w-4 sm:h-4" />}
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

                    <div className="flex gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        disabled={isLoading}
                        className="flex-1 bg-gray-600 text-white py-2.5 sm:py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 text-sm sm:text-base"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className="flex-1 bg-theme_color text-gray-900 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-theme_color/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                            <span className="text-sm sm:text-base">Resetting...</span>
                          </>
                        ) : (
                          <>
                            <FiSave size={16} className="sm:w-4 sm:h-4" />
                            <span className="text-sm sm:text-base">Reset Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-[10px] sm:text-xs text-gray-500">
                Need help? 
                <button className="text-theme_color ml-1 hover:underline">
                  Contact Support
                </button>
              </p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default ResetTransactionPassword;