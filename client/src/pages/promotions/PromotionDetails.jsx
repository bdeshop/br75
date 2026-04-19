import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import axios from "axios";
import { FaRegEdit, FaTrashAlt, FaCircle, FaCalendarAlt, FaClock, FaTag, FaExternalLinkAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const PromotionDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  // Categories from the image
  const categories = [
    "ALL",
    "Welcome Offer",
    "Slots",
    "Casino",
    "Sports",
    "Fishing",
    "Card",
    "E-sports",
    "Lottery",
    "P2P",
    "Table",
    "Others",
    "Arcade",
    "Crcs"
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to strip HTML tags for preview
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    const plainText = stripHtmlTags(text);
    if (plainText.length <= maxLength) return plainText;
    return plainText.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/promotions`);
        console.log(response);
        if (response.data && response.data.success) {
          setPromotions(response.data.data);
          setFilteredPromotions(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch promotions");
        }
      } catch (err) {
        console.error("Failed to fetch promotions:", err);
        setError("Failed to fetch promotions.");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [base_url]);

  // Filter promotions based on active category
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

  const openModal = (promotion) => {
    setSelectedPromotion(promotion);
    setShowModal(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPromotion(null);
    document.body.style.overflow = "auto";
  };

  // Check if promotion is active
  const isPromotionActive = (promotion) => {
    if (!promotion.status) return false;
    if (promotion.endDate && new Date(promotion.endDate) < new Date()) return false;
    return true;
  };

  // Get promotion status text and color
  const getPromotionStatus = (promotion) => {
    if (!promotion.status) return { text: "Inactive", color: "text-red-500", bgColor: "bg-red-500/10" };
    if (promotion.endDate && new Date(promotion.endDate) < new Date()) return { text: "Expired", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    return { text: "Active", color: "text-green-500", bgColor: "bg-green-500/10" };
  };

  return (
    <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content Area */}
        <div className={`flex-1 overflow-auto transition-all duration-300 px-4`}>
          <div className="max-w-7xl mx-auto py-8">
            {/* Header Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                Promotions & Offers
              </h1>
              <p className="text-gray-400 text-sm">
                Discover our exciting promotions and special offers
              </p>
            </div>

            {/* Category Tabs */}
            <div className="mb-6 overflow-x-auto">
              <div className="flex space-x-2 min-w-max pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`px-4 py-2 text-sm md:text-base rounded-lg whitespace-nowrap transition-all duration-300 ${
                      activeCategory === category
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]"
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-6 border-gray-700" />

            {/* Main content grid for promotions */}
            <div className="min-h-[calc(100vh-300px)]">
              {loading && (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {error && (
                <div className="text-center text-red-500 text-base py-10">
                  Error: {error}
                </div>
              )}
              
              {!loading && !error && filteredPromotions.length === 0 && (
                <div className="text-center text-gray-400 text-base py-10">
                  No promotions found in this category.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredPromotions.map((promo) => {
                  const status = getPromotionStatus(promo);
                  return (
                    <div
                      key={promo._id}
                      className="relative bg-[#1a1a2e] rounded-xl overflow-hidden flex flex-col transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer group"
                      onClick={() => openModal(promo)}
                    >
                      {/* Status Badge */}
                      <div className={`absolute top-3 right-3 z-10 ${status.bgColor} backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1`}>
                        <FaCircle className={`h-2 w-2 ${status.color}`} />
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      {/* Image Container */}
                      <div className="relative overflow-hidden">
                        <img
                          src={base_url + promo.image}
                          alt={promo.title}
                          className="w-full h-48 sm:h-52 md:h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent opacity-60"></div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-1 text-white">
                          {promo.title}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm mb-3 line-clamp-2">
                          {truncateText(promo.description, 100)}
                        </p>
                        
                        {/* Date Range */}
                        <div className="space-y-1 mb-3">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <FaCalendarAlt className="text-blue-400" />
                            <span>Start: {formatDate(promo.startDate)}</span>
                          </div>
                          {promo.endDate && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <FaClock className="text-orange-400" />
                              <span>End: {formatDate(promo.endDate)}</span>
                            </div>
                          )}
                        </div>

                        {/* Read More Button */}
                        <button className="mt-auto text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more
                          <FaChevronRight className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Details Modal */}
      {showModal && selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative bg-[#1a1a2e] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[90vh]">
              {/* Hero Image */}
              <div className="relative h-64 md:h-96">
                <img
                  src={base_url + selectedPromotion.image}
                  alt={selectedPromotion.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent"></div>
                
                {/* Status Badge in Modal */}
                <div className={`absolute bottom-4 left-4 ${getPromotionStatus(selectedPromotion).bgColor} backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2`}>
                  <FaCircle className={`h-2 w-2 ${getPromotionStatus(selectedPromotion).color}`} />
                  <span className={`text-sm font-medium ${getPromotionStatus(selectedPromotion).color}`}>
                    {getPromotionStatus(selectedPromotion).text}
                  </span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {selectedPromotion.title}
                </h2>

                {/* Target URL Button */}
                {selectedPromotion.targetUrl && (
                  <a
                    href={selectedPromotion.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all mb-6"
                  >
                    Claim Offer <FaExternalLinkAlt className="text-sm" />
                  </a>
                )}

                {/* Date Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-[#0f0f1a] rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <FaCalendarAlt className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Start Date</p>
                      <p className="text-sm font-medium text-white">{formatDateTime(selectedPromotion.startDate)}</p>
                    </div>
                  </div>
                  {selectedPromotion.endDate && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <FaClock className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-sm font-medium text-white">{formatDateTime(selectedPromotion.endDate)}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description with Rich Text Support */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <div 
                    className="prose prose-invert max-w-none text-gray-300"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(selectedPromotion.description, {
                        ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                        ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'width', 'height', 'class', 'style', 'rel', 'title']
                      })
                    }}
                  />
                </div>

                {/* Terms and Conditions Placeholder */}
                <div className="mt-8 p-4 bg-[#0f0f1a] rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Terms & Conditions Apply</h4>
                  <p className="text-xs text-gray-500">
                    Please read the terms and conditions carefully before participating in this promotion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom CSS for animations and rich text styling */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        /* Rich text content styling */
        .prose {
          line-height: 1.6;
        }
        
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
          color: white;
        }
        
        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.83em 0;
          color: white;
        }
        
        .prose h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 1em 0;
          color: white;
        }
        
        .prose p {
          margin: 1em 0;
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        
        .prose li {
          margin: 0.5em 0;
        }
        
        .prose a {
          color: #60a5fa;
          text-decoration: underline;
        }
        
        .prose a:hover {
          color: #93c5fd;
        }
        
        .prose strong, .prose b {
          font-weight: bold;
          color: white;
        }
        
        .prose em, .prose i {
          font-style: italic;
        }
        
        .prose img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1em 0;
        }
        
        .prose blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 1em;
          margin: 1em 0;
          color: #9ca3af;
          font-style: italic;
        }
        
        .prose code {
          background-color: #1f2937;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.9em;
        }
        
        .prose pre {
          background-color: #1f2937;
          padding: 1em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .prose pre code {
          background: none;
          padding: 0;
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
        }
        
        .prose th, .prose td {
          border: 1px solid #374151;
          padding: 0.5em;
          text-align: left;
        }
        
        .prose th {
          background-color: #1f2937;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
};

export default PromotionDetails;