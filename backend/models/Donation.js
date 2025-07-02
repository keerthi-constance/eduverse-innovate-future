import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  donorAddress: {
    type: String,
    required: true,
    trim: true
  },
  
  // Project Information
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Donation Details
  amount: {
    type: Number,
    required: true,
    min: 1000000 // 1 ADA minimum (in lovelace)
  },
  
  message: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Blockchain Information
  transactionHash: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  blockNumber: {
    type: Number
  },
  
  // NFT Receipt Information
  nftAssetId: {
    type: String,
    trim: true
  },
  
  nftPolicyId: {
    type: String,
    trim: true
  },
  
  nftMetadata: {
    name: String,
    description: String,
    image: String,
    attributes: [{
      trait_type: String,
      value: String
    }]
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'nft_minted'],
    default: 'pending'
  },
  
  // Timestamps
  confirmedAt: Date,
  nftMintedAt: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ project: 1, createdAt: -1 });
donationSchema.index({ transactionHash: 1 });
donationSchema.index({ status: 1 });
donationSchema.index({ createdAt: -1 });

// Virtual for amount in ADA
donationSchema.virtual('amountADA').get(function() {
  return this.amount / 1000000; // Convert lovelace to ADA
});

// Methods
donationSchema.methods.confirm = function(blockNumber) {
  this.status = 'confirmed';
  this.blockNumber = blockNumber;
  this.confirmedAt = new Date();
  return this.save();
};

donationSchema.methods.markNFTMinted = function(nftAssetId, nftPolicyId, metadata) {
  this.status = 'nft_minted';
  this.nftAssetId = nftAssetId;
  this.nftPolicyId = nftPolicyId;
  this.nftMetadata = metadata;
  this.nftMintedAt = new Date();
  return this.save();
};

// Static methods
donationSchema.statics.getTotalDonationsByProject = function(projectId) {
  return this.aggregate([
    { $match: { project: new mongoose.Types.ObjectId(projectId), status: 'confirmed' } },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);
};

donationSchema.statics.getDonorLeaderboard = function(limit = 10) {
  return this.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$donor', totalAmount: { $sum: '$amount' }, donationCount: { $sum: 1 } } },
    { $sort: { totalAmount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'donorInfo'
      }
    },
    { $unwind: '$donorInfo' },
    {
      $project: {
        donorId: '$_id',
        donorName: '$donorInfo.name',
        donorAddress: '$donorInfo.walletAddress',
        totalAmount: 1,
        donationCount: 1,
        totalAmountADA: { $divide: ['$totalAmount', 1000000] }
      }
    }
  ]);
};

const Donation = mongoose.model('Donation', donationSchema);

export default Donation; 
 