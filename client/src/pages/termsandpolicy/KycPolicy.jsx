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

const KycPolicy = () => {
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
    <div className="min-h-screen font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white flex flex-col">
      {/* Brand Header Bar */}
      <div className="bg-[#041512] border-b border-white/5 sticky top-0 z-50">
        <NavLink to="/" className="max-w-7xl mx-auto p-4 flex items-center">
          <img className="w-[100px] md:w-[120px] object-contain" src={logo} alt="Bir75 Logo" />
        </NavLink>
      </div>

      <div className="flex flex-1">
        <div className="flex-1 h-[calc(100vh-72px)] overflow-y-auto custom-scrollbar flex flex-col">
          <div className="max-w-5xl mx-auto px-6 py-10 flex-grow">
            
            {/* Main Header */}
            <div className="mb-6">
              <h1 className="text-xl font-bold mb-1"># 🔐 KYC & AML Policy – Bir75</h1>
              <p className="text-[10px] text-gray-400">Last Updated: 2026</p>
            </div>

            {/* Content Body - New Policy Text */}
            <div className="space-y-6 text-sm text-gray-200">
              <section className="space-y-4">
                <h2 className="font-bold">1. Introduction</h2>
                <p>To ensure a safe, secure, and compliant environment, Bir75 implements strict Know Your Customer (KYC) and Anti-Money Laundering (AML) procedures.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">2. When KYC Verification is Required</h2>
                <p>Users must complete KYC verification when:</p>
                <ul className="list-disc ml-8 space-y-1">
                  <li>Total lifetime deposits exceed BDT 2,000, or</li>
                  <li>A withdrawal request of any amount is made</li>
                </ul>
                <p>👉 Bir75 reserves the right to request KYC at any time.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">3. Required Documents</h2>
                <p><span className="font-bold">🪪 Proof of Identity</span></p>
                <ul className="list-disc ml-8">
                  <li>Government-issued photo ID</li>
                </ul>
                <p><span className="font-bold">📸 Selfie Verification</span></p>
                <ul className="list-disc ml-8">
                  <li>Selfie holding the ID</li>
                </ul>
                <p><span className="font-bold">🏠 Proof of Address</span></p>
                <ul className="list-disc ml-8">
                  <li>Bank statement or utility bill (last 3 months)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">4. Verification Process</h2>
                <ul className="list-disc ml-8">
                  <li>Status: Temporarily Approved after submission</li>
                  <li>Review time: within 24 hours</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">5. Temporary Approval Conditions</h2>
                <ul className="list-disc ml-8">
                  <li>Platform usage allowed</li>
                  <li>Deposit limit: Maximum BDT 500 total</li>
                  <li>Withdrawals restricted until approval</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">6. Verification Requirements</h2>
                <ul className="list-disc ml-8">
                  <li>Must be 18+</li>
                  <li>Name must match documents</li>
                  <li>Documents must be valid</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">7. Restricted Jurisdictions</h2>
                <p>Users from restricted countries are not allowed.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">8. Failed Verification</h2>
                <ul className="list-disc ml-8">
                  <li>User will be notified</li>
                  <li>Resubmission may be required</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">9. AML Measures</h2>
                <ul className="list-disc ml-8">
                  <li>No KYC = no deposit/withdraw</li>
                  <li>Max deposit per transaction: BDT 2,000</li>
                  <li>Withdrawals checked manually and automatically</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">💰 10. Deposit Limit</h2>
                <ul className="list-disc ml-8">
                  <li>Minimum deposit amount: BDT 50</li>
                </ul>
                <p>👉 Deposits below this amount will not be accepted.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">💸 11. Withdrawal Limit</h2>
                <ul className="list-disc ml-8">
                  <li>Minimum withdrawal amount: BDT 500</li>
                </ul>
                <p>👉 Withdrawal requests below this amount will not be processed.</p>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">12. Prohibited Transactions</h2>
                <ul className="list-disc ml-8">
                  <li>No user-to-user transfer</li>
                  <li>Fraud leads to ban</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="font-bold">13. Final Statement</h2>
                <p>Bir75 ensures a secure, transparent, and compliant platform. All users must follow KYC and AML requirements.</p>
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
                <div className="bg-[#4a5568] px-3 py-1.5 rounded flex items-center gap-2 cursor-pointer">
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

export default KycPolicy;