# Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of the EduVerse project to Vercel.

## Project Structure

This is a monorepo with:
- **Frontend**: React + Vite application (root directory)
- **Backend**: Node.js + Express API (backend/ directory)

## Deployment Steps

### 1. Prerequisites

- Vercel account
- MongoDB Atlas account (for production database)
- Blockfrost API key (for Cardano blockchain integration)

### 2. Environment Variables

Set the following environment variables in your Vercel project settings:

#### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edufund

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=7d

# Blockfrost API Configuration (Cardano)
BLOCKFROST_PROJECT_ID=your_blockfrost_project_id_here
BLOCKFROST_API_URL=https://cardano-mainnet.blockfrost.io/api/v0

# Cardano Network Configuration
CARDANO_NETWORK=mainnet

# NFT Configuration
NFT_POLICY_ID=your_nft_policy_id_here
NFT_ASSET_NAME_PREFIX=EDUFUND
NFT_METADATA_LABEL=721

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here

# API Keys (Optional)
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
GOOGLE_ANALYTICS_ID=your_ga_id

# Blockchain Transaction Configuration
MIN_ADA_AMOUNT=1000000
TRANSACTION_TIMEOUT=300000
```

### 3. Deployment Options

#### Option A: Deploy as Monorepo (Recommended)

1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. The frontend will be served from the root, and API routes will be handled by the backend

#### Option B: Deploy Separately

1. **Frontend Deployment**:
   - Deploy the root directory to Vercel
   - Update API endpoints in your frontend code to point to your backend URL

2. **Backend Deployment**:
   - Deploy the `backend/` directory as a separate Vercel project
   - Use the `backend/vercel.json` configuration

### 4. Configuration Files

The following files have been created for Vercel deployment:

- `vercel.json` - Main Vercel configuration for monorepo deployment
- `backend/vercel.json` - Backend-specific configuration
- `.vercelignore` - Files to ignore during deployment

### 5. Build Configuration

The project includes the following build scripts:
- `vercel-build` - Frontend build command
- `vercel-build` - Backend build command (no-op for Node.js)

### 6. API Routes

API routes are configured to be served under `/api/*` and will be handled by the backend server.

### 7. Database Setup

1. Create a MongoDB Atlas cluster
2. Set up database user with appropriate permissions
3. Configure network access to allow Vercel IPs
4. Update `MONGODB_URI` environment variable

### 8. Cardano Blockchain Setup

1. Get a Blockfrost API key from [blockfrost.io](https://blockfrost.io)
2. Create or use an existing NFT policy
3. Update the relevant environment variables

### 9. File Uploads

For file uploads, consider using:
- Vercel Blob storage
- AWS S3
- Cloudinary
- Or any other cloud storage service

Update the upload configuration in your backend accordingly.

### 10. Monitoring and Logs

- Use Vercel's built-in monitoring
- Set up error tracking (Sentry, LogRocket, etc.)
- Monitor API performance and usage

## Troubleshooting

### Common Issues

1. **Build Failures**: Check that all dependencies are properly installed
2. **Environment Variables**: Ensure all required variables are set in Vercel
3. **CORS Issues**: Update `CORS_ORIGIN` to include your frontend domain
4. **Database Connection**: Verify MongoDB connection string and network access
5. **API Routes**: Check that routes are properly configured in `vercel.json`

### Debugging

1. Check Vercel function logs
2. Use Vercel CLI for local testing: `vercel dev`
3. Test API endpoints using tools like Postman or curl

## Security Considerations

1. Never commit sensitive environment variables
2. Use strong, unique secrets for JWT and session keys
3. Enable CORS only for your frontend domain
4. Implement rate limiting
5. Use HTTPS (enabled by default on Vercel)
6. Regularly rotate API keys and secrets

## Performance Optimization

1. Enable Vercel's edge caching
2. Optimize images and assets
3. Use CDN for static files
4. Implement proper caching headers
5. Monitor and optimize database queries

## Support

For issues specific to this deployment:
1. Check the Vercel documentation
2. Review the project's README files
3. Check the backend logs in Vercel dashboard
4. Verify environment variable configuration
