// Real Data Integration Hooks
// Replace mock data with actual API calls and blockchain operations

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { api } from '../lib/api';
import { useWallet, buildDonationTransaction, mintNFT } from '../lib/mesh';
import { toast } from 'sonner';

// Real Dashboard Stats Hook
export const useRealDashboardStats = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalDonated: 0,
    projectsSupported: 0,
    nftsOwned: 0,
    rank: 'Bronze Supporter'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const dashboardStats = await api.getDashboardStats(token);
        setStats({
          totalDonated: dashboardStats.totalAmount,
          projectsSupported: dashboardStats.totalDonations,
          nftsOwned: dashboardStats.totalNFTs,
          rank: getRank(dashboardStats.totalAmount)
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        toast.error('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return { stats, loading };
};

// Real NFT Collection Hook
export const useRealNFTCollection = () => {
  const { token } = useAuth();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const nftData = await api.getNFTs(token);
        setNfts(nftData.nfts.map(nft => ({
          id: nft._id,
          projectTitle: nft.metadata.name,
          donationAmount: parseFloat(nft.metadata.attributes.find(attr => attr.trait_type === 'Donation Amount')?.value || '0'),
          date: new Date(nft.createdAt).toISOString().split('T')[0],
          transactionHash: nft.metadata.attributes.find(attr => attr.trait_type === 'Transaction Hash')?.value || '',
          nftImage: nft.metadata.image,
          status: nft.status === 'minted' ? 'Minted' : 'Pending',
          category: nft.metadata.attributes.find(attr => attr.trait_type === 'Category')?.value || 'General'
        })));
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
        toast.error('Failed to load NFT collection');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [token]);

  return { nfts, loading };
};

// Real Donation History Hook
export const useRealDonationHistory = () => {
  const { token } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const donationData = await api.getDonations(token);
        setDonations(donationData.donations.map(donation => ({
          id: donation._id,
          projectTitle: donation.category,
          amount: donation.amount / 1000000, // Convert from lovelace to ADA
          date: new Date(donation.createdAt).toISOString().split('T')[0],
          status: donation.status,
          transactionHash: donation.blockchainTransaction.txHash,
          receiptNumber: donation.receipt.receiptNumber
        })));
      } catch (error) {
        console.error('Failed to fetch donations:', error);
        toast.error('Failed to load donation history');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  return { donations, loading };
};

// Real Donation Creation Hook
export const useRealDonation = () => {
  const { token } = useAuth();
  const { wallet } = useWallet();
  const [creating, setCreating] = useState(false);

  const createDonation = async (donationData: {
    amount: number;
    category: string;
    message?: string;
    donorName: string;
    donorEmail: string;
  }) => {
    if (!token || !wallet) {
      toast.error('Please connect your wallet and login');
      return;
    }

    setCreating(true);
    try {
      // 1. Create donation record in backend
      const donation = await api.createDonation(token, {
        ...donationData,
        walletAddress: wallet.address,
      });

      // 2. Build and send blockchain transaction
      const txResult = await buildDonationTransaction(
        donationData.amount,
        wallet.address,
        {
          donationId: donation._id,
          category: donationData.category,
          message: donationData.message
        }
      );

      if (txResult.success) {
        // 3. Confirm donation with transaction hash
        await api.confirmDonation(token, donation._id, txResult.txHash);
        toast.success('Donation created successfully!');
        return { success: true, donation, txHash: txResult.txHash };
      } else {
        toast.error('Transaction failed: ' + txResult.error);
        return { success: false, error: txResult.error };
      }
    } catch (error) {
      console.error('Donation creation failed:', error);
      toast.error('Failed to create donation');
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    } finally {
      setCreating(false);
    }
  };

  return { createDonation, creating };
};

// Real Wallet Connection Hook
export const useRealWallet = () => {
  const { connect, disconnect, connected, connecting, wallet, balance, address } = useWallet();

  const connectWallet = async () => {
    try {
      await connect();
      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    disconnect();
    toast.info('Wallet disconnected');
  };

  return {
    connected,
    connecting,
    connectWallet,
    disconnectWallet,
    wallet,
    balance,
    address
  };
};

// Real Blockchain Status Hook
export const useRealBlockchainStatus = () => {
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkInfo = async () => {
      try {
        const info = await api.getNetworkInfo();
        setNetworkInfo(info);
      } catch (error) {
        console.error('Failed to fetch network info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkInfo();
  }, []);

  return { networkInfo, loading };
};

// Utility Functions
const getRank = (totalAmount: number) => {
  if (totalAmount >= 10000) return 'Diamond Supporter';
  if (totalAmount >= 5000) return 'Platinum Supporter';
  if (totalAmount >= 2000) return 'Gold Supporter';
  if (totalAmount >= 1000) return 'Silver Supporter';
  if (totalAmount >= 500) return 'Bronze Supporter';
  return 'New Supporter';
}; 
 
 
 
 
 
 
 