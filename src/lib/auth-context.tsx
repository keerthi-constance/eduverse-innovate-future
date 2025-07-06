import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, User } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    walletAddress?: string;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('edufund_token');
    if (savedToken) {
      setToken(savedToken);
      // Verify token and load user profile
      loadUserProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const loadUserProfile = async (authToken: string) => {
    try {
      const userProfile = await api.getProfile(authToken);
      setUser(userProfile);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      // Token might be invalid, clear it
      localStorage.removeItem('edufund_token');
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await api.login({ email, password });
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('edufund_token', response.token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    walletAddress?: string;
  }) => {
    try {
      setIsLoading(true);
      const response = await api.register(userData);
      
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('edufund_token', response.token);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edufund_token');
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!token) throw new Error('No authentication token');
    
    try {
      const updatedUser = await api.updateProfile(token, updates);
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
 
 
 
 
 
 
 