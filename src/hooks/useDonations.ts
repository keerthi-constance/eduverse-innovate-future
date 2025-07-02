import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

// Types
export interface Donation {
  id: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  project: {
    id: string;
    title: string;
    student: {
      name: string;
      institution: string;
    };
  };
  donor: {
    id: string;
    name?: string;
    walletAddress: string;
    displayName: string;
  };
  transactionHash?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface CreateDonationData {
  amount: number;
  projectId: string;
  message?: string;
  anonymous?: boolean;
}

export interface DonationStats {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  topDonors: Array<{
    id: string;
    name?: string;
    walletAddress: string;
    displayName: string;
    totalDonated: number;
    donationCount: number;
    supporterRank: string;
  }>;
  recentDonations: Donation[];
  monthlyStats: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
}

// Query keys
export const donationKeys = {
  all: ['donations'] as const,
  lists: () => [...donationKeys.all, 'list'] as const,
  list: (filters: any) => [...donationKeys.lists(), filters] as const,
  details: () => [...donationKeys.all, 'detail'] as const,
  detail: (id: string) => [...donationKeys.details(), id] as const,
  myDonations: () => [...donationKeys.all, 'my-donations'] as const,
  projectDonations: (projectId: string) => [...donationKeys.all, 'project', projectId] as const,
  stats: () => [...donationKeys.all, 'stats'] as const,
};

// Hooks
export const useDonations = (filters?: any) => {
  return useQuery({
    queryKey: donationKeys.list(filters),
    queryFn: () => apiService.donations.getAll(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useDonation = (id: string) => {
  return useQuery({
    queryKey: donationKeys.detail(id),
    queryFn: () => apiService.donations.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyDonations = () => {
  return useQuery({
    queryKey: donationKeys.myDonations(),
    queryFn: () => apiService.donations.getMyDonations(),
    staleTime: 2 * 60 * 1000,
  });
};

export const useProjectDonations = (projectId: string) => {
  return useQuery({
    queryKey: donationKeys.projectDonations(projectId),
    queryFn: () => apiService.donations.getProjectDonations(projectId),
    enabled: !!projectId,
    staleTime: 1 * 60 * 1000, // 1 minute for real-time updates
  });
};

export const useDonationStats = () => {
  return useQuery({
    queryKey: donationKeys.stats(),
    queryFn: () => apiService.donations.getDonationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations
export const useCreateDonation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDonationData) => apiService.donations.create(data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: donationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donationKeys.myDonations() });
      queryClient.invalidateQueries({ 
        queryKey: donationKeys.projectDonations(variables.projectId) 
      });
      queryClient.invalidateQueries({ queryKey: donationKeys.stats() });
      
      // Also invalidate project data since funding amount changed
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Utility functions
export const formatDonationAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ADA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getDonationStatusColor = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'text-green-600';
    case 'pending':
      return 'text-yellow-600';
    case 'failed':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
};

export const getDonationStatusText = (status: string): string => {
  switch (status) {
    case 'confirmed':
      return 'Confirmed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};

export const getDonorDisplayName = (donation: Donation): string => {
  if (donation.anonymous) {
    return 'Anonymous Donor';
  }
  return donation.donor.name || donation.donor.displayName;
};

export const getDonationTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
};

export const getSupporterRankColor = (rank: string): string => {
  switch (rank) {
    case 'Diamond':
      return 'text-purple-600';
    case 'Platinum':
      return 'text-gray-600';
    case 'Gold':
      return 'text-yellow-600';
    case 'Silver':
      return 'text-gray-400';
    case 'Bronze':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
  }
}; 