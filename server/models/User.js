const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  energyProfile: {
    monthlyUsage: {
      type: Number,
      default: 0
    },
    averageCost: {
      type: Number,
      default: 0
    },
    currentProvider: String,
    carbonFootprint: {
      type: Number,
      default: 0
    },
    preferences: {
      renewableEnergy: {
        type: Boolean,
        default: false
      },
      notifications: {
        type: Boolean,
        default: true
      },
      autoPurchase: {
        type: Boolean,
        default: false
      }
    }
  },
  balance: {
    type: Number,
    default: 0
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
  collection: 'users' // Explicitly specify collection name
});

// Index for better query performance
userSchema.index({ userId: 1 });
userSchema.index({ email: 1 });

// Pre-save middleware to update the updatedAt field
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to find user by userId
userSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

// Instance method to update energy profile
userSchema.methods.updateEnergyProfile = function(profileData) {
  this.energyProfile = { ...this.energyProfile, ...profileData };
  return this.save();
};

// Instance method to add balance
userSchema.methods.addBalance = function(amount) {
  this.balance += amount;
  return this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User; 