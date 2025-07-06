import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

// Response interface
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// API Service Class
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🌐 [API] Request to ${config.method?.toUpperCase()} ${config.url}:`, {
            hasAuthToken: !!token,
            tokenPreview: token.slice(0, 20) + '...'
          });
        } else {
          console.log(`🌐 [API] Request to ${config.method?.toUpperCase()} ${config.url}:`, {
            hasAuthToken: false
          });
        }
        return config;
      },
      (error) => {
        console.error('❌ [API] Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(`✅ [API] Response from ${response.config.method?.toUpperCase()} ${response.config.url}:`, {
          status: response.status,
          success: response.data?.success,
          hasData: !!response.data?.data
        });
        return response.data;
      },
      (error) => {
        console.error(`❌ [API] Response error from ${error.config?.method?.toUpperCase()} ${error.config?.url}:`, {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          data: error.response?.data
        });
        
        if (error.response?.status === 401) {
          console.log('🔐 [API] 401 Unauthorized - clearing auth token');
          // Token expired or invalid
          localStorage.removeItem('token');
          window.location.href = '/';
        }
        return Promise.reject(error.response?.data || error);
      }
    );
  }

  // Set auth token
  setAuthToken(token: string) {
    console.log('🔐 [API] Setting auth token:', {
      tokenPreview: token.slice(0, 20) + '...',
      tokenLength: token.length
    });
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  }

  // Remove auth token
  removeAuthToken() {
    console.log('🔐 [API] Removing auth token');
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Generic request methods
  async get<T = any>(endpoint: string, params?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 [API] GET ${endpoint}:`, { params });
      const response = await this.api.get(endpoint, { params });
      return response;
    } catch (error) {
      console.error(`❌ [API] GET ${endpoint} failed:`, error);
      throw this.handleError(error);
    }
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 [API] POST ${endpoint}:`, { 
        data: data ? JSON.stringify(data).slice(0, 100) + '...' : undefined 
      });
      const response = await this.api.post(endpoint, data);
      return response;
    } catch (error) {
      console.error(`❌ [API] POST ${endpoint} failed:`, error);
      throw this.handleError(error);
    }
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 [API] PUT ${endpoint}:`, { 
        data: data ? JSON.stringify(data).slice(0, 100) + '...' : undefined 
      });
      const response = await this.api.put(endpoint, data);
      return response;
    } catch (error) {
      console.error(`❌ [API] PUT ${endpoint} failed:`, error);
      throw this.handleError(error);
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      console.log(`📡 [API] DELETE ${endpoint}`);
      const response = await this.api.delete(endpoint);
      return response;
    } catch (error) {
      console.error(`❌ [API] DELETE ${endpoint} failed:`, error);
      throw this.handleError(error);
    }
  }

  // Error handler
  private handleError(error: any): Error {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error.message) {
      return new Error(error.message);
    }
    return new Error('An unexpected error occurred');
  }

  // Authentication endpoints
  auth = {
    login: (credentials: { email: string; password: string }) =>
      this.post('/auth/login', credentials),
    
    register: (userData: any) =>
      this.post('/auth/register', userData),
    
    getProfile: () => this.get('/auth/me'),
    
    updateProfile: (profileData: any) =>
      this.put('/auth/profile', profileData),
    
    connectWallet: (walletAddress: string) =>
      this.post('/auth/connect-wallet', { walletAddress }),
    
    walletLogin: (walletData: { walletAddress: string; displayName?: string }) =>
      this.post('/auth/wallet-login', walletData),
    
    upgradeToStudent: (studentData: any) =>
      this.post('/auth/upgrade-to-student', studentData),
    
    disconnect: () => this.post('/auth/disconnect'),
    
    verifyWallet: (walletAddress: string) =>
      this.post('/auth/verify-wallet', { walletAddress }),
  };

  // Projects endpoints
  projects = {
    getAll: (params?: any) => this.get('/projects', params),
    
    getById: (id: string) => this.get(`/projects/${id}`),
    
    create: (projectData: any) => this.post('/projects', projectData),
    
    update: (id: string, projectData: any) =>
      this.put(`/projects/${id}`, projectData),
    
    delete: (id: string) => this.delete(`/projects/${id}`),
    
    getByCategory: (category: string, params?: any) =>
      this.get(`/projects/category/${category}`, params),
    
    search: (query: string, params?: any) =>
      this.get('/projects/search', { query, ...params }),
    
    getMyProjects: () => this.get('/projects/my-projects'),
    
    getStudentsByCountry: (country: string = 'Sri Lanka') =>
      this.get('/projects/students', { country }),
  };

  // Donations endpoints
  donations = {
    getAll: (params?: any) => this.get('/donations', params),
    
    getById: (id: string) => this.get(`/donations/${id}`),
    
    create: (donationData: any) => this.post('/donations', donationData),
    
    getMyDonations: () => this.get('/donations/my-donations'),
    
    getProjectDonations: (projectId: string) =>
      this.get(`/donations/project/${projectId}`),
    
    getDonationStats: () => this.get('/donations/stats'),
  };

  // NFTs endpoints
  nfts = {
    getAll: (params?: any) => this.get('/nfts', params),
    
    getById: (id: string) => this.get(`/nfts/${id}`),
    
    create: (nftData: any) => this.post('/nfts', nftData),
    
    mint: (nftId: string) => this.post(`/nfts/${nftId}/mint`),
    
    getMyNFTs: () => this.get('/nfts/my-nfts'),
    
    getProjectNFTs: (projectId: string) =>
      this.get(`/nfts/project/${projectId}`),
  };

  // Blockchain endpoints
  blockchain = {
    getBalance: (address: string) =>
      this.get(`/blockchain/balance/${address}`),
    
    getTransaction: (txHash: string) =>
      this.get(`/blockchain/transaction/${txHash}`),
    
    sendTransaction: (transactionData: any) =>
      this.post('/blockchain/send', transactionData),
    
    getNetworkInfo: () => this.get('/blockchain/network-info'),
  };

  // Dashboard endpoints
  dashboard = {
    getStats: () => this.get('/dashboard/stats'),
    
    getRecentActivity: () => this.get('/dashboard/recent-activity'),
    
    getTopDonors: () => this.get('/dashboard/top-donors'),
    
    getTrendingProjects: () => this.get('/dashboard/trending-projects'),
    
    getAnalytics: (period: string = '30d') =>
      this.get('/dashboard/analytics', { period }),
  };

  // Email endpoints
  email = {
    sendReceipt: (donationId: string) =>
      this.post(`/email/receipt/${donationId}`),
    
    sendNotification: (data: any) =>
      this.post('/email/notification', data),
  };

  // File upload endpoints
  upload = {
    uploadImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      return this.api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    
    uploadDocument: async (file: File) => {
      const formData = new FormData();
      formData.append('document', file);
      return this.api.post('/upload/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
  };
}

// Export singleton instance
export const apiService = new ApiService();

// Also export as default for convenience
export default apiService; 
 
 