import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Validation middleware
const validateUser = [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required'),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters')
];

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', validateUser, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { walletAddress, email, name, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ walletAddress: walletAddress.toLowerCase() }, { email: email.toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this wallet address or email already exists'
      });
    }

    // Create user
    const user = new User({
      walletAddress: walletAddress.toLowerCase(),
      email: email.toLowerCase(),
      name,
      password: password || undefined
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: 'User registered successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
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

    const { walletAddress, password } = req.body;

    // Find user by wallet address
    const user = await User.findByWalletAddress(walletAddress);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password if provided
    if (password && user.password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', protect, [
  body('name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Name cannot be more than 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),
  body('preferences.anonymousDonations')
    .optional()
    .isBoolean()
    .withMessage('anonymousDonations must be a boolean')
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

    const { name, email, preferences } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      },
      message: 'Profile updated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:walletAddress
// @desc    Get user by wallet address
// @access  Public
router.get('/:walletAddress', async (req, res, next) => {
  try {
    const user = await User.findByWalletAddress(req.params.walletAddress);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:walletAddress/donations
// @desc    Get user donations
// @access  Public
router.get('/:walletAddress/donations', async (req, res, next) => {
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

// @route   GET /api/users/top-donors
// @desc    Get top donors
// @access  Public
router.get('/top-donors', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const topDonors = await User.getTopDonors(limit);

    res.json({
      success: true,
      data: {
        topDonors
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const filter = {};
    if (role) {
      filter.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users: users.map(user => user.getPublicProfile()),
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

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { role, isVerified, name, email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (role) user.role = role;
    if (typeof isVerified === 'boolean') user.isVerified = isVerified;
    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();

    await user.save();

    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      },
      message: 'User updated successfully'
    });

  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.remove();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    next(error);
  }
});

export default router; 
 
 
 
 
 
 
 