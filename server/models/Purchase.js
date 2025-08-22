const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider',
    required: true
  },
  providerName: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['Solar', 'Wind', 'Hydro', 'Nuclear', 'Biomass', 'Geothermal']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'cancelled', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['credit_card', 'debit_card', 'bank_transfer', 'crypto', 'wallet'],
    default: 'credit_card'
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  notes: {
    type: String,
    trim: true
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
  timestamps: true
});

// Index for better query performance
purchaseSchema.index({ userId: 1, createdAt: -1 });
purchaseSchema.index({ providerId: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Purchase', purchaseSchema); 