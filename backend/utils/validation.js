import Joi from 'joi';

// Cardano address validation
export const validateCardanoAddress = (address) => {
  const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^addr[0-9a-z]{98,103}$|^addr_test[0-9a-z]{98,103}$/;
  return addressRegex.test(address);
};

// Transaction hash validation
export const validateTransactionHash = (txHash) => {
  const txHashRegex = /^[a-fA-F0-9]{64}$/;
  return txHashRegex.test(txHash);
};

// Asset ID validation
export const validateAssetId = (assetId) => {
  const assetIdRegex = /^[a-fA-F0-9]{56}$/;
  return assetIdRegex.test(assetId);
};

// Policy ID validation
export const validatePolicyId = (policyId) => {
  const policyIdRegex = /^[a-fA-F0-9]{56}$/;
  return policyIdRegex.test(policyId);
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Amount validation (in lovelace)
export const validateAmount = (amount, minAmount = 1000000) => {
  const numAmount = parseInt(amount);
  return !isNaN(numAmount) && numAmount >= minAmount;
};

// Pagination validation
export const validatePagination = (page, limit) => {
  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  
  return {
    page: !isNaN(numPage) && numPage > 0 ? numPage : 1,
    limit: !isNaN(numLimit) && numLimit > 0 && numLimit <= 100 ? numLimit : 10
  };
};

// Cardano wallet address validation
export const validateWalletAddress = (address) => {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Cardano address format validation
  const cardanoAddressRegex = /^addr[0-9a-z]+$/;
  return cardanoAddressRegex.test(address);
};

// Joi schemas for validation
export const schemas = {
  // User registration
  userRegistration: Joi.object({
    walletAddress: Joi.string().required().custom((value, helpers) => {
      if (!validateCardanoAddress(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'cardano-address'),
    email: Joi.string().email().required(),
    name: Joi.string().min(1).max(50).required(),
    password: Joi.string().min(6).optional()
  }),

  // User login
  userLogin: Joi.object({
    walletAddress: Joi.string().required(),
    password: Joi.string().optional()
  }),

  // Donation creation
  donationCreation: Joi.object({
    amount: Joi.number().integer().min(1000000).required(),
    walletAddress: Joi.string().required().custom((value, helpers) => {
      if (!validateCardanoAddress(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'cardano-address'),
    message: Joi.string().max(500).optional(),
    category: Joi.string().valid('education', 'infrastructure', 'scholarship', 'research', 'general').optional(),
    isAnonymous: Joi.boolean().optional(),
    email: Joi.string().email().optional(),
    name: Joi.string().max(50).optional()
  }),

  // Donation confirmation
  donationConfirmation: Joi.object({
    txHash: Joi.string().length(64).pattern(/^[a-fA-F0-9]+$/).required()
  }),

  // NFT metadata
  nftMetadata: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().min(1).max(500).required(),
    image: Joi.string().uri().required(),
    attributes: Joi.array().items(
      Joi.object({
        trait_type: Joi.string().required(),
        value: Joi.string().required()
      })
    ).optional(),
    external_url: Joi.string().uri().optional(),
    animation_url: Joi.string().uri().optional()
  }),

  // User profile update
  userProfileUpdate: Joi.object({
    name: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().optional(),
    preferences: Joi.object({
      emailNotifications: Joi.boolean().optional(),
      anonymousDonations: Joi.boolean().optional()
    }).optional()
  }),

  // Admin user update
  adminUserUpdate: Joi.object({
    role: Joi.string().valid('donor', 'admin').optional(),
    isVerified: Joi.boolean().optional(),
    name: Joi.string().min(1).max(50).optional(),
    email: Joi.string().email().optional()
  }),

  // Pagination query
  paginationQuery: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional()
  }),

  // Date range query
  dateRangeQuery: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
  }),

  // Blockchain verification
  blockchainVerification: Joi.object({
    txHash: Joi.string().length(64).pattern(/^[a-fA-F0-9]+$/).required(),
    expectedAmount: Joi.number().integer().min(1000000).required(),
    recipientAddress: Joi.string().required().custom((value, helpers) => {
      if (!validateCardanoAddress(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'cardano-address')
  }),

  // Address verification
  addressVerification: Joi.object({
    address: Joi.string().required()
  }),

  // Donation validation schema
  donationSchema: Joi.object({
    amount: Joi.number().positive().required(),
    projectId: Joi.string().required(),
    message: Joi.string().max(500).optional(),
    anonymous: Joi.boolean().default(false)
  }),

  // Project validation schema
  projectSchema: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(20).max(2000).required(),
    category: Joi.string().required(),
    fundingGoal: Joi.number().positive().required(),
    deadline: Joi.date().greater('now').required(),
    institution: Joi.string().min(1).required(),
    researchField: Joi.string().optional(),
    expectedOutcomes: Joi.string().max(1000).optional(),
    teamMembers: Joi.string().optional(),
    milestones: Joi.array().items(Joi.string()).optional(),
    tags: Joi.array().items(Joi.string()).max(10).optional(),
    attachments: Joi.array().items(Joi.string()).max(5).optional()
  }),

  // User profile validation schema
  userProfileSchema: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    location: Joi.object({
      country: Joi.string().optional(),
      city: Joi.string().optional(),
      institution: Joi.string().optional()
    }).optional(),
    studentInfo: Joi.object({
      studentId: Joi.string().optional(),
      fieldOfStudy: Joi.string().optional(),
      academicLevel: Joi.string().valid('undergraduate', 'postgraduate', 'phd', 'research').optional(),
      graduationYear: Joi.number().integer().min(2024).max(2030).optional(),
      gpa: Joi.number().min(0).max(4).optional(),
      researchInterests: Joi.array().items(Joi.string()).optional()
    }).optional(),
    donorInfo: Joi.object({
      preferredCategories: Joi.array().items(Joi.string()).optional()
    }).optional()
  }),

  // Student upgrade validation schema
  studentUpgradeSchema: Joi.object({
    studentId: Joi.string().required(),
    fieldOfStudy: Joi.string().required(),
    academicLevel: Joi.string().valid('undergraduate', 'postgraduate', 'phd', 'research').required(),
    graduationYear: Joi.number().integer().min(2024).max(2030).optional(),
    gpa: Joi.number().min(0).max(4).optional(),
    researchInterests: Joi.array().items(Joi.string()).optional(),
    institution: Joi.string().required(),
    city: Joi.string().optional()
  }),

  // NFT validation schema
  nftSchema: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().min(10).max(500).required(),
    imageUrl: Joi.string().uri().required(),
    metadata: Joi.object().optional()
  }),

  // Pagination validation
  paginationSchema: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
  }),

  // Search validation
  searchSchema: Joi.object({
    query: Joi.string().min(1).max(100).required(),
    category: Joi.string().optional(),
    minAmount: Joi.number().positive().optional(),
    maxAmount: Joi.number().positive().optional(),
    status: Joi.string().valid('active', 'funded', 'expired').optional()
  }),

  // Email validation
  emailSchema: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    template: Joi.string().required(),
    data: Joi.object().optional()
  }),

  // Blockchain transaction validation
  transactionSchema: Joi.object({
    txHash: Joi.string().required(),
    amount: Joi.number().positive().required(),
    recipientAddress: Joi.string().required(),
    metadata: Joi.object().optional()
  })
};

// Custom error messages
export const errorMessages = {
  'cardano-address': 'Invalid Cardano wallet address format',
  'transaction-hash': 'Invalid transaction hash format',
  'asset-id': 'Invalid asset ID format',
  'policy-id': 'Invalid policy ID format',
  'amount': 'Amount must be at least 1 ADA (1,000,000 lovelace)',
  'email': 'Please provide a valid email address',
  'pagination': 'Invalid pagination parameters'
};

// Validation middleware factory
export const createValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
export const createQueryValidationMiddleware = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        details: errors
      });
    }

    req.query = value;
    next();
  };
};

// Export individual schemas for direct import
export const projectSchema = schemas.projectSchema;
export const donationSchema = schemas.donationSchema;
export const userProfileSchema = schemas.userProfileSchema;
export const studentUpgradeSchema = schemas.studentUpgradeSchema;
export const nftSchema = schemas.nftSchema;
export const paginationSchema = schemas.paginationSchema;
export const searchSchema = schemas.searchSchema;
export const emailSchema = schemas.emailSchema;
export const transactionSchema = schemas.transactionSchema;

export default {
  validateCardanoAddress,
  validateTransactionHash,
  validateAssetId,
  validatePolicyId,
  validateEmail,
  validateAmount,
  validatePagination,
  validateWalletAddress,
  schemas,
  errorMessages,
  createValidationMiddleware,
  createQueryValidationMiddleware
}; 