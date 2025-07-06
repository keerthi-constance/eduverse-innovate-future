// EduFund API Service
// Connects to backend at http://localhost:4567/api

const API_BASE_URL = 'http://localhost:4567/api';

// Types
export interface User {
  _id: string;
  email: string;
  name: string;
  walletAddress?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Donation {
  _id: string;
  amount: number;
  formattedAmount: string;
  category: string;
  message?: string;
  donorName: string;
  donorEmail: string;
  walletAddress: string;
  blockchainTransaction: {
    txHash: string;
    status: 'pending' | 'confirmed' | 'failed';
    confirmedAt?: string;
  };
  receipt: {
    receiptNumber: string;
    sent: boolean;
  };
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface NFT {
  _id: string;
  assetId: string;
  assetName: string;
  policyId: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  donationId: string;
  status: 'minting' | 'minted' | 'failed';
  mintedAt?: string;
  cardanoScanUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlockchainInfo {
  network: string;
  latestBlock: number;
  protocolVersion: string;
  totalSupply: string;
  circulatingSupply: string;
}

export interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  totalDonors: number;
  totalNFTs: number;
  recentDonations: Donation[];
  donationTrends: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

// API Service Class
class EduFundAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Management
  async register(userData: {
    email: string;
    password: string;
    name: string;
    walletAddress?: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    return this.request('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getProfile(token: string): Promise<User> {
    return this.request('/users/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(
    token: string,
    updates: Partial<User>
  ): Promise<User> {
    return this.request('/users/profile', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
  }

  // Donation Management
  async createDonation(
    token: string,
    donationData: {
      amount: number;
      category: string;
      message?: string;
      donorName: string;
      donorEmail: string;
      walletAddress: string;
    }
  ): Promise<Donation> {
    return this.request('/donations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(donationData),
    });
  }

  async getDonations(token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
  }): Promise<{
    donations: Donation[];
    total: number;
    page: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);

    const query = searchParams.toString();
    const endpoint = query ? `/donations?${query}` : '/donations';

    return this.request(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getDonation(token: string, donationId: string): Promise<Donation> {
    return this.request(`/donations/${donationId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async confirmDonation(
    token: string,
    donationId: string,
    txHash: string
  ): Promise<Donation> {
    return this.request(`/donations/${donationId}/confirm`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ txHash }),
    });
  }

  // NFT Management
  async getNFTs(token: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    nfts: NFT[];
    total: number;
    page: number;
    pages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);

    const query = searchParams.toString();
    const endpoint = query ? `/nfts?${query}` : '/nfts';

    return this.request(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getNFT(token: string, nftId: string): Promise<NFT> {
    return this.request(`/nfts/${nftId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Blockchain Operations
  async getNetworkInfo(): Promise<BlockchainInfo> {
    return this.request('/blockchain/network-info');
  }

  async getWalletBalance(address: string): Promise<{
    address: string;
    balance: string;
    availableBalance: string;
    rewards: string;
    withdrawals: string;
    deposits: string;
  }> {
    return this.request(`/blockchain/wallet-balance/${address}`);
  }

  async getTransaction(txHash: string): Promise<any> {
    return this.request(`/blockchain/transaction/${txHash}`);
  }

  async verifyAddress(address: string): Promise<{
    isValid: boolean;
    network: string;
  }> {
    return this.request(`/blockchain/verify-address/${address}`);
  }

  // Dashboard
  async getDashboardStats(token: string): Promise<DashboardStats> {
    return this.request('/dashboard/stats', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getDashboardReports(token: string, params?: {
    startDate?: string;
    endDate?: string;
    category?: string;
  }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    if (params?.category) searchParams.append('category', params.category);

    const query = searchParams.toString();
    const endpoint = query ? `/dashboard/reports?${query}` : '/dashboard/reports';

    return this.request(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Health Check
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> {
    return this.request('/health');
  }
}

// Export singleton instance
export const api = new EduFundAPI();

// Export for custom base URL
export const createAPI = (baseURL: string) => new EduFundAPI(baseURL); 
 
 
 
 
 
 
 