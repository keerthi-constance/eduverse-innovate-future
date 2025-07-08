import express from 'express';
import { blockchainService } from '../services/blockchainService.js';
import { protect, authorize } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// @route   GET /api/blockchain/network
// @desc    Get network information
// @access  Public
router.get('/network', async (req, res, next) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();

    res.json({
      success: true,
      data: networkInfo
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/blockchain/wallet/:address
// @desc    Get wallet balance and information
// @access  Public
router.get('/wallet/:address', async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!blockchainService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Cardano wallet address'
      });
    }

    const walletInfo = await blockchainService.getWalletBalance(address);

    res.json({
      success: true,
      data: walletInfo
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/blockchain/transaction/:txHash
// @desc    Get transaction details
// @access  Public
router.get('/transaction/:txHash', async (req, res, next) => {
  try {
    const { txHash } = req.params;

    if (txHash.length !== 64) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction hash format'
      });
    }

    const transaction = await blockchainService.getTransaction(txHash);

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/blockchain/asset/:assetId
// @desc    Get asset information
// @access  Public
router.get('/asset/:assetId', async (req, res, next) => {
  try {
    const { assetId } = req.params;

    const assetInfo = await blockchainService.getAssetInfo(assetId);

    res.json({
      success: true,
      data: assetInfo
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/blockchain/verify-address
// @desc    Verify if an address is valid
// @access  Public
router.post('/verify-address', async (req, res, next) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required'
      });
    }

    const isValid = blockchainService.isValidAddress(address);

    res.json({
      success: true,
      data: {
        address,
        isValid
      }
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/blockchain/verify-transaction
// @desc    Verify a transaction
// @access  Public
router.post('/verify-transaction', async (req, res, next) => {
  try {
    const { txHash, expectedAmount, recipientAddress } = req.body;

    if (!txHash || !expectedAmount || !recipientAddress) {
      return res.status(400).json({
        success: false,
        error: 'Transaction hash, expected amount, and recipient address are required'
      });
    }

    const verification = await blockchainService.verifyTransaction(
      txHash,
      parseInt(expectedAmount),
      recipientAddress
    );

    res.json({
      success: true,
      data: verification
    });

  } catch (error) {
    next(error);
  }
});

// @route   GET /api/blockchain/status
// @desc    Get blockchain service status
// @access  Private/Admin
router.get('/status', protect, authorize('admin'), async (req, res, next) => {
  try {
    const status = {
      initialized: blockchainService.isInitialized,
      network: process.env.CARDANO_NETWORK,
      policyId: blockchainService.policyId,
      blockfrostConfigured: !!process.env.BLOCKFROST_PROJECT_ID,
      lucidConfigured: !!blockchainService.lucid
    };

    // Test connection if initialized
    if (blockchainService.isInitialized) {
      try {
        const networkInfo = await blockchainService.getNetworkInfo();
        status.connection = 'connected';
        status.networkInfo = networkInfo;
      } catch (error) {
        status.connection = 'error';
        status.error = error.message;
      }
    }

    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    next(error);
  }
});

// @route   POST /api/blockchain/reinitialize
// @desc    Reinitialize blockchain service (admin only)
// @access  Private/Admin
router.post('/reinitialize', protect, authorize('admin'), async (req, res, next) => {
  try {
    await blockchainService.initialize();

    res.json({
      success: true,
      message: 'Blockchain service reinitialized successfully'
    });

  } catch (error) {
    next(error);
  }
});

export default router; 
 
 
 
 
 
 
 