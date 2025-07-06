// Environment Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4567/api',
    timeout: 30000,
  },

  // Blockchain Configuration
  blockchain: {
    network: import.meta.env.VITE_CARDANO_NETWORK || 'testnet',
    blockfrostProjectId: import.meta.env.VITE_BLOCKFROST_PROJECT_ID || '',
    recipientWalletAddress: import.meta.env.VITE_RECIPIENT_WALLET_ADDRESS || '',
  },

  // Mesh SDK Configuration
  mesh: {
    walletName: import.meta.env.VITE_MESH_WALLET_NAME || 'Eternl',
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'EduFund',
    description: import.meta.env.VITE_APP_DESCRIPTION || 'Empowering Sri Lankan Students Through Global Donations',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Feature Flags
  features: {
    enableNFTMinting: import.meta.env.VITE_ENABLE_NFT_MINTING === 'true',
    enableRealTimeUpdates: import.meta.env.VITE_ENABLE_REAL_TIME_UPDATES === 'true',
    enableEmailNotifications: import.meta.env.VITE_ENABLE_EMAIL_NOTIFICATIONS === 'true',
  },

  // Validation
  isValid: () => {
    return !!(
      config.api.baseUrl &&
      config.blockchain.blockfrostProjectId &&
      config.blockchain.recipientWalletAddress
    );
  },

  // Get validation errors
  getValidationErrors: () => {
    const errors: string[] = [];
    
    if (!config.api.baseUrl) {
      errors.push('API base URL is required');
    }
    
    if (!config.blockchain.blockfrostProjectId) {
      errors.push('Blockfrost project ID is required');
    }
    
    if (!config.blockchain.recipientWalletAddress) {
      errors.push('Recipient wallet address is required');
    }
    
    return errors;
  },
};

export default config; 
 
 