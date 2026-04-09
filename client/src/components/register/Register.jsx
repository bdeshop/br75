import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import videoBackgroundUrl from "../../assets/mainvideo.mp4";
import { NavLink, useSearchParams } from 'react-router-dom';
import logo from "../../assets/logo.png";
import { LanguageContext } from "../../context/LanguageContext";

export default function Register() {
  const { t } = useContext(LanguageContext);

  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [affiliateCode, setAffiliateCode] = useState("");
  
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  const [phoneError, setPhoneError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [referralError, setReferralError] = useState("");
  
  const [isSignUpActive, setIsSignUpActive] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingReferral, setIsCheckingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState(false);
  const [referrerInfo, setReferrerInfo] = useState(null);
  const [searchParams] = useSearchParams();
  const [dynamicLogo, setDynamicLogo] = useState(logo);

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchBrandingData();
  }, []);

  useEffect(() => {
    const userReferralCode = searchParams.get('ref');
    const affiliateCodeFromUrl = searchParams.get('aff');
    
    console.log('URL Params:', { userReferralCode, affiliateCodeFromUrl });

    if (affiliateCodeFromUrl) {
      setAffiliateCode(affiliateCodeFromUrl.toUpperCase());
      trackAffiliateClick(affiliateCodeFromUrl);
    }

    if (userReferralCode) {
      setReferralCode(userReferralCode.toUpperCase());
    }
  }, [searchParams]);

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

  const trackAffiliateClick = async (affiliateCode) => {
    const source = searchParams.get('source');
    const campaign = searchParams.get('campaign');
    const medium = searchParams.get('medium');

    try {
      await axios.post(`${API_BASE_URL}/api/auth/track-click`, {
        affiliateCode,
        source: source || 'direct',
        campaign: campaign || 'general',
        medium: medium || 'referral',
        landingPage: window.location.pathname
      });
      console.log('Affiliate click tracked successfully for:', affiliateCode);
    } catch (error) {
      console.error('Failed to track affiliate click:', error);
    }
  };

  // ✅ CHANGED: now validates 11 digits starting with 0
  const validatePhone = (value) => {
    if (!value) {
      return "Phone number is required.";
    }
    if (!value.startsWith("0")) {
      return "Phone number must start with 0.";
    }
    if (value.length !== 11) {
      return "Phone number must be exactly 11 digits.";
    }
    return "";
  };

  // ✅ CHANGED: maxLength 11, hint updated
  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw);
    if (phoneError) {
      setPhoneError(validatePhone(raw));
    }
  };

  const checkReferralCode = async () => {
    if (!referralCode) {
      setReferralError("Please enter a referral code");
      return;
    }

    setIsCheckingReferral(true);
    setReferralError("");

    try {
      const userResponse = await axios.get(`${API_BASE_URL}/api/auth/check-referral/${referralCode}`);
      
      if (userResponse.data.success) {
        setReferralValid(true);
        setReferrerInfo(userResponse.data.referrer);
        toast.success(t.toastReferralValid || 'Referral code is valid!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (userError) {
      console.error('Referral check error:', userError);
      const errorMessage = userError.response?.data?.message || 'Invalid referral code';
      setReferralError(errorMessage);
      setReferralValid(false);
      setReferrerInfo(null);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsCheckingReferral(false);
    }
  };

  const handleDirectSignup = async (e) => {
    e.preventDefault();
    
    const phoneValidationError = validatePhone(phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      toast.error(phoneValidationError);
      return;
    }

    if (!username) {
      setSignupError("Username is required.");
      toast.error("Username is required.");
      return;
    }
    
    if (!/^[a-z0-9_]+$/.test(username)) {
      setSignupError("Username can only contain lowercase letters, numbers, and underscores.");
      toast.error("Username can only contain lowercase letters, numbers, and underscores.");
      return;
    }
    
    if (username.length < 3) {
      setSignupError("Username must be at least 3 characters long.");
      toast.error("Username must be at least 3 characters long.");
      return;
    }

    if (!password) {
      setSignupError("Password is required.");
      toast.error("Password is required.");
      return;
    }
    
    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters long.");
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setSignupError("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }

    if (referralCode && !referralValid) {
      setReferralError("Please validate your referral code first");
      toast.error("Please validate your referral code first");
      return;
    }

    setIsLoading(true);
    setPhoneError("");
    setSignupError("");

    try {
      const userData = {
        phone,
        username,
        password,
        confirmPassword,
        fullName: username,
        email: email || undefined,
        referralCode: referralValid ? referralCode : undefined,
        affiliateCode: affiliateCode || undefined
      };

      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, userData);

      if (response.data.success) {
        toast.success(response.data.message || 'Account created successfully!', {
          position: "top-right",
          autoClose: 3000,
        });

        if (response.data.user.affiliateId) {
          toast.success('Welcome! You joined through an affiliate partner.', {
            position: "top-right",
            autoClose: 3000,
          });
        } else if (response.data.user.isUserReferred) {
          toast.success('Welcome! You joined through a friend\'s referral.', {
            position: "top-right",
            autoClose: 3000,
          });
        }
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usertoken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setPhone("");
        setEmail("");
        setUsername("");
        setPassword("");
        setConfirmPassword("");
        setReferralCode("");
        setAffiliateCode("");
        setReferralValid(false);
        setReferrerInfo(null);

        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        toast.error(response.data.message || 'Signup failed');
        setSignupError(response.data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      setSignupError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsernamePasswordLogin = async (e) => {
    e.preventDefault();
    
    if (!loginUsername) {
      setLoginError("Username is required.");
      toast.error("Username is required.");
      return;
    }
    
    if (!loginPassword) {
      setLoginError("Password is required.");
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username: loginUsername,
        password: loginPassword
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Login successful!', {
          position: "top-right",
          autoClose: 3000,
        });

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('usertoken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        toast.error(response.data.error || response.data.message || 'Login failed');
        setLoginError(response.data.error || response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed. Please check your credentials.';
      setLoginError(errorMessage);
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    await handleDirectSignup(e);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    await handleUsernamePasswordLogin(e);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900 font-poppins text-white">
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
      
      <video className="md:flex hidden absolute top-0 left-0 w-full h-full object-cover" autoPlay loop muted>
        <source src={videoBackgroundUrl} type="video/mp4" />
      </video>

      <header className="relative z-20 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e border-b-[1px] border-gray-700 bg-opacity-70 flex justify-between items-center px-4 py-3 md:px-8">
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

      <div className="relative flex justify-center md:justify-end items-center h-full md:min-h-[calc(100vh-76px)] md:p-6 lg:p-8 xl:p-[100px]">
        <div className="w-full px-[10px] md:px-0 md:max-w-lg overflow-hidden">
          <div className="overflow-hidden">
            <div className="flex bg-opacity-80 gap-3 ">
              <button 
                onClick={() => {
                  setIsSignUpActive(false);
                  setLoginError("");
                  setLoginUsername("");
                  setLoginPassword("");
                }} 
                className={`flex-1 py-3 md:py-4  text-center text-sm md:text-base font-medium cursor-pointer transition-colors duration-300 ${!isSignUpActive ? 'border-b-2 bg-blue-500 text-white' : 'text-gray-200 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] hover:text-gray-300'}`}
              >
                {t.tabLogin}
              </button>
              <button 
                onClick={() => {
                  setIsSignUpActive(true);
                  setSignupError("");
                }} 
                className={`flex-1 py-3 md:py-4 text-center text-sm md:text-base font-medium cursor-pointer transition-colors duration-300 ${isSignUpActive ? 'border-b-2 bg-blue-500 text-white' : 'text-gray-200 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] hover:text-gray-300'}`}
              >
                {t.tabSignup}
              </button>
            </div>

            <div className="pt-[20px]">
              {isSignUpActive ? (
                <form onSubmit={handleSignUpSubmit}>
                  {/* Phone Number Input */}
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2 font-[300]">{t.phoneNumber}</label>
                    <div className={`flex items-stretch border-[1px] ${phoneError ? 'border-red-500' : 'border-blue-500'} bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] overflow-hidden hover:border-gray-600 transition-colors`}>
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
                          maxLength={11}
                          className="w-full py-2 md:py-3.5 bg-transparent font-[400] text-white font-[300] focus:outline-none placeholder-gray-500 text-sm md:text-base"
                          placeholder={t.enterPhoneNumber || "01XXXXXXXXX"}
                          disabled={isLoading}
                        />
                      </div>

                      {/* ✅ CHANGED: counter now shows /11 */}
                      <div className="flex items-center pr-3">
                        <span className={`text-xs font-[300] ${phone.length === 11 ? 'text-green-400' : 'text-gray-500'}`}>
                          {phone.length}/11
                        </span>
                      </div>
                    </div>
                    {phoneError && <p className="text-red-400 text-xs mt-1">{phoneError}</p>}
                    {/* ✅ CHANGED: hint updated for 11 digits starting with 0 */}
                    {!phoneError && phone.length > 0 && phone.length < 11 && (
                      <p className="text-gray-400 text-xs mt-1">Must start with 0 and be 11 digits (e.g. 01XXXXXXXXX)</p>
                    )}
                  </div>

                  {/* Username Input */}
                  <div className="mb-4">
                    <label htmlFor="username" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2">{t.usernameLabel}</label>
                    <input
                      type="text"
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full p-2 md:p-4 text-sm border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] font-[300] text-white focus:outline-none focus:border-[#0C4D38] hover:border-gray-600 transition-colors"
                      placeholder={t.enterUsername}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2">{t.passwordLabel}</label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full p-2 md:p-4 text-sm border-[1px] border-blue-500 font-[300] bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white focus:outline-none focus:border-[#0C4D38] hover:border-gray-600 transition-colors"
                      placeholder={t.createPassword}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Confirm Password Input */}
                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2">{t.confirmPasswordLabel}</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-2 md:p-4 text-sm border-[1px] border-blue-500 font-[300] bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white focus:outline-none focus:border-[#0C4D38] hover:border-gray-600 transition-colors"
                      placeholder={t.confirmPasswordPlaceholder}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Referral Code Input */}
                  <div className="mb-4">
                    <label htmlFor="referralCode" className="block text-sm md:text-sm font-[300] text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2">
                      {t.referralCodeLabel}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        id="referralCode"
                        value={referralCode}
                        onChange={(e) => {
                          setReferralCode(e.target.value.toUpperCase());
                          setReferralValid(false);
                          setReferrerInfo(null);
                        }}
                        className="flex-1 p-2 md:p-4 text-sm border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] font-[300] text-white focus:outline-none focus:border-green-500 hover:border-gray-600 transition-colors"
                        placeholder={t.enterReferralCode}
                        disabled={referralValid || isLoading}
                      />
                      {!referralValid && (
                        <button
                          type="button"
                          onClick={checkReferralCode}
                          disabled={isCheckingReferral || !referralCode || isLoading}
                          className="px-3 md:px-4 bg-[#0C4D38] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-green-700 transition-all shadow-md"
                        >
                          {isCheckingReferral ? t.checkingBtn : t.verifyBtn}
                        </button>
                      )}
                      {referralValid && (
                        <button
                          type="button"
                          onClick={() => {
                            setReferralCode("");
                            setReferralValid(false);
                            setReferrerInfo(null);
                          }}
                          className="px-3 md:px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg text-sm font-[500] hover:from-red-700 hover:to-red-800 transition-all shadow-md"
                          disabled={isLoading}
                        >
                          {t.changeBtn}
                        </button>
                      )}
                    </div>
                    {referralError && <p className="text-red-400 text-xs mt-1">{referralError}</p>}
                    {referralValid && referrerInfo && (
                      <p className="text-green-400 text-xs mt-1">
                        {t.validReferralCode} {referrerInfo.username}
                      </p>
                    )}
                  </div>

                  {/* Sign Up Button */}
                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 bg-[#0C4D38] cursor-pointer text-white text-sm font-[500] mt-2 shadow-lg transition-all transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.creatingAccount || 'Creating Account...'}
                      </span>
                    ) : (t.signUpBtn || 'Sign Up')}
                  </button>

                  {signupError && <p className="text-red-400 text-xs mt-3 text-center">{signupError}</p>}
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-4">
                    <label htmlFor="loginUsername" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2 font-[300]">{t.usernameLabel}</label>
                    <div className="flex items-stretch border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] overflow-hidden hover:border-gray-600 transition-colors">
                      <div className="flex items-center px-3 rounded-l border-r border-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex items-center flex-grow pl-2 md:pl-3">
                        <input
                          type="text"
                          id="loginUsername"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          className="w-full py-2 md:py-3.5  bg-transparent font-[400] text-white font-[300] focus:outline-none placeholder-gray-500 text-sm md:text-base"
                          placeholder={t.enterYourUsername}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="loginPassword" className="block text-sm md:text-sm text-white drop-shadow-[0_1px_4px_rgba(0,0,0,1)] mb-2 font-[300]">{t.passwordLabel}</label>
                    <div className="flex items-stretch border-[1px] border-blue-500 bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] overflow-hidden hover:border-gray-600 transition-colors">
                      <div className="flex items-center px-3 rounded-l border-r border-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex items-center flex-grow pl-2 md:pl-3">
                        <input
                          type="password"
                          id="loginPassword"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full py-2 md:py-3.5 bg-transparent font-[400] text-white font-[300] focus:outline-none placeholder-gray-500 text-sm md:text-base"
                          placeholder={t.enterYourPassword}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-red-400 text-xs mb-3 text-center">{loginError}</p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 md:py-4 bg-[#0C4D38] cursor-pointer text-white text-sm font-[500] mt-2 shadow-lg transition-all transform hover:scale-[1.02] hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.loggingInBtn}
                      </span>
                    ) : t.loginBtn}
                  </button>

                  <div className="mt-4 text-right">
                    <NavLink to="/forgot-password" className="text-xs md:text-sm text-green-400 hover:text-green-300 hover:underline transition-colors">
                      {t.forgotPassword}
                    </NavLink>
                  </div>

                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-xs">
                      {t.noAccount}{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setIsSignUpActive(true);
                          setLoginUsername("");
                          setLoginPassword("");
                          setLoginError("");
                        }}
                        className="text-green-400 hover:text-green-300 font-medium hover:underline transition-colors"
                      >
                        {t.signUpHere}
                      </button>
                    </p>
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