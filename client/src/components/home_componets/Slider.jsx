import React, { useState, useEffect, memo } from "react";
import axios from "axios";

// Simple cache to store computer banners
let computerBannerCache = [];

// Modal Component for Rich Text Display
const RichTextModal = ({ isOpen, onClose, banner }) => {
  if (!isOpen || !banner) return null;

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-sm transition-all duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-[#161C2F] rounded-[2px] max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl animate-modal-slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all duration-200 hover:scale-110"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Modal Content */}
        <div className="">
          {/* Banner Image */}
          <div className="mb-6 overflow-hidden shadow-lg">
            <img
              src={banner.fullImageUrl}
              alt={banner.alt}
              className="w-full min-h-[200px] "
            />
          </div>

          {/* Banner Title */}
          {banner.name && (
            <div className="mb-4 text-center">
              <h2 className="text-2xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {banner.name}
              </h2>
            </div>
          )}

          {/* Rich Text Content */}
          {banner.richText && (
            <div className="mt-6 p-6 ">
              <div
                className="w-full text-left"
                dangerouslySetInnerHTML={{ __html: banner.richText }}
                style={{
                  color: banner.richTextConfig?.textColor || '#ffffff',
                }}
              />
            </div>
          )}

          {/* Link Button if exists */}
          {banner.link && (
            <div className="mt-6 text-center">
              <a
                href={banner.link}
                target={banner.linkTarget || '_blank'}
                rel="noopener noreferrer"
                className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Learn More
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Slider = memo(() => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(computerBannerCache);
  const [loading, setLoading] = useState(!computerBannerCache.length);
  const [error, setError] = useState(null);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch computer banners from API
  useEffect(() => {
    if (computerBannerCache.length > 0) {
      setSlides(computerBannerCache);
      setLoading(false);
      return;
    }

    const fetchComputerBanners = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${base_url}/api/banners/computer`);

        if (response.data.success) {
          const bannerData = response.data.data.map((banner) => ({
            id: banner._id,
            src: banner.image,
            alt: banner.name || "Banner",
            deviceCategory: banner.deviceCategory,
            name: banner.name,
            richText: banner.richText,
            richTextPosition: banner.richTextPosition,
            richTextAlignment: banner.richTextAlignment,
            richTextConfig: banner.richTextConfig,
            link: banner.link,
            linkTarget: banner.linkTarget,
            fullImageUrl: banner.image.startsWith('http') 
              ? banner.image 
              : `${base_url}/${banner.image}`
          }));

          computerBannerCache = bannerData;
          setSlides(bannerData);
        } else {
          setError("Failed to fetch computer banners");
        }
      } catch (err) {
        console.error("Error fetching computer banners:", err);
        setError("Error loading computer banners");

        const fallbackSlides = [
          {
            id: 1,
            src: "https://img.b112j.com/upload/announcement/image_241602.jpg",
            alt: "Computer Banner 1",
            deviceCategory: "computer",
            name: "Welcome to BIR75",
            richText: "<h1><strong>Welcome to BIR75!</strong></h1><p>India's Most Trusted Betting Platform</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_241602.jpg"
          },
          {
            id: 2,
            src: "https://img.b112j.com/upload/announcement/image_241701.jpg",
            alt: "Computer Banner 2",
            deviceCategory: "computer",
            name: "Special Offer",
            richText: "<h2>Get 100% Welcome Bonus</h2><p>Up to ₹25,000</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_241701.jpg"
          },
          {
            id: 3,
            src: "https://img.b112j.com/upload/announcement/image_242355.jpg",
            alt: "Computer Banner 3",
            deviceCategory: "computer",
            name: "Live Betting",
            richText: "<h2>Live Cricket Betting</h2><p>Bet on IPL 2024</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_242355.jpg"
          },
        ];
        computerBannerCache = fallbackSlides;
        setSlides(fallbackSlides);
      } finally {
        setLoading(false);
      }
    };

    fetchComputerBanners();
  }, [base_url]);

  const handleBannerClick = (banner) => {
    // Only open modal if banner has rich text content
    if (banner.richText) {
      setSelectedBanner(banner);
      setIsModalOpen(true);
    } else if (banner.link) {
      // If no rich text but has link, navigate to link
      window.open(banner.link, banner.linkTarget || '_blank');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    if (slides.length === 0) return;
    setCurrentSlide(index);
  };

  // Auto slide every 5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[180px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden">
        <div className="w-full h-full bg-gray-200 animate-pulse">
          <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer"></div>
        </div>
      </div>
    );
  }

  if (error && slides.length === 0) {
    return (
      <div className="relative w-full h-[180px] md:h-[400px] lg:h-[500px] xl:h-[600px] flex items-center justify-center bg-gray-200">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative w-full h-[180px] md:h-[400px] lg:h-[500px] xl:h-[600px] flex items-center justify-center bg-gray-200">
        <div className="text-gray-500">No computer banners available</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full overflow-hidden">
        {/* Slides container */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div 
              key={slide.id} 
              className="w-full flex-shrink-0 relative group cursor-pointer"
              onClick={() => handleBannerClick(slide)}
            >
              <img
                src={slide.src.startsWith('http') ? slide.src : `${base_url}/${slide.src}`}
                alt={slide.alt}
                className="w-full h-auto object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Navigation arrows - only show if multiple slides */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 md:left-8 lg:left-20 top-1/2 md:flex hidden cursor-pointer -translate-y-1/2 bg-[#303232] hover:bg-[#303232]/50 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 z-10"
              aria-label="Previous slide"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 md:right-8 lg:right-20 top-1/2 md:flex hidden cursor-pointer -translate-y-1/2 bg-[#303232] hover:bg-[#303232]/50 text-white p-2 rounded-full transition-all duration-300 hover:scale-110 z-10"
              aria-label="Next slide"
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}

        {/* Indicators - only show if multiple slides */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer duration-300 ${
                  index === currentSlide
                    ? "bg-theme_color w-6"
                    : "bg-theme_gray/80 hover:bg-theme_gray"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Rich Text Modal */}
      <RichTextModal
        isOpen={isModalOpen}
        onClose={closeModal}
        banner={selectedBanner}
      />

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-slide-in {
          animation: modalSlideIn 0.3s ease-out;
        }
        
        .rich-text-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }
        
        .rich-text-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.75rem;
        }
        
        .rich-text-content h3 {
          font-size: 1.25rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        
        .rich-text-content p {
          margin-bottom: 0.75rem;
          line-height: 1.6;
        }
        
        .rich-text-content ul, .rich-text-content ol {
          margin-left: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .rich-text-content li {
          margin-bottom: 0.25rem;
        }
        
        .rich-text-content strong {
          font-weight: bold;
          color: #FFD700;
        }
        
        .rich-text-content a {
          color: #60A5FA;
          text-decoration: underline;
        }
        
        .rich-text-preview {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </>
  );
});

// Optional: Clear cache when needed (e.g., on logout or data refresh)
export const clearComputerBannerCache = () => {
  computerBannerCache = [];
};