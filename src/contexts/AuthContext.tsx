import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { message } from 'antd';
import { apiService } from '../services/apiService';
import * as bech32 from 'bech32';
import { fromHex } from 'lucid-cardano';

// Types
interface User {
  id: string;
  displayName: string;
  email?: string;
  role: 'student' | 'donor';
  walletAddress: string;
  institution?: string;
  researchField?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithWallet: (walletAddress: string, displayName?: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<boolean>;
  setUserFromWallet: (walletAddress: string, balance?: bigint) => void;
  forceConnectWallet: () => Promise<{ address: string; balance: bigint }>;
  token: string | null;
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
  children: ReactNode;
}

// TEST WALLET ADDRESSES (for development/testing only)
const TEST_ADDRESSES = {
  student: 'addr_test1qzcpuxeu3fuskvu76vee7hgvjs2q057ddh06uuh3mweresst308dyd6xvy8zy4ah8jwdu8va6zw9y4k42vcztdznj24srgyv0w',
  donor: 'addr_test1qzx0y7avtk868vwvsqccvw62ns8yf67aye32kxgpc5u3lmy2wxx5d800rqg5ry68kpg3pw3f92h9t69yl0pgk4vzsvxs5nxn97',
};
const isDev = import.meta.env.MODE === 'development' || import.meta.env.MODE === 'test';

export function ensureBech32Address(address: string): string {
  if (!address) return address;
  // If already bech32, return as is
  if (address.startsWith('addr1') || address.startsWith('addr_test1')) return address;
  // If hex (starts with addr_test_ or addr_), convert
  if (address.startsWith('addr_test_') || address.startsWith('addr_')) {
    try {
      // Remove prefix and convert
      const hex = address.replace(/^addr_test_|^addr_/, '');
      const bytes = fromHex(hex);
      // Use testnet prefix for test addresses, mainnet otherwise
      const prefix = address.startsWith('addr_test_') ? 'addr_test' : 'addr';
      return bech32.encode(prefix, bech32.toWords(bytes));
    } catch (e) {
      console.warn('Failed to convert hex address to bech32:', address, e);
      return address;
    }
  }
  return address;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  // On mount, load the user profile from the backend using session/JWT token
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // This should use a session/JWT token if you have one
        const response = await apiService.auth.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  const loginWithWallet = async (walletAddress: string, displayName?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const bech32Address = ensureBech32Address(walletAddress);
      console.log('AuthContext: Logging in with wallet:', bech32Address);
        
      // Store wallet address
      localStorage.setItem('walletAddress', bech32Address);
      
      // Try to get or create user profile
      try {
        const response = await apiService.auth.walletLogin({ 
          walletAddress: bech32Address, 
          displayName: displayName || `User ${bech32Address.slice(0, 8)}...` 
        });
      
      if (response.success) {
          // Set JWT token for future requests
          if (response.data?.token) {
            apiService.setAuthToken(response.data.token);
            setToken(response.data.token);
            localStorage.setItem('token', response.data.token);
          }
          setUser(response.data.user || response.data);
          message.success('Wallet connected successfully!');
        return true;
        }
      } catch (error) {
        console.log('AuthContext: Backend not available, using local profile...');
      }
      
      // Create local user profile if backend is not available
      const localUser: User = {
        id: bech32Address,
        displayName: displayName || `User ${bech32Address.slice(0, 8)}...`,
        walletAddress: bech32Address,
        role: 'donor', // Default role
        createdAt: new Date().toISOString()
      };
      
      setUser(localUser);
      message.success('Wallet connected successfully!');
      return true;
    } catch (error: any) {
      console.error('AuthContext: Wallet login error:', error);
      message.error('Failed to connect wallet. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const setUserFromWallet = (walletAddress: string, balance?: bigint) => {
    // Only update other user fields, not walletAddress
    const existingUser = user;
    const newUser: User = {
      id: existingUser?.id || '',
      displayName: existingUser?.displayName || '',
      walletAddress: existingUser?.walletAddress || '', // Do not set from wallet connection
      role: existingUser?.role || 'donor',
      institution: existingUser?.institution,
      researchField: existingUser?.researchField,
      createdAt: existingUser?.createdAt || new Date().toISOString()
    };
    setUser(newUser);
  };

  const forceConnectWallet = async () => {
    try {
      console.log('AuthContext: Force connecting wallet...');
      
      // Import lucidService dynamically to avoid circular dependencies
      const { lucidService } = await import('../services/lucidService');
      
      // Check if wallet is available
      if (!lucidService.hasWallets()) {
        throw new Error('No wallet available');
      }
      
      // Connect wallet
      await lucidService.connectWallet();
      const walletAddress = await lucidService.getAddress();
      const walletBalance = await lucidService.getBalance();
      
      console.log('AuthContext: Wallet connected:', { address: walletAddress, balance: walletBalance });
      
      // Set user from wallet
      setUserFromWallet(walletAddress, walletBalance);
      
      return { address: walletAddress, balance: walletBalance };
    } catch (error) {
      console.error('AuthContext: Force connect failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Remove wallet address
    localStorage.removeItem('walletAddress');
    
    // Clear user
    setUser(null);
    message.success('Wallet disconnected successfully');
  };

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      console.log('=== AUTH CONTEXT UPDATE USER DEBUG ===');
      console.log('updateUser called with data:', userData);
      console.log('Current user:', user);
      console.log('Is loading state:', isLoading);
      
      setIsLoading(true);
      
      let updatedUserData = { ...userData };
      if (isDev && (userData.role === 'student' || userData.role === 'donor')) {
        updatedUserData.walletAddress = TEST_ADDRESSES[userData.role];
      }
      
      // Update local user data
      if (user) {
        console.log('Updating local user data...');
        const updatedUser = { ...user, ...updatedUserData };
        console.log('Updated user object:', updatedUser);
        setUser(updatedUser);
        
        // Try to update on backend if available
        try {
          console.log('Attempting backend update...');
          console.log('Sending data to backend:', updatedUserData);
          
          const response = await apiService.put('/auth/profile', updatedUserData);
          console.log('Backend response:', response);
      
      if (response.success) {
            console.log('Backend update successful');
        message.success('Profile updated successfully!');
          } else {
            console.log('Backend update failed:', response);
            message.error('Backend update failed: ' + (response.message || 'Unknown error'));
          }
        } catch (error) {
          console.log('AuthContext: Backend not available, using local update...');
          console.log('Backend error:', error);
          message.success('Profile updated locally!');
        }
        
        console.log('=== END AUTH CONTEXT UPDATE USER DEBUG ===');
        return true;
      }
      
      console.log('No user found, cannot update');
      console.log('=== END AUTH CONTEXT UPDATE USER DEBUG ===');
      return false;
    } catch (error: any) {
      console.error('AuthContext: Update error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      message.error('Update failed. Please try again.');
      console.log('=== END AUTH CONTEXT UPDATE USER DEBUG ===');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    loginWithWallet,
    logout,
    updateUser,
    setUserFromWallet,
    forceConnectWallet,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
 