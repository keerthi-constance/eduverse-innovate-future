# EduFund Backend

A comprehensive Node.js + Express backend for the EduFund donation platform with Cardano blockchain integration, NFT minting, and secure donation management.

## 🚀 Features

- **Blockchain Integration**: Full Cardano blockchain support via Blockfrost API
- **NFT Minting**: Automatic NFT certificate generation for donations
- **Secure Donations**: Transaction verification and blockchain confirmation
- **User Management**: Wallet-based authentication and user profiles
- **Email Notifications**: Automated receipt and notification emails
- **Admin Dashboard**: Comprehensive analytics and reporting
- **RESTful API**: Complete API for frontend integration
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT authentication, rate limiting, input validation
- **Logging**: Structured logging with Winston
- **File Upload**: Image upload for NFT metadata

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Blockfrost API key
- Cardano wallet for NFT minting
- SMTP server for emails (optional)

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/edufund
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Blockfrost API
   BLOCKFROST_PROJECT_ID=your_blockfrost_project_id
   BLOCKFROST_API_URL=https://cardano-mainnet.blockfrost.io/api/v0
   
   # Cardano Network
   CARDANO_NETWORK=mainnet
   
   # NFT Configuration
   NFT_POLICY_ID=your_nft_policy_id
   NFT_ASSET_NAME_PREFIX=EDUFUND
   
   # Email (optional)
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Core Endpoints

#### Donations

**Create Donation**
```http
POST /donations
Content-Type: application/json

{
  "amount": 1000000,
  "walletAddress": "addr1...",
  "message": "Supporting education",
  "category": "education",
  "isAnonymous": false,
  "email": "donor@example.com",
  "name": "John Doe"
}
```

**Confirm Donation**
```http
POST /donations/:id/confirm
Content-Type: application/json

{
  "txHash": "transaction_hash_here"
}
```

**Get Donations**
```http
GET /donations?page=1&limit=10&category=education&status=completed
```

**Get Donation by ID**
```http
GET /donations/:id
```

#### Users

**Register User**
```http
POST /users/register
Content-Type: application/json

{
  "walletAddress": "addr1...",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "optional_password"
}
```

**Login**
```http
POST /users/login
Content-Type: application/json

{
  "walletAddress": "addr1...",
  "password": "optional_password"
}
```

**Get User Profile**
```http
GET /users/me
Authorization: Bearer <token>
```

#### NFTs

**Get NFTs**
```http
GET /nfts?page=1&limit=10&status=minted
```

**Get NFT by Asset ID**
```http
GET /nfts/asset/:assetId
```

**Get NFTs by Owner**
```http
GET /nfts/owner/:walletAddress
```

#### Blockchain

**Get Network Info**
```http
GET /blockchain/network
```

**Get Wallet Balance**
```http
GET /blockchain/wallet/:address
```

**Get Transaction Details**
```http
GET /blockchain/transaction/:txHash
```

**Verify Address**
```http
POST /blockchain/verify-address
Content-Type: application/json

{
  "address": "addr1..."
}
```

#### Dashboard (Admin Only)

**Overview Statistics**
```http
GET /dashboard/overview
Authorization: Bearer <admin_token>
```

**Analytics**
```http
GET /dashboard/analytics?period=30d
Authorization: Bearer <admin_token>
```

**Reports**
```http
GET /dashboard/reports?type=donations&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <admin_token>
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `NODE_ENV` | Environment | No | development |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `BLOCKFROST_PROJECT_ID` | Blockfrost API key | Yes | - |
| `CARDANO_NETWORK` | Cardano network (mainnet/testnet) | No | mainnet |
| `NFT_POLICY_ID` | NFT minting policy ID | Yes | - |
| `SMTP_HOST` | SMTP server host | No | - |
| `SMTP_USER` | SMTP username | No | - |
| `SMTP_PASS` | SMTP password | No | - |

### Blockfrost Setup

1. Sign up at [Blockfrost.io](https://blockfrost.io)
2. Create a new project
3. Get your project ID
4. Add to `.env`:
   ```env
   BLOCKFROST_PROJECT_ID=your_project_id_here
   ```

### NFT Policy Setup

1. Create a Cardano native token policy
2. Get your policy ID
3. Add to `.env`:
   ```env
   NFT_POLICY_ID=your_policy_id_here
   ```

## 🗄️ Database Schema

### User Model
```javascript
{
  walletAddress: String,      // Unique Cardano wallet address
  email: String,              // User email
  name: String,               // Display name
  role: String,               // 'donor' or 'admin'
  isVerified: Boolean,        // Email verification status
  totalDonated: Number,       // Total ADA donated
  donationCount: Number,      // Number of donations
  preferences: Object,        // User preferences
  createdAt: Date,
  updatedAt: Date
}
```

### Donation Model
```javascript
{
  donor: ObjectId,            // Reference to User
  amount: Number,             // Amount in lovelace
  currency: String,           // 'ADA'
  message: String,            // Donor message
  category: String,           // Donation category
  isAnonymous: Boolean,       // Anonymous donation flag
  status: String,             // 'pending', 'completed', 'failed'
  blockchainTransaction: {    // Blockchain details
    txHash: String,
    blockNumber: Number,
    confirmations: Number,
    timestamp: Date
  },
  nft: {                      // NFT information
    assetId: String,
    policyId: String,
    metadata: Object
  },
  receipt: {                  // Receipt details
    receiptNumber: String,
    issuedAt: Date,
    sent: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### NFT Model
```javascript
{
  donation: ObjectId,         // Reference to Donation
  assetId: String,            // Unique asset ID
  policyId: String,           // NFT policy ID
  assetName: String,          // Asset name
  metadata: {                 // NFT metadata
    name: String,
    description: String,
    image: String,
    attributes: Array
  },
  blockchainData: {           // Blockchain details
    txHash: String,
    blockNumber: Number,
    slot: Number,
    confirmations: Number,
    mintedAt: Date
  },
  status: String,             // 'minting', 'minted', 'failed'
  owner: String,              // Owner wallet address
  supply: Number,             // Token supply (usually 1)
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Password Hashing**: bcrypt for password security
- **Error Handling**: Secure error responses

## 📊 Monitoring & Logging

### Log Files
- `logs/app.log` - Application logs
- `logs/error.log` - Error logs

### Health Check
```http
GET /health
```

### Performance Monitoring
```http
GET /api/dashboard/performance
Authorization: Bearer <admin_token>
```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI_PROD=mongodb+srv://...
   JWT_SECRET=very_secure_secret
   ```

2. **PM2 (Recommended)**
   ```bash
   npm install -g pm2
   pm2 start server.js --name edufund-backend
   pm2 startup
   pm2 save
   ```

3. **Docker**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

### Environment-Specific Configs

**Development**
```env
NODE_ENV=development
CARDANO_NETWORK=testnet
LOG_LEVEL=debug
```

**Production**
```env
NODE_ENV=production
CARDANO_NETWORK=mainnet
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=50
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [
    // Validation errors
  ]
}
```

## 🔗 Frontend Integration

### Example React Integration

```javascript
// API client
const API_BASE = 'http://localhost:5000/api';

// Create donation
const createDonation = async (donationData) => {
  const response = await fetch(`${API_BASE}/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donationData),
  });
  return response.json();
};

// Get user donations
const getUserDonations = async (walletAddress, token) => {
  const response = await fetch(`${API_BASE}/donations/user/${walletAddress}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## 🆘 Support

For issues and questions:
- Check the logs in `logs/` directory
- Verify environment variables
- Test blockchain connectivity
- Review API documentation

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

---

**EduFund Backend** - Empowering education through blockchain technology 🎓 
 
 
 
 
 
 
 