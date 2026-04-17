import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [exclusiveGames, setExclusiveGames] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState({
    categories: false,
    providers: false,
    games: false,
  });

  const API_BASE_URL = import.meta.env.VITE_API_KEY_Base_URL;

  const fetchCategories = async () => {
    try {
      setIsLoading(prev => ({ ...prev, categories: true }));
      const response = await axios.get(`${API_BASE_URL}/api/categories`);
      if (response.data?.data?.length > 0) {
        setCategories(response.data.data);
        localStorage.setItem("categories", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Try to load from localStorage
      const cached = localStorage.getItem("categories");
      if (cached) setCategories(JSON.parse(cached));
    } finally {
      setIsLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const fetchProviders = async (categoryName) => {
    try {
      setIsLoading(prev => ({ ...prev, providers: true }));
      const response = await axios.get(`${API_BASE_URL}/api/providers/${categoryName}`);
      if (response.data.success) {
        setProviders(response.data.data);
        setExclusiveGames([]);
        return response.data.data;
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
      setProviders([]);
    } finally {
      setIsLoading(prev => ({ ...prev, providers: false }));
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/promotions`);
      if (response.data) {
        setPromotions(response.data.data);
        localStorage.setItem("promotions", JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    }
  };

  const value = {
    categories,
    providers,
    exclusiveGames,
    promotions,
    isLoading,
    setProviders,
    setExclusiveGames,
    fetchCategories,
    fetchProviders,
    fetchPromotions,
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};