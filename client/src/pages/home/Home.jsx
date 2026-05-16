import React, { useState, useEffect, createContext, useContext } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import { Slider } from "../../components/home_componets/Slider";
import Footer from "../../components/footer/Footer";
import { AiOutlineSound } from "react-icons/ai";
import Category from "../../components/home_componets/category/Categroy";
import ProviderSlider from "../../components/home_componets/provider/ProviderSlider";
import Event from "../../components/home_componets/event/Event";
import Featured from "../../components/home_componets/featured/Featured";
import logo from "../../assets/logo.png";
import axios from 'axios';
import { Mobileslider } from "../../components/home_componets/Mobileslider";
import Sports from "../../components/home_componets/sports/Sports";

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
const useAuth = () => {
  return useContext(AuthContext);
};

// Cache for user data to prevent unnecessary API calls
let userCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    if (userCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setUser(userCache);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        userCache = data.data;
        cacheTimestamp = Date.now();
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
        userCache = null;
        cacheTimestamp = null;
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      userCache = null;
      cacheTimestamp = null;
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    userCache = userData;
    cacheTimestamp = Date.now();
    setUser(userData);
  };

  const value = {
    user,
    login,
    checkAuthStatus,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const HomeContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const [notice, setNotice] = useState("");
  
  // State for sidebar category activation - THIS IS THE KEY STATE
  const [activeCategory, setActiveCategory] = useState(null);
  
  // State for providers and exclusive games
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);

  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Cache for branding data
  const [brandingCache, setBrandingCache] = useState(null);

  // Function to fetch providers
  const fetchProviders = async (categoryName) => {
    try {
      const response = await axios.get(`${base_url}/api/providers/${categoryName}`);
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]);
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    }
  };

  // Function to handle category click from Sidebar
  const handleCategorySelect = async (category) => {
    console.log("Category selected:", category);
    
    // Set the active category - this will highlight it in both sidebar and header
    setActiveCategory(category.name);
    
    // Fetch providers for this category
    if (category.name?.toLowerCase() !== "exclusive") {
      await fetchProviders(category.name);
    }
  };

  // Function to handle expanding sidebar and activating category (when clicked from collapsed state)
  const handleExpandAndActivate = async (category) => {
    // 1. Open the full sidebar
    setSidebarOpen(true);
    
    // 2. Set the active category - this highlights in both sidebar and header
    setActiveCategory(category.name);
    
    // 3. Fetch providers for the category
    if (category.name?.toLowerCase() !== "exclusive") {
      await fetchProviders(category.name);
    }
  };

  // Fetch branding data for dynamic logo
  const fetchBrandingData = async () => {
    if (brandingCache) {
      setDynamicLogo(brandingCache);
      return;
    }

    const cachedBranding = localStorage.getItem('branding_logo');
    const cacheTime = localStorage.getItem('branding_cache_time');
    
    if (cachedBranding && cacheTime && Date.now() - parseInt(cacheTime) < 30 * 60 * 1000) {
      setDynamicLogo(cachedBranding);
      setBrandingCache(cachedBranding);
      return;
    }

    try {
      const response = await axios.get(`${base_url}/api/branding`);
      if (response.data.success && response.data.data && response.data.data.logo) {
        const logoUrl = response.data.data.logo.startsWith('http') 
          ? response.data.data.logo 
          : `${base_url}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        
        setDynamicLogo(logoUrl);
        setBrandingCache(logoUrl);
        localStorage.setItem('branding_logo', logoUrl);
        localStorage.setItem('branding_cache_time', Date.now().toString());
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
    }
  };

  // Fetch notice from API
  const fetchNotice = async () => {
    try {
      const response = await axios.get(`${base_url}/api/notice`);
      
      if (response.data.success) {
        if (response.data.data && response.data.data.title) {
          setNotice(response.data.data.title);
          localStorage.setItem('notice_data', JSON.stringify({
            title: response.data.data.title,
            timestamp: Date.now()
          }));
        } else {
          setNotice("Welcome to Our Platform - Deposit Now and Get Exciting Bonuses!");
          localStorage.setItem('notice_data', JSON.stringify({
            title: "Welcome to Our Platform - Deposit Now and Get Exciting Bonuses!",
            timestamp: Date.now()
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching notice:", error);
      
      const cachedNotice = localStorage.getItem('notice_data');
      if (cachedNotice) {
        const parsedNotice = JSON.parse(cachedNotice);
        if (Date.now() - parsedNotice.timestamp < 60 * 60 * 1000) {
          setNotice(parsedNotice.title);
        } else {
          setNotice("Welcome to Our Platform - Deposit Now and Get Exciting Bonuses!");
        }
      } else {
        setNotice("Welcome to Our Platform - Deposit Now and Get Exciting Bonuses!");
      }
    }
  };

  // Use useEffect to handle loading state
  useEffect(() => {
    let mounted = true;

    const isInitialLoad = performance.navigation.type === performance.navigation.TYPE_NAVIGATE ||
                         performance.navigation.type === performance.navigation.TYPE_RELOAD;

    if (isInitialLoad) {
      setIsLoading(true);
    }

    fetchBrandingData();
    fetchNotice();

    const handleLoad = () => {
      if (mounted) {
        setIsLoading(false);
      }
    };

    if (document.readyState === "complete") {
      if (mounted) {
        setIsLoading(false);
      }
    } else {
      window.addEventListener("load", handleLoad);

      const fallbackTimer = setTimeout(() => {
        if (mounted) {
          setIsLoading(false);
        }
      }, 3000);

      return () => {
        mounted = false;
        window.removeEventListener("load", handleLoad);
        clearTimeout(fallbackTimer);
      };
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Reset active category when sidebar closes (optional)
  useEffect(() => {
    if (!sidebarOpen) {
      // You can choose to keep the active category or clear it
      // setActiveCategory(null);
    }
  }, [sidebarOpen]);

  return (
    <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute z-[10000] inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-30">
          {/* Main loader container */}
          <div className="relative flex flex-col items-center justify-center">
        
            {/* Loading text */}
            <div className="flex justify-center items-center text-center mt-8 space-y-2">
              <img className="w-[150px]" src={logo} alt="" />
            </div>
    
            {/* Progress bar */}
            <div className="w-64 h-1.5 bg-gray-700 rounded-full mt-6 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header - Pass active category */}
      <Header 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
        activeCategory={activeCategory}
        onExpandAndActivate={handleExpandAndActivate}
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar - Pass active category and handlers */}
<Sidebar
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen} 
  onCategorySelect={handleCategorySelect}
  onExpandAndActivate={handleExpandAndActivate}
  activeCategory={activeCategory}
/>
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto transition-all duration-300">
          <div className="">
            <div className="md:hidden">
              <Mobileslider/>
            </div>
            <div className="md:block hidden">
              <Slider />
            </div>
            <main className="mx-auto w-full max-w-screen-xl px-2 md:px-4 md:py-4">
              {/* Notice Section */}
              <div className="p-2 md:p-4 text-black border-[1px] border-blue-400 rounded-[5px] md:rounded-[10px] flex items-center justify-between">
                <AiOutlineSound className="text-xl text-theme_color mr-2" />
                <marquee
                  behavior="scroll"
                  scrollamount="10"
                  direction="left"
                  className="text-[12px] md:text-[14px] text-white flex-1 font-[400]"
                >
                  {notice || "Welcome to Our Platform - Deposit Now and Get Exciting Bonuses!"}
                </marquee>
              </div>

              {/* Exclusive Categories Section */}
              <Category />

              {/* Providers Section */}
              <ProviderSlider />

              {/* Events Section */}
              <Event />
              
              {/* Sports Section */}
              <Sports/>
              
              {/* Featured Games Section */}
              <Featured />
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  );
};

export default Home;