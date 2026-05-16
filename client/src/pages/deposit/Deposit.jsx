import React, { useState, useEffect, useContext } from "react";
import { Header } from "../../components/header/Header";
import Sidebar from "../../components/sidebar/Sidebar";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";

const Deposit = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;
  const ORACLEPAY_API_URL = "https://api.oraclepay.org/api/opay-business";
  const ORACLEPAY_TOKEN = "70b7248fa9ed79cd92cb3b59bf49f6db626768ac0690b0aa";
  
  const [activeMethod, setActiveMethod] = useState(null);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [depositMethods, setDepositMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [availableBonuses, setAvailableBonuses] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState(null);
  const navigate = useNavigate();
  
  const { t } = useContext(LanguageContext);

  // Determine minimum deposit amount based on first deposit status
  const getMinimumDepositAmount = () => {
    if (userData && userData.first_deposit === true) {
      return 50; // After first deposit, minimum is 50
    } else {
      return 500; // Before first deposit, minimum is 500
    }
  };

  const quickAmounts = () => {
    const minDeposit = getMinimumDepositAmount();
    if (minDeposit === 500) {
      return [500, 1000, 2000, 5000, 10000, 25000];
    } else {
      return [50, 100, 300, 500, 1000, 25000];
    }
  };

  // Fetch deposit methods
  useEffect(() => {
    const fetchDepositMethods = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/deposit-methods`);
        console.log("response.data",response.data)
        if (response.data.success) {
          setDepositMethods(response.data.method);
          if (response.data.method.length > 0) {
            setActiveMethod(response.data.method[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching deposit methods:", err);
        setError(t.failedToFetchDepositMethods || "Failed to load deposit methods");
      } finally {
        setLoadingMethods(false);
      }
    };

    fetchDepositMethods();
  }, [API_BASE_URL, t]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const response = await axios.get(
          `${API_BASE_URL}/api/user/all-information/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("usertoken")}`,
            },
          }
        );

        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError(t.failedToFetchUserData || "Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [API_BASE_URL, t]);

  // Fetch available bonuses
  useEffect(() => {
    const fetchAvailableBonuses = async () => {
      try {
        setBonusLoading(true);
        const token = localStorage.getItem("usertoken");
        const response = await axios.get(
          `${API_BASE_URL}/api/user/bonuses/available`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data) {
          const user = JSON.parse(localStorage.getItem("user"));
          const userResponse = await axios.get(
            `${API_BASE_URL}/api/user/all-information/${user.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (userResponse.data.success) {
            const userData = userResponse.data.data;
            
            const usedBonusCodes = [];
            
            if (userData.bonusActivityLogs && Array.isArray(userData.bonusActivityLogs)) {
              userData.bonusActivityLogs.forEach(log => {
                if (log.bonusCode && (log.status === 'active' || log.status === 'completed')) {
                  usedBonusCodes.push(log.bonusCode);
                }
              });
            }
            
            if (userData.bonusInfo && userData.bonusInfo.activeBonuses && Array.isArray(userData.bonusInfo.activeBonuses)) {
              userData.bonusInfo.activeBonuses.forEach(bonus => {
                if (bonus.bonusCode) {
                  usedBonusCodes.push(bonus.bonusCode);
                }
              });
            }
            
            let filteredBonuses = response.data.data.filter(bonus => {
              if (!bonus.bonusCode) return true;
              const isUsed = usedBonusCodes.includes(bonus.bonusCode);
              if (bonus.bonusType === 'first_deposit' && userData.bonusInfo?.firstDepositBonusClaimed) {
                return false;
              }
              return !isUsed;
            });
            
            // Filter out bonuses that have minimum deposit higher than current user's capability
            const minDeposit = getMinimumDepositAmount();
            filteredBonuses = filteredBonuses.filter(bonus => {
              if (bonus.minDeposit && bonus.minDeposit > 0) {
                // For users who haven't made first deposit, only show bonuses with min deposit <= 500
                if (!userData.first_deposit && bonus.minDeposit > 500) {
                  return false;
                }
                return true;
              }
              return true;
            });
            
            setAvailableBonuses(filteredBonuses);
          }
        }
      } catch (err) {
        console.error("Error fetching bonuses:", err);
      } finally {
        setBonusLoading(false);
      }
    };

    if (userData) {
      fetchAvailableBonuses();
    }
  }, [API_BASE_URL, userData]);

  const getOraclePayMethodName = (methodName) => {
    const methodMap = {
      'bKash': 'bkash',
      'Nagad': 'nagad',
      'Rocket': 'rocket',
      'Upay': 'upay'
    };
    return methodMap[methodName] || methodName?.toLowerCase() || 'bkash';
  };

  // Handle OraclePay payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Payment submitted");

    setTransactionStatus(null);
    
    const errors = {};
    const minDeposit = getMinimumDepositAmount();
    
    if (!activeMethod) {
      errors.method = t.pleaseSelectPaymentMethod || "Please select a payment method";
    }
    if (!amount) {
      errors.amount = t.amountRequired || "Amount is required";
    } else if (parseFloat(amount) < minDeposit) {
      if (!userData?.first_deposit) {
        errors.amount = `First deposit minimum amount is ৳${minDeposit}. Please deposit at least ৳${minDeposit} to activate your account.`;
      } else {
        errors.amount = `${t.minDepositAmount || "Minimum deposit amount is"} ৳${minDeposit}`;
      }
    } else if (parseFloat(amount) > parseFloat(activeMethod?.maxAmount || 50000)) {
      errors.amount = `${t.maxDepositAmount || "Maximum deposit amount is"} ৳${activeMethod?.maxAmount || 50000}`;
    }
    
    // Check minimum deposit requirement for selected bonus
    if (selectedBonus && selectedBonus.minDeposit > 0) {
      if (parseFloat(amount) < selectedBonus.minDeposit) {
        errors.amount = `Minimum deposit of ৳${selectedBonus.minDeposit} required for ${selectedBonus.name} bonus`;
      }
    }

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsProcessing(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("usertoken");
      
      const userIdentityAddress = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      const invoiceNumber = `INV-${user.id}-${Date.now()}`;
      
      const calculatedBonusAmount = selectedBonus ? calculateBonusAmount(selectedBonus) : 0;
      
      const checkoutItems = {
        userId: user.id,
        username: user.username,
        method: activeMethod.gatewayName,
        selectedBonus: selectedBonus ? {
          id: selectedBonus.id,
          name: selectedBonus.name,
          code: selectedBonus.bonusCode,
          type: selectedBonus.bonusType,
          percentage: selectedBonus.percentage,
          amount: selectedBonus.amount,
          calculatedAmount: calculatedBonusAmount,
          wageringRequirement: selectedBonus.wageringRequirement,
          minDeposit: selectedBonus.minDeposit
        } : null,
        timestamp: new Date().toISOString()
      };

      const oraclePayResponse = await axios.post(
        `${ORACLEPAY_API_URL}/generate-payment-page`,
        {
          payment_amount: parseInt(amount),
          user_identity_address: userIdentityAddress,
          callback_url: `${API_BASE_URL}/api/opay/oraclepay-callback`,
          success_redirect_url: `${window.location.origin}/deposit/success`,
          checkout_items: checkoutItems,
          invoice_number: invoiceNumber
        },
        {
          headers: { 
            'X-Opay-Business-Token': ORACLEPAY_TOKEN,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("OraclePay Response:", oraclePayResponse.data);

      if (oraclePayResponse.data.success) {
        
        const depositRecord = {
          method: activeMethod.gatewayName,
          amount: parseFloat(amount),
          transactionId: `OPAY_${Date.now()}`,
          phoneNumber: userData?.phone || "",
          playerbalance: userData?.balance || 0,
          status: "pending",
          oraclePaySessionCode: oraclePayResponse.data.session_code,
          paymentPageUrl: oraclePayResponse.data.payment_page_url,
          userIdentityAddress: userIdentityAddress,
          invoiceNumber: invoiceNumber,
          bonusType: selectedBonus?.bonusType || 'none',
          bonusAmount: calculatedBonusAmount,
          wageringRequirement: selectedBonus?.wageringRequirement || 0,
          bonusCode: selectedBonus?.bonusCode || '',
          bonusName: selectedBonus?.name || '',
          checkoutItems: checkoutItems,
          currency: 'BDT',
          isFirstDeposit: !userData?.first_deposit // Mark if this is first deposit
        };

        try {
          const saveResponse = await axios.post(
            `${API_BASE_URL}/api/user/deposit`,
            depositRecord,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log("Deposit record saved:", saveResponse.data);
          
          if (saveResponse.data.success) {
            setUserData(prev => ({
              ...prev,
              depositHistory: [
                {
                  ...depositRecord,
                  createdAt: new Date()
                },
                ...(prev?.depositHistory || [])
              ].slice(0, 10)
            }));
          }
        } catch (err) {
          console.error("Error saving deposit record:", err.response?.data || err.message);
        }

        setTransactionStatus({
          success: true,
          message: t.redirectingToPaymentPage || "Redirecting to payment page..."
        });

        setTimeout(() => {
          window.location.href = oraclePayResponse.data.payment_page_url;
        }, 1500);

      } else {
        throw new Error(oraclePayResponse.data.message || t.failedToGeneratePayment || "Failed to generate payment");
      }
      
    } catch (err) {
      console.error("OraclePay payment generation error:", err);
      
      let errorMessage = t.paymentGenerationFailed || "Payment generation failed. Please try again.";
      
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || t.invalidPaymentRequest || "Invalid payment request. Please check your input.";
      } else if (err.response?.status === 401) {
        errorMessage = t.invalidApiToken || "Invalid API token. Please contact support.";
      } else if (err.response?.status === 403) {
        errorMessage = t.accessDenied || "Access denied. Please contact support.";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setTransactionStatus({
        success: false,
        message: errorMessage,
      });
      
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate bonus amount for a specific bonus
  const calculateBonusAmount = (bonus) => {
    if (!amount || isNaN(parseFloat(amount))) return 0;
    
    const amountNum = parseFloat(amount);
    let calculatedBonus = 0;
    
    if (bonus.percentage > 0) {
      calculatedBonus = (amountNum * bonus.percentage) / 100;
      if (bonus.maxBonus && calculatedBonus > bonus.maxBonus) {
        calculatedBonus = bonus.maxBonus;
      }
    } else if (bonus.amount > 0) {
      calculatedBonus = bonus.amount;
    }
    
    return calculatedBonus;
  };

  // Check if amount meets bonus minimum deposit
  const doesAmountMeetBonusMin = (bonus) => {
    if (!bonus || !bonus.minDeposit) return true;
    const currentAmount = parseFloat(amount) || 0;
    return currentAmount >= bonus.minDeposit;
  };

  const handleRefreshBalance = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("usertoken");

      if (!token) {
        setError(t.authenticationTokenNotFound || "Authentication token not found");
        return;
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/user/all-information/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
        setTransactionStatus({
          success: true,
          message: t.balanceUpdatedSuccessfully || "Balance updated successfully!"
        });
        setTimeout(() => setTransactionStatus(null), 3000);
      }
    } catch (err) {
      console.error("Error refreshing balance:", err);
      setError(t.failedToRefreshBalance || "Failed to refresh balance");
    }
  };

  const renderPaymentMethodButton = (method) => (
    <button
      type="button"
      key={method._id}
      className={`px-3 py-3 md:px-4 md:py-4 rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
        activeMethod?._id === method._id
          ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
          : "bg-[#1a1f1f] hover:bg-[#1f2525] border-2 hover:border-gray-700 border-transparent"
      }`}
      onClick={() => {
        setActiveMethod(method);
        setFormErrors({});
        setTransactionStatus(null);
      }}
    >
      <img
        src={`${API_BASE_URL}/images/${method.image}`}
        alt={method.gatewayName}
        className="w-8 h-8 md:w-20 md:h-10 mb-1 md:mb-2 object-contain"
      />
      <span className="text-xs font-medium">{method.gatewayName}</span>
    </button>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(t.dateFormatLocale || 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return t.justNow || 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} ${t.minutesAgo || 'minutes ago'}`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ${t.hoursAgo || 'hours ago'}`;
    return `${Math.floor(diffInSeconds / 86400)} ${t.daysAgo || 'days ago'}`;
  };

  const totalWithBonus = selectedBonus && amount
    ? parseFloat(amount) + calculateBonusAmount(selectedBonus)
    : parseFloat(amount || 0);

  if (error && !userData) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0a0f0f]">
        <div className="bg-[#1a1f1f] text-[#ff6b6b] p-6 rounded-lg max-w-md text-center border border-[#2a2f2f]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">{t.error || "Error"}</p>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#2a5c45] hover:bg-[#3a6c55] px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {t.tryAgain || "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  const minDepositAmount = getMinimumDepositAmount();
  const isFirstDeposit = userData && userData.first_deposit === false;

  return (
    <div className="h-screen overflow-hidden bg-[#0a0f0f] text-white font-rubik">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar isOpen={sidebarOpen} />

        <div
          className={`flex-1 overflow-auto transition-all duration-300  ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <div className="max-w-6xl mx-auto py-4 md:py-8 p-3 md:p-6">
            <div className="mb-6 md:mb-8">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 text-white">
                {t.depositFunds || "Deposit Funds"}
              </h1>
              <p className="text-sm md:text-base text-[#8a9ba8]">
                {t.depositDescription || "Add money to your account using OraclePay secure payment gateway"}
              </p>
            </div>

            {/* First Deposit Warning Banner */}
            {isFirstDeposit && (
              <div className="bg-gradient-to-r from-[#2a1f1f] to-[#1a2525] border-l-4 border-[#ff6b6b] p-4 mb-6 md:mb-8 rounded-r-lg">
                <div className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-[#ff6b6b] mr-3 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-[#ff6b6b] mb-1">
                      First Deposit Requirement
                    </h3>
                    <p className="text-xs md:text-sm text-[#a8b9c6]">
                      As this is your first deposit, the minimum amount is <strong className="text-white">৳{minDepositAmount}</strong>. 
                      After your first deposit, the minimum will be reduced to ৳50.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {userData && (
              <div className="bg-[#1a1f1f] rounded-[2px] p-4 md:p-6 mb-6 md:mb-8 border border-[#2a2f2f] shadow-lg">
                <h2 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white">
                  {t.accountInformation || "Account Information"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">{t.playerId || "Player ID"}</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.player_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">{t.username || "Username"}</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.username}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#8a9ba8]">{t.phone || "Phone"}</p>
                    <p className="text-sm md:text-base font-medium text-white">
                      {userData.phone}
                    </p>
                  </div>
                </div>
                {isFirstDeposit && (
                  <div className="mt-3 pt-3 border-t border-[#2a2f2f]">
                    <p className="text-xs text-[#e6db74]">
                      ⚡ First Deposit Bonus Available! Check the bonus section below.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gradient-to-r from-[#1a2525] to-[#2a3535] rounded-[2px] p-4 md:p-6 mb-6 md:mb-8 shadow-lg border border-[#2a2f2f]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-0">
                <div>
                  <p className="text-xs md:text-sm text-[#a8b9c6]">
                    {t.currentBalance || "Current Balance"}
                  </p>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
                    ৳ {userData ? userData.balance?.toLocaleString() : "0.00"}
                  </h2>
                  {userData?.bonusBalance > 0 && (
                    <p className="text-sm text-[#3a8a6f] mt-1">
                      {t.bonusBalance || "Bonus Balance"}: ৳{userData.bonusBalance?.toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleRefreshBalance}
                  className="bg-[#2a5c45] px-4 py-2 cursor-pointer md:px-6 md:py-3 rounded-[5px] text-xs md:text-sm font-medium transition-colors flex items-center hover:bg-[#3a6c55]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  {t.refreshBalance || "Refresh Balance"}
                </button>
              </div>
            </div>

            {loadingMethods ? (
              <div className="bg-[#1a1f1f] rounded-lg p-8 text-center border border-[#2a2f2f]">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#2a2f2f] rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent rounded-full border-t-[#3a8a6f] animate-spin"></div>
                  </div>
                  <div>
                    <p className="text-[#8a9ba8] font-medium">{t.loadingDepositMethods || "Loading Deposit methods"}</p>
                  </div>
                </div>
              </div>
            ) : depositMethods.length === 0 ? (
              <div className="bg-[#1a1f1f] rounded-[2px] p-8 text-center border border-[#2a2f2f]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-[#8a9ba8] mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-[#8a9ba8]">{t.noDepositMethodsAvailable || "No deposit methods available at the moment."}</p>
              </div>
            ) : (
              <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden mb-6 md:mb-8 border border-[#2a2f2f]">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-3 md:p-4 border-b border-[#2a2f2f]">
                  {depositMethods.map((method) => renderPaymentMethodButton(method))}
                </div>

                {activeMethod && (
                  <>
                    <div className="p-4 md:p-6">
                      <form onSubmit={handleSubmit} noValidate>
                        <div className="mb-4 md:mb-6">
                          <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                            {t.amountCurrency || "Amount (৳)"}
                            <span className="text-[#ff6b6b] ml-1">*</span>
                          </label>
                          <input
                            type="number"
                            className={`w-full bg-[#1f2525] border rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-[#5a6b78] focus:outline-none focus:ring-2 focus:ring-[#3a8a6f] ${
                              formErrors.amount
                                ? "border-[#ff6b6b]"
                                : "border-[#2a2f2f]"
                            }`}
                            placeholder={isFirstDeposit 
                              ? `Enter deposit amount (minimum ৳${minDepositAmount})` 
                              : "Enter deposit amount (minimum ৳50)"}
                            value={amount}
                            onChange={(e) => {
                              setAmount(e.target.value);
                              // Clear amount error when user types
                              if (formErrors.amount) {
                                setFormErrors(prev => ({ ...prev, amount: '' }));
                              }
                              // If bonus selected, check minimum deposit requirement
                              if (selectedBonus && selectedBonus.minDeposit > 0) {
                                const newAmount = parseFloat(e.target.value);
                                if (newAmount >= selectedBonus.minDeposit) {
                                  setFormErrors(prev => ({ ...prev, amount: '' }));
                                }
                              }
                            }}
                            required
                            min={minDepositAmount}
                          />
                          {formErrors.amount && (
                            <p className="text-[#ff6b6b] text-xs md:text-sm mt-1">
                              {formErrors.amount}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 mt-3 md:mt-4">
                            {quickAmounts().map((quickAmount) => (
                              <button
                                type="button"
                                key={quickAmount}
                                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors cursor-pointer ${
                                  amount === quickAmount.toString()
                                    ? "bg-[#2a5c45] text-white"
                                    : "bg-[#1f2525] text-[#8a9ba8] hover:bg-[#252b2b]"
                                }`}
                                onClick={() => {
                                  setAmount(quickAmount.toString());
                                  if (selectedBonus && selectedBonus.minDeposit > 0 && quickAmount < selectedBonus.minDeposit) {
                                    setFormErrors(prev => ({ 
                                      ...prev, 
                                      amount: `Minimum deposit of ৳${selectedBonus.minDeposit} required for ${selectedBonus.name} bonus` 
                                    }));
                                  } else {
                                    setFormErrors(prev => ({ ...prev, amount: '' }));
                                  }
                                }}
                              >
                                ৳ {quickAmount.toLocaleString()}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-[#8a9ba8] mt-2">
                            {isFirstDeposit 
                              ? `ℹ️ First deposit minimum: ৳${minDepositAmount} (After first deposit, minimum will be ৳50)`
                              : `ℹ️ Minimum deposit: ৳${minDepositAmount}`}
                          </p>
                        </div>

                        {/* Dynamic Bonus Selection */}
                        <div className="mb-4 md:mb-6">
                          <label className="block text-[#8a9ba8] text-xs md:text-sm mb-1 md:mb-2 font-medium">
                            {t.selectBonusOptional || "Select Bonus (Optional)"}
                          </label>
                          
                          {bonusLoading ? (
                            <div className="text-center py-4">
                              <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-[#3a8a6f] border-r-transparent"></div>
                              <p className="text-xs text-[#8a9ba8] mt-2">{t.loadingBonuses || "Loading bonuses..."}</p>
                            </div>
                          ) : availableBonuses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <button
                                type="button"
                                className={`p-3 rounded-[5px] flex flex-col cursor-pointer items-center justify-center transition-all ${
                                  !selectedBonus
                                    ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
                                    : "bg-[#1f2525] hover:bg-[#252b2b] border-2 border-transparent"
                                }`}
                                onClick={() => {
                                  setSelectedBonus(null);
                                  setFormErrors(prev => ({ ...prev, amount: '' }));
                                }}
                              >
                                <span className="text-sm md:text-base font-medium">
                                  {t.noBonus || "No Bonus"}
                                </span>
                                <span className="text-xs text-[#8a9ba8]">
                                  {t.proceedWithoutBonus || "Proceed without bonus"}
                                </span>
                              </button>

                              {availableBonuses.map((bonus) => {
                                const calculatedAmount = calculateBonusAmount(bonus);
                                const meetsMinDeposit = doesAmountMeetBonusMin(bonus);
                                const isSelected = selectedBonus?.id === bonus.id;
                                
                                return (
                                  <button
                                    type="button"
                                    key={bonus.id}
                                    className={`p-3 rounded-[5px] flex flex-col cursor-pointer items-center justify-center transition-all relative ${
                                      isSelected
                                        ? "bg-[#1a2a2a] border-2 border-[#3a8a6f]"
                                        : "bg-[#1f2525] hover:bg-[#252b2b] border-2 border-transparent"
                                    } ${!meetsMinDeposit && amount ? "opacity-60" : ""}`}
                                    onClick={() => {
                                      if (meetsMinDeposit || !amount) {
                                        setSelectedBonus({
                                          ...bonus,
                                          calculatedAmount
                                        });
                                        setFormErrors(prev => ({ ...prev, amount: '' }));
                                      } else {
                                        setFormErrors(prev => ({ 
                                          ...prev, 
                                          amount: `Minimum deposit of ৳${bonus.minDeposit} required for ${bonus.name} bonus` 
                                        }));
                                      }
                                    }}
                                    disabled={!meetsMinDeposit && amount}
                                  >
                                    <div className="flex justify-between items-center w-full">
                                      <span className="text-sm md:text-base font-medium text-left">
                                        {bonus.name}
                                      </span>
                                      {amount && !isNaN(parseFloat(amount)) && calculatedAmount > 0 && (
                                        <span className="text-xs bg-[#2a5c45] text-white px-2 py-1 rounded">
                                          +৳{calculatedAmount.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                    {bonus.minDeposit > 0 && (
                                      <span className="text-xs text-[#e6db74] text-left w-full">
                                        Min Deposit: ৳{bonus.minDeposit}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-center py-4 border border-[#2a2f2f] rounded-lg">
                              <p className="text-sm text-[#8a9ba8]">{t.noBonusesAvailable || "No bonuses available at the moment."}</p>
                            </div>
                          )}
                        </div>

                        {/* Summary Section */}
                        <div className="mb-4 md:mb-6 p-4 bg-[#1a2a2a] rounded-lg border border-[#2a3535]">
                          <h4 className="text-sm font-medium mb-3 text-white">{t.transactionSummary || "Transaction Summary"}</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-[#8a9ba8]">{t.depositAmount || "Deposit Amount"}:</span>
                              <span className="text-white">৳{parseFloat(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </div>
                            
                            {selectedBonus && amount && !isNaN(parseFloat(amount)) && (
                              <div className="flex justify-between">
                                <span className="text-[#8a9ba8]">{t.bonus || "Bonus"} ({selectedBonus.name}):</span>
                                <span className="text-[#3a8a6f]">
                                  +৳{calculateBonusAmount(selectedBonus).toFixed(2)}
                                </span>
                              </div>
                            )}
                            
                            {selectedBonus && selectedBonus.minDeposit > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[#8a9ba8]">{t.minDepositRequired || "Min Deposit Required"}:</span>
                                <span className="text-[#e6db74]">৳{selectedBonus.minDeposit}</span>
                              </div>
                            )}
                            
                            {selectedBonus && selectedBonus.wageringRequirement > 0 && (
                              <div className="flex justify-between">
                                <span className="text-[#8a9ba8]">{t.wageringRequirement || "Wagering"}:</span>
                                <span className="text-[#e6db74]">{selectedBonus.wageringRequirement}x</span>
                              </div>
                            )}
                            
                            <div className="pt-2 border-t border-[#2a3535]">
                              <div className="flex justify-between font-medium">
                                <span className="text-white">{t.totalCredit || "Total Credit"}:</span>
                                <span className="text-[#3a8a6f]">
                                  ৳{totalWithBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <button
                            className="w-full bg-gradient-to-r from-[#2a5c45] to-[#3a6c55] hover:from-[#3a6c55] hover:to-[#4a7c65] py-3 md:py-4 rounded-lg text-sm md:text-base text-white font-medium flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
                            type="submit"
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                {t.processing || "Processing..."}
                              </>
                            ) : (
                              `${t.proceedTo || "Proceed to"} ${activeMethod.gatewayName} ${t.payment || "Payment"}`
                            )}
                          </button>
                        </div>

                        {formErrors.method && (
                          <div className="mb-4 p-3 bg-[#2a1f1f] border border-[#3a2f2f] rounded-lg">
                            <p className="text-[#ff6b6b] text-sm">
                              {formErrors.method}
                            </p>
                          </div>
                        )}
                      </form>
                    </div>
                  </>
                )}
              </div>
            )}

            {transactionStatus && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  transactionStatus.success
                    ? "bg-[#1a2525] border border-[#2a3535]"
                    : "bg-[#2a1f1f] border border-[#3a2f2f]"
                }`}
              >
                <div className="flex items-center">
                  {transactionStatus.success ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3 text-[#4ecdc4]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-3 text-[#ff6b6b]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <p className={`text-sm ${transactionStatus.success ? 'text-[#4ecdc4]' : 'text-[#ff6b6b]'}`}>
                    {transactionStatus.message}
                  </p>
                </div>
              </div>
            )}

            {activeMethod && (
              <div className="bg-[#1a1f1f] rounded-[2px] p-4 md:p-6 border border-[#2a2f2f] mb-6 md:mb-8">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 mr-2 text-[#3a8a6f]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t.howToDepositWithOraclePay || "How to deposit with OraclePay"}
                </h3>
                <ol className="text-xs md:text-sm text-[#8a9ba8] space-y-2 md:space-y-3 list-decimal list-inside">
                  <li>{t.selectPaymentMethod || "Select your preferred payment method"}</li>
                  <li>{t.enterDepositAmountInstruction || `Enter the amount you want to deposit (minimum ৳${minDepositAmount})`}</li>
                  <li>{t.selectBonusIfAvailable || "Select a bonus option if available (optional)"}</li>
                  <li>{t.clickProceedToPayment || `Click "Proceed to [Payment Method] Payment"`}</li>
                  <li>{t.redirectedToOraclePay || "You will be redirected to OraclePay secure payment page"}</li>
                  <li>{t.completePayment || "Complete the payment using your chosen method"}</li>
                  <li>{t.redirectedBack || "After successful payment, you'll be redirected back"}</li>
                  <li>{t.balanceUpdated || "Your balance will be updated automatically"}</li>
                </ol>
              </div>
            )}

            <div className="bg-[#1a1f1f] rounded-[2px] overflow-hidden border border-[#2a2f2f]">
              <div className="p-4 md:p-6 border-b border-[#2a2f2f] flex justify-between items-center">
                <h3 className="text-base md:text-lg font-semibold text-white">
                  {t.recentTransactions || "Recent Transactions"}
                </h3>
                <button 
                  onClick={() => navigate("/transactions")}
                  className="text-[#3a8a6f] text-xs md:text-sm hover:text-[#4a9a7f] transition-colors cursor-pointer"
                >
                  {t.viewAll || "View All"}
                </button>
              </div>
              <div className="p-3 md:p-4">
                {userData &&
                userData.depositHistory &&
                userData.depositHistory.length > 0 ? (
                  <div className="space-y-4">
                    {userData.depositHistory.map((transaction, index) => (
                      <div
                        key={index}
                        className="bg-[#1f2525] rounded-lg border-[1px] border-gray-500 hover:bg-[#252b2b] transition-colors overflow-hidden"
                      >
                        <div className="p-4 border-b border-[#2a2f2f]">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-2 rounded-full ${
                                  transaction.status === "completed"
                                    ? "bg-[#1a2525] text-[#4ecdc4]"
                                    : transaction.status === "pending"
                                    ? "bg-[#2a2a1f] text-[#e6db74]"
                                    : "bg-[#2a1f1f] text-[#ff6b6b]"
                                }`}
                              >
                                {transaction.status === "completed" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                ) : transaction.status === "pending" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-white capitalize">
                                    {transaction.method}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    transaction.status === "completed"
                                      ? "bg-green-900/30 text-green-400"
                                      : transaction.status === "pending"
                                      ? "bg-yellow-900/30 text-yellow-400"
                                      : "bg-red-900/30 text-red-400"
                                  }`}>
                                    {t[transaction.status] || transaction.status}
                                  </span>
                                  {transaction.isFirstDeposit && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-900/30 text-blue-400">
                                      First Deposit
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-[#8a9ba8] mt-1">
                                  {formatDate(transaction.createdAt)} • {timeAgo(transaction.createdAt)}
                                </p>
                                {transaction.transactionId && (
                                  <p className="text-xs text-[#5a6b78] mt-1">
                                    {t.transactionId || "ID"}: {transaction.transactionId}
                                  </p>
                                )}
                                {transaction.oraclePaySessionCode && (
                                  <p className="text-xs text-[#3a8a6f] mt-1">
                                    {t.session || "Session"}: {transaction.oraclePaySessionCode}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg md:text-xl font-bold text-white">
                                ৳ {transaction.amount?.toLocaleString()}
                              </div>
                              {transaction.bonusAmount > 0 && (
                                <div className="text-sm text-[#3a8a6f] font-medium mt-1">
                                  +৳{transaction.bonusAmount?.toLocaleString()} {t.bonus || "Bonus"}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {(transaction.bonusApplied || (transaction.bonusType && transaction.bonusType !== 'none')) && (
                          <div className="p-4 bg-[#1a2a2a] border-b border-[#2a3535]">
                            <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-2 text-[#3a8a6f]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {t.bonusDetails || "Bonus Details"}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                              <div className="bg-[#1f2525] p-3 rounded">
                                <p className="text-xs text-[#8a9ba8]">{t.bonusType || "Bonus Type"}</p>
                                <p className="text-sm font-medium text-white capitalize">
                                  {transaction.bonusType || t.standardBonus || 'Standard Bonus'}
                                </p>
                              </div>
                              <div className="bg-[#1f2525] p-3 rounded">
                                <p className="text-xs text-[#8a9ba8]">{t.bonusAmount || "Bonus Amount"}</p>
                                <p className="text-sm font-medium text-[#3a8a6f]">
                                  ৳{transaction.bonusAmount?.toLocaleString() || '0'}
                                </p>
                              </div>
                              {transaction.wageringRequirement > 0 && (
                                <div className="bg-[#1f2525] p-3 rounded">
                                  <p className="text-xs text-[#8a9ba8]">{t.wageringRequirement || "Wagering Requirement"}</p>
                                  <p className="text-sm font-medium text-[#e6db74]">
                                    {transaction.wageringRequirement}x
                                  </p>
                                </div>
                              )}
                            </div>
                            {transaction.bonusCode && (
                              <div className="mt-2 bg-[#1f2525] p-3 rounded">
                                <p className="text-xs text-[#8a9ba8]">{t.bonusCode || "Bonus Code"}</p>
                                <p className="text-sm font-medium text-white">
                                  {transaction.bonusCode}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-[#8a9ba8]">{t.totalCredit || "Total Credit"}</p>
                              <p className="text-lg font-bold text-[#3a8a6f]">
                                ৳{(transaction.amount + (transaction.bonusAmount || 0)).toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-[#8a9ba8]">{t.beforeBalance || "Before Balance"}</p>
                              <p className="text-sm font-medium text-white">
                                ৳{transaction.playerbalance?.toLocaleString() || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {transaction.completedAt && (
                            <div className="mt-3 pt-3 border-t border-[#2a2f2f]">
                              <p className="text-xs text-[#8a9ba8]">
                                {t.completedAt || "Completed"}: {formatDate(transaction.completedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center flex justify-center items-center flex-col py-8 md:py-12 text-[#8a9ba8]">
                    <div className="w-16 h-16 flex justify-center items-center border-2 border-[#2a2f2f] mb-4 rounded-full">
                      <FaBangladeshiTakaSign className="text-2xl text-[#5a6b78]" />
                    </div>
                    <p className="text-base md:text-lg font-medium mb-2">
                      {t.noRecentTransactions || "No Recent Transactions"}
                    </p>
                    <p className="text-sm text-[#5a6b78] max-w-md">
                      {t.depositHistoryWillAppear || "Your deposit history will appear here once you make your first deposit."}
                    </p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="mt-4 bg-[#2a5c45] hover:bg-[#3a6c55] px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {t.makeFirstDeposit || "Make Your First Deposit"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Deposit;