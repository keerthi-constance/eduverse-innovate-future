import mongoose from 'mongoose';

const nftSchema = new mongoose.Schema({
  donation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation',
    required: [true, 'Donation reference is required']
  },
  assetId: {
    type: String,
    required: [true, 'Asset ID is required'],
    unique: true
  },
  policyId: {
    type: String,
    required: [true, 'Policy ID is required']
  },
  assetName: {
    type: String,
    required: [true, 'Asset name is required']
  },
  metadata: {
    name: {
      type: String,
      required: [true, 'NFT name is required']
    },
    description: {
      type: String,
      required: [true, 'NFT description is required']
    },
    image: {
      type: String,
      required: [true, 'NFT image URL is required']
    },
    attributes: [{
      trait_type: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }],
    external_url: String,
    animation_url: String
  },
  ipfsHash: {
    type: String,
    default: null
  },
  blockchainData: {
    txHash: {
      type: String,
      required: [true, 'Transaction hash is required']
    },
    blockNumber: {
      type: Number,
      default: null
    },
    slot: {
      type: Number,
      default: null
    },
    confirmations: {
      type: Number,
      default: 0
    },
    mintedAt: {
      type: Date,
      default: null
    }
  },
  status: {
    type: String,
    enum: ['minting', 'minted', 'failed'],
    default: 'minting'
  },
  owner: {
    type: String,
    required: [true, 'Owner wallet address is required']
  },
  supply: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted asset ID
nftSchema.virtual('formattedAssetId').get(function() {
  if (!this.assetId) return '';
  return `${this.assetId.slice(0, 8)}...${this.assetId.slice(-8)}`;
});

// Virtual for formatted transaction hash
nftSchema.virtual('formattedTxHash').get(function() {
  if (!this.blockchainData.txHash) return '';
  return `${this.blockchainData.txHash.slice(0, 8)}...${this.blockchainData.txHash.slice(-8)}`;
});

// Virtual for CardanoScan URL
nftSchema.virtual('cardanoScanUrl').get(function() {
  const network = process.env.CARDANO_NETWORK === 'testnet' ? 'testnet' : 'mainnet';
  return `https://cardanoscan.io/${network}/asset/${this.assetId}`;
});

// Indexes for better query performance
nftSchema.index({ assetId: 1 });
nftSchema.index({ policyId: 1 });
nftSchema.index({ owner: 1 });
nftSchema.index({ status: 1 });
nftSchema.index({ 'blockchainData.txHash': 1 });
nftSchema.index({ createdAt: -1 });

// Method to get public NFT info
nftSchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    assetId: this.assetId,
    policyId: this.policyId,
    assetName: this.assetName,
    metadata: this.metadata,
    status: this.status,
    owner: this.owner,
    supply: this.supply,
    cardanoScanUrl: this.cardanoScanUrl,
    createdAt: this.createdAt
  };
};

// Static method to get NFT statistics
nftSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalNFTs: { $sum: 1 },
        mintedNFTs: {
          $sum: { $cond: [{ $eq: ['$status', 'minted'] }, 1, 0] }
        },
        mintingNFTs: {
          $sum: { $cond: [{ $eq: ['$status', 'minting'] }, 1, 0] }
        },
        failedNFTs: {
          $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
        }
      }
    }
  ]);

  return stats[0] || {
    totalNFTs: 0,
    mintedNFTs: 0,
    mintingNFTs: 0,
    failedNFTs: 0
  };
};

// Static method to get NFTs by owner
nftSchema.statics.getNFTsByOwner = function(ownerAddress, limit = 20) {
  return this.find({ owner: ownerAddress.toLowerCase() })
    .populate('donation', 'amount currency message category createdAt')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get recent NFTs
nftSchema.statics.getRecentNFTs = function(limit = 10) {
  return this.find({ status: 'minted' })
    .populate('donation', 'amount currency message category')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('assetId metadata owner createdAt');
};

// Static method to find by asset ID
nftSchema.statics.findByAssetId = function(assetId) {
  return this.findOne({ assetId: assetId });
};

export default mongoose.model('NFT', nftSchema); 
 
 
 
 
 
 