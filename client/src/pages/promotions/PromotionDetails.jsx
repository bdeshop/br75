import React, { useState, useEffect } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import axios from "axios";
import { FaCircle, FaCalendarAlt, FaClock, FaExternalLinkAlt, FaChevronLeft } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const PromotionDetails = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [promotion, setPromotion] = useState(null);
  const [error, setError] = useState(null);
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Helper function to format date with time (shorter for mobile)
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get promotion status text and color
  const getPromotionStatus = () => {
    if (!promotion) return { text: "Inactive", color: "text-red-500", bgColor: "bg-red-500/10" };
    if (!promotion.status) return { text: "Inactive", color: "text-red-500", bgColor: "bg-red-500/10" };
    if (promotion.endDate && new Date(promotion.endDate) < new Date()) return { text: "Expired", color: "text-orange-500", bgColor: "bg-orange-500/10" };
    return { text: "Active", color: "text-green-500", bgColor: "bg-green-500/10" };
  };

  useEffect(() => {
    const fetchPromotionDetails = async () => {
      try {
        const response = await axios.get(`${base_url}/api/promotions/${id}`);
        console.log(response);
        if (response.data && response.data.success) {
          setPromotion(response.data.data);
        } else {
          setError(response.data.message || "Failed to fetch promotion details");
        }
      } catch (err) {
        console.error("Failed to fetch promotion details:", err);
        setError("Failed to fetch promotion details.");
      }
    };

    if (id) {
      fetchPromotionDetails();
    }
  }, [base_url, id]);

  const status = getPromotionStatus();

  if (error || !promotion) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-bold text-red-400 mb-3">Promotion Not Found</h2>
              <p className="text-xs sm:text-sm text-gray-400 mb-4">{error || "The promotion you're looking for doesn't exist."}</p>
              <button
                onClick={() => navigate('/promotions')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 sm:px-5 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                Back to Promotions
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto transition-all duration-300">
          <div className="max-w-4xl mx-auto py-4 sm:py-6 md:py-8 px-3 sm:px-4">
            {/* Back Button */}
            <button
              onClick={() => navigate('/promotions')}
              className="mb-4 sm:mb-6 flex items-center gap-1.5 sm:gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <FaChevronLeft className="text-xs sm:text-sm" />
              <span className="text-xs sm:text-sm">Back to Promotions</span>
            </button>

            {/* Hero Image */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden mb-5 sm:mb-8">
              <img
                src={base_url + promotion.image}
                alt={promotion.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent"></div>
              
              {/* Status Badge */}
              <div className={`absolute bottom-3 left-3 sm:bottom-4 sm:left-4 ${status.bgColor} backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 sm:gap-2`}>
                <FaCircle className={`h-1.5 w-1.5 sm:h-2 sm:w-2 ${status.color}`} />
                <span className={`text-xs sm:text-sm font-medium ${status.color}`}>
                  {status.text}
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-medium text-white leading-tight">
                {promotion.title}
              </h1>

              {/* Date Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-[#0f0f1a] rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <FaCalendarAlt className="text-blue-400 text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">Start Date</p>
                    <p className="text-xs sm:text-sm font-medium text-white truncate">{formatDateTime(promotion.startDate)}</p>
                  </div>
                </div>
                {promotion.endDate && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <FaClock className="text-orange-400 text-xs sm:text-sm" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-xs text-gray-500">End Date</p>
                      <p className="text-xs sm:text-sm font-medium text-white truncate">{formatDateTime(promotion.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description with Rich Text Support */}
              <div className="bg-[#0f0f1a] rounded-xl p-4 sm:p-6">
                <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white mb-3 sm:mb-4">Description</h2>
                <div 
                  className="prose prose-invert max-w-none text-gray-300 prose-sm sm:prose-base"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(promotion.description, {
                      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'strike', 'ul', 'ol', 'li', 'a', 'img', 'div', 'span', 'blockquote', 'code', 'pre', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
                      ALLOWED_ATTR: ['href', 'target', 'src', 'alt', 'width', 'height', 'class', 'style', 'rel', 'title']
                    })
                  }}
                />
              </div>

              {/* Terms and Conditions */}
              <div className="p-3 sm:p-4 bg-[#0f0f1a] rounded-xl">
                <h4 className="text-xs sm:text-sm font-semibold text-gray-400 mb-1.5 sm:mb-2">Terms & Conditions Apply</h4>
                <p className="text-[10px] sm:text-xs text-gray-500">
                  Please read the terms and conditions carefully before participating in this promotion.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for rich text styling - responsive */}
      <style jsx>{`
        .prose {
          line-height: 1.5;
          font-size: 0.875rem;
        }
        
        @media (min-width: 640px) {
          .prose {
            font-size: 1rem;
            line-height: 1.6;
          }
        }
        
        .prose h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.5em 0;
          color: white;
        }
        
        @media (min-width: 640px) {
          .prose h1 {
            font-size: 2rem;
            margin: 0.67em 0;
          }
        }
        
        .prose h2 {
          font-size: 1.25rem;
          font-weight: bold;
          margin: 0.6em 0;
          color: white;
        }
        
        @media (min-width: 640px) {
          .prose h2 {
            font-size: 1.5rem;
            margin: 0.83em 0;
          }
        }
        
        .prose h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin: 0.8em 0;
          color: white;
        }
        
        @media (min-width: 640px) {
          .prose h3 {
            font-size: 1.17rem;
            margin: 1em 0;
          }
        }
        
        .prose p {
          margin: 0.75em 0;
        }
        
        @media (min-width: 640px) {
          .prose p {
            margin: 1em 0;
          }
        }
        
        .prose ul, .prose ol {
          margin: 0.75em 0;
          padding-left: 1.5em;
        }
        
        @media (min-width: 640px) {
          .prose ul, .prose ol {
            margin: 1em 0;
            padding-left: 2em;
          }
        }
        
        .prose li {
          margin: 0.25em 0;
        }
        
        @media (min-width: 640px) {
          .prose li {
            margin: 0.5em 0;
          }
        }
        
        .prose a {
          color: #60a5fa;
          text-decoration: underline;
          font-size: inherit;
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
          margin: 0.75em 0;
        }
        
        @media (min-width: 640px) {
          .prose img {
            margin: 1em 0;
          }
        }
        
        .prose blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 0.75em;
          margin: 0.75em 0;
          color: #9ca3af;
          font-style: italic;
          font-size: 0.875rem;
        }
        
        @media (min-width: 640px) {
          .prose blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1em;
            margin: 1em 0;
            font-size: 1rem;
          }
        }
        
        .prose code {
          background-color: #1f2937;
          padding: 0.125em 0.25em;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.8em;
        }
        
        @media (min-width: 640px) {
          .prose code {
            padding: 0.2em 0.4em;
            font-size: 0.9em;
          }
        }
        
        .prose pre {
          background-color: #1f2937;
          padding: 0.75em;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.75em 0;
          font-size: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .prose pre {
            padding: 1em;
            margin: 1em 0;
            font-size: 0.875rem;
          }
        }
        
        .prose pre code {
          background: none;
          padding: 0;
        }
        
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75em 0;
          font-size: 0.75rem;
        }
        
        @media (min-width: 640px) {
          .prose table {
            margin: 1em 0;
            font-size: 0.875rem;
          }
        }
        
        .prose th, .prose td {
          border: 1px solid #374151;
          padding: 0.375em;
          text-align: left;
        }
        
        @media (min-width: 640px) {
          .prose th, .prose td {
            padding: 0.5em;
          }
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