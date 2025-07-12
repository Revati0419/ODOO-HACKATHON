import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api'; // Assuming your api service is set up
import api from '../services/api'; // Import the api instance for setting headers

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // This function validates the token with the backend
  const validateSession = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Set auth header for the upcoming API call
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch the user's profile to confirm the token is valid
        const response = await authAPI.getProfile();
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        // If the token is invalid/expired, the API call will fail.
        console.error("Session validation failed, logging out.", error);
        logout(); // Clear the invalid token and state
      }
    }
    setLoading(false);
  }, []); // No navigate dependency needed here

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      // 1. Store the token
      localStorage.setItem('token', token);
      
      // 2. Set auth header for all subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // 3. Update state
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    // 1. Clear everything
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    
    // 2. Redirect to login page
    navigate('/login');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
  };

  // We don't render children until the initial loading (session check) is complete
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};