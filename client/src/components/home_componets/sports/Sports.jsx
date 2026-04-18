import React, { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from "../../../assets/logo.png";

// --- AUTH CONTEXT ---
const AuthContext = createContext();
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("usertoken");
    if (!token) { setLoading(false); return; }
    try {
      const response = await fetch(`${base_url}/api/user/my-information`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else { localStorage.removeItem("usertoken"); }
    } catch (error) { console.error("Auth check failed:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { checkAuthStatus(); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkAuthStatus }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
const useAuth = () => useContext(AuthContext);

// --- MAIN CONTENT ---
const SportsContent = () => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  
  // DRAG STATES
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const scrollRef = useRef(null);
  const popupRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch("https://api.oraclegames.live/api/cricket/live-crex")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setMatches(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    const fetchBrandingData = async () => {
      try {
        const response = await axios.get(`${base_url}/api/branding`);
        if (response.data.success && response.data.data?.logo) {
          const logoUrl = response.data.data.logo.startsWith('http') 
            ? response.data.data.logo 
            : `${base_url}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
          setDynamicLogo(logoUrl);
        }
      } catch (error) { setDynamicLogo(logo); }
    };
    fetchBrandingData();
  }, [base_url]);

  // --- MOUSE DRAG HANDLERS ---
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftState(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => {
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleAction = () => {
    if (isDragging) return;
    if (!user) {
      setShowLoginPopup(true);
    } else {
      navigate(`/game/0?provider=LUCKYSPORTS&category=Exclusive`);
    }
  };

  const scrollManual = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 200 : 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) return (
    <div className="min-h-[300px] flex items-center justify-center bg-[#0f0f0f]">
      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="py-[6px] md:py-[20px] text-white font-inter">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row bg-[#1a1a1a] rounded-[16px] md:rounded-[28px] overflow-hidden border border-white/5 relative">
        
        {/* Sidebar Notch (Desktop) */}
        <div className="hidden md:flex w-[85px] flex-col bg-[#1a1a1a] shrink-0 relative">
          <div className="h-[120px] bg-[#222222] rounded-br-[32px] flex flex-col items-center justify-center gap-1.5 border-b border-r border-white/5 relative z-20">
            <div className="w-8 h-8 border-2 border-white/10 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full shadow-inner opacity-90"></div>
            </div>
            <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Cricket</span>
          </div>
          <div className="absolute top-[120px] left-0 w-8 h-8 bg-[#222222]"></div>
          <div className="absolute top-[120px] left-0 w-full h-8 bg-[#1a1a1a] rounded-tl-[32px] z-20"></div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-5">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="px-3 md:px-6 py-1 md:py-1.5 bg-white text-black rounded-full font-bold text-[9px] md:text-[10px] uppercase cursor-pointer">All</div>
              <div onClick={handleAction} className="px-3 md:px-5 py-1 md:py-1.5 border border-white/10 text-gray-400 rounded-full font-bold text-[9px] md:text-[10px] uppercase cursor-pointer hover:text-white transition-colors">IPL</div>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 bg-[#222222] px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-white/5">
              <span className="text-[8px] md:text-[10px] font-bold text-gray-400">{today}</span>
              <Calendar size={12} className="text-gray-500 md:w-[14px] md:h-[14px]" />
            </div>
          </div>

          <div className="relative group px-3 md:px-6 pb-6 md:pb-10">
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              style={{ cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
              className="flex gap-2 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-start"
            >
              {matches.map((match, index) => (
                <div 
                  key={index} 
                  onClick={handleAction}
                  className="match-card snap-start shrink-0 bg-[#212121] rounded-[16px] md:rounded-[20px] overflow-hidden border border-white/5 flex flex-col shadow-xl hover:border-white/10 transition-all"
                >
                  <div className="bg-[#2434b5] px-2 md:px-4 py-1.5 md:py-2 flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] font-black text-white/90 uppercase truncate max-w-[70%]">{match.subtitle || "International | T20"}</span>
                    <div className="flex items-center gap-1 md:gap-1.5 bg-black/20 px-1.5 md:px-2 py-0.5 rounded-full">
                       <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse"></span>
                       <span className="text-[7px] md:text-[8px] font-black">LIVE</span>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <div className="space-y-3 md:space-y-4 mb-2 md:mb-3">
                      {[match.team1, match.team2].map((team, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="flex items-center gap-2 md:gap-3">
                            <img src={team.flag} alt="" className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-blue-900 border border-white/10 object-cover" />
                            <span className="text-[11px] md:text-[13px] font-semibold text-gray-200">{team.name}</span>
                          </div>
                          <span className="text-sm md:text-base font-semibold">{team.score || "0/0"}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[8px] md:text-[10px] text-gray-500 font-bold mb-3 md:mb-4">{match.status || "1 INN, 8.3 OV"}</p>
                    <div className="border-t border-white/5 pt-3 md:pt-4">
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="flex rounded-lg overflow-hidden h-7 md:h-9 shadow-inner bg-[#2a2a2a]">
                           <div className="flex-1 bg-[#72bbef] text-black/70 flex items-center justify-center font-black text-[9px] md:text-base">--</div>
                           <div className="flex-1 bg-[#f1a1b8] text-black/70 flex items-center justify-center font-black text-[9px] md:text-base">--</div>
                        </div>
                        <div className="flex rounded-lg overflow-hidden h-7 md:h-9 shadow-inner bg-[#2a2a2a]">
                           <div className="flex-1 bg-[#72bbef] text-black/70 flex items-center justify-center font-black text-[9px] md:text-base">--</div>
                           <div className="flex-1 bg-[#f1a1b8] text-black/70 flex items-center justify-center font-black text-[9px] md:text-base">--</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scrollManual('left')} className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/5"><ChevronLeft size={16} /></button>
            <button onClick={() => scrollManual('right')} className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-white/5"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* --- POPUP --- */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[10000] p-4" onClick={() => setShowLoginPopup(false)}>
          <div ref={popupRef} onClick={e => e.stopPropagation()} className="bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border border-[#333] rounded-lg p-5 md:p-6 max-w-md w-full relative">
            <button onClick={() => setShowLoginPopup(false)} className="absolute top-3 right-3 md:top-4 md:right-4 text-gray-400 hover:text-white"><X size={18} className="md:w-[20px] md:h-[20px]" /></button>
            <div className="flex justify-center mb-5 md:mb-6">
              <img className="h-10 md:h-12 w-auto object-contain" src={dynamicLogo} alt="Logo" onError={(e) => { e.target.src = logo; }} />
            </div>
            <p className="text-gray-300 text-center mb-5 md:mb-6 text-xs md:text-sm">Please log in to play the game. If you don't have an account, sign up for free!</p>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <button onClick={() => navigate("/register")} className="bg-theme_color hover:bg-theme_color/90 text-white font-medium py-2.5 md:py-3 rounded-md transition-colors text-sm md:text-base">Sign up</button>
              <button onClick={() => navigate("/login")} className="bg-[#333] hover:bg-[#444] text-white font-medium py-2.5 md:py-3 rounded-md transition-colors text-sm md:text-base">Log in</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (max-width: 767px) {
          .match-card {
            width: calc(90vw / 1.1);
            min-width: calc(90vw / 1.1);
            max-width: calc(90vw / 1.1);
          }
        }
        @media (min-width: 768px) {
          .match-card { width: 320px; }
        }
      `}</style>
    </div>
  );
};

const Sports = () => (
  <AuthProvider>
    <SportsContent />
  </AuthProvider>
);

export default Sports;