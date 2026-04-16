import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { NavLink, useNavigate } from 'react-router-dom';
import videoBackgroundUrl from "../../assets/mainvideo.mp4";
import logo from "../../assets/logo.png";
import { LanguageContext } from '../../context/LanguageContext';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useContext(LanguageContext);
  
  // Reset method selection: 'mobile' or 'email'
  const [resetMethod, setResetMethod] = useState('mobile');
  
  // Step management
  const [step, setStep] = useState(1);
  
  // Mobile form data - store raw input
  const [phone, setPhone] = useState("");
  
  // Email form data
  const [email, setEmail] = useState("");
  
  // OTP digits
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  
  // Password fields
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [emailResetToken, setEmailResetToken] = useState("");
  
  // OTP timer state
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Refs for OTP input fields
  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];
  
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch branding data on component mount
  useEffect(() => {
    fetchBrandingData();
  }, []);

  // OTP Timer
  useEffect(() => {
    let timer;
    if (otpExpiry && step === 2) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const expiry = new Date(otpExpiry).getTime();
        const diff = Math.max(0, Math.floor((expiry - now) / 1000));
        
        setTimeLeft(diff);
        
        if (diff <= 0) {
          setOtpExpiry(null);
          setCanResend(true);
          setOtpError(t.otpExpired || "OTP has expired. Please request a new one.");
        }
      };
      
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [otpExpiry, step, t]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCooldown]);

  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branding`);
      if (response.data.success && response.data.data && response.data.data.logo) {
        const logoUrl = response.data.data.logo.startsWith('http') 
          ? response.data.data.logo 
          : `${API_BASE_URL}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
      setDynamicLogo(logo);
    }
  };

  // Handle OTP digit change
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pastedValue = value.slice(0, 6);
      const newDigits = [...otpDigits];
      
      for (let i = 0; i < pastedValue.length; i++) {
        if (i < 6) {
          newDigits[i] = pastedValue[i];
        }
      }
      
      setOtpDigits(newDigits);
      
      const nextEmptyIndex = newDigits.findIndex(d => d === "");
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpRefs[nextEmptyIndex].current?.focus();
      } else {
        otpRefs[5].current?.focus();
      }
    } else if (/^\d*$/.test(value)) {
      const newDigits = [...otpDigits];
      newDigits[index] = value;
      setOtpDigits(newDigits);
      
      if (value !== "" && index < 5) {
        otpRefs[index + 1].current?.focus();
      }
    }
  };

  // Handle OTP key down
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otpDigits[index] === "" && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        otpRefs[index - 1].current?.focus();
      } else if (otpDigits[index] !== "") {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (pastedNumbers.length > 0) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < pastedNumbers.length; i++) {
        if (i < 6) {
          newDigits[i] = pastedNumbers[i];
        }
      }
      setOtpDigits(newDigits);
      
      const nextEmptyIndex = newDigits.findIndex(d => d === "");
      if (nextEmptyIndex !== -1 && nextEmptyIndex < 6) {
        otpRefs[nextEmptyIndex].current?.focus();
      } else {
        otpRefs[5].current?.focus();
      }
    }
  };

  // Get full OTP string
  const getFullOtp = () => {
    return otpDigits.join("");
  };

  // Format time left
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Format phone number to always have 11 digits starting with 01
  const formatPhoneNumber = (input) => {
    // Remove all non-digit characters
    let cleaned = input.replace(/\D/g, '');
    
    // If empty, return empty
    if (!cleaned) return '';
    
    // If starts with 88, remove it
    if (cleaned.startsWith('88')) {
      cleaned = cleaned.substring(2);
    }
    
    // If starts with 0, keep as is (already has leading 0)
    if (cleaned.startsWith('0')) {
      return cleaned;
    }
    
    // If starts with 1, add leading 0 (e.g., 1612258208 -> 01612258208)
    if (cleaned.startsWith('1')) {
      return `0${cleaned}`;
    }
    
    // If starts with anything else, add 0 prefix
    return cleaned;
  };

  // Format phone for API (remove leading 0 for backend)
  const formatPhoneForAPI = (phoneNumber) => {
    let formatted = formatPhoneNumber(phoneNumber);
    return formatted;
  };

  // Get display phone number with +88 prefix
  const getDisplayPhone = () => {
    const formatted = formatPhoneNumber(phone);
    if (formatted && formatted.startsWith('0')) {
      return `+88${formatted}`;
    }
    return phone ? `+88${phone}` : '';
  };
  // Step 1: Request OTP (Mobile)
  const handleMobileRequestOTP = async (e) => {
    e.preventDefault();
    
    // Format the phone number to ensure it has leading 0
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      setInputError(t.phoneNumber + " " + (t.isRequired || "is required"));
      return;
    }

    // Validate Bangladeshi phone number (starts with 01 and has 11 digits total)
    if (!/^01[3-9]\d{8}$/.test(formattedPhone)) {
      setInputError(t.invalidPhoneNumber || "Please enter a valid Bangladeshi phone number starting with 01 (e.g., 01XXXXXXXXX)");
      return;
    }

    setIsLoading(true);
    setInputError("");

    // Format for API (remove leading 0)
    const apiPhone = formatPhoneForAPI(phone);
 console.log("apiPhone",apiPhone)
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password/request-otp`, {
        phone: apiPhone
      });

      console.log('OTP request response:', response);
      
      // Check if the response indicates user not found
      if (response.data.message && response.data.message.includes("If this phone number is registered")) {
        toast.error(t.phoneNotFound || "Phone number not found in our system. Please check and try again.");
        setInputError(t.phoneNotFound || "Phone number not found in our system.");
        setIsLoading(false);
        return;
      }

      if (response.data.success) {
        setStep(2);
        setOtpExpiry(response.data.data?.expiresAt);
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        setResetToken(response.data.data?.resetToken || "");
        
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
        
        toast.success(t.toastOtpSent || 'OTP sent to your phone!', {
          position: "top-right",
          autoClose: 3000,
        });

        if (response.data.data?.otp) {
          toast.success(`Development OTP: ${response.data.data.otp}`, {
            position: "top-right",
            autoClose: 10000,
          });
        }
      } else {
        toast.error(response.data.message || t.failedToSendOtp || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP request error:', error);
      const errorMessage = error.response?.data?.message || t.failedToSendOtp || 'Failed to send OTP. Please try again.';
      setInputError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Request OTP via Email
  const handleEmailRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setInputError(t.email + " " + (t.isRequired || "is required"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInputError(t.invalidEmail || "Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setInputError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password-email`, {
        email
      });

      // Check if the response indicates user not found
      if (response.data.message && response.data.message.includes("If an account exists with this email")) {
        toast.error(t.emailNotFound || "Email address not found in our system. Please check and try again.");
        setInputError(t.emailNotFound || "Email address not found in our system.");
        setIsLoading(false);
        return;
      }

      if (response.data.success) {
        const token = response.data.data?.resetToken;
        
        if (token) {
          setEmailResetToken(token);
        }
        
        setStep(2);
        setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000));
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
        
        toast.success(t.toastOtpSent || 'OTP sent to your email!', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(response.data.message || t.failedToSendOtp || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Email OTP request error:', error);
      const errorMessage = error.response?.data?.message || t.failedToSendOtp || 'Failed to send OTP. Please try again.';
      setInputError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (Mobile)
  const handleMobileVerifyOTP = async (e) => {
    e.preventDefault();
    
    const fullOtp = getFullOtp();
    
    if (fullOtp.length !== 6) {
      setOtpError(t.pleaseEnterAllDigits || "Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    // Format for API (remove leading 0)
    const apiPhone = formatPhoneForAPI(phone);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password/verify-otp`, {
        phone: apiPhone,
        otp: fullOtp
      });

      if (response.data.success) {
        setResetToken(response.data.data.resetToken);
        setStep(3);
        toast.success(t.otpVerifiedSuccess || 'OTP verified successfully! Please set your new password.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(response.data.message || t.otpVerificationFailed || 'OTP verification failed');
        setOtpError(response.data.message || t.otpVerificationFailed || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.response?.data?.message || t.otpVerificationFailed || 'OTP verification failed. Please try again.';
      setOtpError(errorMessage);
      
      if (errorMessage.includes('Too many failed attempts')) {
        setTimeout(() => {
          setStep(1);
          setOtpDigits(["", "", "", "", "", ""]);
        }, 2000);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (Email)
  const handleEmailVerifyOTP = async (e) => {
    e.preventDefault();
    
    const fullOtp = getFullOtp();
    
    if (fullOtp.length !== 6) {
      setOtpError(t.pleaseEnterAllDigits || "Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setOtpError("");

    try {
      const tokenToUse = emailResetToken || resetToken;
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        resetToken: tokenToUse,
        otp: fullOtp
      });

      if (response.data.success) {
        setStep(3);
        toast.success(t.otpVerifiedSuccess || 'OTP verified successfully! Please set your new password.', {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error(response.data.message || t.otpVerificationFailed || 'OTP verification failed');
        setOtpError(response.data.message || t.otpVerificationFailed || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Email OTP verification error:', error);
      const errorMessage = error.response?.data?.message || t.otpVerificationFailed || 'OTP verification failed. Please try again.';
      setOtpError(errorMessage);
      
      if (errorMessage.includes('Too many failed attempts')) {
        setTimeout(() => {
          setStep(1);
          setOtpDigits(["", "", "", "", "", ""]);
        }, 2000);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP (Mobile)
  const handleMobileResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setOtpError("");

    // Format for API (remove leading 0)
    const apiPhone = formatPhoneForAPI(phone);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password/resend-otp`, {
        phone: apiPhone
      });

      if (response.data.success) {
        setOtpExpiry(response.data.data.expiresAt);
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        
        toast.success(t.toastOtpResent || 'OTP resent successfully!', {
          position: "top-right",
          autoClose: 3000,
        });

        if (response.data.data.otp) {
          toast.success(`Development OTP: ${response.data.data.otp}`, {
            position: "top-right",
            autoClose: 10000,
          });
        }

        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      } else {
        toast.error(response.data.message || t.failedToResendOtp || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('OTP resend error:', error);
      const errorMessage = error.response?.data?.message || t.failedToResendOtp || 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP (Email)
  const handleEmailResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setOtpError("");

    try {
      const tokenToUse = emailResetToken || resetToken;
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-reset-otp`, {
        resetToken: tokenToUse
      });

      if (response.data.success) {
        setOtpExpiry(new Date(Date.now() + 10 * 60 * 1000));
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(["", "", "", "", "", ""]);
        
        toast.success(t.toastOtpResent || 'OTP resent successfully!', {
          position: "top-right",
          autoClose: 3000,
        });

        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      } else {
        toast.error(response.data.message || t.failedToResendOtp || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Email OTP resend error:', error);
      const errorMessage = error.response?.data?.message || t.failedToResendOtp || 'Failed to resend OTP';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password (Mobile)
  const handleMobileResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setPasswordError(t.newPassword + " " + (t.isRequired || "is required"));
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(t.passwordMinLength || "Password must be at least 6 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDontMatch || "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
        resetToken,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        toast.success(t.passwordResetSuccess || 'Password reset successfully! Redirecting to login...', {
          position: "top-right",
          autoClose: 3000,
        });
        
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      } else {
        toast.error(response.data.message || t.passwordResetFailed || 'Password reset failed');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      const errorMessage = error.response?.data?.message || t.passwordResetFailed || 'Password reset failed. Please try again.';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password (Email)
  const handleEmailResetPassword = async (e) => {
    e.preventDefault();
    
    if (!newPassword) {
      setPasswordError(t.newPassword + " " + (t.isRequired || "is required"));
      return;
    }
    
    if (newPassword.length < 6) {
      setPasswordError(t.passwordMinLength || "Password must be at least 6 characters long.");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDontMatch || "Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setPasswordError("");

    try {
      const tokenToUse = emailResetToken || resetToken;
      
      const response = await axios.post(`${API_BASE_URL}/api/auth/reset-password-email`, {
        resetToken: tokenToUse,
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        toast.success(t.passwordResetSuccess || 'Password reset successfully! Redirecting to login...', {
          position: "top-right",
          autoClose: 3000,
        });
        
        setTimeout(() => {
          navigate('/register');
        }, 2000);
      } else {
        toast.error(response.data.message || t.passwordResetFailed || 'Password reset failed');
      }
    } catch (error) {
      console.error('Email password reset error:', error);
      const errorMessage = error.response?.data?.message || t.passwordResetFailed || 'Password reset failed. Please try again.';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to previous step
  const goBack = () => {
    if (step === 2) {
      setStep(1);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError("");
      if (resetMethod === 'mobile') {
        setResetToken("");
      }
    } else if (step === 3) {
      setStep(2);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  };

  // Cancel and go to login
  const cancel = () => {
    navigate('/register');
  };

  // Get the appropriate handlers based on method
  const handleVerifyOTP = resetMethod === 'mobile' ? handleMobileVerifyOTP : handleEmailVerifyOTP;
  const handleResendOTP = resetMethod === 'mobile' ? handleMobileResendOTP : handleEmailResendOTP;
  const handleResetPassword = resetMethod === 'mobile' ? handleMobileResetPassword : handleEmailResetPassword;

  // Get the identifier for display
  const getIdentifier = () => {
    if (resetMethod === 'mobile') {
      return getDisplayPhone();
    }
    return email || "";
  };

  // Handle phone input change
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 11 digits (01XXXXXXXXX)
    if (value.length > 11) {
      value = value.slice(0, 11);
    }
    
    setPhone(value);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 font-poppins text-white">
      <Toaster />
      
      {/* Background Video */}
      <video className="md:flex hidden absolute top-0 left-0 w-full h-full object-cover" autoPlay loop muted>
        <source src={videoBackgroundUrl} type="video/mp4" />
      </video>

      {/* Header Section */}
      <header className="relative z-20 bg-[#141515] border-b-[1px] border-gray-700 bg-opacity-70 flex justify-between items-center px-4 py-3 md:px-8">
        <NavLink to="/">
          <img 
            src={dynamicLogo} 
            alt="Logo" 
            className="w-[70px] md:w-[100px] cursor-pointer" 
          />
        </NavLink>
        
        <div className="flex items-center">
          <NavLink to="/">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </NavLink>
        </div>
      </header>
      
      <video className="md:hidden" autoPlay loop muted>
        <source src={videoBackgroundUrl} type="video/mp4" />
      </video>

      {/* Main Content */}
      <div className="relative flex justify-center md:justify-end items-center h-full md:min-h-[calc(100vh-76px)] md:p-6 lg:p-8 xl:p-[100px]">
        <div className="w-full px-[10px] md:px-0 md:max-w-lg overflow-hidden">
          {/* Password Reset Box */}
          <div className="overflow-hidden bg-opacity-90 bg-[#141515] rounded-lg shadow-2xl">
            {/* Header with step indicator */}
            <div className="p-4 text-center">
              <h2 className="text-xl md:text-2xl font-medium text-white">{t.resetLoginPassword || "Reset Password"}</h2>
              <p className="text-sm text-gray-200 mt-1">
                {step === 1 ? (resetMethod === 'mobile' ? t.enterPhoneNumberStep || "Enter Phone Number" : t.enterEmailStep || "Enter Email Address") : 
                 step === 2 ? (t.verifyOtpStep || "Verify OTP") : 
                 (t.setNewPasswordStep || "Set New Password")}
              </p>
            </div>

            {/* Method Selection Tabs (Only on Step 1) */}
            {step === 1 && (
              <div className="flex border-b border-gray-700 mx-6">
                <button
                  onClick={() => {
                    setResetMethod('mobile');
                    setInputError("");
                    setPhone("");
                    setEmail("");
                    setResetToken("");
                    setEmailResetToken("");
                  }}
                  className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                    resetMethod === 'mobile'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  {t.mobile || "Mobile"}
                </button>
                <button
                  onClick={() => {
                    setResetMethod('email');
                    setInputError("");
                    setPhone("");
                    setEmail("");
                    setResetToken("");
                    setEmailResetToken("");
                  }}
                  className={`flex-1 py-3 text-center font-medium transition-all duration-200 ${
                    resetMethod === 'email'
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <svg className="inline-block w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {t.email || "Email"}
                </button>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Step 1: Input (Phone or Email) */}
              {step === 1 && (
                <form onSubmit={resetMethod === 'mobile' ? handleMobileRequestOTP : handleEmailRequestOTP}>
                  {resetMethod === 'mobile' ? (
                    <div className="mb-6">
                      <label htmlFor="phone" className="block text-sm md:text-sm text-gray-200 mb-2 font-[300]">{t.phoneNumber || "Phone Number"}</label>
                      <div className="flex items-stretch border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] overflow-hidden hover:border-gray-600 transition-colors rounded">
                        <div className="flex items-center px-2 md:px-3 rounded-l border-r border-gray-700">
                          <img src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/flag-type/BD.png?v=1754999737902&source=drccdnsrc" alt="Bangladesh Flag" className="w-5 h-5 md:w-6 md:h-6 mr-1 md:mr-2 rounded-full" />
                          <span className="text-white text-sm md:text-base font-[300]">+88</span>
                        </div>
                        
                        <div className="flex items-center flex-grow pl-2 md:pl-3">
                          <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={handlePhoneChange}
                            className="w-full py-2 md:py-3.5 bg-transparent font-[400] text-white font-[300] focus:outline-none placeholder-gray-500 text-sm md:text-base"
                            placeholder="01XXXXXXXXX"
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      <p className="text-gray-400 text-xs mt-1 ml-1">Enter 11-digit number starting with 01 (e.g., 01XXXXXXXXX)</p>
                      {inputError && <p className="text-red-400 text-xs mt-1">{inputError}</p>}
                    </div>
                  ) : (
                    <div className="mb-6">
                      <label htmlFor="email" className="block text-sm md:text-sm text-gray-200 mb-2 font-[300]">{t.email || "Email Address"}</label>
                      <div className="flex items-stretch border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] overflow-hidden hover:border-gray-600 transition-colors rounded">
                        <div className="flex items-center px-3 border-r border-gray-700">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex items-center flex-grow pl-2 md:pl-3">
                          <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value.toLowerCase())}
                            className="w-full py-2 md:py-3.5 bg-transparent font-[400] text-white font-[300] focus:outline-none placeholder-gray-500 text-sm md:text-base"
                            placeholder={t.enterEmailAddress || "Enter your email address"}
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      {inputError && <p className="text-red-400 text-xs mt-1">{inputError}</p>}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 bg-[#0C4D38] cursor-pointer text-white text-sm font-[500] rounded shadow-lg transition-all transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.sendingOtpBtn || "Sending OTP..."}
                      </span>
                    ) : (t.sendOtpBtn || "Send OTP")}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={cancel}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t.cancelAndGoBack || "Cancel and go back to login"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyOTP}>
                  <div className="mb-6">
                    <p className="text-sm text-gray-300 mb-4 text-center">
                      {t.otpSentTo || "Enter 6-digit OTP sent to"} <span className="font-bold text-green-400">{getIdentifier()}</span>
                    </p>
                    
                    {/* 6-digit OTP Input Fields */}
                    <div className="flex justify-between gap-2 mb-4" onPaste={handleOtpPaste}>
                      {otpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={otpRefs[index]}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-12 md:w-14 md:h-14 border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white text-center text-xl font-bold rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                          disabled={isLoading}
                        />
                      ))}
                    </div>
                    
                    {otpError && <p className="text-red-400 text-xs mb-3 text-center">{otpError}</p>}
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm text-gray-400">
                        {timeLeft > 0 ? (
                          <span>{t.otpExpiresIn || "Expires in:"} <span className="text-yellow-400 font-mono">{formatTimeLeft(timeLeft)}</span></span>
                        ) : (
                          <span className="text-red-400">{t.otpExpired || "OTP expired"}</span>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={!canResend || isLoading}
                        className={`text-sm px-3 py-1 rounded transition-colors ${
                          canResend 
                            ? 'text-green-400 hover:text-green-300 border border-green-800 hover:border-green-600' 
                            : 'text-gray-600 border border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        {resendCooldown > 0 ? `${t.resendIn || "Resend in"} ${resendCooldown}s` : (t.resendOtp || "Resend OTP")}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 bg-[#0C4D38] cursor-pointer text-white text-sm font-[500] rounded shadow-lg transition-all transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || getFullOtp().length !== 6}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.verifyingOtpBtn || "Verifying..."}
                      </span>
                    ) : (t.verifyOtpBtn || "Verify OTP")}
                  </button>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={goBack}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      ← {t.backBtn || "Back"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={cancel}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t.cancel || "Cancel"}
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword}>
                  <div className="mb-4">
                    <label htmlFor="newPassword" className="block text-sm md:text-sm text-gray-200 mb-2">{t.newPassword || "New Password"}</label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 md:p-4 text-sm border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] font-[300] text-white focus:outline-none focus:border-green-500 hover:border-gray-600 transition-colors rounded"
                      placeholder={t.enterNewPassword || "Enter new password (min. 6 characters)"}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-sm md:text-sm text-gray-200 mb-2">{t.confirmNewPassword || "Confirm New Password"}</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 md:p-4 text-sm border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] font-[300] text-white focus:outline-none focus:border-green-500 hover:border-gray-600 transition-colors rounded"
                      placeholder={t.confirmNewPassword || "Confirm your new password"}
                      disabled={isLoading}
                    />
                  </div>

                  {passwordError && <p className="text-red-400 text-xs mb-3">{passwordError}</p>}

                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 bg-[#0C4D38] cursor-pointer text-white text-sm font-[500] rounded shadow-lg transition-all transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.resettingPassword || "Resetting Password..."}
                      </span>
                    ) : (t.resetPassword || "Reset Password")}
                  </button>

                  <div className="mt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={goBack}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      ← {t.backBtn || "Back"}
                    </button>
                    
                    <button
                      type="button"
                      onClick={cancel}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {t.cancel || "Cancel"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}