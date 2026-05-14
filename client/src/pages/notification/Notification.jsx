import React, { useState, useEffect, useContext, useCallback } from "react";
import Sidebar from "../../components/sidebar/Sidebar";
import { Header } from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import { FiChevronDown, FiBell, FiExternalLink, FiClock, FiCheckCircle, FiCircle, FiMail, FiTrash2, FiCheck } from "react-icons/fi";
import axios from "axios";
import logo from "../../assets/logo.png";
import { LanguageContext } from "../../context/LanguageContext";
import { toast, Toaster } from "react-hot-toast";
import { IoMdMailOpen } from "react-icons/io";

const Notification = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all"); // all, unread, read
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 10
  });
  
  // Get language context
  const { language, t } = useContext(LanguageContext);
  
  // Get user and token from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('usertoken');
  
  const base_url = import.meta.env.VITE_API_KEY_Base_URL;

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${base_url}/api/user/notifications/unread-count/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setUnreadCount(response.data.data.count);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, [base_url, token]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 10, filter = selectedFilter) => {
    try {
      if (!token) {
        setError(t?.pleaseLoginToViewNotifications || "Please login to view notifications");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      let url = `${base_url}/api/user/notifications/${user.id}`;
      const params = { page, limit };
      
      if (filter === "unread") {
        params.unreadOnly = true;
      }
      
      const response = await axios.get(url, {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const responseData = response.data.data;
        
        if (responseData.notifications) {
          setNotifications(responseData.notifications);
          setPagination({
            page: responseData.pagination?.page || page,
            totalPages: responseData.pagination?.pages || 1,
            total: responseData.pagination?.total || responseData.notifications.length,
            limit: responseData.pagination?.limit || limit
          });
        } else if (Array.isArray(responseData)) {
          setNotifications(responseData);
          setPagination({
            page: 1,
            totalPages: 1,
            total: responseData.length,
            limit: limit
          });
        } else {
          setNotifications(responseData || []);
        }
      } else {
        setError(response.data.message || (t?.failedToFetchNotifications || "Failed to fetch notifications"));
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || (t?.failedToFetchNotifications || "Failed to fetch notifications");
      setError(errorMessage);
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [base_url, token, user.id, selectedFilter, t]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await axios.post(`${base_url}/api/user/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
        
        toast.success(t?.markedAsRead || "Marked as read");
      }
    } catch (err) {
      console.error("Error marking as read:", err);
      toast.error(t?.failedToMarkAsRead || "Failed to mark as read");
    }
  };

  // Mark single notification as unread
  const markAsUnread = async (notificationId) => {
    if (!token) return;
    
    try {
      const response = await axios.post(`${base_url}/api/user/notifications/${notificationId}/unread`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            notification._id === notificationId
              ? { ...notification, isRead: false, readAt: null }
              : notification
          )
        );
        
        // Update unread count
        setUnreadCount(prev => prev + 1);
        
        toast.success(t?.markedAsUnread || "Marked as unread");
      }
    } catch (err) {
      console.error("Error marking as unread:", err);
      toast.error(t?.failedToMarkAsUnread || "Failed to mark as unread");
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!token) return;
    
    try {
      const response = await axios.post(`${base_url}/api/user/notifications/read-all`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date()
          }))
        );
        
        setUnreadCount(0);
        toast.success(t?.allMarkedAsRead || "All notifications marked as read");
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
      toast.error(t?.failedToMarkAllAsRead || "Failed to mark all as read");
    }
  };

  // Bulk mark selected notifications as read
  const bulkMarkAsRead = async () => {
    if (selectedNotifications.length === 0) {
      toast.error(t?.selectNotificationsFirst || "Select notifications first");
      return;
    }
    
    try {
      const response = await axios.post(`${base_url}/api/user/notifications/bulk-read`, {
        notificationIds: selectedNotifications
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notification =>
            selectedNotifications.includes(notification._id)
              ? { ...notification, isRead: true, readAt: new Date() }
              : notification
          )
        );
        
        // Update unread count
        const newlyReadCount = notifications.filter(
          n => selectedNotifications.includes(n._id) && !n.isRead
        ).length;
        setUnreadCount(prev => Math.max(0, prev - newlyReadCount));
        
        setSelectedNotifications([]);
        setIsSelectMode(false);
        toast.success(response.data.message || `${response.data.data.markedCount} notifications marked as read`);
      }
    } catch (err) {
      console.error("Error bulk marking as read:", err);
      toast.error(t?.failedToMarkAsRead || "Failed to mark as read");
    }
  };

  // Toggle notification read status
  const toggleReadStatus = async (notificationId, currentStatus) => {
    if (currentStatus) {
      await markAsUnread(notificationId);
    } else {
      await markAsRead(notificationId);
    }
  };

  // Toggle select notification
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Select all notifications
  const selectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  // Change filter
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setSelectedNotifications([]);
    setIsSelectMode(false);
    fetchNotifications(1, pagination.limit, filter);
  };

  // Toggle dropdown
  const toggleDropdown = (id) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Load notifications on component mount and filter change
  useEffect(() => {
    if (token) {
      fetchNotifications(pagination.page, pagination.limit, selectedFilter);
      fetchUnreadCount();
    } else {
      setLoading(false);
      setError(t?.pleaseLoginToViewNotifications || "Please login to view notifications");
    }
  }, [token, selectedFilter]);

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return (t?.todayAt || 'Today at') + ' ' + date.toLocaleTimeString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays === 1) {
        return (t?.yesterdayAt || 'Yesterday at') + ' ' + date.toLocaleTimeString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (diffDays < 7) {
        return date.toLocaleDateString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        return date.toLocaleDateString(language?.code === 'bn' ? 'bn-BD' : 'en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return t?.invalidDate || "Invalid date";
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'success':
        return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'warning':
        return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'error':
        return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>;
      case 'promotional':
        return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-purple-900/30 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>;
      default:
        return <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-900/30 flex items-center justify-center">
          <FiBell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
        </div>;
    }
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'text-red-400 bg-red-900/20';
      case 'high': return 'text-orange-400 bg-orange-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-800/20';
    }
  };

  if (loading) {
    return (
      <div className="h-screen overflow-hidden font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className="w-full overflow-y-auto flex items-center justify-center">
            <div className='w-full p-[20px] flex justify-center items-center'>
              <div className="relative w-24 h-24 flex justify-center items-center">
                <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-green-500 border-r-green-500 animate-spin"></div>
                <div className="w-20 h-20 rounded-full flex justify-center items-center font-bold text-lg">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden w-full font-poppins bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-48px)] sm:h-[calc(100vh-56px)] w-full">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className="flex-1 overflow-auto w-full transition-all duration-300">
          {/* Main Content Area */}
          <div className="mx-auto overflow-y-auto pb-[100px] w-full max-w-screen-xl px-4 md:px-[50px] py-6">
            {/* Header Section */}
            <div className="flex flex-col pt-[25px] lg:pt-[50px] space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-[18px] md:text-xl sm:text-[22px] font-[600] text-white">
                  {t?.notifications || "Notifications"}
                </h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-500 text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              
              {token && notifications.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Filter Buttons */}
                  <div className="flex bg-black/20 rounded-lg p-1">
                    <button
                      onClick={() => handleFilterChange("all")}
                      className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition ${
                        selectedFilter === "all" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {t?.all || "All"}
                    </button>
                    <button
                      onClick={() => handleFilterChange("unread")}
                      className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition ${
                        selectedFilter === "unread" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {t?.unread || "Unread"}
                    </button>
                    <button
                      onClick={() => handleFilterChange("read")}
                      className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg transition ${
                        selectedFilter === "read" 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {t?.read || "Read"}
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <button
                    onClick={() => setIsSelectMode(!isSelectMode)}
                    className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 transition"
                  >
                    {isSelectMode ? t?.cancel || "Cancel" : t?.select || "Select"}
                  </button>
                  
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-green-600/20 hover:bg-green-600/30 text-green-400 transition flex items-center gap-1"
                    >
                      <FiCheckCircle className="text-xs" />
                      {t?.markAllAsRead || "Mark all read"}
                    </button>
                  )}
                  
                  {isSelectMode && selectedNotifications.length > 0 && (
                    <button
                      onClick={bulkMarkAsRead}
                      className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-blue-600 text-white transition flex items-center gap-1"
                    >
                      <FiCheck className="text-xs" />
                      {t?.markSelectedRead || `Mark ${selectedNotifications.length} read`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {!token ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-[#2a2a2a] rounded-lg p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#222] mb-3 sm:mb-4">
                  <FiBell className="text-lg sm:text-xl text-gray-500" />
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">{t?.authenticationRequired || "Authentication Required"}</h3>
                <p className="text-gray-400 mb-3 sm:mb-4 text-xs sm:text-sm">{t?.pleaseLoginToViewNotifications || "Please log in to view your notifications"}</p>
                <a 
                  href="/login" 
                  className="inline-block px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition-all duration-300 shadow-lg shadow-blue-500/20 text-xs sm:text-sm"
                >
                  {t?.signIn || "Sign In"}
                </a>
              </div>
            ) : error ? (
              <div className="bg-gradient-to-br from-[#1a1a1a] to-[#151515] border border-red-500/20 rounded-lg p-4 sm:p-6 text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-900/30 mb-3 sm:mb-4">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-400 text-xs sm:text-sm">{error}</p>
                <button
                  onClick={() => fetchNotifications(pagination.page, pagination.limit, selectedFilter)}
                  className="mt-3 px-4 py-2 text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                >
                  {t?.retry || "Retry"}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 sm:p-6 text-center max-w-sm sm:max-w-md mx-auto">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#222] mb-3 sm:mb-4">
                  {selectedFilter === "unread" ? (
                    <IoMdMailOpen  className="text-lg sm:text-xl text-gray-500" />
                  ) : (
                    <FiBell className="text-lg sm:text-xl text-gray-500" />
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-medium mb-2">
                  {selectedFilter === "unread" 
                    ? (t?.noUnreadNotifications || "No unread notifications")
                    : selectedFilter === "read"
                    ? (t?.noReadNotifications || "No read notifications")
                    : (t?.noNotificationsYet || "No notifications yet")}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm">
                  {selectedFilter === "unread"
                    ? (t?.allNotificationsRead || "You've read all your notifications")
                    : (t?.weWillNotifyYou || "We'll notify you when something important happens.")}
                </p>
              </div>
            ) : (
              <>
                {/* Notifications List */}
                <div className="space-y-2 sm:space-y-3">
                  {notifications.map((notification) => (
                    <div 
                      key={notification._id} 
                      className={`bg-gradient-to-br from-[#1a1a1a] to-[#151515] border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                        !notification.isRead 
                          ? 'border-blue-500/50 bg-gradient-to-r from-blue-900/10 to-transparent' 
                          : 'border-[#2a2a2a] hover:border-[#3a3a3a]'
                      }`}
                    >
                      <div className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          {/* Select Checkbox (when in select mode) */}
                          {isSelectMode && (
                            <div className="flex-shrink-0 pt-1">
                              <input
                                type="checkbox"
                                checked={selectedNotifications.includes(notification._id)}
                                onChange={() => toggleSelectNotification(notification._id)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                              />
                            </div>
                          )}
                          
                          {/* Notification Icon */}
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          
                          {/* Notification Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                  <h2 className={`text-sm sm:text-base font-medium ${
                                    !notification.isRead ? 'text-white' : 'text-gray-300'
                                  }`}>
                                    {notification.title}
                                  </h2>
                                  
                                  {/* Priority Badge */}
                                  {notification.priority && notification.priority !== 'medium' && (
                                    <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${getPriorityColor(notification.priority)}`}>
                                      {notification.priority}
                                    </span>
                                  )}
                                  
                                  {/* Unread Badge */}
                                  {!notification.isRead && (
                                    <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                      {t?.new || "New"}
                                    </span>
                                  )}
                                </div>
                                
                                <p className="text-gray-400 text-xs sm:text-sm break-words">
                                  {notification.message}
                                </p>
                                
                                {/* Footer with date and action buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-gray-800/50">
                                  <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
                                    <FiClock className="text-xs" />
                                    <span>{formatDate(notification.createdAt)}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {notification.actionUrl && (
                                      <a
                                        href={notification.actionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <FiExternalLink className="text-xs" />
                                        {t?.viewDetails || "View Details"}
                                      </a>
                                    )}
                                    
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleReadStatus(notification._id, notification.isRead);
                                      }}
                                      className={`text-[10px] sm:text-xs flex items-center gap-1 transition ${
                                        notification.isRead 
                                          ? 'text-gray-500 hover:text-blue-400' 
                                          : 'text-blue-400 hover:text-blue-300'
                                      }`}
                                    >
                                      {notification.isRead ? (
                                        <>
                                          <FiMail className="text-xs" />
                                          {t?.markAsUnread || "Mark unread"}
                                        </>
                                      ) : (
                                        <>
                                          <IoMdMailOpen  className="text-xs" />
                                          {t?.markAsRead || "Mark read"}
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                    <p className="text-gray-400 text-[10px] sm:text-xs">
                      {t?.showing || "Showing"} {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} {t?.of || "of"} {pagination.total} {t?.notifications || "notifications"}
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => fetchNotifications(pagination.page - 1, pagination.limit, selectedFilter)}
                        disabled={pagination.page === 1}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] border border-[#2a2a2a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                      >
                        {t?.previous || "Previous"}
                      </button>
                      
                      <span className="px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm text-gray-400">
                        {pagination.page} / {pagination.totalPages}
                      </span>
                      
                      <button
                        onClick={() => fetchNotifications(pagination.page + 1, pagination.limit, selectedFilter)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-gradient-to-br from-[#121212] via-[#1a2344] to-[#1e2b5e] border border-[#2a2a2a] hover:bg-[#222] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm"
                      >
                        {t?.next || "Next"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notification;