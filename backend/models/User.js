import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Cardano Wallet Authentication
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true,
    validate: {
      validator: function(v) {
        // Comprehensive Cardano address validation - accept both standard bech32 and our custom hex format
        const addressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^addr[0-9a-z]{98,103}$|^addr_test[0-9a-z]{98,103}$|^addr_test_[0-9a-f]{100,120}$|^addr_[0-9a-f]{100,120}$|^addr_test1[a-z0-9]{98,103}$/;
        return addressRegex.test(v);
      },
      message: 'Invalid Cardano wallet address format'
    }
  },
  
  // Dynamic Role System
  role: {
    type: String,
    enum: ['student', 'donor', 'admin'],
    default: 'donor'
  },
  
  // User Profile (Optional - can be filled later)
  name: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Display name for UI
  displayName: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Institution/Organization
  institution: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Research field or area of interest
  researchField: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Location for Sri Lankan students
  location: {
    country: {
      type: String,
      default: 'Sri Lanka'
    },
    city: String,
    institution: String // University/School name
  },
  
  // Student-specific fields
  studentInfo: {
    studentId: String,
    fieldOfStudy: String,
    academicLevel: {
      type: String,
      enum: ['undergraduate', 'postgraduate', 'phd', 'research']
    },
    graduationYear: Number,
    gpa: Number,
    researchInterests: [String]
  },
  
  // Donor-specific fields
  donorInfo: {
    preferredCategories: [String],
    totalDonated: {
      type: Number,
      default: 0
    },
    donationCount: {
      type: Number,
      default: 0
    },
    supporterRank: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
      default: 'Bronze'
    }
  },
  
  // Project submissions (for students)
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  
  // Donation history (for donors)
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  
  // NFT collection
  nfts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  
  // Profile completion
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Verification status
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Last activity
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  email: {
    type: String,
    unique: true,
    sparse: true, // Only enforce uniqueness for non-null emails
    trim: true,
    lowercase: true
  },
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ walletAddress: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.country': 1 });
userSchema.index({ 'donorInfo.supporterRank': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for display name (fallback)
userSchema.virtual('displayNameFallback').get(function() {
  return this.displayName || this.name || `User ${this.walletAddress.slice(0, 8)}...`;
});

// Virtual for user type
userSchema.virtual('userType').get(function() {
  if (this.role === 'student') {
    return 'Sri Lankan Student';
  } else if (this.role === 'donor') {
    return 'Global Donor';
  }
  return 'Admin';
});

// Methods
userSchema.methods.updateSupporterRank = function() {
  const totalDonated = this.donorInfo.totalDonated;
  
  if (totalDonated >= 10000) {
    this.donorInfo.supporterRank = 'Diamond';
  } else if (totalDonated >= 5000) {
    this.donorInfo.supporterRank = 'Platinum';
  } else if (totalDonated >= 2000) {
    this.donorInfo.supporterRank = 'Gold';
  } else if (totalDonated >= 1000) {
    this.donorInfo.supporterRank = 'Silver';
  } else if (totalDonated >= 500) {
    this.donorInfo.supporterRank = 'Bronze';
  }
  
  return this.save();
};

userSchema.methods.upgradeToStudent = function(studentData) {
  this.role = 'student';
  this.studentInfo = { ...this.studentInfo, ...studentData };
  this.profileCompleted = true;
  return this.save();
};

userSchema.methods.addDonation = function(donationId, amount) {
  this.donations.push(donationId);
  this.donorInfo.totalDonated += amount;
  this.donorInfo.donationCount += 1;
  this.updateSupporterRank();
  return this.save();
};

// Get public profile (safe for external use)
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    walletAddress: this.walletAddress,
    role: this.role,
    name: this.name,
    displayName: this.displayName,
    email: this.email,
    institution: this.institution,
    researchField: this.researchField,
    userType: this.userType,
    profileCompleted: this.profileCompleted,
    isVerified: this.isVerified,
    location: this.location,
    studentInfo: this.studentInfo,
    donorInfo: this.donorInfo,
    createdAt: this.createdAt
  };
};

// Static methods
userSchema.statics.findOrCreateByWallet = async function(walletAddress) {
  let user = await this.findOne({ walletAddress });
  
  if (!user) {
    user = new this({
      walletAddress,
      role: 'donor', // Default role
      displayName: `User ${walletAddress.slice(0, 8)}...`,
      location: {
        country: 'Global' // Default for donors
      }
    });
    await user.save();
  }
  
  // Update last active
  user.lastActive = new Date();
  await user.save();
  
  return user;
};

userSchema.statics.getStudentsByCountry = function(country = 'Sri Lanka') {
  return this.find({
    role: 'student',
    'location.country': country
  }).populate('projects');
};

userSchema.statics.getTopDonors = function(limit = 10) {
  return this.find({
    role: 'donor',
    isActive: true
  })
  .sort({ 'donorInfo.totalDonated': -1 })
  .limit(limit);
};

// Pre-save middleware
userSchema.pre('save', function(next) {
  // Update last active on any change
  this.lastActive = new Date();
  next();
});

const User = mongoose.model('User', userSchema);

export default User; 
 