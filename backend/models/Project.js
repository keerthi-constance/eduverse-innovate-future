import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'Artificial Intelligence',
      'Biotechnology',
      'Climate Science',
      'Computer Science',
      'Environmental Science',
      'Health & Medicine',
      'Materials Science',
      'Physics',
      'Space Science',
      'Other'
    ]
  },
  
  // Funding Information
  fundingGoal: {
    type: Number,
    required: true,
    min: 1000000 // 1 ADA minimum
  },
  
  currentFunding: {
    type: Number,
    default: 0
  },
  
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  
  // Project Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'funded', 'expired', 'cancelled'],
    default: 'draft'
  },
  
  // Student Information
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Additional Details
  institution: {
    type: String,
    required: true,
    trim: true
  },
  
  researchField: {
    type: String,
    trim: true
  },
  
  teamMembers: {
    type: String,
    trim: true
  },
  
  expectedOutcomes: {
    type: String,
    maxlength: 1000
  },
  
  milestones: [{
    type: String,
    trim: true
  }],
  
  tags: [{
    type: String,
    trim: true
  }],
  
  attachments: [{
    type: String // File URLs
  }],
  
  // Statistics
  backersCount: {
    type: Number,
    default: 0
  },
  
  // Donations and NFTs
  donations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  
  nfts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NFT'
  }],
  
  // Visibility and Approval
  isApproved: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  approvedAt: Date,
  featuredAt: Date
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
projectSchema.index({ status: 1, isApproved: 1 });
projectSchema.index({ category: 1 });
projectSchema.index({ student: 1 });
projectSchema.index({ deadline: 1 });
projectSchema.index({ createdAt: -1 });
projectSchema.index({ currentFunding: -1 });

// Virtual for funding progress
projectSchema.virtual('fundingProgress').get(function() {
  if (this.fundingGoal === 0) return 0;
  return Math.min((this.currentFunding / this.fundingGoal) * 100, 100);
});

// Virtual for days left
projectSchema.virtual('daysLeft').get(function() {
  const now = new Date();
  const deadline = new Date(this.deadline);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for average donation
projectSchema.virtual('averageDonation').get(function() {
  if (this.backersCount === 0) return 0;
  return this.currentFunding / this.backersCount;
});

// Methods
projectSchema.methods.updateFunding = function(donationAmount) {
  this.currentFunding += donationAmount;
  this.backersCount += 1;
  
  // Update status based on funding
  if (this.currentFunding >= this.fundingGoal) {
    this.status = 'funded';
  } else if (this.daysLeft <= 0) {
    this.status = 'expired';
  }
  
  return this.save();
};

projectSchema.methods.approve = function() {
  this.isApproved = true;
  this.status = 'active';
  this.approvedAt = new Date();
  return this.save();
};

projectSchema.methods.feature = function() {
  this.isFeatured = true;
  this.featuredAt = new Date();
  return this.save();
};

// Static methods
projectSchema.statics.getActiveProjects = function() {
  return this.find({
    status: 'active',
    isApproved: true,
    deadline: { $gt: new Date() }
  }).populate('student', 'name walletAddress institution');
};

projectSchema.statics.getProjectsByCategory = function(category) {
  return this.find({
    category,
    status: 'active',
    isApproved: true,
    deadline: { $gt: new Date() }
  }).populate('student', 'name walletAddress institution');
};

projectSchema.statics.getProjectsByStudent = function(studentId) {
  return this.find({ student: studentId }).populate('donations');
};

projectSchema.statics.searchProjects = function(query) {
  return this.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { researchField: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ],
    status: 'active',
    isApproved: true,
    deadline: { $gt: new Date() }
  }).populate('student', 'name walletAddress institution');
};

projectSchema.statics.getTrendingProjects = function(limit = 10) {
  return this.find({
    status: 'active',
    isApproved: true,
    deadline: { $gt: new Date() }
  })
  .sort({ backersCount: -1, currentFunding: -1 })
  .limit(limit)
  .populate('student', 'name walletAddress institution');
};

projectSchema.statics.getExpiredProjects = function() {
  return this.find({
    deadline: { $lte: new Date() },
    status: { $in: ['active', 'draft'] }
  });
};

// Pre-save middleware
projectSchema.pre('save', function(next) {
  // Update status based on deadline
  if (this.deadline && this.deadline <= new Date() && this.status === 'active') {
    this.status = 'expired';
  }
  
  // Ensure funding doesn't exceed goal
  if (this.currentFunding > this.fundingGoal) {
    this.currentFunding = this.fundingGoal;
  }
  
  next();
});

const Project = mongoose.model('Project', projectSchema);

export default Project; 
 
 