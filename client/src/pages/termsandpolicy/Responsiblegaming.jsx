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

const Responsiblegaming = () => {
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
              <h1 className="text-lg font-normal text-yellow-500">Responsible Gaming</h1>
            </div>

            {/* Content Body */}
            <div className="space-y-6 text-[13px] text-gray-200 leading-snug font-normal">
              
              {/* Title Section */}
              <section className="space-y-2">
                <p className="font-bold text-base">🎯 Gambling with Responsibility – Bir75</p>
                <p className="text-[11px] text-gray-400">Last Updated: 2026</p>
                <p>Please read this information carefully for your own benefit.</p>
                <p>Bir75 is committed to promoting responsible gaming. While gambling is a source of entertainment and enjoyment for most users, we recognize that it may cause negative effects for some individuals. We aim to provide tools, guidance, and support to help users stay in control of their gaming behavior.</p>
              </section>

              {/* Definitions */}
              <section className="space-y-3">
                <h2 className="text-[14px] font-bold">📘 Definitions</h2>
                <ul className="list-disc ml-8 space-y-1">
                  <li><span className="font-bold">Account</span> means a unique account created to access Bir75 services.</li>
                  <li><span className="font-bold">Company</span> (referred to as "Bir75", "We", "Us", or "Our") refers to the platform operator.</li>
                  <li><span className="font-bold">Service</span> refers to the Bir75 website and related services.</li>
                  <li><span className="font-bold">Website</span> refers to the official Bir75 platform.</li>
                  <li><span className="font-bold">User</span> (You) means any individual accessing or using our services.</li>
                </ul>
              </section>

              {/* Responsible Gambling & Self-Control */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">⚠️ Responsible Gambling & Self-Control</h2>
                <p>Gambling should always be considered as a form of entertainment, not a way to earn money. While most users enjoy gaming responsibly, some may experience difficulties.</p>
                <p>Bir75 supports responsible gaming through:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Awareness and education</li>
                  <li>Self-control tools</li>
                  <li>Account restriction options</li>
                </ul>
                <p>If you feel your gaming behavior is becoming harmful, we strongly encourage you to take immediate action.</p>
              </section>

              {/* Support & Assistance */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">📩 Support & Assistance</h2>
                <p>📧 Email: <a href="mailto:support@bir75.com" className="text-yellow-500 hover:underline">support@bir75.com</a></p>
                <p>We respect your privacy and will never share your personal information without your consent, unless required by law.</p>
                <p>Self-assessment test:<br />
                  👉 <a href="https://www.begambleaware.org/gambling-problems/do-i-have-a-gambling-problem/" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline break-all">https://www.begambleaware.org/gambling-problems/do-i-have-a-gambling-problem/</a>
                </p>
                <p>More info:<br />
                  👉 <a href="https://www.begambleaware.org/safer-gambling/" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:underline break-all">https://www.begambleaware.org/safer-gambling/</a>
                </p>
              </section>

              {/* Responsible Gambling Guidelines */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">💡 Responsible Gambling Guidelines</h2>
                <ul className="list-disc ml-8 space-y-1">
                  <li>✔️ Set a budget and deposit limits</li>
                  <li>❌ Do not chase losses</li>
                  <li>⏱️ Set time limits</li>
                  <li>🧠 Avoid gambling under stress, pressure, or influence</li>
                  <li>☕️ Take regular breaks</li>
                </ul>
              </section>

              {/* Underage Gambling */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🚫 Underage Gambling</h2>
                <p>Bir75 strictly prohibits access to anyone under the age of 18. We reserve the right to verify user identity at any time.</p>
              </section>

              {/* Self-Exclusion & Account Control */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🔐 Self-Exclusion & Account Control</h2>
                <p>You may request:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Temporary suspension</li>
                  <li>Permanent self-exclusion</li>
                  <li>Account limits</li>
                </ul>
                <p>Contact support to activate these features.</p>
              </section>

              {/* Single Account Policy */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">⚙️ Single Account Policy</h2>
                <p>Only one account per user is allowed. Multiple accounts may lead to suspension.</p>
              </section>

              {/* Responsible Gaming Notice */}
              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">⚠️ Responsible Gaming Notice</h2>
                <p className="italic">"Play responsibly. Bir75 is for 18+ users only. Gaming is for entertainment, not a source of income. Contact support for account limits or self-exclusion."</p>
              </section>

              {/* Final Note */}
              <section className="space-y-2 pt-2">
                <h2 className="text-[14px] font-bold">🎯 Final Note</h2>
                <p>Gambling should always remain fun and controlled. If it stops being enjoyable, take a break and seek support.</p>
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

export default Responsiblegaming;