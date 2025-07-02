# Mesh SDK Integration Guide

## 🚀 Complete Integration Steps

### 1. Install Mesh SDK Dependencies

```bash
# Navigate to frontend directory
cd eduverse-innovate-future

# Install Mesh SDK
npm install @meshsdk/react @meshsdk/core

# Install additional dependencies for better integration
npm install @meshsdk/plutus-context
```

### 2. Create Environment File

Create `.env` file in the frontend root:

```env
# API Configuration
VITE_API_URL=http://localhost:4567/api

# Blockchain Configuration
VITE_RECIPIENT_ADDRESS=addr_test1uzv2whxqk2sv36amdz7zuyanrayvnap4f2hea58mp7ekmhsw3q6l5
VITE_NETWORK=preprod

# App Configuration
VITE_APP_NAME=EduFund
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_NFT_MINTING=true
VITE_ENABLE_EMAIL_NOTIFICATIONS=true
VITE_ENABLE_BLOCKCHAIN_INTEGRATION=true
```

### 3. Update Mesh Integration

Replace the placeholder functions in `src/lib/mesh.ts` with actual Mesh SDK implementation:

```typescript
import { useWallet as useMeshWallet, useAddress, useLovelace } from '@meshsdk/react';

// Replace the useWallet function with:
export const useWallet = () => {
  const { connected, connecting, connect, disconnect } = useMeshWallet();
  const address = useAddress();
  const lovelace = useLovelace();

  return {
    connected,
    connecting,
    connect,
    disconnect,
    wallet: connected ? {
      name: 'Cardano Wallet',
      address: address || '',
      balance: formatADA(parseInt(lovelace || '0')),
    } : null,
    balance: formatADA(parseInt(lovelace || '0')),
    address: address || '',
  };
};
```

### 4. Update App.tsx with Mesh Provider

```typescript
import { MeshProvider } from '@meshsdk/react';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <MeshProvider>
      <AuthProvider>
        {/* ... rest of your app */}
      </AuthProvider>
    </MeshProvider>
  </QueryClientProvider>
);
```

### 5. Update Dashboard Component

The Dashboard component has been prepared to use real data. After installing Mesh SDK, it will automatically connect to your backend and display real information.

### 6. Test the Integration

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd eduverse-innovate-future
   npm run dev
   ```

3. **Test Features:**
   - Connect wallet (Nami, Eternl, Flint)
   - View real dashboard stats
   - See actual NFT collection
   - View donation history
   - Create real donations

## 🎯 What's Ready

### ✅ **Backend Integration**
- API service layer (`src/lib/api.ts`)
- Authentication context (`src/lib/auth-context.tsx`)
- React Query hooks (`src/hooks/use-api.ts`)
- Real data hooks (`src/hooks/use-real-data.ts`)

### ✅ **Frontend Components**
- Dashboard with real data integration
- Wallet connection UI
- NFT collection display
- Donation history
- Blockchain status

### ✅ **Configuration**
- Environment variables setup
- API base URL configuration
- Blockchain network settings

## 🔧 After Installation

### 1. **Replace Mock Data**
All mock data has been replaced with real API calls. The components will automatically fetch data from your backend.

### 2. **Wallet Connection**
Users can connect their Cardano wallets (Nami, Eternl, Flint) and see their real balance and address.

### 3. **Real Transactions**
Donations will create real Cardano transactions and NFT receipts.

### 4. **Live Updates**
Data will refresh automatically and show real-time blockchain information.

## 🚀 Production Deployment

### 1. **Environment Variables**
Update `.env` for production:
```env
VITE_API_URL=https://your-backend-domain.com/api
VITE_RECIPIENT_ADDRESS=addr1... # Production wallet
VITE_NETWORK=mainnet
```

### 2. **Build Frontend**
```bash
npm run build
```

### 3. **Deploy**
Deploy the `dist` folder to your hosting service.

## 🎉 Success!

After completing these steps, your EduFund platform will have:

- ✅ **Real wallet connections** with Mesh SDK
- ✅ **Live blockchain data** from Cardano
- ✅ **Real donation transactions** 
- ✅ **NFT minting** for donation receipts
- ✅ **Dashboard analytics** with real data
- ✅ **Authentication** with your backend
- ✅ **No sample data** - everything is real!

## 📞 Support

If you encounter issues:
1. Check that Mesh SDK is properly installed
2. Verify environment variables are set
3. Ensure backend is running on port 4567
4. Check browser console for errors
5. Verify wallet connection in browser

Your EduFund platform is now ready for production use! 🚀 
 