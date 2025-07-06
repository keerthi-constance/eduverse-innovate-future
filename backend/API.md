# EduFund API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Response Format
All API responses follow this format:

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

---

## 🔗 Donations API

### Create Donation
**POST** `/donations`

Create a new donation record.

**Request Body:**
```json
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

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": {
      "id": "donation_id",
      "amount": "1.000000",
      "currency": "ADA",
      "message": "Supporting education",
      "category": "education",
      "status": "pending",
      "isAnonymous": false,
      "donor": {
        "name": "John Doe",
        "walletAddress": "addr1...",
        "totalDonated": 0,
        "donationCount": 1
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 0,
      "donationCount": 1
    }
  },
  "message": "Donation created successfully. Please complete the blockchain transaction."
}
```

### Confirm Donation
**POST** `/donations/:id/confirm`

Confirm a donation with blockchain transaction hash.

**Request Body:**
```json
{
  "txHash": "transaction_hash_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": {
      "id": "donation_id",
      "amount": "1.000000",
      "status": "completed",
      "blockchainTransaction": {
        "txHash": "transaction_hash",
        "blockNumber": 123456,
        "confirmations": 1
      },
      "nft": {
        "assetId": "asset_id",
        "metadata": {
          "name": "EduFund Donation #EDU-123456-ABC",
          "description": "Thank you for your donation...",
          "image": "image_url"
        }
      }
    },
    "nft": {
      "assetId": "asset_id",
      "policyId": "policy_id",
      "metadata": {...},
      "status": "minted",
      "owner": "addr1...",
      "cardanoScanUrl": "https://cardanoscan.io/..."
    }
  },
  "message": "Donation confirmed and NFT minted successfully!"
}
```

### Get Donations
**GET** `/donations`

Get all donations with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `category` (string): Filter by category
- `status` (string): Filter by status
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "donation_id",
        "amount": "1.000000",
        "currency": "ADA",
        "message": "Supporting education",
        "category": "education",
        "status": "completed",
        "isAnonymous": false,
        "donor": {
          "name": "John Doe",
          "walletAddress": "addr1..."
        },
        "nft": {
          "assetId": "asset_id",
          "metadata": {...}
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### Get Donation by ID
**GET** `/donations/:id`

Get a specific donation by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "donation": {
      "id": "donation_id",
      "amount": "1.000000",
      "currency": "ADA",
      "message": "Supporting education",
      "category": "education",
      "status": "completed",
      "isAnonymous": false,
      "donor": {
        "name": "John Doe",
        "walletAddress": "addr1...",
        "email": "donor@example.com"
      },
      "nft": {
        "assetId": "asset_id",
        "metadata": {...},
        "status": "minted"
      },
      "blockchainTransaction": {
        "txHash": "transaction_hash",
        "blockNumber": 123456,
        "confirmations": 1,
        "timestamp": "2024-01-01T00:00:00.000Z"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "receipt": {
      "receiptNumber": "EDU-123456-ABC",
      "issuedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get User Donations
**GET** `/donations/user/:walletAddress`

Get donations by wallet address.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 5000000,
      "donationCount": 5
    },
    "donations": [...],
    "pagination": {...}
  }
}
```

---

## 👤 Users API

### Register User
**POST** `/users/register`

Register a new user.

**Request Body:**
```json
{
  "walletAddress": "addr1...",
  "email": "user@example.com",
  "name": "John Doe",
  "password": "optional_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 0,
      "donationCount": 0
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/users/login`

Login with wallet address.

**Request Body:**
```json
{
  "walletAddress": "addr1...",
  "password": "optional_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 5000000,
      "donationCount": 5
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### Get Current User Profile
**GET** `/users/me`

Get current user profile (requires authentication).

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 5000000,
      "donationCount": 5,
      "lastDonationDate": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Update User Profile
**PUT** `/users/me`

Update current user profile (requires authentication).

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "email": "newemail@example.com",
  "preferences": {
    "emailNotifications": true,
    "anonymousDonations": false
  }
}
```

### Get User by Wallet Address
**GET** `/users/:walletAddress`

Get user profile by wallet address.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "walletAddress": "addr1...",
      "totalDonated": 5000000,
      "donationCount": 5,
      "lastDonationDate": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Top Donors
**GET** `/users/top-donors`

Get top donors by total amount donated.

**Query Parameters:**
- `limit` (number): Number of donors to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "topDonors": [
      {
        "name": "John Doe",
        "formattedWalletAddress": "addr1...",
        "totalDonated": 10000000,
        "donationCount": 10
      }
    ]
  }
}
```

---

## 🎨 NFTs API

### Get NFTs
**GET** `/nfts`

Get all NFTs with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (minting/minted/failed)
- `owner` (string): Filter by owner wallet address
- `sortBy` (string): Sort field (default: createdAt)
- `sortOrder` (string): Sort order - asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "id": "nft_id",
        "assetId": "asset_id",
        "policyId": "policy_id",
        "assetName": "EDUFUND123456",
        "metadata": {
          "name": "EduFund Donation #EDU-123456-ABC",
          "description": "Thank you for your donation...",
          "image": "image_url",
          "attributes": [
            {
              "trait_type": "Donation Amount",
              "value": "1.000000 ADA"
            }
          ]
        },
        "status": "minted",
        "owner": "addr1...",
        "supply": 1,
        "cardanoScanUrl": "https://cardanoscan.io/...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### Get NFT by ID
**GET** `/nfts/:id`

Get a specific NFT by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "nft": {
      "id": "nft_id",
      "assetId": "asset_id",
      "policyId": "policy_id",
      "assetName": "EDUFUND123456",
      "metadata": {...},
      "status": "minted",
      "owner": "addr1...",
      "supply": 1,
      "cardanoScanUrl": "https://cardanoscan.io/...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get NFT by Asset ID
**GET** `/nfts/asset/:assetId`

Get NFT by blockchain asset ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "nft": {
      "id": "nft_id",
      "assetId": "asset_id",
      "policyId": "policy_id",
      "assetName": "EDUFUND123456",
      "metadata": {...},
      "status": "minted",
      "owner": "addr1...",
      "supply": 1,
      "cardanoScanUrl": "https://cardanoscan.io/...",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get NFTs by Owner
**GET** `/nfts/owner/:walletAddress`

Get NFTs owned by a specific wallet address.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "owner": "addr1...",
    "nfts": [...],
    "pagination": {...}
  }
}
```

### Verify NFT
**POST** `/nfts/:id/verify`

Verify NFT on blockchain and update status.

**Response:**
```json
{
  "success": true,
  "data": {
    "nft": {
      "id": "nft_id",
      "assetId": "asset_id",
      "status": "minted",
      "blockchainData": {
        "blockNumber": 123456,
        "slot": 123456789,
        "confirmations": 1
      }
    },
    "blockchainInfo": {
      "asset": "asset_id",
      "policy_id": "policy_id",
      "asset_name": "EDUFUND123456",
      "fingerprint": "asset_fingerprint",
      "quantity": "1",
      "block": "123456",
      "slot": 123456789
    }
  },
  "message": "NFT verified successfully"
}
```

### Get NFT Statistics
**GET** `/nfts/statistics`

Get NFT statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalNFTs": 100,
    "mintedNFTs": 95,
    "mintingNFTs": 3,
    "failedNFTs": 2
  }
}
```

### Get Recent NFTs
**GET** `/nfts/recent`

Get recently minted NFTs.

**Query Parameters:**
- `limit` (number): Number of NFTs to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "nfts": [
      {
        "assetId": "asset_id",
        "metadata": {...},
        "owner": "addr1...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

## ⛓️ Blockchain API

### Get Network Information
**GET** `/blockchain/network`

Get Cardano network information.

**Response:**
```json
{
  "success": true,
  "data": {
    "network": "mainnet",
    "supply": {
      "max": "45000000000000000",
      "total": "35600000000000000",
      "circulating": "35600000000000000",
      "locked": "0"
    },
    "stake": {
      "live": "25000000000000000",
      "active": "24000000000000000"
    },
    "latestBlock": {
      "hash": "block_hash",
      "height": 12345678,
      "slot": 123456789,
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Get Wallet Balance
**GET** `/blockchain/wallet/:address`

Get wallet balance and information.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "addr1...",
    "balance": "1000000000",
    "availableBalance": "950000000",
    "rewards": "50000000",
    "withdrawals": "0",
    "deposits": "2000000"
  }
}
```

### Get Transaction Details
**GET** `/blockchain/transaction/:txHash`

Get transaction details from blockchain.

**Response:**
```json
{
  "success": true,
  "data": {
    "hash": "transaction_hash",
    "block": "block_hash",
    "blockHeight": 12345678,
    "slot": 123456789,
    "index": 0,
    "outputAmount": [
      {
        "unit": "lovelace",
        "quantity": "1000000"
      }
    ],
    "fees": "170000",
    "deposit": "0",
    "size": 1234,
    "invalidBefore": null,
    "invalidHereafter": null,
    "utxos": {
      "hash": "transaction_hash",
      "inputs": [...],
      "outputs": [...]
    }
  }
}
```

### Get Asset Information
**GET** `/blockchain/asset/:assetId`

Get asset information from blockchain.

**Response:**
```json
{
  "success": true,
  "data": {
    "asset": "asset_id",
    "policy_id": "policy_id",
    "asset_name": "EDUFUND123456",
    "fingerprint": "asset_fingerprint",
    "quantity": "1",
    "block": "123456",
    "slot": 123456789,
    "initial_mint_tx_hash": "transaction_hash",
    "mint_or_burn_count": 1,
    "onchain_metadata": {...},
    "metadata": {...}
  }
}
```

### Verify Address
**POST** `/blockchain/verify-address`

Verify if a Cardano address is valid.

**Request Body:**
```json
{
  "address": "addr1..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "addr1...",
    "isValid": true
  }
}
```

### Verify Transaction
**POST** `/blockchain/verify-transaction`

Verify a transaction on blockchain.

**Request Body:**
```json
{
  "txHash": "transaction_hash",
  "expectedAmount": 1000000,
  "recipientAddress": "addr1..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "status": "confirmed",
    "message": "Transaction verified successfully",
    "blockHeight": 12345678,
    "confirmations": 1
  }
}
```

### Get Blockchain Status
**GET** `/blockchain/status`

Get blockchain service status (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "network": "mainnet",
    "policyId": "policy_id",
    "blockfrostConfigured": true,
    "lucidConfigured": true,
    "connection": "connected",
    "networkInfo": {...}
  }
}
```

---

## 📊 Dashboard API (Admin Only)

### Get Overview Statistics
**GET** `/dashboard/overview`

Get dashboard overview statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDonations": 150,
      "totalAmount": 50000000,
      "averageAmount": 333333,
      "completedDonations": 145,
      "pendingDonations": 5,
      "totalUsers": 100,
      "verifiedUsers": 85,
      "totalNFTs": 145,
      "mintedNFTs": 140
    },
    "recentDonations": [...],
    "topDonors": [...],
    "donationsByCategory": [...],
    "networkInfo": {...}
  }
}
```

### Get Analytics
**GET** `/dashboard/analytics`

Get detailed analytics data.

**Query Parameters:**
- `period` (string): Time period - 7d/30d/90d/1y (default: 30d)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "donationsOverTime": [
      {
        "_id": "2024-01-01",
        "count": 5,
        "amount": 15000000
      }
    ],
    "userRegistrations": [...],
    "nftMinting": [...],
    "categoryDistribution": [...],
    "avgByCategory": [...]
  }
}
```

### Get Reports
**GET** `/dashboard/reports`

Get various reports.

**Query Parameters:**
- `type` (string): Report type - donations/users/nfts/failed-transactions
- `startDate` (string): Start date (ISO format)
- `endDate` (string): End date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "donations",
    "count": 150,
    "report": [...]
  }
}
```

### Get Blockchain Status
**GET** `/dashboard/blockchain-status`

Get blockchain network status and recent transactions.

**Response:**
```json
{
  "success": true,
  "data": {
    "networkInfo": {...},
    "recentTransactions": [
      {
        "txHash": "transaction_hash",
        "amount": "1.000000",
        "confirmations": 1,
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Performance Metrics
**GET** `/dashboard/performance`

Get system performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "database": {
      "connections": {
        "current": 5,
        "available": 95,
        "pending": 0
      },
      "operations": {
        "insert": 1000,
        "query": 5000,
        "update": 500,
        "delete": 50
      },
      "memory": {
        "bits": 64,
        "resident": 100000000,
        "virtual": 200000000
      }
    },
    "system": {
      "memory": {
        "rss": 100000000,
        "heapTotal": 50000000,
        "heapUsed": 30000000,
        "external": 10000000
      },
      "uptime": 3600,
      "nodeVersion": "v18.0.0",
      "platform": "darwin"
    }
  }
}
```

---

## 🔧 Health Check

### Health Check
**GET** `/health`

Check server health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

---

## 📝 Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

## 🔒 Rate Limiting

API endpoints are rate limited to prevent abuse:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP address
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:5000/health
   curl http://localhost:5000/api
   ```

3. **Create your first donation:**
   ```bash
   curl -X POST http://localhost:5000/api/donations \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 1000000,
       "walletAddress": "addr1...",
       "message": "Supporting education",
       "category": "education"
     }'
   ```

---

**EduFund API** - Empowering education through blockchain technology 🎓 
 
 
 
 
 
 
 