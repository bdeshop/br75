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

const Privacypolicy = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const getDefaultSocialLinks = () => [
    { platform: "youtube", url: "https://youtube.com", backgroundColor: "#FF0000" },
    { platform: "facebook", url: "https://facebook.com", backgroundColor: "#1877F2" },
    { platform: "twitter", url: "https://twitter.com", backgroundColor: "#1DA1F2" },
    { platform: "instagram", url: "https://instagram.com", backgroundColor: "#E4405F" },
    { platform: "whatsapp", url: "https://wa.me/yournumber", backgroundColor: "#25D366" },
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
            
            {/* Page Header */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-normal text-yellow-500">🔐 Privacy Policy – Bir75</h1>
            </div>

            {/* Content Body - New Text */}
            <div className="space-y-6 text-[13px] text-gray-200 leading-snug font-normal">
              <p><strong>Last Updated: 2026</strong></p>
              <p>Your privacy is important to us. At Bir75, we are committed to protecting your personal information and being transparent about how we collect, use, and safeguard your data.</p>
              <p>This Privacy Policy explains how Bir75 uses your personal information when you access and use our website and services.</p>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">⚠️ Acceptance of Policy</h2>
                <p>By registering an account, using our services, or accessing the Bir75 platform, you agree to this Privacy Policy and our Terms & Conditions.</p>
                <p>If you do not agree, please discontinue using our website. You may stop using our services at any time; however, we may still be required to retain certain data for legal or regulatory reasons.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🏢 Data Controller</h2>
                <p>Bir75 (referred to as "We", "Us", or "Our") is responsible for collecting and processing your personal data.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">📩 Contact Information</h2>
                <p>If you have any questions or concerns regarding your data:</p>
                <p>📧 Email: <a href="mailto:support@bir75.com" className="text-yellow-500 hover:underline">support@bir75.com</a></p>
              </section>

              <section className="space-y-3">
                <h2 className="text-[14px] font-bold">📊 Information We Collect</h2>
                <h3 className="text-[13px] font-bold">🔹 Personal Information</h3>
                <p>We collect information you provide when you:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Register an account</li>
                  <li>Use our services</li>
                  <li>Contact customer support</li>
                </ul>
                <p>This may include:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Username</li>
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Phone number</li>
                  <li>Residential address</li>
                  <li>Payment details (if applicable)</li>
                  <li>Identification documents (KYC)</li>
                  <li>Transaction history</li>
                  <li>Any other information you provide</li>
                </ul>
                <h3 className="text-[13px] font-bold">🔹 Non-Personal Information</h3>
                <p>We also collect technical data such as:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>IP address</li>
                  <li>Device and browser type</li>
                  <li>Access time and date</li>
                  <li>Website activity and usage</li>
                </ul>
                <p>👉 This helps us improve performance and user experience.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">☎️ Communication & Monitoring</h2>
                <p>Customer support interactions (including emails or chats) may be recorded or stored for:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Security</li>
                  <li>Training</li>
                  <li>Service improvement</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">💬 Social Features</h2>
                <p>If you use features like chat or community tools, we may store and process that data to maintain a safe environment.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🍪 Cookies</h2>
                <p>Bir75 uses cookies to:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Improve website functionality</li>
                  <li>Enhance user experience</li>
                </ul>
                <p>You can manage cookie preferences through your browser settings.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">⚙️ How We Use Your Information</h2>
                <p>We use your data to:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Provide and manage your account</li>
                  <li>Process transactions</li>
                  <li>Deliver customer support</li>
                  <li>Improve website performance</li>
                  <li>Comply with legal and regulatory requirements</li>
                  <li>Send important updates or promotional offers</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🔐 Data Protection</h2>
                <p>We implement strict security measures to protect your personal information from unauthorized access, misuse, or disclosure.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">📤 Data Sharing</h2>
                <p>Your personal data is never sold. We may share information only when necessary with:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Payment providers</li>
                  <li>Legal authorities (if required)</li>
                  <li>Service partners (for platform operation)</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">📅 Data Retention</h2>
                <p>We retain your data only as long as necessary for:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Legal obligations</li>
                  <li>Security purposes</li>
                  <li>Service operation</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">👤 Your Rights</h2>
                <p>You have the right to:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request correction or updates</li>
                  <li>Request deletion (where applicable)</li>
                  <li>Restrict or object to processing</li>
                </ul>
                <p>To exercise your rights, contact our support team.</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-[14px] font-bold">🔄 Policy Updates</h2>
                <p>Bir75 may update this Privacy Policy from time to time. Any changes will be posted on this page, and we recommend reviewing it regularly.</p>
              </section>

              <section className="space-y-2 pb-10">
                <h2 className="text-[14px] font-bold">🎯 Final Note</h2>
                <p>Your trust is important to us. We are committed to ensuring your data is handled securely and responsibly at all times.</p>
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
                <div className="bg-[#4a5568] px-3 py-1.5 rounded flex items-center gap-2 cursor-pointer hover:bg-gray-600 transition-colors">
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
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-80 transition-all text-sm"
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

export default Privacypolicy;