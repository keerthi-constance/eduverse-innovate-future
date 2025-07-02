// EduFund Frontend Configuration

export const config = {
  // API Configuration
  api: {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4567/api',
    timeout: 30000, // 30 seconds
  },
  
  // App Configuration
  app: {
    name: 'EduFund',
    version: '1.0.0',
    description: 'Blockchain-powered education funding platform',
  },
  
  // Blockchain Configuration
  blockchain: {
    network: 'preprod', // Cardano preprod testnet
    currency: 'ADA',
    minDonationAmount: 1, // 1 ADA minimum
    recipientAddress: import.meta.env.VITE_RECIPIENT_ADDRESS || 'addr_test1uzv2whxqk2sv36amdz7zuyanrayvnap4f2hea58mp7ekmhsw3q6l5',
  },
  
  // UI Configuration
  ui: {
    theme: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    pagination: {
      defaultPageSize: 10,
      maxPageSize: 100,
    },
  },
  
  // Feature Flags
  features: {
    nftMinting: true,
    emailNotifications: true,
    blockchainIntegration: true,
    dashboardAnalytics: true,
  },
} as const;

// Environment-specific configuration
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Helper function to get API URL
export const getApiUrl = (endpoint: string) => {
  return `${config.api.baseURL}${endpoint}`;
};

// Helper function to format ADA amounts
export const formatADA = (lovelace: number) => {
  return (lovelace / 1000000).toFixed(6);
};

// Helper function to convert ADA to lovelace
export const adaToLovelace = (ada: number) => {
  return Math.floor(ada * 1000000);
}; 
 