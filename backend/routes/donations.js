import express from 'express';
import { body, validationResult } from 'express-validator';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import NFT from '../models/NFT.js';
import { blockchainService } from '../services/blockchainService.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { logger } from '../utils/logger.js';
import { sendDonationReceipt } from '../services/emailService.js';
import Project from '../models/Project.js';
import { createObjectCsvWriter } from 'csv-writer';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';

const router = express.Router();

// Validation middleware
const validateDonation = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .custom((value) => {
      const minAmount = parseInt(process.env.MIN_ADA_AMOUNT) || 1000000; // 1 ADA in lovelace
      if (value < minAmount) {
        throw new Error(`Minimum donation amount is ${minAmount / 1000000} ADA`);
      }
      return true;
    }),
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .custom((value) => {
      if (!blockchainService.isValidAddress(value)) {
        throw new Error('Invalid Cardano wallet address');
      }
      return true;
    }),
  body('message')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Message cannot be more than 500 characters'),
  body('category')
    .optional()
    .isIn(['education', 'infrastructure', 'scholarship', 'research', 'general'])
    .withMessage('Invalid category'),
  body('isAnonymous')
    .optional()
    .isBoolean()
    .withMessage('isAnonymous must be a boolean')
];

// @route   POST /api/donations
// @desc    Create a new donation
// @access  Public
router.post('/', protect, async (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    return res.status(403).json({
        success: false,
      message: 'Students are not allowed to donate.'
      });
    }
  try {
    const {
      donor,
      donorAddress,
      studentAddress,
      amount,
      transactionHash,
      project,
      status = 'pending',
      message,
      anonymous
    } = req.body;

    if (!donor || !donorAddress || !studentAddress || !amount || !transactionHash || !project) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Generate unique receipt number
    const receiptNumber = `EDU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Force ObjectId for donor and project
    const donation = await Donation.create({
      donor: new mongoose.Types.ObjectId(donor),
      donorAddress,
      studentAddress,
      amount,
      transactionHash,
      project: new mongoose.Types.ObjectId(project),
      status,
      message,
      anonymous,
      receipt: { receiptNumber }
    });

    // Fetch project for metadata
    const projectDoc = await Project.findById(project);
    let nftResult = null;
    if (projectDoc) {
      try {
        nftResult = await blockchainService.mintNFT(
          {
            ...donation.toObject(),
            projectTitle: projectDoc.title,
            formattedAmount: (amount / 1_000_000).toFixed(2),
            createdAt: donation.createdAt,
            message: donation.message,
            transactionHash: donation.transactionHash
          },
          donorAddress,
          'https://placehold.co/400x400/png?text=EduFund+NFT' // test image URL
        );
        // Save NFT info to donation
        donation.nftAssetId = nftResult.assetId;
        donation.nftPolicyId = nftResult.policyId;
        donation.nftMetadata = nftResult.metadata;
        donation.status = 'nft_minted';
        await donation.save();
      } catch (nftError) {
        logger.error('NFT minting error type:', typeof nftError, 'keys:', Object.keys(nftError || {}));
        logger.error('NFT minting failed:', nftError && (nftError.stack || nftError.message || JSON.stringify(nftError)));
        // If NFT minting fails, mark as confirmed
        donation.status = 'confirmed';
        await donation.save();
      }
    } else {
      // If no project found, still mark as confirmed
      donation.status = 'confirmed';
    await donation.save();
    }

    // After donation is created, update project funding
    if (projectDoc) {
      projectDoc.currentFunding += amount;
      if (!projectDoc.backersCount) projectDoc.backersCount = 0;
      projectDoc.backersCount += 1;
      await projectDoc.save();
    }

    // Always respond with donation (and NFT info if available)
    res.status(201).json({ success: true, data: { donation, nft: nftResult } });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/donations/:id/confirm
// @desc    Confirm donation with blockchain transaction
// @access  Public
router.post('/:id/confirm', [
  body('txHash')
    .notEmpty()
    .withMessage('Transaction hash is required')
    .isLength({ min: 64, max: 64 })
    .withMessage('Invalid transaction hash format')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { txHash } = req.body;
    const donation = await Donation.findById(req.params.id).populate('donor');

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    if (donation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Donation is not in pending status'
      });
    }

    // Verify transaction on blockchain
    const verification = await blockchainService.verifyTransaction(
      txHash,
      donation.amount,
      process.env.RECIPIENT_ADDRESS || 'your_recipient_address_here'
    );

    if (!verification.verified) {
      return res.status(400).json({
        success: false,
        error: verification.message
      });
    }

    // Update donation with transaction details
    donation.status = 'completed';
    donation.blockchainTransaction = {
      txHash,
      blockNumber: verification.blockHeight,
      confirmations: verification.confirmations,
      timestamp: new Date()
    };

    await donation.save();

    // Update user total donated amount
    const user = donation.donor;
    user.totalDonated += donation.amount;
    await user.save();

    // Mint NFT for the donation
    try {
      const nftResult = await blockchainService.mintNFT(
        donation,
        user.walletAddress,
        `${req.protocol}://${req.get('host')}/uploads/default-nft.png`
      );

      // Create NFT record
      const nft = new NFT({
        donation: donation._id,
        assetId: nftResult.assetId,
        policyId: nftResult.policyId,
        assetName: nftResult.assetName,
        metadata: nftResult.metadata,
        blockchainData: {
          txHash: nftResult.txHash,
          mintedAt: new Date()
        },
        status: 'minted',
        owner: user.walletAddress
      });

      await nft.save();

      // Update donation with NFT info
      donation.nft = {
        assetId: nftResult.assetId,
        policyId: nftResult.policyId,
        assetName: nftResult.assetName,
        metadata: nftResult.metadata
      };

      await donation.save();

      // Send receipt email
      if (user.email && user.preferences.emailNotifications) {
        try {
          await sendDonationReceipt(donation, user, nft);
        } catch (emailError) {
          logger.error('Failed to send receipt email:', emailError);
        }
      }

      logger.info(`Donation confirmed and NFT minted: ${donation._id}`);

      res.json({
        success: true,
        data: {
          donation: donation.getPublicInfo(),
          nft: nft.getPublicInfo(),
          user: user.getPublicProfile()
        },
        message: 'Donation confirmed and NFT minted successfully!'
      });

    } catch (nftError) {
      logger.error('NFT minting error type:', typeof nftError, 'keys:', Object.keys(nftError || {}));
      logger.error('NFT minting failed:', nftError && (nftError.stack || nftError.message || JSON.stringify(nftError)));
      
      // Still return success for donation, but note NFT failure
      res.json({
        success: true,
        data: {
          donation: donation.getPublicInfo(),
          user: user.getPublicProfile()
        },
        message: 'Donation confirmed successfully, but NFT minting failed. Please contact support.',
        warning: 'NFT minting failed'
      });
    }

  } catch (error) {
    next(error);
  }
});

// @desc    Get my donations
// @route   GET /api/donations/my-donations
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    logger.info('💰 [DONATIONS] Get my donations request:', {
      userId: req.user.id
    });

    const donations = await Donation.find({ donor: req.user.id })
      .populate('project', 'title _id student attachments currentFunding fundingGoal')
      .populate('donor', 'name walletAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        donations
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get donations',
      error: error.message
    });
  }
});

// @route   GET /api/donations
// @desc    Get all donations with pagination and filters
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const status = req.query.status;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const donations = await Donation.find(filter)
      .populate('donor', 'name formattedWalletAddress')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-metadata');

    const total = await Donation.countDocuments(filter);

    res.json({
      success: true,
      data: {
        donations: donations.map(d => d.getPublicInfo()),
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

// @route   GET /api/donations/received
// @desc    Get all donations received for a student's projects
// @access  Private
router.get('/received', protect, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can view received donations.'
      });
    }
    // Find all projects owned by this student
    const projects = await Project.find({ student: req.user.id }).select('_id title');
    const projectIds = projects.map(p => p._id);
    // Find all donations for these projects
    const donations = await Donation.find({ project: { $in: projectIds } })
      .populate('donor', 'name walletAddress')
      .populate('project', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: {
        donations,
        projects
      }
    });
  } catch (error) {
    logger.error('💰 [DONATIONS] Get received donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get received donations',
      error: error.message
    });
  }
});

// @route   GET /api/donations/:id
// @desc    Get donation by ID
// @access  Public
router.get('/:id', async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name formattedWalletAddress email')
      .populate({
        path: 'nft',
        model: 'NFT',
        select: 'assetId metadata status cardanoScanUrl'
      });

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    res.json({
      success: true,
      data: {
        donation: donation.getPublicInfo(),
        receipt: {
          receiptNumber: donation.receipt.receiptNumber,
          issuedAt: donation.receipt.issuedAt
        }
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/donations/user/:walletAddress
// @desc    Get donations by wallet address
// @access  Public
router.get('/user/:walletAddress', async (req, res, next) => {
  try {
    const { walletAddress } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findByWalletAddress(walletAddress);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const skip = (page - 1) * limit;

    const donations = await Donation.find({ donor: user._id })
      .populate('donor', 'name formattedWalletAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Donation.countDocuments({ donor: user._id });

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        donations: donations.map(d => d.getPublicInfo()),
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

// @route   PUT /api/donations/:id
// @desc    Update donation (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { status, message } = req.body;
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    if (status) donation.status = status;
    if (message) donation.message = message;

    await donation.save();

    res.json({
      success: true,
      data: {
        donation: donation.getPublicInfo()
      },
      message: 'Donation updated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/donations/:id
// @desc    Delete donation (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        error: 'Donation not found'
      });
    }

    await donation.remove();

    res.json({
      success: true,
      message: 'Donation deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

// Handle upload errors
router.use(handleUploadError);

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donors only)
router.post('/', protect, authorize('donor'), async (req, res) => {
  try {
    const { projectId, amount, message, transactionHash } = req.body;
    
    logger.info('💰 [DONATIONS] Create donation request:', {
      donorId: req.user.id,
      projectId,
      amount,
      transactionHash
    });

    // Validate project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if project is active
    if (project.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Project is not active for donations'
      });
    }

    // Validate amount (minimum 1 ADA)
    if (amount < 1000000) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation amount is 1 ADA'
      });
    }

    // Create donation record
    const donation = new Donation({
      donor: req.user.id,
      donorAddress: req.user.walletAddress,
      project: projectId,
      amount,
      message: message || '',
      transactionHash,
      status: 'pending'
    });

    await donation.save();

    // Update project funding
    await project.updateFunding(amount);

    // Populate references for response
    await donation.populate('project', 'title student');
    await donation.populate('donor', 'name walletAddress');

    logger.info('💰 [DONATIONS] Donation created successfully:', {
      donationId: donation.id,
      projectId,
      amount
    });

    res.status(201).json({
      success: true,
      data: {
        donation
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Create donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create donation',
      error: error.message
    });
  }
});

// @desc    Get donations by project
// @route   GET /api/donations/project/:projectId
// @access  Public
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    
    logger.info('💰 [DONATIONS] Get project donations request:', {
      projectId
    });

    const donations = await Donation.find({ 
      project: projectId,
      status: { $in: ['confirmed', 'nft_minted'] }
    })
      .populate('donor', 'name walletAddress')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        donations
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Get project donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get project donations',
      error: error.message
    });
  }
});

// @desc    Get donor leaderboard
// @route   GET /api/donations/leaderboard
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    logger.info('💰 [DONATIONS] Get leaderboard request:', {
      limit: parseInt(limit)
    });

    const leaderboard = await Donation.getDonorLeaderboard(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        leaderboard
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

// @desc    Export donations as CSV
// @route   GET /api/donations/export
// @access  Private
router.get('/export', protect, async (req, res) => {
  try {
    const { projectId, startDate, endDate } = req.query;
    
    logger.info('💰 [DONATIONS] Export donations request:', {
      userId: req.user.id,
      projectId,
      startDate,
      endDate
    });

    // Build query
    let query = { donor: req.user.id };
    
    if (projectId) {
      query.project = projectId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const donations = await Donation.find(query)
      .populate('project', 'title student')
      .sort({ createdAt: -1 });

    // Create CSV
    const csvWriter = createObjectCsvWriter({
      path: path.join(process.cwd(), 'temp', `donations-${req.user.id}-${Date.now()}.csv`),
      header: [
        { id: 'date', title: 'Date' },
        { id: 'project', title: 'Project' },
        { id: 'amount', title: 'Amount (ADA)' },
        { id: 'message', title: 'Message' },
        { id: 'status', title: 'Status' },
        { id: 'transactionHash', title: 'Transaction Hash' },
        { id: 'nftAssetId', title: 'NFT Asset ID' }
      ]
    });

    const records = donations.map(donation => ({
      date: donation.createdAt.toISOString().split('T')[0],
      project: donation.project?.title || 'Unknown',
      amount: (donation.amount / 1000000).toFixed(6),
      message: donation.message || '',
      status: donation.status,
      transactionHash: donation.transactionHash,
      nftAssetId: donation.nftAssetId || ''
    }));

    await csvWriter.writeRecords(records);

    // Send file
    const filePath = csvWriter.csvStringifier.path;
    res.download(filePath, `donations-${new Date().toISOString().split('T')[0]}.csv`, (err) => {
      // Clean up file after download
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Export donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export donations',
      error: error.message
    });
  }
});

// @desc    Confirm donation transaction
// @route   PUT /api/donations/:id/confirm
// @access  Private
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { blockNumber } = req.body;
    
    logger.info('💰 [DONATIONS] Confirm donation request:', {
      donationId: id,
      blockNumber
    });

    let donation = await Donation.findById(id).populate('project');
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    // Only allow donor or admin to confirm
    if (donation.donor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this donation'
      });
    }

    await donation.confirm(blockNumber);
    // Fetch updated donation
    donation = await Donation.findById(id).populate('project');

    // Try to mint NFT after confirmation
    let nftResult = null;
    try {
      nftResult = await blockchainService.mintNFT(
        {
          ...donation.toObject(),
          projectTitle: donation.project?.title,
          formattedAmount: (donation.amount / 1_000_000).toFixed(2),
          createdAt: donation.createdAt,
          message: donation.message,
          transactionHash: donation.transactionHash
        },
        donation.donorAddress,
        'https://placehold.co/400x400/png?text=EduFund+NFT'
      );
      donation.nftAssetId = nftResult.assetId;
      donation.nftPolicyId = nftResult.policyId;
      donation.nftMetadata = nftResult.metadata;
      donation.status = 'nft_minted';
      await donation.save();
      logger.info(`NFT minted after confirmation for donation ${donation._id}`);
    } catch (nftError) {
      logger.error('NFT minting error type:', typeof nftError, 'keys:', Object.keys(nftError || {}));
      logger.error('NFT minting failed after confirmation:', nftError && (nftError.stack || nftError.message || JSON.stringify(nftError)));
      // Leave status as 'confirmed'
    }

    res.status(200).json({
      success: true,
      data: {
        donation,
        nft: nftResult
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Confirm donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm donation',
      error: error.message
    });
  }
});

// @desc    Mark NFT as minted
// @route   PUT /api/donations/:id/mint-nft
// @access  Private
router.put('/:id/mint-nft', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { nftAssetId, nftPolicyId, metadata } = req.body;
    
    logger.info('💰 [DONATIONS] Mint NFT request:', {
      donationId: id,
      nftAssetId,
      nftPolicyId
    });

    const donation = await Donation.findById(id);
    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found'
      });
    }

    await donation.markNFTMinted(nftAssetId, nftPolicyId, metadata);

    res.status(200).json({
      success: true,
      data: {
        donation
      }
    });

  } catch (error) {
    logger.error('💰 [DONATIONS] Mint NFT error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mint NFT',
      error: error.message
    });
  }
});

export default router; 
 
 