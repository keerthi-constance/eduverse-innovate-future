import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/apiService';

// Types
export interface DashboardStats {
  totalProjects: number;
  totalDonations: number;
  totalAmount: number;
  activeProjects: number;
  fundedProjects: number;
  totalStudents: number;
  totalDonors: number;
  averageDonation: number;
  successRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'donation' | 'project_created' | 'project_funded' | 'nft_minted';
  title: string;
  description: string;
  amount?: number;
  user: {
    name?: string;
    walletAddress: string;
    displayName: string;
  };
  project?: {
    id: string;
    title: string;
  };
  createdAt: string;
}

export interface TopDonor {
  id: string;
  name?: string;
  walletAddress: string;
  displayName: string;
  totalDonated: number;
  donationCount: number;
  supporterRank: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  lastDonation: string;
}

export interface TrendingProject {
  id: string;
  title: string;
  description: string;
  category: string;
  fundingGoal: number;
  currentFunding: number;
  progress: number;
  daysLeft: number;
  student: {
    name: string;
    institution: string;
    fieldOfStudy: string;
  };
  recentDonations: number;
  createdAt: string;
}

export interface AnalyticsData {
  period: string;
  donations: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  projects: Array<{
    date: string;
    created: number;
    funded: number;
  }>;
  categories: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
  topInstitutions: Array<{
    institution: string;
    projects: number;
    funding: number;
  }>;
}

// Query keys
export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  recentActivity: () => [...dashboardKeys.all, 'recent-activity'] as const,
  topDonors: () => [...dashboardKeys.all, 'top-donors'] as const,
  trendingProjects: () => [...dashboardKeys.all, 'trending-projects'] as const,
  analytics: (period: string) => [...dashboardKeys.all, 'analytics', period] as const,
};

// Hooks
export const useDashboardStats = () => {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => apiService.dashboard.getStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: dashboardKeys.recentActivity(),
    queryFn: () => apiService.dashboard.getRecentActivity(),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time updates
  });
};

export const useTopDonors = () => {
  return useQuery({
    queryKey: dashboardKeys.topDonors(),
    queryFn: () => apiService.dashboard.getTopDonors(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useTrendingProjects = () => {
  return useQuery({
    queryKey: dashboardKeys.trendingProjects(),
    queryFn: () => apiService.dashboard.getTrendingProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAnalytics = (period: string = '30d') => {
  return useQuery({
    queryKey: dashboardKeys.analytics(period),
    queryFn: () => apiService.dashboard.getAnalytics(period),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ADA',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'donation':
      return '💰';
    case 'project_created':
      return '📝';
    case 'project_funded':
      return '🎉';
    case 'nft_minted':
      return '🖼️';
    default:
      return '📊';
  }
};

export const getActivityColor = (type: string): string => {
  switch (type) {
    case 'donation':
      return 'text-green-600';
    case 'project_created':
      return 'text-blue-600';
    case 'project_funded':
      return 'text-purple-600';
    case 'nft_minted':
      return 'text-orange-600';
    default:
      return 'text-gray-600';
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

export const getSupporterRankIcon = (rank: string): string => {
  switch (rank) {
    case 'Diamond':
      return '💎';
    case 'Platinum':
      return '⚪';
    case 'Gold':
      return '🥇';
    case 'Silver':
      return '🥈';
    case 'Bronze':
      return '🥉';
    default:
      return '🏆';
  }
};

export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months}mo ago`;
  }
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-yellow-500';
  if (progress >= 25) return 'bg-orange-500';
  return 'bg-red-500';
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-100';
    case 'funded':
      return 'text-purple-600 bg-purple-100';
    case 'expired':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}; 
 
 