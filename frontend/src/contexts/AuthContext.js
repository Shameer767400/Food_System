import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const AuthContext = createContext(null);

const getBackendUrl = () => {
  let url = process.env.REACT_APP_BACKEND_URL || 'https://food-system-backend.onrender.com';
  url = url.trim();
  
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  return url.replace(/\/$/, '');
};

export const API = `${getBackendUrl()}/api`;
console.log('Final API URL:', API);

// Create axios instance with timeout
export const api = axios.create({
  timeout: 45000, // 45 seconds for slow cold starts
});
// Add interceptors or just use the instance


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    toast.info(`Attempting login to: ${API}`, { duration: 3000 });
    const response = await api.post(`${API}/auth/login`, { email, password });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const ping = async () => {
    try {
      const start = Date.now();
      const response = await api.get(`${API}/ping`);
      const duration = Date.now() - start;
      toast.success(`Connection Active! Ping: ${duration}ms`);
      return true;
    } catch (error) {
      console.error('Ping failed:', error);
      toast.error(`Connection Failed: ${error.message}`);
      return false;
    }
  };

  const register = async (email, password, name, hostel_id) => {
    const response = await api.post(`${API}/auth/register`, {
      email,
      password,
      name,
      hostel_id
    });
    const { token: newToken, user: userData } = response.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchUser();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading, refreshUser, ping, API }}>
      {children}
    </AuthContext.Provider>
  );
};
