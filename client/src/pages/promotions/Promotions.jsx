import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import axios from "axios";
import { HiOutlineClock } from "react-icons/hi";
import { IoPlaySharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const Promotions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(["ALL"]);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigator = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get(`${base_url}/api/admin/promotionals`);
        if (response.data) {
          const promoData = Array.isArray(response.data) ? response.data : response.data.data || [];
          setPromotions(promoData);
          setFilteredPromotions(promoData);
          
          // Extract unique categories from promotions
          const uniqueCategories = [...new Set(promoData.map(promo => promo.category).filter(Boolean))];
          setCategories(["ALL", ...uniqueCategories]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [base_url]);

  useEffect(() => {
    if (activeCategory === "ALL") {
      setFilteredPromotions(promotions);
    } else {
      const filtered = promotions.filter(promo => 
        promo.category === activeCategory
      );
      setFilteredPromotions(filtered);
    }
  }, [activeCategory, promotions]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // Get category display name
  const getCategoryDisplayName = (category) => {
    const names = {
      'sports': 'Sports',
      'live-casino': 'Live Casino',
      'slots': 'Slots',
      'jackpot': 'Jackpot',
      'tournament': 'Tournament',
      'bonus': 'Bonus',
      'reload-bonus': 'Reload Bonus',
      'cashback': 'Cashback',
      'free-bet': 'Free Bet',
      'referral': 'Referral',
      'vip': 'VIP',
      'cricket': 'Cricket',
      'football': 'Football',
      'tennis': 'Tennis',
      'esports': 'Esports',
      'sale': 'Sale',
      'discount': 'Discount',
      'event': 'Event',
      'announcement': 'Announcement',
      'featured': 'Featured',
      'holiday': 'Holiday',
      'clearance': 'Clearance',
      'new-arrival': 'New Arrival'
    };
    return names[category] || category?.toUpperCase() || 'Other';
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white font-sans">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto px-6">
          <div className="mx-auto py-6">
            <h1 className="text-lg font-bold mb-5">Promotions</h1>
            
            {/* Category Filter - Dynamic from API */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-2 text-[13px] md:text-[14px] font-[500] cursor-pointer rounded-[3px] transition-all ${
                    activeCategory === category
                      ? "bg-[#333333] text-white"
                      : "bg-[#212121] text-[#8e8e8e] hover:text-white"
                  }`}
                >
                  {category === "ALL" ? "ALL" : getCategoryDisplayName(category)}
                </button>
              ))}
            </div>

            {/* Promotions Grid */}
            {filteredPromotions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPromotions.map((promo) => (
                  <div
                    key={promo._id}
                    onClick={() => navigator(`/promotion-details/${promo._id}`)}
                    className="bg-[#1e1e1e] rounded-[4px] overflow-hidden cursor-pointer flex flex-col hover:scale-[1.02] transition-transform duration-200"
                  >
                    {/* Top Image & New Badge */}
                    <div className="relative h-[180px]">
                      <img
                        src={base_url + promo.image}
                        alt={promo.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x180?text=No+Image';
                        }}
                      />
                      <div className="absolute top-0 right-0 bg-[#fcc011] text-[#000] text-[10px] font-bold px-2 py-0.5 rounded-bl-[4px]">
                        NEW
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-4 flex flex-col gap-2">
                      {/* Category Tag */}
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-[#2a2a2a] text-[#18bd8d] text-[10px] px-2 py-0.5 rounded-[2px] uppercase">
                          {getCategoryDisplayName(promo.category)}
                        </span>
                      </div>

                      {/* Date Row */}
                      <div className="flex items-center text-[#757575] text-[11px] mt-1">
                        <HiOutlineClock className="mr-1.5 w-3.5 h-3.5" />
                        <span>
                          {formatDate(promo.startDate)} 00:00:00 ~ {formatDate(promo.endDate)} 23:59:59
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-[15px] font-bold text-[#fefefe] leading-tight line-clamp-1 mt-0.5">
                        {promo.title}
                      </h3>

                      {/* Read More Link */}
                      <div className="mt-1 flex items-center text-[#18bd8d] text-[12px] font-semibold">
                        Read more 
                        <IoPlaySharp className="ml-1 w-2 h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 opacity-50 text-sm">
                {loading ? "Loading..." : "No promotions found"}
              </div>
            )}

            {loading && <div className="text-center py-10 opacity-50 text-sm">Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;