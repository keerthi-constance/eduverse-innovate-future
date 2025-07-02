import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useWallet } from '@meshsdk/react';
import { apiService } from '../services/apiService';

// Types
interface User {
  id: string;
  walletAddress: string;
  role: 'student' | 'donor' | 'admin';
  name?: string;
  displayName: string;
  userType: string;
  profileCompleted: boolean;
  isVerified: boolean;
  location?: {
    country: string;
    city?: string;
    institution?: string;
  };
  studentInfo?: {
    studentId?: string;
    fieldOfStudy?: string;
    academicLevel?: 'undergraduate' | 'postgraduate' | 'phd' | 'research';
    graduationYear?: number;
    gpa?: number;
    researchInterests?: string[];
  };
  donorInfo?: {
    preferredCategories?: string[];
    totalDonated: number;
    donationCount: number;
    supporterRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  };
  projects?: any[];
  donations?: any[];
  nfts?: any[];
  lastActive: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
  upgradeToStudent: (studentData: any) => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'CLEAR_ERROR' };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { connected, connecting, disconnect, wallet } = useWallet();

  // Debug logging
  const logAuthState = (action: string, data?: any) => {
    console.log(`🔐 [AuthContext] ${action}:`, {
      isAuthenticated: state.isAuthenticated,
      hasUser: !!state.user,
      hasToken: !!state.token,
      walletConnected: connected,
      data
    });
  };

  // Check for existing token on mount
  useEffect(() => {
    logAuthState('Component mounted');
    const token = localStorage.getItem('authToken');
    logAuthState('Checking localStorage token', { hasToken: !!token });
    
    if (token) {
      logAuthState('Found token in localStorage, setting in API service');
      apiService.setAuthToken(token);
      fetchUserProfile();
    } else {
      logAuthState('No token found in localStorage');
    }
  }, []);

  // Handle wallet connection
  useEffect(() => {
    logAuthState('Wallet connection effect triggered', { 
      connected, 
      hasWallet: !!wallet,
      isAuthenticated: state.isAuthenticated 
    });
    
    if (connected && wallet && !state.isAuthenticated) {
      logAuthState('Wallet connected but not authenticated, starting auth flow');
      handleWalletConnection();
    } else if (connected && wallet && state.isAuthenticated) {
      logAuthState('Wallet connected and already authenticated');
    }
  }, [connected, wallet, state.isAuthenticated]);

  const handleWalletConnection = async () => {
    try {
      logAuthState('Starting wallet connection process');
      dispatch({ type: 'AUTH_START' });

      // Give wallet a moment to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      logAuthState('Wallet initialization delay completed');

      // Try different methods to get wallet address
      let walletAddress = null;
      
      // Method 1: Try getUsedAddresses first
      try {
        const addresses = await wallet.getUsedAddresses();
        logAuthState('getUsedAddresses result', { 
          addressCount: addresses.length, 
          addresses: addresses.slice(0, 2) // Log first 2 addresses
        });
        
        if (addresses && addresses.length > 0) {
          walletAddress = addresses[0];
        }
      } catch (error) {
        logAuthState('getUsedAddresses failed', { error: error.message });
      }

      // Method 2: Try getUnusedAddresses if no used addresses
      if (!walletAddress) {
        try {
          const unusedAddresses = await wallet.getUnusedAddresses();
          logAuthState('getUnusedAddresses result', { 
            addressCount: unusedAddresses.length, 
            addresses: unusedAddresses.slice(0, 2)
          });
          
          if (unusedAddresses && unusedAddresses.length > 0) {
            walletAddress = unusedAddresses[0];
          }
        } catch (error) {
          logAuthState('getUnusedAddresses failed', { error: error.message });
        }
      }

      // Method 3: Try getRewardAddresses
      if (!walletAddress) {
        try {
          const rewardAddresses = await wallet.getRewardAddresses();
          logAuthState('getRewardAddresses result', { 
            addressCount: rewardAddresses.length, 
            addresses: rewardAddresses.slice(0, 2)
          });
          
          if (rewardAddresses && rewardAddresses.length > 0) {
            walletAddress = rewardAddresses[0];
          }
        } catch (error) {
          logAuthState('getRewardAddresses failed', { error: error.message });
        }
      }

      // Method 4: Try getChangeAddress
      if (!walletAddress) {
        try {
          walletAddress = await wallet.getChangeAddress();
          logAuthState('getChangeAddress result', { walletAddress });
        } catch (error) {
          logAuthState('getChangeAddress failed', { error: error.message });
        }
      }

      logAuthState('Final wallet address check', { 
        hasWalletAddress: !!walletAddress,
        walletAddress: walletAddress ? `${walletAddress.slice(0, 10)}...` : null 
      });

      if (!walletAddress) {
        // Try one more time with a small delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          const addresses = await wallet.getUsedAddresses();
          if (addresses && addresses.length > 0) {
            walletAddress = addresses[0];
            logAuthState('Retry successful', { walletAddress: `${walletAddress.slice(0, 10)}...` });
          }
        } catch (error) {
          logAuthState('Retry failed', { error: error.message });
        }
      }

      if (!walletAddress) {
        throw new Error('No wallet address found. Please try disconnecting and reconnecting your wallet.');
      }

      // Connect wallet to backend
      logAuthState('Calling backend /auth/connect-wallet');
      const response = await apiService.post('/auth/connect-wallet', {
        walletAddress,
      });

      logAuthState('Backend response received', { 
        success: response.success, 
        hasData: !!response.data 
      });

      if (response.success) {
        const { token, user } = response.data;
        
        logAuthState('Authentication successful', { 
          hasToken: !!token, 
          hasUser: !!user,
          userRole: user?.role 
        });
        
        // Store token
        localStorage.setItem('authToken', token);
        apiService.setAuthToken(token);

        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user, token },
        });
      } else {
        throw new Error(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('❌ Wallet connection error:', error);
      logAuthState('Authentication failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Authentication failed',
      });
    }
  };

  const fetchUserProfile = async () => {
    try {
      logAuthState('Fetching user profile from /auth/me');
      const response = await apiService.get('/auth/me');
      
      logAuthState('Profile fetch response', { 
        success: response.success, 
        hasData: !!response.data 
      });
      
      if (response.success) {
        const token = localStorage.getItem('authToken');
        logAuthState('Profile fetch successful', { 
          hasToken: !!token,
          userRole: response.data.user?.role 
        });
        
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user, token: token || '' },
        });
      } else {
        logAuthState('Profile fetch failed, clearing token');
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        apiService.removeAuthToken();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
    } catch (error) {
      console.error('❌ Fetch profile error:', error);
      logAuthState('Profile fetch error, clearing token', { error: error instanceof Error ? error.message : 'Unknown error' });
      localStorage.removeItem('authToken');
      apiService.removeAuthToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const connectWallet = async () => {
    try {
      logAuthState('Manual connect wallet called');
      dispatch({ type: 'AUTH_START' });
      
      if (connected && wallet) {
        logAuthState('Wallet already connected, proceeding with auth');
        await handleWalletConnection();
      } else {
        logAuthState('Wallet not connected, throwing error');
        throw new Error('Please use the Connect Wallet button to connect your wallet.');
      }
    } catch (error) {
      console.error('❌ Connect wallet error:', error);
      logAuthState('Manual connect failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to connect wallet',
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      logAuthState('Disconnecting wallet');
      
      // Disconnect from backend
      if (state.token) {
        logAuthState('Calling backend disconnect');
        await apiService.post('/auth/disconnect');
      }

      // Disconnect wallet
      logAuthState('Disconnecting from Mesh SDK');
      await disconnect();

      // Clear local storage
      logAuthState('Clearing localStorage and API token');
      localStorage.removeItem('authToken');
      apiService.removeAuthToken();

      dispatch({ type: 'AUTH_LOGOUT' });
      logAuthState('Disconnect completed');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
      logAuthState('Disconnect error, forcing logout', { error: error instanceof Error ? error.message : 'Unknown error' });
      // Still logout even if backend call fails
      localStorage.removeItem('authToken');
      apiService.removeAuthToken();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    try {
      logAuthState('Updating profile', { profileData });
      const response = await apiService.put('/auth/profile', profileData);
      
      if (response.success) {
        logAuthState('Profile update successful');
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('❌ Update profile error:', error);
      logAuthState('Profile update failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to update profile',
      });
    }
  };

  const upgradeToStudent = async (studentData: any) => {
    try {
      logAuthState('Upgrading to student', { studentData });
      const response = await apiService.post('/auth/upgrade-to-student', studentData);
      
      if (response.success) {
        logAuthState('Student upgrade successful');
        dispatch({
          type: 'UPDATE_USER',
          payload: response.data.user,
        });
      } else {
        throw new Error(response.message || 'Failed to upgrade to student');
      }
    } catch (error) {
      console.error('❌ Upgrade to student error:', error);
      logAuthState('Student upgrade failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      dispatch({
        type: 'AUTH_FAILURE',
        payload: error instanceof Error ? error.message : 'Failed to upgrade to student',
      });
    }
  };

  const clearError = () => {
    logAuthState('Clearing error');
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    ...state,
    connectWallet,
    disconnectWallet,
    updateProfile,
    upgradeToStudent,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 