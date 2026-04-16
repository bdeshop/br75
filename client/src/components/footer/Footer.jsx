import React, { useState, useEffect, useContext } from "react";
import {
  FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaPinterest, FaWhatsapp,
  FaChevronDown, FaChevronUp, FaLinkedin, FaDiscord, FaReddit, FaMedium,
  FaGithub, FaSnapchat, FaWeixin, FaSkype,
} from "react-icons/fa";
import { SiTiktok, SiTelegram } from "react-icons/si";
import { IoOpenOutline } from "react-icons/io5";
import axios from "axios";
import logo from "../../assets/logo.png";
import OBP from "../../assets/OBP.png";
import { NavLink } from "react-router-dom";
import { LanguageContext } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useContext(LanguageContext);
  const [openSection, setOpenSection] = useState(null);
  const [showMoreText, setShowMoreText] = useState(false);
  const [dynamicLogo, setDynamicLogo] = useState(logo);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  useEffect(() => {
    fetchBrandingData();
    fetchSocialLinks();
  }, []);

  const fetchBrandingData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/branding`);
      if (response.data.success && response.data.data?.logo) {
        const logoUrl = response.data.data.logo.startsWith('http')
          ? response.data.data.logo
          : `${API_BASE_URL}${response.data.data.logo.startsWith('/') ? '' : '/'}${response.data.data.logo}`;
        setDynamicLogo(logoUrl);
      }
    } catch (error) {
      console.error("Error fetching branding data:", error);
    }
  };

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

  const getDefaultSocialLinks = () => [
    { platform: 'facebook', url: '#', backgroundColor: '#1877F2' },
    { platform: 'instagram', url: '#', backgroundColor: 'linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D)', isGradient: true },
    { platform: 'telegram', url: '#', backgroundColor: '#0088CC' },
    { platform: 'whatsapp', url: '#', backgroundColor: '#25D366' },
  ];

  const getSocialIcon = (platform) => {
    const iconProps = { size: 14, className: "text-white" };
    const icons = {
      facebook: <FaFacebook {...iconProps} />,
      instagram: <FaInstagram {...iconProps} />,
      twitter: <FaTwitter {...iconProps} />,
      youtube: <FaYoutube {...iconProps} />,
      pinterest: <FaPinterest {...iconProps} />,
      tiktok: <SiTiktok {...iconProps} />,
      telegram: <SiTelegram {...iconProps} />,
      whatsapp: <FaWhatsapp {...iconProps} />,
      linkedin: <FaLinkedin {...iconProps} />,
      discord: <FaDiscord {...iconProps} />,
      reddit: <FaReddit {...iconProps} />,
      medium: <FaMedium {...iconProps} />,
      github: <FaGithub {...iconProps} />,
      snapchat: <FaSnapchat {...iconProps} />,
      wechat: <FaWeixin {...iconProps} />,
      skype: <FaSkype {...iconProps} />,
    };
    return icons[platform] || <FaFacebook {...iconProps} />;
  };

  const toggleSection = (section) => setOpenSection(openSection === section ? null : section);

  return (
    <footer className="bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white border-b border-[#333] font-poppins text-gray-500 text-xs pb-20 md:pb-10">
      <div className="mx-auto max-w-screen-xl px-4 py-8">
        
        {/* ── Mobile Dropdown Sections ── */}
        <div className="md:hidden mb-3">

          {/* Gaming Dropdown */}
          <div className=" py-3">
            <button
              className="flex justify-between cursor-pointer items-center w-full text-left font-medium text-gray-200 text-[14px]"
              onClick={() => toggleSection("gaming")}
            >
              <span>{t.footerGaming}</span>
              {openSection === "gaming" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            {openSection === "gaming" && (
              <ul className="mt-2 space-y-3.5 pl-2">
                {[
                  { label: t.footerCasino,  href: "#" },
                  { label: t.footerSlots,   href: "#" },
                  { label: t.footerTable,   href: "#" },
                  { label: t.footerFishing, href: "#" },
                  { label: t.footerCrash,   href: "#" },
                  { label: t.footerArcade,  href: "#" },
                  { label: t.footerLottery, href: "#" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">
                      {label} <IoOpenOutline />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* About Dropdown */}
          <div className=" py-3">
            <button
              className="flex justify-between items-center cursor-pointer w-full text-left font-medium text-gray-200 text-[14px]"
              onClick={() => toggleSection("about")}
            >
              <span>{t.footerAbout}</span>
              {openSection === "about" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            {openSection === "about" && (
              <ul className="mt-2 space-y-3.5 pl-2">
                {[
                  t.footerAboutUs,
                  t.footerPrivacyPolicy,
                  t.footerTerms,
                  t.footerResponsibleGaming,
                  t.footerKyc,
                ].map((label) => (
                  <li key={label}>
                    <a href="#" className="hover:text-white text-gray-200 transition-colors duration-200 text-[13px] flex items-center gap-1">
                      {label} <IoOpenOutline />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Features Dropdown */}
          <div className=" py-3">
            <button
              className="flex cursor-pointer justify-between items-center w-full text-left font-medium text-gray-200 text-[14px]"
              onClick={() => toggleSection("features")}
            >
              <span>{t.footerFeatures}</span>
              {openSection === "features" ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
            {openSection === "features" && (
              <ul className="mt-2 space-y-3.5 pl-2">
                <li><a href="/promotions" className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">{t.footerPromotions}  <IoOpenOutline /></a></li>
                <li><a href="#" className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">{t.footerVipClub}  <IoOpenOutline /></a></li>
                <li><a href="#" className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">{t.footerReferral}  <IoOpenOutline /> </a></li>
                <li><a href="#" className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">{t.footerBrandAmbassadors}  <IoOpenOutline /></a></li>
                <li><a href="#" className="hover:text-white flex justify-start items-center gap-2 text-gray-200 transition-colors duration-200 text-[13px]">{t.footerAppDownload}  <IoOpenOutline /></a></li>
              </ul>
            )}
          </div>
        </div>

        {/* ── Desktop Grid Layout ── */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">

          {/* Column 1: Gaming */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">{t.footerGaming}</h3>
            <ul className="space-y-2">
              <li><NavLink to="/casino" className="hover:text-white transition-colors duration-200">{t.footerCasino}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerSlots}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerTable}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerFishing}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerCrash}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerArcade}</NavLink></li>
              <li><NavLink to="/slots"  className="hover:text-white transition-colors duration-200">{t.footerLottery}</NavLink></li>
            </ul>
          </div>

          {/* Column 2: About */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">{t.footerAbout}</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/about-us" className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]">
                  {t.footerAboutUs} <span className="inline-block text-gray-500 text-[20px]"><IoOpenOutline /></span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/privacy-policy" className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]">
                  {t.footerPrivacyPolicy} <span className="inline-block text-gray-500 text-[20px]"><IoOpenOutline /></span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms-and-conditions" className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]">
                  {t.footerTerms} <span className="inline-block text-gray-500 text-[20px]"><IoOpenOutline /></span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/responsible-gaming" className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]">
                  {t.footerResponsibleGaming} <span className="inline-block text-gray-500 text-[20px]"><IoOpenOutline /></span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/kyc" className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]">
                  {t.footerKyc} <span className="inline-block text-gray-500 text-[20px]"><IoOpenOutline /></span>
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Column 3: Features */}
          <div>
            <h3 className="font-medium mb-4 text-gray-200">{t.footerFeatures}</h3>
            <ul className="space-y-2">
              <li><a href="/promotions" className="hover:text-white transition-colors duration-200">{t.footerPromotions}</a></li>
              <li><NavLink to="/vip-club" className="hover:text-white transition-colors duration-200">{t.footerVipClub}</NavLink></li>
              <li><NavLink to="/referral-program" className="hover:text-white transition-colors duration-200">{t.footerReferral}</NavLink></li>
            </ul>
          </div>
{/* Column 4: Help */}
<div>
  <h3 className="font-medium mb-4 text-white">{t.footerHelp}</h3>
  <ul className="space-y-2">
    <li>
      <a 
        href="#" 
        onClick={(e) => {
          e.preventDefault();
          // Add your live chat initialization logic here
          // For example: window.LiveChatWidget?.call('maximize');
          alert('Live chat will open here');
        }}
        className="hover:text-white transition-colors duration-200 flex justify-start items-center gap-[2px]"
      >
        Live Chat <span className="inline-block text-gray-500 text-xs ml-[2px] text-[20px]"><IoOpenOutline /></span>
      </a>
    </li>
  </ul>
</div>
        </div>

        <div className="h-[1px] bg-gray-700 my-4 md:my-8"></div>
        {/* --- Sponsorships (Image 2 Style) --- */}
        <section className="mb-10">
          <h3 className="text-[#12b16a] font-bold text-[13px] md:text-base mb-6 uppercase tracking-wider">
            {t.footerSponsorships}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-4">
            {[
              { img: "https://img.b112j.com/bj/h5/assets/v3/images/sponsor/quetta-gladiators.png", name: "Quetta Gladiators", role: t.footerMainSponsor, date: "2023" },
              { img: "https://img.b112j.com/bj/h5/assets/v3/images/sponsor/sunrisers-eastern-cape.png", name: "Sunrisers Eastern Cape", role: t.footerMainSponsor, date: "2023 - 2024" },
              { img: "https://img.b112j.com/bj/h5/assets/v3/images/sponsor/deccan-gladiators.png", name: "Deccan Gladiators", role: t.footerOfficialPartner, date: "2023 - 2024" },
              { img: "https://img.b112j.com/bj/h5/assets/v3/images/sponsor/st-kitts-and-nevis-patriots.png", name: "St Kitts & Nevis Patriots", role: t.footerPrincipleSponsor, date: "2024 - 2025" },
              { img: "https://img.b112j.com/bj/h5/assets/v3/images/sponsor/biratnagar-kings.png", name: "Biratnagar Kings", role: t.footerBackJersey, date: "2024 - 2025" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <img src={item.img} alt={item.name} className="h-9 w-9 object-contain" />
                <div>
                  <h4 className="text-gray-300 font-semibold text-[13px]">{item.name}</h4>
                  <p className="text-[10px] text-yellow_theme uppercase">{item.role}</p>
                  <p className="text-[10px] text-yellow_theme">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-900 mb-10" />

        {/* --- Brand Ambassadors (Image 2 Style) --- */}
        <section className="mb-10">
          <h3 className="text-[#12b16a] font-bold text-[13px] md:text-base mb-6 uppercase tracking-wider">
            {t.footerBrandAmbassadors}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-y-8 gap-x-4">
            {[
              { name: "Mia Khalifa", date: "2024 - 2028", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/mia-k.png" },
              { name: "Kevin Pietersen", date: "2024 - 2028", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/kevin-pietersen.png" },
              { name: "Amy Jackson", date: "2023 - 2024", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/amy-jacson.png" },
              { name: "Hansika Motwani", date: "2023 - 2024", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/hansika.png" },
              { name: "Chan Samart", date: "2024 - 2025", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/chan-samart.png" },
              { name: "Keya Akter Payel", date: "2025", img: "https://img.b112j.com/bj/h5/assets/v3/images/ambassador/keya-akter-payel.png" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <img src={item.img} alt={item.name} className="h-8 w-8 object-contain grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all" />
                <div>
                  <h4 className="text-gray-300 font-semibold text-[13px]">{item.name}</h4>
                  <p className="text-[10px] text-yellow_theme">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-gray-900 mb-10" />

        {/* --- Desktop Navigation --- */}
        <div className="hidden md:grid grid-cols-4 gap-8 mb-10">
          <div>
            <h3 className="text-gray-200 font-bold mb-4 uppercase text-[11px] tracking-widest">{t.footerGaming}</h3>
            <ul className="space-y-2">
              <li><NavLink to="/casino" className="hover:text-white transition-colors">{t.footerCasino}</NavLink></li>
              <li><NavLink to="/slots" className="hover:text-white transition-colors">{t.footerSlots}</NavLink></li>
              <li><NavLink to="/table" className="hover:text-white transition-colors">{t.footerTable}</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-200 font-bold mb-4 uppercase text-[11px] tracking-widest">{t.footerAbout}</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-1"><NavLink to="/about-us" className="hover:text-white">{t.footerAboutUs}</NavLink> <IoOpenOutline /></li>
              <li className="flex items-center gap-1"><NavLink to="/privacy-policy" className="hover:text-white">{t.footerPrivacyPolicy}</NavLink> <IoOpenOutline /></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-200 font-bold mb-4 uppercase text-[11px] tracking-widest">{t.footerFeatures}</h3>
            <ul className="space-y-2">
              <li><NavLink to="/promotions" className="hover:text-white">{t.footerPromotions}</NavLink></li>
              <li><NavLink to="/vip-club" className="hover:text-white">{t.footerVipClub}</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4 uppercase text-[11px] tracking-widest">{t.footerFollowUs}</h3>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
                  style={{ background: link.isGradient ? link.backgroundColor : link.backgroundColor }}
                  target={link.opensInNewTab ? "_blank" : "_self"}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>
        {/* --- SEO / Main Text Section (Restored Logic) --- */}
        <div className="mb-10">
          <h3 className="text-gray-200 font-semibold mb-2 text-sm uppercase tracking-tight">
            Bir75 - Leading Online Gaming and Betting Platform
          </h3>
          <p className="text-gray-200 text-justify leading-relaxed">
            {t.footerHeadingText}
          </p>
          {showMoreText && (
            <p className="text-gray-200 mt-2 text-justify italic">
              {t.footerHeadingTextMore}
            </p>
          )}
          <button
            onClick={() => setShowMoreText(!showMoreText)}
            className="mt-3 px-4 py-1 border border-gray-400 rounded-full text-[10px] text-gray-200 hover:bg-gray-900"
          >
            {showMoreText ? t.footerShowLess : t.footerShowMore}
          </button>
        </div>

        {/* --- Bottom Licenses & Copyright --- */}
        <div className="border-t border-gray-900 pt-8 flex flex-col justify-between items-center gap-6">
          <div className="flex flex-col  items-center gap-4 text-center md:text-left">
            <img src={dynamicLogo} alt="logo" className="h-8" />
            <p className="text-[10px] text-gray-200 text-left leading-5">{t.footerLegalText}</p>
          </div>
          <div className="flex flex-col items-center md:items-center">
            <p className="text-gray-200 font-semibold mb-2 text-center ">{t.footerCopyright}</p>
            <div className="flex gap-3 justify-center items-center opacity-40">
              <img src="https://img.b112j.com/bj/h5/assets/images/footer/gaming_license.png" className="h-4" />
              <img src="https://img.b112j.com/bj/h5/assets/v3/images/icon-set/trivial-type/age-limit.svg" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;