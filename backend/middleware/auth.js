import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

export const protect = async (req, res, next) => {
  let token;

  logger.info(`🔐 [MIDDLEWARE] Auth check for ${req.method} ${req.path}:`, {
    hasAuthHeader: !!req.headers.authorization,
    authHeaderStartsWithBearer: req.headers.authorization?.startsWith('Bearer'),
    headers: Object.keys(req.headers)
  });

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      logger.info(`🔐 [MIDDLEWARE] Token extracted:`, {
        tokenLength: token?.length,
        tokenPreview: token ? `${token.slice(0, 20)}...` : 'missing'
      });

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      logger.info(`🔐 [MIDDLEWARE] JWT verified:`, {
        userId: decoded.userId,
        hasUserId: !!decoded.userId
      });

      // Get user from token
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        logger.warn(`🔐 [MIDDLEWARE] User not found for ID: ${decoded.userId}`);
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      logger.info(`🔐 [MIDDLEWARE] User authenticated:`, {
        userId: req.user._id,
        role: req.user.role,
        walletAddress: req.user.walletAddress?.slice(0, 10) + '...'
      });

      next();
    } catch (error) {
      logger.error(`🔐 [MIDDLEWARE] JWT verification failed:`, {
        error: error.message,
        tokenLength: token?.length
      });
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  }

  if (!token) {
    logger.warn(`🔐 [MIDDLEWARE] No token provided for ${req.method} ${req.path}`);
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    logger.info(`🔐 [MIDDLEWARE] Role check for ${req.method} ${req.path}:`, {
      requiredRoles: roles,
      userRole: req.user?.role,
      hasUser: !!req.user
    });

    if (!req.user) {
      logger.warn(`🔐 [MIDDLEWARE] No user found for role check`);
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`🔐 [MIDDLEWARE] Insufficient role:`, {
        userRole: req.user.role,
        requiredRoles: roles
      });
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }

    logger.info(`🔐 [MIDDLEWARE] Role check passed:`, {
      userRole: req.user.role,
      requiredRoles: roles
    });

    next();
  };
}; 