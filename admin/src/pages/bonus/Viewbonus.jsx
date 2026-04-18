import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPercentage, FaGift, FaSpinner, FaInfoCircle, FaUser, FaClock, FaEdit, FaUsers, FaUserCheck, FaTimes, FaUserPlus } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNavigate, useParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaBangladeshiTakaSign } from "react-icons/fa6";

const Viewbonus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [bonusData, setBonusData] = useState(null);
  const [assignedUsersList, setAssignedUsersList] = useState([]);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch bonus data on component mount
  useEffect(() => {
    const fetchBonusData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${base_url}/api/admin/bonuses/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch bonus data');
        }

        if (data.success && data.bonus) {
          setBonusData(data.bonus);
          // Extract assigned users
          if (data.bonus.assignedUsers && data.bonus.assignedUsers.length > 0) {
            setAssignedUsersList(data.bonus.assignedUsers);
          } else if (data.bonus.applicableTo === 'specific' && data.bonus.assignedUsers) {
            setAssignedUsersList(data.bonus.assignedUsers);
          }
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load bonus data');
        console.error('Error fetching bonus:', error);
        setTimeout(() => navigate('/admin/bonuses'), 2000);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBonusData();
    }
  }, [id, base_url, navigate]);

  // Format bonus type for display
  const formatBonusType = (type) => {
    if (!type) return 'N/A';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Get bonus type icon
  const getBonusTypeIcon = (type) => {
    switch(type) {
      case 'welcome': return '🎉';
      case 'deposit': return '💰';
      case 'reload': return '🔄';
      case 'cashback': return '💸';
      case 'free_spin': return '🎰';
      case 'special': return '⭐';
      case 'manual': return '✏️';
      default: return '🎁';
    }
  };

  // Get applicable to label
  const getApplicableToLabel = () => {
    if (!bonusData) return 'N/A';
    
    switch(bonusData.applicableTo) {
      case 'all': return 'All Users';
      case 'new': return 'New Users Only';
      case 'existing': return 'Existing Users Only';
      case 'specific': return 'Specific Users';
      default: return bonusData.applicableTo || 'N/A';
    }
  };

  // Get assignment display text
  const getAssignmentDisplay = () => {
    if (!bonusData) return 'N/A';
    
    if (bonusData.applicableTo === 'specific') {
      const count = assignedUsersList.length;
      return `${count} User${count !== 1 ? 's' : ''} Selected`;
    }
    return getApplicableToLabel();
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'active':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'inactive':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'expired':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate bonus amount based on percentage
  const calculateBonusFromPercentage = () => {
    if (!bonusData) return 0;
    
    if (bonusData.percentage > 0 && bonusData.minDeposit > 0) {
      const calculated = (bonusData.minDeposit * bonusData.percentage) / 100;
      if (bonusData.maxBonus && calculated > bonusData.maxBonus) {
        return bonusData.maxBonus;
      }
      return calculated;
    }
    return bonusData.amount;
  };

  // Check if bonus is expired
  const isBonusExpired = () => {
    if (!bonusData || !bonusData.endDate) return false;
    const endDate = new Date(bonusData.endDate);
    const now = new Date();
    return endDate < now;
  };

  if (loading) {
    return (
      <section className="min-h-screen bg-[#0F111A] text-gray-200 font-poppins">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <div className="flex items-center justify-center h-full flex-col gap-3">
              <FaSpinner className="animate-spin text-amber-400 text-2xl" />
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-500">Loading bonus details...</p>
            </div>
          </main>
        </div>
      </section>
    );
  }

  if (!bonusData) {
    return (
      <section className="min-h-screen bg-[#0F111A] text-gray-200 font-poppins">
        <Header toggleSidebar={toggleSidebar} />
        <div className="flex pt-[10vh]">
          <Sidebar isOpen={isSidebarOpen} />
          <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center bg-[#161B22] border border-gray-800 rounded-lg p-8 max-w-md">
                <div className="text-rose-400 text-4xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-white mb-2">Bonus Not Found</h2>
                <p className="text-gray-400 text-sm mb-4">The bonus you're looking for doesn't exist or has been deleted.</p>
                <button
                  onClick={() => navigate('/admin/bonuses')}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs transition-all"
                >
                  Back to Bonuses List
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#0F111A] text-gray-200 font-poppins">
      <Header toggleSidebar={toggleSidebar} />
      <Toaster position="top-right" toastOptions={{ style: { background: '#161B22', color: '#e5e7eb', border: '1px solid #374151' } }} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main
          className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${
            isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'
          }`}
        >
          <div className="w-full mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tighter">
                      {bonusData.name}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-bold border ${getStatusBadgeClass(bonusData.status)}`}>
                      {bonusData.status.toUpperCase()}
                      {isBonusExpired() && ' (EXPIRED)'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-[10px] text-gray-500">
                    <div className="flex items-center gap-1">
                      <FaUser className="text-xs text-amber-400" />
                      <span>Created by: {bonusData.createdBy?.username || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaClock className="text-xs text-amber-400" />
                      <span>
                        Created: {formatDate(bonusData.createdAt)} • 
                        Updated: {formatDate(bonusData.updatedAt)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[9px] px-2 py-1 bg-[#1C2128] text-gray-400 rounded font-mono">
                      ID: {bonusData._id}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/bonuses/edit/${bonusData._id}`)}
                    className="bg-amber-600 hover:bg-amber-700 px-5 py-2 rounded font-bold text-xs transition-all flex items-center gap-2 text-white"
                  >
                    <FaEdit /> Edit Bonus
                  </button>
                  <button
                    onClick={() => navigate('/admin/bonuses')}
                    className="bg-[#1F2937] hover:bg-[#374151] border border-gray-700 px-5 py-2 rounded font-bold text-xs transition-all flex items-center gap-2 text-gray-400"
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Bonus Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bonus Overview Card */}
                <div className="bg-[#161B22] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-amber-500"></div> Bonus Overview
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bonus Type */}
                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Bonus Type</h3>
                        <p className="text-base font-bold text-white flex items-center gap-2">
                          <span className="text-xl">{getBonusTypeIcon(bonusData.bonusType)}</span>
                          {formatBonusType(bonusData.bonusType)}
                        </p>
                      </div>

                      {/* Bonus Code */}
                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Bonus Code</h3>
                        <p className="text-base font-bold text-white font-mono">
                          {bonusData.bonusCode || 'N/A'}
                        </p>
                      </div>

                      {/* Applicable To */}
                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Assigned To</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-base font-bold text-white">
                            {getAssignmentDisplay()}
                          </p>
                          {bonusData.applicableTo === 'specific' && assignedUsersList.length > 0 && (
                            <button
                              onClick={() => setShowUsersModal(true)}
                              className="text-[9px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1"
                            >
                              <FaUsers /> View All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Validity Period */}
                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Validity Period</h3>
                        <p className="text-base font-bold text-white">
                          {bonusData.validityDays} days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financial Details Card */}
                <div className="bg-[#161B22] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-amber-500"></div> Financial Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Fixed Amount</h3>
                          <div className="flex items-center">
                            <FaBangladeshiTakaSign className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {bonusData.amount > 0 ? `${bonusData.amount.toFixed(2)} BDT` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Percentage</h3>
                          <div className="flex items-center">
                            <FaPercentage className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {bonusData.percentage > 0 ? `${bonusData.percentage}%` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Minimum Deposit</h3>
                          <div className="flex items-center">
                            <FaBangladeshiTakaSign className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {bonusData.minDeposit > 0 ? `${bonusData.minDeposit.toFixed(2)} BDT` : 'No Minimum'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Maximum Bonus</h3>
                          <div className="flex items-center">
                            <FaBangladeshiTakaSign className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {bonusData.maxBonus ? `${bonusData.maxBonus.toFixed(2)} BDT` : 'No Limit'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Wagering Requirement</h3>
                          <div className="flex items-center">
                            <span className="text-base font-bold text-amber-400">
                              {bonusData.wageringRequirement}x
                            </span>
                            <span className="ml-2 text-[9px] text-gray-500">
                              (times the bonus amount)
                            </span>
                          </div>
                        </div>

                        {/* Example Calculation */}
                        {bonusData.minDeposit > 0 && bonusData.percentage > 0 && (
                          <div className="bg-emerald-500/5 p-4 rounded-lg border border-emerald-500/20">
                            <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-2">Example Calculation</h3>
                            <p className="text-xs text-gray-300">
                              Deposit <span className="text-white font-bold">{bonusData.minDeposit.toFixed(2)} BDT</span> 
                              → Get <span className="text-emerald-400 font-bold">
                                {calculateBonusFromPercentage().toFixed(2)} BDT
                              </span> bonus
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dates Card */}
                <div className="bg-[#161B22] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-amber-500"></div> <FaCalendarAlt className="text-amber-400" /> Date Information
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Start Date</h3>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {formatDate(bonusData.startDate)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Created At</h3>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {formatDate(bonusData.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">End Date</h3>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                            <span className={`text-base font-bold ${bonusData.endDate ? 'text-white' : 'text-gray-500'}`}>
                              {bonusData.endDate ? formatDate(bonusData.endDate) : '♾️ Never Expires'}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Last Updated</h3>
                          <div className="flex items-center">
                            <FaCalendarAlt className="text-gray-400 mr-2 text-xs" />
                            <span className="text-base font-bold text-white">
                              {formatDate(bonusData.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Validity Status */}
                    {bonusData.endDate && (
                      <div className={`mt-4 p-4 rounded-lg ${isBonusExpired() ? 'bg-rose-500/5 border border-rose-500/20' : 'bg-emerald-500/5 border border-emerald-500/20'}`}>
                        <div className="flex items-center gap-2">
                          <FaInfoCircle className={isBonusExpired() ? 'text-rose-400' : 'text-emerald-400'} />
                          <span className={`text-xs font-medium ${isBonusExpired() ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {isBonusExpired() 
                              ? 'This bonus has expired.' 
                              : `This bonus expires on ${formatDate(bonusData.endDate)}.`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Stats & Actions */}
              <div className="space-y-6">
                {/* Bonus Value Summary */}
                <div className="bg-[#161B22] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-amber-500"></div> Bonus Value
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 p-4 rounded-lg border border-amber-500/20">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Bonus Value</h3>
                        <div className="flex items-baseline">
                          <span className="text-xl font-bold text-amber-400">
                            {bonusData.amount > 0 
                              ? `${bonusData.amount.toFixed(2)} BDT` 
                              : bonusData.percentage > 0 
                              ? `${bonusData.percentage}% up to ${bonusData.maxBonus ? bonusData.maxBonus.toFixed(2) + ' BDT' : 'No Limit'}`
                              : 'No Value Set'
                            }
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Effective Value</h3>
                        <p className="text-sm font-bold text-white">
                          {bonusData.percentage > 0 
                            ? `${bonusData.percentage}% of deposit`
                            : `${bonusData.amount.toFixed(2)} BDT fixed`
                          }
                        </p>
                      </div>

                      <div className="bg-[#1C2128] p-4 rounded-lg border border-gray-800">
                        <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Activation Condition</h3>
                        <p className="text-xs text-gray-300">
                          Minimum deposit of {bonusData.minDeposit > 0 ? `${bonusData.minDeposit.toFixed(2)} BDT` : 'any amount'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-[#161B22] border border-gray-800 rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                      <div className="w-1 h-4 bg-amber-500"></div> Quick Stats
                    </h2>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Wagering Requirement</span>
                        <span className="font-bold text-amber-400">{bonusData.wageringRequirement}x</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Validity Period</span>
                        <span className="font-bold text-white">{bonusData.validityDays} days</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-800">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Minimum Deposit</span>
                        <span className="font-bold text-white">{bonusData.minDeposit.toFixed(2)} BDT</span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Assigned Users</span>
                        <span className="font-bold text-white">{getAssignmentDisplay()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bonus Preview */}
                <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 rounded-xl border border-amber-500/20 p-6">
                  <h2 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
                    <div className="w-1 h-4 bg-amber-500"></div> <FaGift className="text-amber-400" /> Bonus Preview
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="bg-[#0F111A] p-4 rounded-lg border border-gray-800">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Bonus Type</h3>
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        {getBonusTypeIcon(bonusData.bonusType)} {formatBonusType(bonusData.bonusType)}
                      </p>
                    </div>
                    
                    <div className="bg-[#0F111A] p-4 rounded-lg border border-gray-800">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">Bonus Code</h3>
                      <p className="text-base font-bold text-white font-mono">
                        {bonusData.bonusCode || 'AUTO-GENERATED'}
                      </p>
                    </div>
                    
                    <div className="bg-[#0F111A] p-4 rounded-lg border border-gray-800">
                      <h3 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">For Players</h3>
                      <p className="text-xs text-gray-300">
                        {bonusData.minDeposit > 0 && bonusData.percentage > 0 ? (
                          <>
                            Deposit {bonusData.minDeposit.toFixed(2)} BDT and get {bonusData.percentage}% bonus
                            {bonusData.maxBonus && ` up to ${bonusData.maxBonus.toFixed(2)} BDT`}
                          </>
                        ) : bonusData.amount > 0 ? (
                          `Get ${bonusData.amount.toFixed(2)} BDT bonus`
                        ) : (
                          'Bonus details not specified'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Users List Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm p-4">
          <div className="bg-[#161B22] border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#1C2128]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                <FaUserPlus /> Assigned Users ({assignedUsersList.length})
              </h3>
              <button onClick={() => setShowUsersModal(false)} className="text-gray-500 hover:text-gray-300">
                <FaTimes />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {assignedUsersList.length === 0 ? (
                <div className="text-center py-8">
                  <FaUsers className="text-4xl text-gray-600 mx-auto mb-3" />
                  <p className="text-xs text-gray-500">No users assigned to this bonus</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedUsersList.map((user, index) => (
                    <div key={user._id || index} className="flex items-center gap-3 p-3 bg-[#0F111A] border border-gray-800 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                        <FaUser className="text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-bold text-white">{user.username || 'Unknown User'}</p>
                            <p className="text-[10px] text-gray-500">{user.email || 'No email'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-mono text-gray-400">ID: {user.player_id || user._id}</p>
                            <p className="text-[9px] text-gray-600 capitalize">{user.role || 'User'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-800 bg-[#1C2128] flex justify-end">
              <button
                onClick={() => setShowUsersModal(false)}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Viewbonus;