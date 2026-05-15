import React, { useState, useEffect } from 'react';
import { 
  FaCalendarDay, FaPercentage, FaGift, FaSpinner, 
  FaInfoCircle, FaUsers, FaMoneyBillWave, FaClock, 
  FaSearch, FaCheckCircle, FaTimesCircle, FaChartLine,
  FaAward, FaHistory, FaWallet, FaDollarSign, FaArrowDown
} from 'react-icons/fa';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const DailybetBonus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bonusHistory, setBonusHistory] = useState([]);
  const [summaryStats, setSummaryStats] = useState(null);
  const [distributionResult, setDistributionResult] = useState(null);
  
  // Bonus configuration state
  const [bonusConfig, setBonusConfig] = useState({
    bonusPercentage: 10, // Changed to 10% as default for loss-based bonus
    minLossAmount: 0,    // Renamed from minBetAmount
    maxBonusAmount: null
  });
  const [showConfig, setShowConfig] = useState(false);

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Get admin info from localStorage
  const getAdminInfo = () => {
    try {
      const adminData = localStorage.getItem('adminData');
      if (adminData) {
        const admin = JSON.parse(adminData);
        return { id: admin.id, username: admin.name };
      }
      
      const token = localStorage.getItem('admintoken') || localStorage.getItem('token');
      if (token) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = JSON.parse(atob(base64));
          return {
            id: decoded.id || decoded._id || decoded.userId,
            username: decoded.username || decoded.name || decoded.email?.split('@')[0] || 'admin'
          };
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
      
      return { id: 'admin', username: 'admin' };
    } catch (error) {
      console.error('Error getting admin info:', error);
      return { id: 'admin', username: 'admin' };
    }
  };

  // Fetch eligible users for daily bonus based on loss amount
  const fetchEligibleUsers = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('admintoken') || localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/admin/bonus/daily/eligible-users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          bonusPercentage: bonusConfig.bonusPercentage,
          minLossAmount: bonusConfig.minLossAmount,
          maxBonusAmount: bonusConfig.maxBonusAmount
        }
      });
      
      if (response.data.success) {
        setEligibleUsers(response.data.data?.users || []);
        setSummaryStats(response.data.data?.totals);
      }
    } catch (error) {
      console.error('Error fetching eligible users:', error);
      toast.error('Failed to fetch eligible users');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch bonus history
  const fetchBonusHistory = async () => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem('admintoken') || localStorage.getItem('token');
      const response = await axios.get(`${base_url}/api/admin/bonus/history`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { bonusType: 'daily', limit: 50 }
      });
      
      if (response.data.success) {
        const dailyBonuses = response.data.data.filter(b => b.bonusType === 'daily');
        setBonusHistory(dailyBonuses);
      }
    } catch (error) {
      console.error('Error fetching bonus history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchEligibleUsers();
    fetchBonusHistory();
  }, [bonusConfig]);

  // Filter users based on search term
  const getFilteredUsers = () => {
    if (!searchTerm.trim()) return eligibleUsers;
    
    const search = searchTerm.toLowerCase();
    return eligibleUsers.filter(user => 
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.player_id?.toLowerCase().includes(search)
    );
  };

  // Distribute Daily Bonus based on loss amount
  const handleDailyBonus = async () => {
    if (bonusConfig.bonusPercentage <= 0) {
      toast.error('Bonus percentage must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setDistributionResult(null);
    
    try {
      const token = localStorage.getItem('admintoken') || localStorage.getItem('token');
      const adminInfo = getAdminInfo();
      
      const response = await axios.post(`${base_url}/api/admin/bonus/daily`, 
        {
          bonusPercentage: bonusConfig.bonusPercentage,
          minLossAmount: bonusConfig.minLossAmount > 0 ? bonusConfig.minLossAmount : null,
          maxBonusAmount: bonusConfig.maxBonusAmount > 0 ? bonusConfig.maxBonusAmount : null,
          processedBy: adminInfo.username,
          notes: 'Daily loss-based bonus distribution',
          bonusType: 'loss_based' // Indicate this is loss-based bonus
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      if (response.data.success) {
        toast.success(response.data.message);
        setDistributionResult({
          success: true,
          data: response.data.data
        });
        fetchEligibleUsers();
        fetchBonusHistory();
      } else {
        toast.error(response.data.message);
        setDistributionResult({
          success: false,
          message: response.data.message
        });
      }
    } catch (error) {
      console.error('Error distributing daily bonus:', error);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to distribute daily bonus';
      toast.error(errorMsg);
      setDistributionResult({
        success: false,
        message: errorMsg
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = getFilteredUsers();
  const totalPotentialBonus = filteredUsers.reduce((sum, user) => sum + (user.potentialBonus || 0), 0);
  const totalLossAmount = filteredUsers.reduce((sum, user) => sum + (user.dailyLossAmount || 0), 0);

  return (
    <section className="min-h-screen bg-[#0F111A] text-gray-200 font-poppins">
      <Header toggleSidebar={toggleSidebar} />
      <Toaster toastOptions={{ style: { background: '#161B22', color: '#e5e7eb', border: '1px solid #374151' } }} />
      <div className="flex pt-[10vh]">
        <Sidebar isOpen={isSidebarOpen} />
        <main className={`transition-all duration-300 flex-1 p-6 overflow-y-auto h-[90vh] ${isSidebarOpen ? 'md:ml-[40%] lg:ml-[28%] xl:ml-[17%]' : 'ml-0'}`}>

          {/* Page Header */}
          <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-white tracking-tighter uppercase">Daily Loss Bonus</h1>
              <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-2">
                <FaArrowDown className="text-rose-500" /> Automatically distribute daily bonuses based on user's daily loss amount
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => setShowConfig(!showConfig)}
                className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] rounded-lg hover:bg-[#374151] transition-colors text-sm"
              >
                <FiSettings className="text-amber-400" /> Configure Bonus
              </button>
              <button
                onClick={() => { fetchEligibleUsers(); fetchBonusHistory(); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] rounded-lg hover:bg-[#374151] transition-colors text-sm"
              >
                <FiRefreshCw className="text-amber-400" /> Refresh
              </button>
            </div>
          </div>

          {/* Bonus Configuration Panel */}
          {showConfig && (
            <div className="mb-6 bg-[#161B22] border border-amber-500/30 rounded-lg p-5">
              <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <FiSettings /> Loss Bonus Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Bonus Percentage (%)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={bonusConfig.bonusPercentage}
                    onChange={(e) => setBonusConfig({...bonusConfig, bonusPercentage: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0F111A] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[9px] text-gray-600 mt-1">Percentage of loss amount to give as bonus</p>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Minimum Loss Amount (Optional)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={bonusConfig.minLossAmount}
                    onChange={(e) => setBonusConfig({...bonusConfig, minLossAmount: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[#0F111A] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[9px] text-gray-600 mt-1">Users must lose at least this amount</p>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Maximum Bonus Amount (Optional)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={bonusConfig.maxBonusAmount || ''}
                    onChange={(e) => setBonusConfig({...bonusConfig, maxBonusAmount: e.target.value ? parseFloat(e.target.value) : null})}
                    className="w-full bg-[#0F111A] border border-gray-700 text-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[9px] text-gray-600 mt-1">Maximum bonus per user</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary Stats Cards */}
          {summaryStats && summaryStats.totalUsers > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-amber-900/20 to-amber-800/10 border border-amber-500/20 rounded-lg p-4">
                <p className="text-[9px] text-gray-500 uppercase font-black">Eligible Users</p>
                <p className="text-2xl font-bold text-amber-400">{summaryStats.totalUsers}</p>
              </div>
              <div className="bg-gradient-to-br from-rose-900/20 to-rose-800/10 border border-rose-500/20 rounded-lg p-4">
                <p className="text-[9px] text-gray-500 uppercase font-black">Total Loss Amount</p>
                <p className="text-2xl font-bold text-white">৳{totalLossAmount.toLocaleString() || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-800/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-[9px] text-gray-500 uppercase font-black">Bonus Rate</p>
                <p className="text-2xl font-bold text-emerald-400">{bonusConfig.bonusPercentage}%</p>
              </div>
              <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border border-purple-500/20 rounded-lg p-4">
                <p className="text-[9px] text-gray-500 uppercase font-black">Total Bonus to Distribute</p>
                <p className="text-2xl font-bold text-purple-400">৳{totalPotentialBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Distribute Bonus */}
            <div className="lg:col-span-2 space-y-5">

              {/* Distribute Bonus Section */}
              <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <div className="w-1 h-4 bg-amber-500"></div> 
                    <FaArrowDown className="text-rose-500" /> 
                    Distribute Loss-Based Daily Bonus
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <FaPercentage className="text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Loss Bonus Rate: {bonusConfig.bonusPercentage}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Users receive {bonusConfig.bonusPercentage}% of their daily loss amount directly to their balance
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-center text-xs">
                      <div className="p-2 bg-[#0F111A] rounded">
                        <p className="text-gray-500">Min Loss Amount</p>
                        <p className="text-rose-400 font-bold">{bonusConfig.minLossAmount > 0 ? `৳${bonusConfig.minLossAmount}` : 'No minimum'}</p>
                      </div>
                      <div className="p-2 bg-[#0F111A] rounded">
                        <p className="text-gray-500">Max Bonus</p>
                        <p className="text-amber-400 font-bold">{bonusConfig.maxBonusAmount ? `৳${bonusConfig.maxBonusAmount}` : 'Unlimited'}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleDailyBonus}
                    disabled={isSubmitting || (summaryStats?.totalUsers === 0)}
                    className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <><FaSpinner className="animate-spin" /> Distributing Loss Bonus...</>
                    ) : (
                      <><FaGift /> Distribute Daily Loss Bonus Now</>
                    )}
                  </button>

                  {summaryStats?.totalUsers === 0 && (
                    <p className="text-center text-xs text-gray-500 mt-2">
                      No eligible users found for loss-based daily bonus
                    </p>
                  )}
                </div>
              </div>

              {/* Distribution Results */}
              {distributionResult && (
                <div className={`rounded-lg p-5 ${
                  distributionResult.success 
                    ? 'bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-500/30'
                    : 'bg-gradient-to-r from-rose-900/20 to-red-900/20 border border-rose-500/30'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    {distributionResult.success ? (
                      <FaCheckCircle className="text-emerald-400" />
                    ) : (
                      <FaTimesCircle className="text-rose-400" />
                    )}
                    <p className={`text-sm font-bold uppercase tracking-wider ${
                      distributionResult.success ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {distributionResult.success ? 'Distribution Complete' : 'Distribution Failed'}
                    </p>
                  </div>
                  
                  {distributionResult.success && distributionResult.data && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-[#0F111A] rounded">
                          <p className="text-[9px] text-gray-500 uppercase">Successful</p>
                          <p className="text-xl font-bold text-emerald-400">{distributionResult.data.successfulCount}</p>
                        </div>
                        <div className="p-3 bg-[#0F111A] rounded">
                          <p className="text-[9px] text-gray-500 uppercase">Failed</p>
                          <p className="text-xl font-bold text-rose-400">{distributionResult.data.failedCount}</p>
                        </div>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded">
                        <p className="text-[9px] text-gray-500 uppercase">Total Bonus Distributed</p>
                        <p className="text-xl font-bold text-amber-400">৳{distributionResult.data.totalBonusAmount?.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-[#0F111A] rounded">
                        <p className="text-[9px] text-gray-500 uppercase">Bonus Rate Applied</p>
                        <p className="text-xs text-gray-300">{distributionResult.data.bonusPercentage}</p>
                      </div>
                    </div>
                  )}
                  
                  {!distributionResult.success && (
                    <p className="text-sm text-gray-300">{distributionResult.message}</p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Eligible Users Preview */}
            <div className="space-y-5">
              
              {/* Eligible Users Section */}
              <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                    <div className="w-1 h-4 bg-amber-500"></div> 
                    <FaUsers className="text-amber-500" /> 
                    Eligible Users (Loss: {bonusConfig.bonusPercentage}% Bonus)
                  </p>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search users by username, email, or player ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#0F111A] border border-gray-700 text-gray-200 text-sm rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                
                {/* Users List */}
                {loadingUsers ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-amber-500 text-2xl" />
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto border border-gray-800 rounded-lg bg-[#0F111A]">
                    {filteredUsers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        {searchTerm ? 'No users found matching your search' : 'No eligible users found for today'}
                      </div>
                    ) : (
                      filteredUsers.map((user) => (
                        <div
                          key={user.userId}
                          className="p-3 border-b border-gray-800 hover:bg-[#1F2937] transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{user.username}</p>
                              <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                                {user.email && <span>{user.email}</span>}
                                {user.player_id && <span>{user.player_id}</span>}
                              </div>
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className="text-gray-500">Daily Loss:</span>
                                <span className="text-rose-400 font-medium">-৳{user.dailyLossAmount?.toLocaleString()}</span>
                              </div>
                              <div className="flex gap-4 mt-1 text-xs">
                                <span className="text-gray-500">Current Balance:</span>
                                <span className="text-white font-medium">৳{user.currentBalance?.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] text-gray-500">Bonus</p>
                              <p className="text-sm font-bold text-emerald-400">+৳{user.potentialBonus?.toFixed(2)}</p>
                              <p className="text-[9px] text-gray-500 mt-1">New Balance</p>
                              <p className="text-xs font-medium text-amber-400">৳{user.newBalance?.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </div>

          {/* Bonus History Section */}
          <div className="mt-8">
            <div className="bg-[#161B22] border border-gray-800 rounded-lg">
              <div className="bg-[#1C2128] px-5 py-3 border-b border-gray-800 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                  <FaHistory className="text-amber-500" /> Recent Loss Bonus Distribution History
                </p>
                <button
                  onClick={() => fetchBonusHistory()}
                  className="text-[10px] text-gray-500 hover:text-amber-400 transition-colors"
                >
                  <FiRefreshCw className="inline mr-1" /> Refresh
                </button>
              </div>
              <div className="overflow-x-auto p-5">
                {loadingHistory ? (
                  <div className="flex justify-center py-8">
                    <FaSpinner className="animate-spin text-amber-500 text-2xl" />
                  </div>
                ) : bonusHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No loss bonus distribution history available
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="text-[9px] text-gray-500 uppercase tracking-wider border-b border-gray-800">
                      <tr>
                        <th className="text-left py-3 px-2">Date</th>
                        <th className="text-left py-3 px-2">User</th>
                        <th className="text-left py-3 px-2">Loss Amount</th>
                        <th className="text-left py-3 px-2">Bonus Amount</th>
                        <th className="text-left py-3 px-2">Rate</th>
                        <th className="text-left py-3 px-2">Processed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonusHistory.map((bonus) => (
                        <tr key={bonus._id} className="border-b border-gray-800/50 hover:bg-[#1F2937] transition-colors">
                          <td className="py-3 px-2 text-[10px] text-gray-400">
                            {new Date(bonus.distributionDate).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2 text-xs text-white">{bonus.username}</td>
                          <td className="py-3 px-2 text-xs text-rose-400">-৳{bonus.lossAmount?.toLocaleString() || bonus.betAmount?.toLocaleString()}</td>
                          <td className="py-3 px-2 text-xs text-emerald-400">+৳{bonus.amount?.toLocaleString()}</td>
                          <td className="py-3 px-2 text-[10px] text-gray-400">{bonus.bonusRate || `${bonusConfig.bonusPercentage}%`}</td>
                          <td className="py-3 px-2 text-[10px] text-gray-400">{bonus.processedBy || 'Admin'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};

export default DailybetBonus;