import React, { useState, useEffect, useRef, memo, useCallback } from "react";
import axios from "axios";

let mobileBannerCache = [];

// Modal Component for Rich Text Display (reused from computer version)
const RichTextModal = ({ isOpen, onClose, banner }) => {
  if (!isOpen || !banner) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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

        <div className="">
          <div className="mb-6 overflow-hidden shadow-lg">
            <img
              src={banner.fullImageUrl}
              alt={banner.alt}
              className="w-full h-auto max-h-[400px] object-contain bg-[#0F111A]"
            />
          </div>

          {banner.name && (
            <div className="mb-4 text-center">
              <h2 className="text-2xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                {banner.name}
              </h2>
            </div>
          )}

          {banner.richText && (
            <div className="mt-6 p-6">
              <div
                className="w-full text-left"
                dangerouslySetInnerHTML={{ __html: banner.richText }}
                style={{
                  color: banner.richTextConfig?.textColor || '#ffffff',
                }}
              />
            </div>
          )}

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

export const Mobileslider = memo(() => {
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const [slides, setSlides] = useState(mobileBannerCache);
  const [loading, setLoading] = useState(!mobileBannerCache.length);
  const [error, setError] = useState(null);
  
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Modal states
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Data Fetching - Mobile banners with rich text support
  useEffect(() => {
    if (mobileBannerCache.length > 0) {
      setSlides(mobileBannerCache);
      setLoading(false);
      return;
    }

    const fetchMobileBanners = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${base_url}/api/banners/mobile`);
        
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
          
          mobileBannerCache = bannerData;
          setSlides(bannerData);
        } else {
          setError("Failed to fetch mobile banners");
        }
      } catch (err) {
        console.error("Error fetching mobile banners:", err);
        setError("Error loading mobile banners");
        
        // Fallback banners for mobile with rich text examples
        const fallback = [
          { 
            id: 1, 
            src: "https://img.b112j.com/upload/announcement/image_241602.jpg", 
            alt: "Mobile Banner 1",
            deviceCategory: "mobile",
            name: "Welcome to BIR75",
            richText: "<h1><strong>Welcome to BIR75!</strong></h1><p>India's Most Trusted Betting Platform on Mobile</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_241602.jpg"
          },
          { 
            id: 2, 
            src: "https://img.b112j.com/upload/announcement/image_241701.jpg", 
            alt: "Mobile Banner 2",
            deviceCategory: "mobile",
            name: "Special Mobile Offer",
            richText: "<h2>Get 150% Welcome Bonus</h2><p>Up to ₹35,000 for Mobile Users</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_241701.jpg"
          },
          { 
            id: 3, 
            src: "https://img.b112j.com/upload/announcement/image_242355.jpg", 
            alt: "Mobile Banner 3",
            deviceCategory: "mobile",
            name: "Live Betting on Mobile",
            richText: "<h2>Live Cricket Betting</h2><p>Bet on IPL 2024 from Your Phone</p>",
            richTextAlignment: "center",
            fullImageUrl: "https://img.b112j.com/upload/announcement/image_242355.jpg"
          },
        ];
        mobileBannerCache = fallback;
        setSlides(fallback);
      } finally {
        setLoading(false);
      }
    };
    fetchMobileBanners();
  }, [base_url]);

  // Handle banner click
  const handleBannerClick = (banner) => {
    if (banner.richText) {
      setSelectedBanner(banner);
      setIsModalOpen(true);
    } else if (banner.link) {
      window.open(banner.link, banner.linkTarget || '_blank');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBanner(null);
  };

  // 2. Prepare slides with clones for infinite loop
  const hasSlides = slides.length > 0;
  const extendedSlides = hasSlides 
    ? [slides[slides.length - 1], ...slides, slides[0]] 
    : [];

  // 3. Navigation Handlers
  const handleNext = useCallback(() => {
    if (!isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
  }, [isTransitioning, slides.length]);

  const handlePrev = useCallback(() => {
    if (!isTransitioning || slides.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
  }, [isTransitioning, slides.length]);

  // 4. Mouse & Touch Event Handlers
  const onDragStart = (e) => {
    if (slides.length <= 1) return;
    setIsDragging(true);
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const onDragMove = (e) => {
    if (!isDragging || slides.length <= 1) return;
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const currentDrag = clientX - startX;
    setDragOffset(currentDrag);
  };

  const onDragEnd = () => {
    if (!isDragging || slides.length <= 1) return;
    
    if (dragOffset > 50) {
      handlePrev();
    } else if (dragOffset < -50) {
      handleNext();
    }
    
    setIsDragging(false);
    setDragOffset(0);
  };

  // 5. Infinite Jump Logic
  const handleTransitionEnd = () => {
    if (!isTransitioning) return;
    
    if (currentSlide === 0) {
      setIsTransitioning(false);
      setCurrentSlide(extendedSlides.length - 2);
    } else if (currentSlide === extendedSlides.length - 1) {
      setIsTransitioning(false);
      setCurrentSlide(1);
    }
  };

  useEffect(() => {
    if (!isTransitioning) {
      const timeout = setTimeout(() => setIsTransitioning(true), 50);
      return () => clearTimeout(timeout);
    }
  }, [isTransitioning]);

  // 6. Auto-play Logic (Paused while dragging)
  useEffect(() => {
    if (slides.length <= 1 || isDragging) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isDragging, handleNext]);

  if (loading) {
    return (
      <div className="relative w-full py-4">
        <div className="w-full h-40 bg-gray-800 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (error && slides.length === 0) {
    return (
      <div className="relative w-full py-4">
        <div className="w-full h-40 flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!hasSlides) {
    return (
      <div className="relative w-full py-4">
        <div className="w-full h-40 flex items-center justify-center bg-gray-800 rounded-lg">
          <div className="text-gray-500">No mobile banners available</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative w-full py-4 overflow-hidden select-none">
        <div 
          className={`flex ${isTransitioning && !isDragging ? "transition-transform duration-500 ease-out" : ""}`}
          onTransitionEnd={handleTransitionEnd}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
          style={{
            transform: `translateX(calc(-${currentSlide * 85}% + 7.5% + ${dragOffset}px))`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
        >
          {extendedSlides.map((slide, index) => {
            // Determine if this slide should be clickable
            const isClickable = slide.richText || slide.link;
            
            return (
              <div 
                key={`${slide.id}-${index}`} 
                className={`
                  flex-shrink-0 px-1 w-[85%] md:w-full 
                  transition-all duration-500
                  ${index === currentSlide ? 'scale-100 opacity-100' : 'scale-95 opacity-50'}
                  md:scale-100 md:opacity-100 md:px-4
                `}
              >
                <div 
                  className={`relative rounded-xl overflow-hidden bg-slate-900 ${isClickable ? 'cursor-pointer' : ''}`}
                  onClick={() => isClickable && handleBannerClick(slide)}
                >
                  <img
                    src={slide.src.startsWith('http') ? slide.src : `${base_url}/${slide.src}`}
                    alt={slide.alt}
                    className="w-full aspect-[21/9] md:aspect-[3/1] object-cover block"
                    loading="lazy"
                  />
                  
                  {/* Rich Text Preview Overlay for Mobile */}
                  {slide.richText && index === currentSlide && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        {slide.name && (
                          <h3 className="text-white font-bold text-sm mb-1 line-clamp-1">
                            {slide.name}
                          </h3>
                        )}
                        {slide.richText && (
                          <div 
                            className="rich-text-preview text-white text-xs opacity-90"
                            dangerouslySetInnerHTML={{ 
                              __html: slide.richText.replace(/<[^>]*>/g, ' ').substring(0, 80) + '...'
                            }}
                          />
                        )}
                        <div className="flex items-center mt-2 text-yellow-400 text-xs">
                          <span>Tap to view details</span>
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Navigation */}
        {slides.length > 1 && (
          <div className="hidden md:block">
            <button 
              onClick={handlePrev}
              className="absolute left-10 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-blue-600 p-2 rounded-full text-white transition-all duration-300 hover:scale-110"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-10 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-blue-600 p-2 rounded-full text-white transition-all duration-300 hover:scale-110"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}

        {/* Mobile Navigation Arrows (optional, for better UX) */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white transition-all duration-300"
              aria-label="Previous slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button 
              onClick={handleNext}
              className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 p-1.5 rounded-full text-white transition-all duration-300"
              aria-label="Next slide"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
          </>
        )}

        {/* Indicators */}
        {slides.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-4">
            {slides.map((_, index) => {
              let activeIndex = currentSlide - 1;
              if (currentSlide === 0) activeIndex = slides.length - 1;
              if (currentSlide === extendedSlides.length - 1) activeIndex = 0;

              return (
                <button
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentSlide(index + 1);
                  }}
                  className={`h-[3px] transition-all duration-300 cursor-pointer rounded-full ${
                    index === activeIndex ? "bg-theme_color w-7" : "bg-theme_gray/80 hover:bg-theme_gray w-4"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
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
        
        .rich-text-preview {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .line-clamp-1 {
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </>
  );
});

// Optional: Clear cache when needed
export const clearMobileBannerCache = () => {
  mobileBannerCache = [];
};