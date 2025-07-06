import express from 'express';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import NFT from '../models/NFT.js';
import { blockchainService } from '../services/blockchainService.js';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Private/Admin
router.get('/overview', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Get donation statistics
    const donationStats = await Donation.getStatistics();
    
    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          verifiedUsers: {
            $sum: { $cond: [{ $eq: ['$isVerified', true] }, 1, 0] }
          },
          totalDonated: { $sum: '$totalDonated' }
        }
      }
    ]);

    // Get NFT statistics
    const nftStats = await NFT.getStatistics();

    // Get recent donations
    const recentDonations = await Donation.getRecentDonations(5);

    // Get top donors
    const topDonors = await User.getTopDonors(5);

    // Get donations by category
    const donationsByCategory = await Donation.getDonationsByCategory();

    // Get network information
    let networkInfo = null;
    try {
      networkInfo = await blockchainService.getNetworkInfo();
    } catch (error) {
      logger.error('Failed to get network info:', error);
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalDonations: donationStats.totalDonations,
          totalAmount: donationStats.totalAmount,
          averageAmount: donationStats.averageAmount,
          completedDonations: donationStats.completedDonations,
          pendingDonations: donationStats.pendingDonations,
          totalUsers: userStats[0]?.totalUsers || 0,
          verifiedUsers: userStats[0]?.verifiedUsers || 0,
          totalNFTs: nftStats.totalNFTs,
          mintedNFTs: nftStats.mintedNFTs
        },
        recentDonations,
        topDonors,
        donationsByCategory,
        networkInfo
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics data
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Donations over time
    const donationsOverTime = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          amount: { $sum: '$amount' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // User registrations over time
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // NFT minting over time
    const nftMinting = await NFT.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'minted'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Category distribution
    const categoryDistribution = await Donation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);

    // Average donation amount by category
    const avgByCategory = await Donation.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
      {
        $group: {
          _id: '$category',
          averageAmount: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { averageAmount: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        donationsOverTime,
        userRegistrations,
        nftMinting,
        categoryDistribution,
        avgByCategory
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/reports
// @desc    Get various reports
// @access  Private/Admin
router.get('/reports', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { type = 'donations', startDate, endDate } = req.query;

    let filter = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let report;
    switch (type) {
      case 'donations':
        report = await Donation.find(filter)
          .populate('donor', 'name formattedWalletAddress email')
          .sort({ createdAt: -1 })
          .select('-metadata');
        break;

      case 'users':
        report = await User.find(filter)
          .sort({ createdAt: -1 })
          .select('-password');
        break;

      case 'nfts':
        report = await NFT.find(filter)
          .populate('donation', 'amount currency message category')
          .sort({ createdAt: -1 });
        break;

      case 'failed-transactions':
        filter.status = { $in: ['failed', 'cancelled'] };
        report = await Donation.find(filter)
          .populate('donor', 'name formattedWalletAddress')
          .sort({ createdAt: -1 });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid report type'
        });
    }

    res.json({
      success: true,
      data: {
        type,
        count: report.length,
        report: report.map(item => {
          if (type === 'donations') return item.getPublicInfo();
          if (type === 'users') return item.getPublicProfile();
          if (type === 'nfts') return item.getPublicInfo();
          return item;
        })
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/blockchain-status
// @desc    Get blockchain network status
// @access  Private/Admin
router.get('/blockchain-status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    
    // Get recent transactions
    const recentDonations = await Donation.find({
      status: 'completed',
      'blockchainTransaction.txHash': { $exists: true, $ne: '' }
    })
    .sort({ 'blockchainTransaction.timestamp': -1 })
    .limit(10)
    .select('blockchainTransaction amount createdAt');

    res.json({
      success: true,
      data: {
        networkInfo,
        recentTransactions: recentDonations.map(donation => ({
          txHash: donation.blockchainTransaction.txHash,
          amount: donation.formattedAmount,
          confirmations: donation.blockchainTransaction.confirmations,
          timestamp: donation.blockchainTransaction.timestamp
        }))
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/dashboard/performance
// @desc    Get system performance metrics
// @access  Private/Admin
router.get('/performance', protect, authorize('admin'), async (req, res, next) => {
  try {
    // Database performance metrics
    const dbStats = await Donation.db.db.admin().serverStatus();
    
    // Memory usage
    const memUsage = process.memoryUsage();
    
    // Uptime
    const uptime = process.uptime();

    res.json({
      success: true,
      data: {
        database: {
          connections: dbStats.connections,
          operations: dbStats.opcounters,
          memory: dbStats.mem
        },
        system: {
          memory: {
            rss: memUsage.rss,
            heapTotal: memUsage.heapTotal,
            heapUsed: memUsage.heapUsed,
            external: memUsage.external
          },
          uptime,
          nodeVersion: process.version,
          platform: process.platform
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

export default router; 
 
 
 
 
 
 
 