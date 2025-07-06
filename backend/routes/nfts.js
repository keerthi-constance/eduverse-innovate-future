import express from 'express';
import NFT from '../models/NFT.js';
import Donation from '../models/Donation.js';
import { blockchainService } from '../services/blockchainService.js';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/nfts
// @desc    Get all NFTs with pagination and filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const owner = req.query.owner;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (owner) {
      filter.owner = owner.toLowerCase();
    }

    const skip = (page - 1) * limit;

    const nfts = await NFT.find(filter)
      .populate('donation', 'amount currency message category createdAt')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const total = await NFT.countDocuments(filter);

    res.json({
      success: true,
      data: {
        nfts: nfts.map(nft => nft.getPublicInfo()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/nfts/:id
// @desc    Get NFT by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const nft = await NFT.findById(req.params.id)
      .populate('donation', 'amount currency message category createdAt receipt');

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    res.json({
      success: true,
      data: {
        nft: nft.getPublicInfo()
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/nfts/asset/:assetId
// @desc    Get NFT by asset ID
// @access  Public
router.get('/asset/:assetId', async (req, res, next) => {
  try {
    const nft = await NFT.findByAssetId(req.params.assetId)
      .populate('donation', 'amount currency message category createdAt');

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    res.json({
      success: true,
      data: {
        nft: nft.getPublicInfo()
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/nfts/owner/:walletAddress
// @desc    Get NFTs by owner wallet address
// @access  Public
router.get('/owner/:walletAddress', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const nfts = await NFT.getNFTsByOwner(walletAddress, limit);
    const total = await NFT.countDocuments({ owner: walletAddress.toLowerCase() });

    res.json({
      success: true,
      data: {
        owner: walletAddress,
        nfts: nfts.map(nft => nft.getPublicInfo()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/nfts/:id/verify
// @desc    Verify NFT on blockchain
// @access  Public
router.post('/:id/verify', async (req, res, next) => {
  try {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    // Get asset info from blockchain
    const assetInfo = await blockchainService.getAssetInfo(nft.assetId);

    // Update NFT with blockchain data
    nft.blockchainData = {
      ...nft.blockchainData,
      blockNumber: assetInfo.block,
      slot: assetInfo.slot,
      confirmations: assetInfo.block ? 1 : 0
    };

    if (assetInfo.block) {
      nft.status = 'minted';
    }

    await nft.save();

    res.json({
      success: true,
      data: {
        nft: nft.getPublicInfo(),
        blockchainInfo: assetInfo
      },
      message: 'NFT verified successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/nfts/statistics
// @desc    Get NFT statistics
// @access  Public
router.get('/statistics', async (req, res, next) => {
  try {
    const stats = await NFT.getStatistics();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/nfts/recent
// @desc    Get recent NFTs
// @access  Public
router.get('/recent', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const nfts = await NFT.getRecentNFTs(limit);

    res.json({
      success: true,
      data: {
        nfts: nfts.map(nft => nft.getPublicInfo())
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/nfts/:id
// @desc    Update NFT (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, metadata } = req.body;
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    if (status) nft.status = status;
    if (metadata) nft.metadata = { ...nft.metadata, ...metadata };

    await nft.save();

    res.json({
      success: true,
      data: {
        nft: nft.getPublicInfo()
      },
      message: 'NFT updated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/nfts/:id
// @desc    Delete NFT (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const nft = await NFT.findById(req.params.id);

    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found'
      });
    }

    await nft.remove();

    res.json({
      success: true,
      message: 'NFT deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

export default router; 
 
 
 
 
 
 
 