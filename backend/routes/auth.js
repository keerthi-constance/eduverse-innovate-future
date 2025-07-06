import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validateCardanoAddress } from '../utils/validation.js';
import { logger } from '../utils/logger.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  logger.info(`Generating JWT token for user: ${userId}`);
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Connect wallet and authenticate user
// @route   POST /api/auth/connect-wallet
// @access  Public
router.post('/connect-wallet', async (req, res) => {
  try {
    const { walletAddress, signature, message } = req.body;
    
    logger.info(`🔐 [AUTH] Wallet connection attempt:`, {
      walletAddress: walletAddress ? `${walletAddress.slice(0, 10)}...` : 'missing',
      hasSignature: !!signature,
      hasMessage: !!message,
      bodyKeys: Object.keys(req.body)
    });

    // Validate wallet address
    if (!validateCardanoAddress(walletAddress)) {
      logger.warn(`🔐 [AUTH] Invalid wallet address: ${walletAddress}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid Cardano wallet address'
      });
    }

    // Verify signature (optional - for enhanced security)
    if (signature && message) {
      // TODO: Implement signature verification with Cardano
      // For now, we'll trust the wallet connection
      logger.info(`Wallet signature verification pending for: ${walletAddress}`);
    }

    // Find or create user
    logger.info(`🔐 [AUTH] Finding or creating user for wallet: ${walletAddress.slice(0, 10)}...`);
    let user = await User.findOrCreateByWallet(walletAddress);
    
    if (!user) {
      logger.error(`🔐 [AUTH] Failed to create or find user for wallet: ${walletAddress}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to create or find user'
      });
    }

    logger.info(`🔐 [AUTH] User found/created:`, {
      userId: user._id,
      role: user.role,
      walletAddress: user.walletAddress.slice(0, 10) + '...'
    });

    // Generate token
    const token = generateToken(user._id);
    logger.info(`🔐 [AUTH] JWT token generated for user: ${user._id}`);

    // Return user data
    const responseData = {
      success: true,
      message: 'Wallet connected successfully',
      data: {
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          institution: user.institution,
          researchField: user.researchField,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
          location: user.location,
          studentInfo: user.studentInfo,
          donorInfo: user.donorInfo,
          createdAt: user.createdAt
        }
      }
    };

    logger.info(`🔐 [AUTH] Wallet connection successful:`, {
      userId: user._id,
      role: user.role,
      hasToken: !!token,
      tokenLength: token.length
    });

    res.status(200).json(responseData);

    logger.info(`User authenticated via wallet: ${walletAddress} (Role: ${user.role})`);

  } catch (error) {
    logger.error('🔐 [AUTH] Wallet connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// @desc    Login with wallet address (simplified version without signature)
// @route   POST /api/auth/wallet-login
// @access  Public
router.post('/wallet-login', async (req, res) => {
  try {
    const { walletAddress, displayName } = req.body;
    
    logger.info(`🔐 [AUTH] Wallet login attempt:`, {
      walletAddress: walletAddress ? `${walletAddress.slice(0, 10)}...` : 'missing',
      displayName: displayName,
      bodyKeys: Object.keys(req.body),
      fullAddress: walletAddress,
      addressLength: walletAddress ? walletAddress.length : 0
    });

    // Validate wallet address
    if (!validateCardanoAddress(walletAddress)) {
      logger.warn(`🔐 [AUTH] Invalid wallet address: ${walletAddress}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid Cardano wallet address'
      });
    }

    // Find or create user
    logger.info(`🔐 [AUTH] Finding or creating user for wallet: ${walletAddress.slice(0, 10)}...`);
    let user = await User.findOrCreateByWallet(walletAddress);
    
    if (!user) {
      logger.error(`🔐 [AUTH] Failed to create or find user for wallet: ${walletAddress}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to create or find user'
      });
    }

    // Update display name if provided
    if (displayName && displayName !== user.displayName) {
      user.displayName = displayName;
      await user.save();
      logger.info(`🔐 [AUTH] Updated display name for user: ${user._id}`);
    }

    logger.info(`🔐 [AUTH] User found/created:`, {
      userId: user._id,
      role: user.role,
      walletAddress: user.walletAddress.slice(0, 10) + '...'
    });

    // Generate token
    const token = generateToken(user._id);
    logger.info(`🔐 [AUTH] JWT token generated for user: ${user._id}`);

    // Return user data
    const responseData = {
      success: true,
      message: 'Wallet login successful',
      data: {
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          institution: user.institution,
          researchField: user.researchField,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
          location: user.location,
          studentInfo: user.studentInfo,
          donorInfo: user.donorInfo,
          createdAt: user.createdAt
        }
      }
    };

    logger.info(`🔐 [AUTH] Wallet login successful:`, {
      userId: user._id,
      role: user.role,
      hasToken: !!token,
      tokenLength: token.length
    });

    res.status(200).json(responseData);

  } catch (error) {
    logger.error('🔐 [AUTH] Wallet login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// @desc    Get user by wallet address
// @route   GET /api/auth/wallet/:walletAddress
// @access  Public
router.get('/wallet/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    logger.info(`🔐 [AUTH] Get user by wallet address:`, {
      walletAddress: walletAddress ? `${walletAddress.slice(0, 10)}...` : 'missing',
      fullAddress: walletAddress,
      addressLength: walletAddress ? walletAddress.length : 0
    });

    // Validate wallet address
    if (!validateCardanoAddress(walletAddress)) {
      logger.warn(`🔐 [AUTH] Invalid wallet address: ${walletAddress}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid Cardano wallet address'
      });
    }

    const user = await User.findByWalletAddress(walletAddress);

    if (!user) {
      logger.warn(`🔐 [AUTH] User not found for wallet: ${walletAddress.slice(0, 10)}...`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`🔐 [AUTH] User found by wallet address:`, {
      userId: user._id,
      role: user.role,
      walletAddress: user.walletAddress.slice(0, 10) + '...'
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          institution: user.institution,
          researchField: user.researchField,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
          location: user.location,
          studentInfo: user.studentInfo,
          donorInfo: user.donorInfo,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('🔐 [AUTH] Get user by wallet address error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user',
      error: error.message
    });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    logger.info(`🔐 [AUTH] Get profile request:`, {
      userId: req.user?.id,
      hasUser: !!req.user
    });

    const user = await User.findById(req.user.id)
      .populate('projects')
      .populate('donations')
      .populate('nfts');

    if (!user) {
      logger.warn(`🔐 [AUTH] User not found for ID: ${req.user.id}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    logger.info(`🔐 [AUTH] Profile retrieved successfully:`, {
      userId: user._id,
      role: user.role,
      walletAddress: user.walletAddress.slice(0, 10) + '...'
    });

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          institution: user.institution,
          researchField: user.researchField,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          isVerified: user.isVerified,
          location: user.location,
          studentInfo: user.studentInfo,
          donorInfo: user.donorInfo,
          projects: user.projects,
          donations: user.donations,
          nfts: user.nfts,
          lastActive: user.lastActive,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('🔐 [AUTH] Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const {
      name,
      displayName,
      email,
      institution,
      researchField,
      role,
      location,
      studentInfo,
      donorInfo
    } = req.body;

    logger.info(`🔐 [AUTH] Update profile request:`, {
      userId: req.user.id,
      fields: Object.keys(req.body)
    });

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update basic profile info
    if (name !== undefined) user.name = name;
    if (displayName !== undefined) user.displayName = displayName;
    if (email !== undefined) user.email = email;
    if (institution !== undefined) user.institution = institution;
    if (researchField !== undefined) user.researchField = researchField;
    
    // Update role (with validation)
    if (role && ['student', 'donor'].includes(role)) {
      user.role = role;
    }

    // Update location
    if (location) {
      user.location = { ...user.location, ...location };
    }

    // Update role-specific info
    if (studentInfo) {
      user.studentInfo = { ...user.studentInfo, ...studentInfo };
    }

    if (donorInfo) {
      user.donorInfo = { ...user.donorInfo, ...donorInfo };
    }

    // Mark profile as completed
    user.profileCompleted = true;

    await user.save();

    logger.info(`🔐 [AUTH] Profile updated successfully:`, {
      userId: user._id,
      walletAddress: user.walletAddress.slice(0, 10) + '...',
      role: user.role,
      profileCompleted: user.profileCompleted
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          email: user.email,
          institution: user.institution,
          researchField: user.researchField,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          location: user.location,
          studentInfo: user.studentInfo,
          donorInfo: user.donorInfo,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    logger.error('🔐 [AUTH] Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @desc    Upgrade user to student role
// @route   POST /api/auth/upgrade-to-student
// @access  Private
router.post('/upgrade-to-student', protect, async (req, res) => {
  try {
    const {
      studentId,
      fieldOfStudy,
      academicLevel,
      graduationYear,
      gpa,
      researchInterests,
      institution,
      city
    } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role === 'student') {
      return res.status(400).json({
        success: false,
        message: 'User is already a student'
      });
    }

    // Validate required fields
    if (!studentId || !fieldOfStudy || !academicLevel || !institution) {
      return res.status(400).json({
        success: false,
        message: 'Missing required student information'
      });
    }

    // Update location for Sri Lankan students
    user.location = {
      country: 'Sri Lanka',
      city: city || user.location.city,
      institution
    };

    // Upgrade to student
    await user.upgradeToStudent({
      studentId,
      fieldOfStudy,
      academicLevel,
      graduationYear,
      gpa,
      researchInterests: researchInterests || []
    });

    res.status(200).json({
      success: true,
      message: 'Successfully upgraded to student role',
      data: {
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          name: user.name,
          displayName: user.displayName,
          userType: user.userType,
          profileCompleted: user.profileCompleted,
          location: user.location,
          studentInfo: user.studentInfo
        }
      }
    });

    logger.info(`User upgraded to student: ${user.walletAddress}`);

  } catch (error) {
    logger.error('Upgrade to student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade to student',
      error: error.message
    });
  }
});

// @desc    Disconnect wallet (logout)
// @route   POST /api/auth/disconnect
// @access  Private
router.post('/disconnect', protect, async (req, res) => {
  try {
    // Update last active
    await User.findByIdAndUpdate(req.user.id, {
      lastActive: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Wallet disconnected successfully'
    });

    logger.info(`User disconnected wallet: ${req.user.id}`);

  } catch (error) {
    logger.error('Disconnect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect',
      error: error.message
    });
  }
});

// @desc    Verify wallet address
// @route   POST /api/auth/verify-wallet
// @access  Public
router.post('/verify-wallet', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!validateCardanoAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Cardano wallet address'
      });
    }

    // Check if wallet exists
    const existingUser = await User.findOne({ walletAddress });

    res.status(200).json({
      success: true,
      data: {
        exists: !!existingUser,
        isNewUser: !existingUser
      }
    });

  } catch (error) {
    logger.error('Verify wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify wallet',
      error: error.message
    });
  }
});

export default router; 
 
 