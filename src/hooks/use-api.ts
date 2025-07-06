import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Donation, NFT, DashboardStats, BlockchainInfo } from '../lib/api';
import { useAuth } from '../lib/auth-context';

// Donation Hooks
export const useDonations = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
}) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['donations', params],
    queryFn: () => api.getDonations(token!, params),
    enabled: !!token,
  });
};

export const useDonation = (donationId: string) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['donation', donationId],
    queryFn: () => api.getDonation(token!, donationId),
    enabled: !!token && !!donationId,
  });
};

export const useCreateDonation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (donationData: {
      amount: number;
      category: string;
      message?: string;
      donorName: string;
      donorEmail: string;
      walletAddress: string;
    }) => api.createDonation(token!, donationData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    },
  });
};

export const useConfirmDonation = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ donationId, txHash }: { donationId: string; txHash: string }) =>
      api.confirmDonation(token!, donationId, txHash),
    onSuccess: (_, { donationId }) => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
      queryClient.invalidateQueries({ queryKey: ['donation', donationId] });
    },
  });
};

// NFT Hooks
export const useNFTs = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['nfts', params],
    queryFn: () => api.getNFTs(token!, params),
    enabled: !!token,
  });
};

export const useNFT = (nftId: string) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['nft', nftId],
    queryFn: () => api.getNFT(token!, nftId),
    enabled: !!token && !!nftId,
  });
};

// Blockchain Hooks
export const useNetworkInfo = () => {
  return useQuery({
    queryKey: ['network-info'],
    queryFn: () => api.getNetworkInfo(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useWalletBalance = (address: string) => {
  return useQuery({
    queryKey: ['wallet-balance', address],
    queryFn: () => api.getWalletBalance(address),
    enabled: !!address,
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

export const useTransaction = (txHash: string) => {
  return useQuery({
    queryKey: ['transaction', txHash],
    queryFn: () => api.getTransaction(txHash),
    enabled: !!txHash,
    refetchInterval: 5000, // Refetch every 5 seconds for pending transactions
  });
};

export const useVerifyAddress = (address: string) => {
  return useQuery({
    queryKey: ['verify-address', address],
    queryFn: () => api.verifyAddress(address),
    enabled: !!address,
  });
};

// Dashboard Hooks
export const useDashboardStats = () => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(token!),
    enabled: !!token,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useDashboardReports = (params?: {
  startDate?: string;
  endDate?: string;
  category?: string;
}) => {
  const { token } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-reports', params],
    queryFn: () => api.getDashboardReports(token!, params),
    enabled: !!token,
  });
};

// Health Check Hook
export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.healthCheck(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Utility hook to check if backend is connected
export const useBackendStatus = () => {
  const healthQuery = useHealthCheck();
  
  return {
    isConnected: healthQuery.isSuccess,
    isLoading: healthQuery.isLoading,
    error: healthQuery.error,
    data: healthQuery.data,
  };
}; 
 
 
 
 
 
 
 