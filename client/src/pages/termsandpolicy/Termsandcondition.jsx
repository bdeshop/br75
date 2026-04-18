import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  FaUserCircle, 
  FaYoutube, 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaPinterestP,
  FaWhatsapp 
} from "react-icons/fa";
import logo from "../../assets/logo.png";
import { NavLink } from "react-router-dom";

const Termsandcondition = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const getDefaultSocialLinks = () => [
    { platform: "youtube", url: "https://youtube.com", backgroundColor: "#FF0000" },
    { platform: "facebook", url: "https://facebook.com", backgroundColor: "#1877F2" },
    { platform: "twitter", url: "https://twitter.com", backgroundColor: "#1DA1F2" },
    { platform: "instagram", url: "https://instagram.com", backgroundColor: "#E4405F" },
    { platform: "whatsapp", url: "https://wa.me/+447311133789", backgroundColor: "#25D366" },
  ];

  const fetchSocialLinks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/social-links`);
      if (response.data.success) {
        setSocialLinks(response.data.data);
      } else {
        setSocialLinks(getDefaultSocialLinks());
      }
    } catch (error) {
      setSocialLinks(getDefaultSocialLinks());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const getSocialIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case "whatsapp": return <FaWhatsapp />;
      case "youtube": return <FaYoutube />;
      case "facebook": return <FaFacebookF />;
      case "twitter": return <FaTwitter />;
      case "instagram": return <FaInstagram />;
      case "pinterest": return <FaPinterestP />;
      default: return <FaUserCircle />;
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white flex flex-col">
      {/* Top Logo Bar */}
      <div className="bg-[#041512] border-b border-white/5 sticky top-0 z-50">
        <NavLink to="/" className="max-w-7xl mx-auto p-4 flex items-center">
          <img className="w-[100px] md:w-[120px] object-contain" src={logo} alt="Bir75 Logo" />
        </NavLink>
      </div>

      <div className="flex flex-1">
        <div className="flex-1 h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar flex flex-col">
          <div className="max-w-7xl mx-auto px-6 py-10 flex-grow">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-normal text-yellow-500">Our Terms & Policy</h1>
            </div>

            {/* Content Body */}
            <div className="space-y-6 text-[13px] text-gray-200 leading-snug font-normal">
              
              <section className="space-y-4">
                <p className="text-[11px] text-gray-400">Last updated: 2026</p>
                <h2 className="text-[14px] font-bold">1. Introduction</h2>
                <p>These Terms & Conditions ("Terms") apply to the use of the Bir75 website and all related services (collectively, the "Service").</p>
                <p>By accessing or using Bir75, you agree to be legally bound by these Terms. If you do not agree, you must stop using the website immediately.</p>
                <p>Bir75 is an international online platform providing gaming and betting services for entertainment purposes only.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">2. General Terms</h2>
                <p>Bir75 reserves the right to modify or update these Terms at any time. Changes take effect immediately upon publication.</p>
                <p>Continued use of the website indicates acceptance of updated Terms.</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-bold">3. User Obligations</h2>
                <p>By using Bir75, you confirm that:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>You are 18 years or older</li>
                  <li>You have legal capacity to enter this agreement</li>
                  <li>You comply with your local laws</li>
                  <li>You are the authorized user of your payment method</li>
                  <li>All payments are made in good faith</li>
                  <li>You understand gambling involves risk and possible loss</li>
                  <li>You are using the platform for personal use only</li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-bold">4. Prohibited Activities</h2>
                <p>You must NOT:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Use VPN, proxy, or location-masking tools</li>
                  <li>Create multiple accounts</li>
                  <li>Commit fraud or payment abuse</li>
                  <li>Use unauthorized payment methods</li>
                  <li>Exploit system errors</li>
                </ul>
                <p className="text-yellow-500">👉 Violations may result in suspension or permanent ban.</p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-bold">5. Restricted Countries</h2>
                <p>Bir75 is not available in:</p>
                <ul className="list-disc ml-8 grid grid-cols-2 md:grid-cols-3 gap-1">
                  <li>Austria</li>
                  <li>Australia</li>
                  <li>Aruba</li>
                  <li>Bonaire</li>
                  <li>Curaçao</li>
                  <li>France</li>
                  <li>Netherlands</li>
                  <li>Saba</li>
                  <li>Sint Eustatius (Statia)</li>
                  <li>St. Maarten</li>
                  <li>Singapore</li>
                  <li>Spain</li>
                  <li>United Kingdom</li>
                  <li>United States</li>
                </ul>
                <p>👉 Also restricted in any country where online gambling is illegal.</p>
              </section>

              <section className="space-y-3 bg-red-900/20 p-4 rounded border border-red-500/30">
                <h2 className="text-[14px] font-bold text-red-400">6. Asia Restriction Policy</h2>
                <p className="font-semibold">Bir75 permits access to users from all Asian countries.</p>
                <p className="text-red-300">⚠️ Users from Asia are not allowed to:</p>
                <ul className="list-disc ml-8 space-y-1 text-red-200">
                  <li>Register</li>
                  <li>Access the platform</li>
                  <li>Use any services</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">7. Payments & Risk</h2>
                <p>All bets are final once placed. Losses are the user's responsibility. Bir75 is not liable for financial losses.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">8. Account Suspension</h2>
                <p>Bir75 may suspend or terminate accounts, withhold funds in case of violations, or request identity verification (KYC).</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">9. Responsible Gambling</h2>
                <p>Bir75 promotes responsible gaming. Users should treat gambling as entertainment, not income.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">10. Changes to Terms</h2>
                <p>We may update these Terms at any time. Users should review regularly.</p>
              </section>

              {/* NEW ENTERTAINMENT PURPOSE POLICY SECTION */}
              <section className="space-y-4 bg-yellow-900/20 p-6 rounded border border-yellow-500/30">
                <h2 className="text-[18px] font-bold text-yellow-400">🎯 11. Entertainment Purpose Policy</h2>
                <p>Bir75 is designed strictly for <span className="font-semibold text-yellow-300">entertainment and leisure purposes only</span>.</p>
                
                <p>By using our platform, you agree that:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Gambling is for fun and recreational use only</li>
                  <li>You will not treat it as a profession or income source</li>
                  <li>You will only play during your leisure time</li>
                  <li>Profits are not guaranteed</li>
                </ul>

                <div className="mt-4 pt-3 border-t border-yellow-500/30">
                  <h3 className="text-[15px] font-bold text-yellow-400">⏱️ Recommended Play Time</h3>
                  <p>To promote responsible gaming, Bir75 recommends that users:</p>
                  <ul className="list-disc ml-6 space-y-1 mt-1">
                    <li>Limit their gameplay to approximately <span className="font-semibold">6 hours per day</span></li>
                    <li>Not exceed approximately <span className="font-semibold">120–150 hours per month</span></li>
                    <li>Always take regular breaks during sessions</li>
                  </ul>
                  <p className="text-red-300 text-xs mt-2">👉 Excessive gameplay may lead to unhealthy habits and financial risk.</p>
                </div>

                <div className="mt-4 pt-3 border-t border-yellow-500/30">
                  <h3 className="text-[15px] font-bold text-yellow-400">🎉 Promotional Statement</h3>
                  <p className="italic">"Have fun & make money with Bir75."</p>
                  <p>This slogan reflects entertainment value only. Users must understand:</p>
                  <ul className="list-disc ml-6 space-y-1 mt-1">
                    <li>Earnings are not guaranteed</li>
                    <li>Results depend on chance</li>
                    <li>It is not a stable income source</li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-yellow-500/30">
                  <h3 className="text-[15px] font-bold text-yellow-400">⚠️ Player Responsibility</h3>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Play within your financial limits</li>
                    <li>Do not depend on gambling for income</li>
                    <li>Accept that losses are part of the activity</li>
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-yellow-500/30">
                  <h3 className="text-[15px] font-bold text-yellow-400">🚫 Professional Use Restriction</h3>
                  <p>Users are strictly prohibited from:</p>
                  <ul className="list-disc ml-6 space-y-1">
                    <li>Professional gambling</li>
                    <li>Syndicate/group betting</li>
                    <li>Commercial exploitation of the platform</li>
                  </ul>
                </div>

                <div className="mt-4 pt-4 border-t-2 border-yellow-500/50 bg-black/30 p-4 rounded text-center">
                  <h3 className="text-[16px] font-bold text-yellow-300">🎯 Final Statement</h3>
                  <p className="text-sm italic mt-2">
                    Bir75 is a platform for entertainment during your leisure time. 
                    It should never be considered a profession, investment, or guaranteed source of income.
                  </p>
                </div>
              </section>
            </div>
          </div>

          <footer className="bg-black text-gray-400 py-10 px-6 md:px-16 border-t border-gray-900 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
              <div className="flex flex-col items-start min-w-[150px]">
                <img src={logo} alt="Bir75" className="w-20 mb-2" />
                <p className="text-[10px] text-gray-500">©Copyright 2026</p>
              </div>

              <div className="flex flex-col gap-4 items-end ml-auto">
                <div className="bg-[#4a5568] px-3 py-1.5 rounded flex items-center gap-2 cursor-pointer transition-colors">
                  <span className="text-lg">🇬🇧</span>
                  <span className="text-sm text-white">English</span>
                  <span className="text-[10px] ml-4 font-sans">▼</span>
                </div>

                <div className="flex gap-2">
                  {socialLinks.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target={link.opensInNewTab ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                      style={{ backgroundColor: link.backgroundColor || "#4a5568" }}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Termsandcondition;