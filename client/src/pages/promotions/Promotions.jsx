import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import axios from "axios";
import { HiOutlineClock } from "react-icons/hi"; // Accurate thin clock icon
import { IoPlaySharp } from "react-icons/io5"; // Arrow for Read More
import { useNavigate } from "react-router-dom";

const Promotions = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const navigator = useNavigate();

  const categories = [
    "ALL", "Welcome Offer", "Slots", "Live Casino", "Sports", 
    "Fishing", "Lottery", "Table", "Arcade", "Crash", "Other"
  ];

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await axios.get(`${base_url}/api/promotions`);
        if (response.data) {
          setPromotions(response.data.data);
          setFilteredPromotions(response.data.data);
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
        promo.category === activeCategory || 
        (promo.categories && promo.categories.includes(activeCategory))
      );
      setFilteredPromotions(filtered);
    }
  }, [activeCategory, promotions]);

  return (
    <div className="h-screen overflow-hidden bg-[#121212] text-white font-sans">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto bg-[#0f0f0f] px-6">
          <div className="max-w-[1200px] mx-auto py-6">
            <h1 className="text-lg font-bold mb-5">Promotions</h1>
            
            {/* Category Filter Design - Exact Colors */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-2 text-[12px] rounded-[3px] transition-all ${
                    activeCategory === category
                      ? "bg-[#333333] text-white"
                      : "bg-[#212121] text-[#8e8e8e] hover:text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Promotions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPromotions.map((promo) => (
                <div
                  key={promo._id}
                  onClick={() => navigator(`/promotion-details/${promo._id}`)}
                  className="bg-[#1e1e1e] rounded-[4px] overflow-hidden cursor-pointer flex flex-col"
                >
                  {/* Top Image & New Badge */}
                  <div className="relative h-[180px]">
                    <img
                      src={base_url + promo.image}
                      alt={promo.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-[#fcc011] text-[#000] text-[10px] font-bold px-2 py-0.5 rounded-bl-[4px]">
                      NEW
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-4 flex flex-col gap-2">
                    {/* Tags (Grey Pills) */}
                    <div className="flex flex-wrap gap-1.5">
                      {["FDB", "Slots", "Welcome Offer"].map((tag, idx) => (
                        <span key={idx} className="bg-[#2a2a2a] text-[#8e8e8e] text-[10px] px-2 py-0.5 rounded-[2px] uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Date Row */}
                    <div className="flex items-center text-[#757575] text-[11px] mt-1">
                      <HiOutlineClock className="mr-1.5 w-3.5 h-3.5" />
                      <span>
                        {promo.startDate?.split('T')[0]?.replace(/-/g, '/')} 00:00:00 ~ 
                        {promo.endDate?.split('T')[0]?.replace(/-/g, '/')} 23:59:59
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

            {loading && <div className="text-center py-10 opacity-50 text-sm">Loading...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;