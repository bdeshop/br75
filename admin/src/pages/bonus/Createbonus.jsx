import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt, FaPercentage, FaGift, FaSpinner, FaInfoCircle, FaUsers, FaUserCheck, FaTimes } from 'react-icons/fa';
import { FiRefreshCw } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { FaBangladeshiTakaSign } from "react-icons/fa6";
import axios from 'axios';
import { FaSearch } from "react-icons/fa";

const Createbonus = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchUserTerm, setSearchUserTerm] = useState('');
  const [assignToAll, setAssignToAll] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    bonusCode: '',
    bonusType: 'deposit',
    amount: 0,
    percentage: 0,
    minDeposit: 0,
    maxBonus: null,
    wageringRequirement: 0,
    validityDays: 30,
    status: 'active',
    applicableTo: 'all',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    noEndDate: true,
  });
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;
  const bonusTypes = ['welcome', 'deposit', 'reload', 'cashback', 'free_spin', 'special', 'manual'];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Fetch users for selection
  useEffect(() => {
    if (showUserSelector && users.length === 0) {
      fetchUsers();
    }
  }, [showUserSelector]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${base_url}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'noEndDate') {
      setFormData((prev) => ({ 
        ...prev, 
        noEndDate: checked,
        endDate: checked ? '' : prev.endDate 
      }));
      if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
      return;
    }
    
    const processedValue = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const generateBonusCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData((prev) => ({ ...prev, bonusCode: code }));
  };

  // User selection handlers
  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAllUsers = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user._id));
    }
  };

  const getFilteredUsers = () => {
    if (!searchUserTerm) return users;
    return users.filter(user => 
      user.username?.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchUserTerm.toLowerCase()) ||
      user.player_id?.toLowerCase().includes(searchUserTerm.toLowerCase())
    );
  };

  const removeSelectedUser = (userId) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId));
  };

  const getSelectedUserNames = () => {
    return users.filter(user => selectedUsers.includes(user._id));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Bonus name is required';
    else if (formData.name.length < 3) newErrors.name = 'Bonus name must be at least 3 characters';
    
    if (formData.amount <= 0 && formData.percentage <= 0) {
      newErrors.amount = 'Either amount or percentage must be greater than 0';
      newErrors.percentage = 'Either amount or percentage must be greater than 0';
    }
    if (formData.amount < 0) newErrors.amount = 'Amount cannot be negative';
    if (formData.percentage < 0) newErrors.percentage = 'Percentage cannot be negative';
    else if (formData.percentage > 500) newErrors.percentage = 'Percentage cannot exceed 500%';
    if (formData.minDeposit < 0) newErrors.minDeposit = 'Minimum deposit cannot be negative';
    if (formData.maxBonus !== null && formData.maxBonus < 0) newErrors.maxBonus = 'Maximum bonus cannot be negative';
    if (formData.wageringRequirement < 0) newErrors.wageringRequirement = 'Wagering requirement cannot be negative';
    else if (formData.wageringRequirement > 100) newErrors.wageringRequirement = 'Wagering requirement cannot exceed 100x';
    if (formData.validityDays <= 0) newErrors.validityDays = 'Validity days must be greater than 0';
    else if (formData.validityDays > 365) newErrors.validityDays = 'Validity days cannot exceed 365 days';
    
    if (!formData.noEndDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    if (!assignToAll && selectedUsers.length === 0) {
      newErrors.users = 'Please select at least one user or assign to all users';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { 
      toast.error('Please fix the form errors before submitting'); 
      return; 
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        amount: formData.amount || 0,
        percentage: formData.percentage || 0,
        maxBonus: formData.maxBonus === '' ? null : formData.maxBonus,
        endDate: formData.noEndDate ? null : (formData.endDate || null),
        assignToAll: assignToAll,
        selectedUsers: assignToAll ? [] : selectedUsers,
      };
      
      const response = await fetch(`${base_url}/api/admin/bonuses`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create bonus');
      
      toast.success(`Bonus created successfully and assigned to ${assignToAll ? 'all users' : `${selectedUsers.length} user(s)`}!`);
      
      // Reset form
      setFormData({
        name: '', bonusCode: '', bonusType: 'deposit', amount: 0, percentage: 0,
        minDeposit: 0, maxBonus: null, wageringRequirement: 0, validityDays: 30,
        status: 'active', applicableTo: 'all', startDate: new Date().toISOString().split('T')[0], 
        endDate: '', noEndDate: true,
      });
      setSelectedUsers([]);
      setAssignToAll(true);
      
      // Navigate back after 2 seconds
      setTimeout(() => navigate('/admin/bonuses'), 2000);
      
    } catch (error) {
      toast.error(error.message || 'Failed to create bonus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateBonusFromPercentage = () => {
    if (formData.percentage > 0 && formData.minDeposit > 0) {
      const calculated = (formData.minDeposit * formData.percentage) / 100;
      if (formData.maxBonus && calculated > formData.maxBonus) return formData.maxBonus;
      return calculated;
    }
    return formData.amount;
  };

  const formatBonusType = (type) => type.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const getBonusTypeIcon = (type) => {
    const icons = { welcome: '🎉', deposit: '💰', reload: '🔄', cashback: '💸', free_spin: '🎰', special: '⭐', manual: '✏️' };
    return icons[type] || '🎁';
  };

  const inputClass = (field) =>
    `w-full bg-[#0F111A] border ${errors[field] ? 'border-rose-500' : 'border-gray-700'} text-gray-200 text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 placeholder-gray-600 transition-colors`;

  const labelClass = 'block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2';

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
              <h1 className="text-2xl font-semibold text-white tracking-tighter uppercase">Create New Bonus</h1>
              <p className="text-xs font-bold text-gray-500 mt-1 flex items-center gap-2">
                <FaCalendarAlt className="text-amber-500" /> Create attractive bonuses to engage and reward your players
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 md:mt-0 bg-[#1F2937] hover:bg-[#374151] border border-gray-700 px-5 py-2 rounded font-bold text-xs transition-all flex items-center gap-2 text-gray-400"
            >
              ← Back to List
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Left Column */}
              <div className="space-y-5">

                {/* Bonus Name */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> Basic Info
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Bonus Name <span className="text-rose-400">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Welcome Bonus 2024" className={inputClass('name')} />
                      {errors.name && <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1"><FaInfoCircle /> {errors.name}</p>}
                    </div>

                    {/* Bonus Code */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className={labelClass + ' mb-0'}>Bonus Code</label>
                        <button type="button" onClick={generateBonusCode} className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1">
                          <FaPlus className="text-[9px]" /> Generate
                        </button>
                      </div>
                      <input type="text" name="bonusCode" value={formData.bonusCode} onChange={handleInputChange} placeholder="WELCOME2024 (auto-generated if blank)" className={inputClass('bonusCode') + ' uppercase'} maxLength={20} />
                      <p className="mt-1 text-[10px] text-gray-600">Uppercase letters and numbers only. Auto-generated code is 8 characters.</p>
                    </div>

                    {/* Applicable To - Modified for user selection */}
                    <div>
                      <label className={labelClass}>Assign Bonus To</label>
                      <div className="flex gap-2 mb-3">
                        <button 
                          type="button"
                          onClick={() => { setAssignToAll(true); setShowUserSelector(false); }}
                          className={`flex-1 py-2 rounded text-xs font-bold border transition-all uppercase tracking-wide ${assignToAll ? 'bg-amber-600 border-amber-500 text-white' : 'bg-[#0F111A] border-gray-700 text-gray-400 hover:border-amber-500/50'}`}
                        >
                          <FaUsers className="inline mr-1" /> All Users
                        </button>
                        <button 
                          type="button"
                          onClick={() => { setAssignToAll(false); setShowUserSelector(true); }}
                          className={`flex-1 py-2 rounded text-xs font-bold border transition-all uppercase tracking-wide ${!assignToAll ? 'bg-amber-600 border-amber-500 text-white' : 'bg-[#0F111A] border-gray-700 text-gray-400 hover:border-amber-500/50'}`}
                        >
                          <FaUserCheck className="inline mr-1" /> Specific Users
                        </button>
                      </div>
                      
                      {!assignToAll && (
                        <div>
                          <button
                            type="button"
                            onClick={() => setShowUserSelector(!showUserSelector)}
                            className="w-full py-2 bg-[#0F111A] border border-gray-700 rounded text-xs text-gray-400 hover:border-amber-500/50 transition-all flex items-center justify-center gap-2"
                          >
                            <FaUsers /> {selectedUsers.length > 0 ? `${selectedUsers.length} User(s) Selected` : 'Select Users'}
                          </button>
                          
                          {/* Selected Users Tags */}
                          {selectedUsers.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {getSelectedUserNames().map(user => (
                                <div key={user._id} className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
                                  <span className="text-xs text-amber-400">{user.username}</span>
                                  <button type="button" onClick={() => removeSelectedUser(user._id)} className="text-gray-500 hover:text-rose-400">
                                    <FaTimes size={10} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {errors.users && <p className="mt-1.5 text-xs text-rose-400 flex items-center gap-1"><FaInfoCircle /> {errors.users}</p>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Selection Modal */}
                {showUserSelector && !assignToAll && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] backdrop-blur-sm p-4">
                    <div className="bg-[#161B22] border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-[#1C2128]">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-400">Select Users</h3>
                        <button onClick={() => setShowUserSelector(false)} className="text-gray-500 hover:text-gray-300">
                          <FaTimes />
                        </button>
                      </div>
                      
                      <div className="p-4 border-b border-gray-800">
                        <div className="relative">
                          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                          <input
                            type="text"
                            value={searchUserTerm}
                            onChange={(e) => setSearchUserTerm(e.target.value)}
                            className="w-full bg-[#0F111A] border border-gray-700 text-gray-200 text-xs rounded-lg px-3 py-2 pl-8 focus:outline-none focus:border-amber-500"
                            placeholder="Search users by name, email or player ID..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4">
                        {loadingUsers ? (
                          <div className="text-center py-8">
                            <FaSpinner className="animate-spin text-amber-400 mx-auto text-2xl" />
                            <p className="text-xs text-gray-500 mt-2">Loading users...</p>
                          </div>
                        ) : (
                          <>
                            <div className="mb-3 flex justify-between items-center">
                              <button
                                type="button"
                                onClick={handleSelectAllUsers}
                                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold uppercase"
                              >
                                {selectedUsers.length === getFilteredUsers().length ? 'Deselect All' : 'Select All'}
                              </button>
                              <span className="text-[9px] text-gray-500">{selectedUsers.length} selected</span>
                            </div>
                            <div className="space-y-2">
                              {getFilteredUsers().map(user => (
                                <label key={user._id} className="flex items-center gap-3 p-3 bg-[#0F111A] border border-gray-800 rounded-lg cursor-pointer hover:border-amber-500/30 transition-all">
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => handleUserSelection(user._id)}
                                    className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                                  />
                                  <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-bold text-white">{user.username}</p>
                                        <p className="text-[10px] text-gray-500">{user.email}</p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[10px] font-mono text-gray-400">ID: {user.player_id}</p>
                                        <p className="text-[9px] text-gray-600 capitalize">{user.role}</p>
                                      </div>
                                    </div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="px-6 py-4 border-t border-gray-800 bg-[#1C2128] flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setShowUserSelector(false)}
                          className="px-4 py-2 bg-[#0F111A] border border-gray-700 text-gray-300 rounded text-xs font-bold hover:border-gray-500 transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowUserSelector(false)}
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold transition-all"
                        >
                          Done ({selectedUsers.length})
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bonus Type */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> Bonus Type
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {bonusTypes.map((type) => (
                      <button key={type} type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, bonusType: type }))}
                        className={`p-3 rounded-lg border transition-all flex flex-col items-center justify-center gap-2 ${
                          formData.bonusType === type ? 'border-amber-500 bg-amber-500/10 text-amber-400' : 'border-gray-700 bg-[#0F111A] text-gray-500 hover:border-amber-500/40 hover:text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{getBonusTypeIcon(type)}</span>
                        <span className="text-[10px] font-bold">{formatBonusType(type)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount & Percentage */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> Value Settings
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Fixed Amount (BDT)</label>
                      <div className="relative">
                        <FaBangladeshiTakaSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                        <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} min="0" step="0.01" className={inputClass('amount') + ' pl-8'} />
                      </div>
                      {errors.amount && <p className="mt-1 text-xs text-rose-400">{errors.amount}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Percentage (%)</label>
                      <div className="relative">
                        <FaPercentage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                        <input type="number" name="percentage" value={formData.percentage} onChange={handleInputChange} min="0" max="500" step="0.1" className={inputClass('percentage') + ' pl-8'} />
                      </div>
                      {errors.percentage && <p className="mt-1 text-xs text-rose-400">{errors.percentage}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Min Deposit (BDT)</label>
                      <input type="number" name="minDeposit" value={formData.minDeposit} onChange={handleInputChange} min="0" step="0.01" className={inputClass('minDeposit')} />
                      {errors.minDeposit && <p className="mt-1 text-xs text-rose-400">{errors.minDeposit}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Max Bonus (BDT)</label>
                      <input type="number" name="maxBonus" value={formData.maxBonus === null ? '' : formData.maxBonus} onChange={handleInputChange} min="0" step="0.01" placeholder="No limit" className={inputClass('maxBonus')} />
                      {errors.maxBonus && <p className="mt-1 text-xs text-rose-400">{errors.maxBonus}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">

                {/* Wagering & Validity */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> Requirements
                    </p>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className={labelClass + ' mb-0'}>Wagering Requirement</label>
                        <span className="text-lg font-black text-amber-400">{formData.wageringRequirement}x</span>
                      </div>
                      <input type="range" name="wageringRequirement" value={formData.wageringRequirement} onChange={handleInputChange} min="0" max="100" step="1"
                        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                      <div className="flex justify-between text-[10px] text-gray-600 mt-1.5">
                        <span>No Requirement</span><span>100x</span>
                      </div>
                      <p className="mt-2 text-[10px] text-gray-600">Players must wager bonus {formData.wageringRequirement} times before withdrawal</p>
                      {errors.wageringRequirement && <p className="mt-1 text-xs text-rose-400">{errors.wageringRequirement}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Validity Period (Days)</label>
                      <input type="number" name="validityDays" value={formData.validityDays} onChange={handleInputChange} min="1" max="365" className={inputClass('validityDays')} />
                      {errors.validityDays && <p className="mt-1 text-xs text-rose-400">{errors.validityDays}</p>}
                      <p className="mt-1.5 text-[10px] text-gray-600">Bonus expires after {formData.validityDays} days from activation</p>
                    </div>
                  </div>
                </div>

                {/* Dates & Status */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> Schedule & Status
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Start Date</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                          <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} min={new Date().toISOString().split('T')[0]} className={inputClass('startDate') + ' pl-8'} />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>End Date</label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                          <input 
                            type="date" 
                            name="endDate" 
                            value={formData.endDate} 
                            onChange={handleInputChange} 
                            min={formData.startDate} 
                            disabled={formData.noEndDate}
                            className={inputClass('endDate') + ' pl-8 ' + (formData.noEndDate ? 'opacity-50 cursor-not-allowed' : '')} 
                          />
                        </div>
                        {errors.endDate && <p className="mt-1 text-xs text-rose-400">{errors.endDate}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="noEndDate" 
                          checked={formData.noEndDate} 
                          onChange={handleInputChange}
                          className="w-4 h-4 rounded border-gray-700 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">No End Date (Bonus never expires)</span>
                      </label>
                    </div>
                    <div>
                      <label className={labelClass}>Status</label>
                      <div className="flex gap-3">
                        {['active', 'inactive'].map((s) => (
                          <label key={s} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="status" value={s} checked={formData.status === s} onChange={handleInputChange} className="accent-amber-500" />
                            <span className={`text-xs font-bold uppercase ${formData.status === s ? (s === 'active' ? 'text-emerald-400' : 'text-gray-400') : 'text-gray-600'}`}>{s}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-[#161B22] border border-gray-800 rounded-lg p-5">
                  <div className="bg-[#1C2128] -mx-5 -mt-5 px-5 py-3 mb-5 border-b border-gray-800">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-2">
                      <div className="w-1 h-4 bg-amber-500"></div> <FaGift className="text-amber-500" /> Bonus Preview
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {[
                      { label: 'Type', value: `${getBonusTypeIcon(formData.bonusType)} ${formatBonusType(formData.bonusType)}` },
                      { label: 'Value', value: formData.amount > 0 ? `৳${formData.amount.toFixed(2)}` : formData.percentage > 0 ? `${formData.percentage}%` : '—', valueClass: 'text-amber-400' },
                      { label: 'Wagering', value: `${formData.wageringRequirement}x`, valueClass: 'text-indigo-400' },
                    ].map((item, i) => (
                      <div key={i} className="bg-[#0F111A] border border-gray-800 p-3 rounded">
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">{item.label}</p>
                        <p className={`text-xs font-bold ${item.valueClass || 'text-white'}`}>{item.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-[#0F111A] border border-gray-800 p-3 rounded">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Assignment</p>
                      <p className="text-xs font-bold text-white">
                        {assignToAll ? '🎯 All Users' : `👥 ${selectedUsers.length} User(s)`}
                      </p>
                    </div>
                    <div className="bg-[#0F111A] border border-gray-800 p-3 rounded">
                      <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black mb-1">Expiry</p>
                      <p className="text-xs font-bold text-white">
                        {formData.noEndDate ? '♾️ Never' : formData.endDate ? `📅 ${formData.endDate}` : '❌ Not set'}
                      </p>
                    </div>
                  </div>
                  {formData.minDeposit > 0 && formData.percentage > 0 && (
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-3 rounded">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Example</p>
                      <p className="text-xs text-gray-300">Deposit <span className="text-white font-bold">৳{formData.minDeposit.toFixed(2)}</span> → Get <span className="text-emerald-400 font-bold">৳{calculateBonusFromPercentage().toFixed(2)}</span> bonus</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/bonuses')}
                className="px-8 py-3 bg-[#1F2937] hover:bg-[#374151] border border-gray-700 text-gray-300 rounded font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? <><FaSpinner className="animate-spin" /> Creating...</> : <><FaGift /> Create Bonus</>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </section>
  );
};

export default Createbonus;