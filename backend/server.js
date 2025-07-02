import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import donationRoutes from './routes/donations.js';
import nftRoutes from './routes/nfts.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import blockchainRoutes from './routes/blockchain.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import uploadRoutes from './routes/upload.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { logger } from './utils/logger.js';

// Import database connection
import { connectDB } from './config/database.js';

// Import blockchain service
import { initializeBlockchain } from './services/blockchainService.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http://localhost:4567"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Static files
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/donations', donationRoutes);
app.use('/api/nfts', nftRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/upload', uploadRoutes);

// API documentation
app.get('/api', (req, res) => {
  res.json({
    message: 'EduFund API',
    version: '1.0.0',
    endpoints: {
      donations: '/api/donations',
      nfts: '/api/nfts',
      users: '/api/users',
      dashboard: '/api/dashboard',
      blockchain: '/api/blockchain',
      auth: '/api/auth',
      projects: '/api/projects'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    logger.info('Database connected successfully');

    // Initialize blockchain service
    await initializeBlockchain();
    logger.info('Blockchain service initialized');

    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
      logger.info(`API documentation: http://localhost:${PORT}/api`);
      console.log('\n================ EduFund Backend Ready ================');
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log('');
      console.log('🔗 Frontend Integration:');
      console.log(`   API Base URL: http://localhost:${PORT}/api`);
      console.log('   CORS: Enabled for localhost:3000, localhost:5173');
      console.log('');
      console.log('✅ Production Ready:');
      console.log('   - MongoDB Atlas connected');
      console.log('   - Cardano blockchain service active');
      console.log('   - All endpoints ready for real data');
      console.log('');
      console.log('📋 Available Endpoints:');
      console.log('   - /api/donations - Donation management');
      console.log('   - /api/users - User management');
      console.log('   - /api/nfts - NFT operations');
      console.log('   - /api/blockchain - Cardano integration');
      console.log('   - /api/dashboard - Analytics');
      console.log('   - /api/auth - Authentication');
      console.log('   - /api/projects - Project management');
      console.log('   - /api/upload - Upload operations');
      console.log('');
      console.log('=======================================================\n');
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception thrown:', err);
  process.exit(1);
});

startServer();

export default app; 