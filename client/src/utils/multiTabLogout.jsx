// utils/multiTabLogout.js
class MultiTabLogout {
  constructor() {
    this.isLoggingOut = false;
    this.channel = null;
    this.tabId = null;
    this.activeTabs = new Set();
  }

  init(onLogout) {
    this.onLogout = onLogout;
    this.tabId = this.generateTabId();
    
    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel !== 'undefined') {
      this.setupBroadcastChannel();
    } else {
      // Fallback for older browsers using localStorage
      this.setupLocalStorageFallback();
    }
    
    this.setupBeforeUnload();
    this.setupPageHide();
    this.registerTab();
  }

  generateTabId() {
    return `${Date.now()}-${Math.random()}-${sessionStorage.getItem('tabId')}`;
  }

  setupBroadcastChannel() {
    // Create a channel for cross-tab communication
    this.channel = new BroadcastChannel('tab-tracker');
    
    // Listen for messages from other tabs
    this.channel.onmessage = (event) => {
      const { type, tabId } = event.data;
      
      if (type === 'REGISTER_TAB') {
        this.activeTabs.add(tabId);
      } else if (type === 'UNREGISTER_TAB') {
        this.activeTabs.delete(tabId);
      } else if (type === 'REQUEST_TAB_COUNT') {
        // Respond with current tab count
        this.channel.postMessage({
          type: 'TAB_COUNT_RESPONSE',
          count: this.activeTabs.size,
          requesterId: tabId
        });
      }
    };
    
    // Announce new tab
    this.channel.postMessage({
      type: 'REGISTER_TAB',
      tabId: this.tabId
    });
  }

  setupLocalStorageFallback() {
    // Use localStorage for cross-tab communication in older browsers
    const storageHandler = (e) => {
      if (e.key === 'active_tabs') {
        try {
          const tabs = JSON.parse(e.newValue || '[]');
          this.activeTabs = new Set(tabs);
        } catch (error) {
          console.error('Error parsing active tabs:', error);
        }
      }
    };
    
    window.addEventListener('storage', storageHandler);
    this.storageHandler = storageHandler;
  }

  registerTab() {
    // Get existing tabs from localStorage
    const existingTabs = localStorage.getItem('active_tabs');
    let tabs = [];
    
    if (existingTabs) {
      try {
        tabs = JSON.parse(existingTabs);
      } catch (error) {
        console.error('Error parsing tabs:', error);
      }
    }
    
    // Add current tab if not already present
    if (!tabs.includes(this.tabId)) {
      tabs.push(this.tabId);
    }
    
    // Update localStorage
    localStorage.setItem('active_tabs', JSON.stringify(tabs));
    this.activeTabs = new Set(tabs);
  }

  unregisterTab() {
    // Get existing tabs from localStorage
    const existingTabs = localStorage.getItem('active_tabs');
    if (existingTabs) {
      try {
        let tabs = JSON.parse(existingTabs);
        // Remove current tab
        tabs = tabs.filter(id => id !== this.tabId);
        
        // Update localStorage
        localStorage.setItem('active_tabs', JSON.stringify(tabs));
        this.activeTabs = new Set(tabs);
        
        // Notify other tabs via BroadcastChannel
        if (this.channel) {
          this.channel.postMessage({
            type: 'UNREGISTER_TAB',
            tabId: this.tabId
          });
        }
        
        return tabs.length;
      } catch (error) {
        console.error('Error parsing tabs:', error);
      }
    }
    return 0;
  }

  setupBeforeUnload() {
    window.addEventListener('beforeunload', (event) => {
      if (!this.isAuthenticated() || this.isLoggingOut) return;
      
      // Unregister this tab and get remaining tab count
      const remainingTabs = this.unregisterTab();
      
      // Only logout if this is the LAST tab (0 remaining tabs)
      if (remainingTabs === 0) {
        this.isLoggingOut = true;
        
        // Send logout beacon
        this.sendLogoutBeacon();
        
        // Clear storage
        this.clearStorage();
        
        // Show confirmation (optional)
        event.preventDefault();
        event.returnValue = 'You are closing the last tab. Your session will be closed.';
      }
    });
  }

  setupPageHide() {
    window.addEventListener('pagehide', () => {
      if (!this.isAuthenticated() || this.isLoggingOut) return;
      
      // Check if this is the last tab
      const remainingTabs = this.unregisterTab();
      
      if (remainingTabs === 0) {
        this.isLoggingOut = true;
        this.sendLogoutBeacon();
        this.clearStorage();
      }
    });
  }

  sendLogoutBeacon() {
    const token = localStorage.getItem('usertoken') || localStorage.getItem('token');
    if (!token) return;

    const baseUrl = import.meta.env.VITE_API_KEY_Base_URL;
    const formData = new FormData();
    formData.append('token', token);
    
    // Use sendBeacon for reliable delivery during page close
    navigator.sendBeacon(`${baseUrl}/api/auth/logout`, formData);
  }

  isAuthenticated() {
    return !!(localStorage.getItem('usertoken') || localStorage.getItem('token'));
  }

  clearStorage() {
    localStorage.removeItem('usertoken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('active_tabs'); // Clear the tabs tracking
    sessionStorage.clear();
  }

  // Optional: Get current number of active tabs
  getActiveTabCount() {
    return this.activeTabs.size;
  }
}

export default new MultiTabLogout();