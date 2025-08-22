const express = require('express');
const router = express.Router();
const Provider = require('../models/Provider');
const Purchase = require('../models/Purchase');

// ==================== PROVIDER ROUTES ====================

// GET all providers
router.get('/providers', async (req, res) => {
  try {
    const { type, minPrice, maxPrice, minRating, sortBy = 'name', order = 'asc' } = req.query;
    
    let query = {};
    
    // Filter by energy type
    if (type) {
      query.type = type;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }
    
    // Sorting
    let sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;
    
    const providers = await Provider.find(query)
      .sort(sortOptions)
      .select('-__v');
    
    res.json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch providers',
      message: error.message
    });
  }
});

// GET single provider by ID
router.get('/providers/:id', async (req, res) => {
  try {
    const provider = await Provider.findById(req.params.id).select('-__v');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch provider',
      message: error.message
    });
  }
});

// POST create new provider
router.post('/providers', async (req, res) => {
  try {
    const provider = new Provider(req.body);
    const savedProvider = await provider.save();
    
    res.status(201).json({
      success: true,
      message: 'Provider created successfully',
      data: savedProvider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create provider',
      message: error.message
    });
  }
});

// PUT update provider
router.put('/providers/:id', async (req, res) => {
  try {
    const provider = await Provider.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-__v');
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Provider updated successfully',
      data: provider
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update provider',
      message: error.message
    });
  }
});

// DELETE provider (hard delete)
router.delete('/providers/:id', async (req, res) => {
  try {
    const provider = await Provider.findByIdAndDelete(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Provider deleted successfully',
      data: { _id: req.params.id, name: provider.name }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete provider',
      message: error.message
    });
  }
});

// ==================== PURCHASE ROUTES ====================

// GET all purchases for a user
router.get('/purchases/:userId', async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    
    let query = { userId: req.params.userId };
    
    if (status) {
      query.status = status;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const purchases = await Purchase.find(query)
      .populate('providerId', 'name type location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');
    
    const total = await Purchase.countDocuments(query);
    
    res.json({
      success: true,
      count: purchases.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data: purchases
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchases',
      message: error.message
    });
  }
});

// GET single purchase by ID
router.get('/purchases/detail/:id', async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('providerId', 'name type location contactEmail contactPhone')
      .select('-__v');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }
    
    res.json({
      success: true,
      data: purchase
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch purchase',
      message: error.message
    });
  }
});

// POST create new purchase
router.post('/purchases', async (req, res) => {
  try {
    const { userId, providerId, amount, paymentMethod = 'credit_card', notes } = req.body;
    
    // Validate provider exists and has enough capacity
    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    

    
    if (provider.available < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient capacity available',
        available: provider.available,
        requested: amount
      });
    }
    
    // Calculate cost
    const cost = amount * provider.price;
    
    // Generate transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create purchase
    const purchase = new Purchase({
      userId,
      providerId,
      providerName: provider.name,
      amount,
      cost,
      type: provider.type,
      paymentMethod,
      transactionId,
      notes,
      status: 'completed' // Auto-complete for demo
    });
    
    const savedPurchase = await purchase.save();
    
    // Update provider's available capacity
    await Provider.findByIdAndUpdate(providerId, {
      $inc: { available: -amount }
    });
    
    res.status(201).json({
      success: true,
      message: 'Purchase completed successfully',
      data: savedPurchase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to create purchase',
      message: error.message
    });
  }
});

// PUT update purchase status
router.put('/purchases/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const purchase = await Purchase.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('providerId', 'name type location').select('-__v');
    
    if (!purchase) {
      return res.status(404).json({
        success: false,
        error: 'Purchase not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Purchase status updated successfully',
      data: purchase
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: 'Failed to update purchase status',
      message: error.message
    });
  }
});

// ==================== ANALYTICS ROUTES ====================

// GET marketplace analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalProviders = await Provider.countDocuments({ isActive: true });
    const totalPurchases = await Purchase.countDocuments();
    const totalRevenue = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$cost' } } }
    ]);
    
    const energyTypeStats = await Provider.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 }, totalAvailable: { $sum: '$available' } } }
    ]);
    
    const recentPurchases = await Purchase.find()
      .populate('providerId', 'name type')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount cost type createdAt');
    
    res.json({
      success: true,
      data: {
        totalProviders,
        totalPurchases,
        totalRevenue: totalRevenue[0]?.total || 0,
        energyTypeStats,
        recentPurchases
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics',
      message: error.message
    });
  }
});

// ==================== SEED DATA ROUTE ====================

// POST seed initial data (for development)
router.post('/seed', async (req, res) => {
  try {
    // Clear existing data
    await Provider.deleteMany({});
    await Purchase.deleteMany({});
    
    // Seed providers
    const providers = [
      {
        name: 'Solar Power Co',
        type: 'Solar',
        price: 0.12,
        rating: 4.5,
        available: 150,
        description: 'Clean solar energy from rooftop panels',
        location: 'California, USA',
        contactEmail: 'info@solarpowerco.com',
        contactPhone: '+1-555-0123'
      },
      {
        name: 'Wind Energy Ltd',
        type: 'Wind',
        price: 0.10,
        rating: 4.2,
        available: 200,
        description: 'Sustainable wind power generation',
        location: 'Texas, USA',
        contactEmail: 'contact@windenergyltd.com',
        contactPhone: '+1-555-0124'
      },
      {
        name: 'Hydro Electric',
        type: 'Hydro',
        price: 0.08,
        rating: 4.8,
        available: 100,
        description: 'Reliable hydroelectric power',
        location: 'Washington, USA',
        contactEmail: 'info@hydroelectric.com',
        contactPhone: '+1-555-0125'
      },
      {
        name: 'Nuclear Power',
        type: 'Nuclear',
        price: 0.15,
        rating: 4.0,
        available: 300,
        description: 'High-capacity nuclear energy',
        location: 'Illinois, USA',
        contactEmail: 'contact@nuclearpower.com',
        contactPhone: '+1-555-0126'
      },
      {
        name: 'Green Energy Plus',
        type: 'Solar',
        price: 0.13,
        rating: 4.6,
        available: 80,
        description: 'Premium solar energy solutions',
        location: 'Arizona, USA',
        contactEmail: 'info@greenenergyplus.com',
        contactPhone: '+1-555-0127'
      }
    ];
    
    const savedProviders = await Provider.insertMany(providers);
    
    res.json({
      success: true,
      message: 'Database seeded successfully',
      providersCount: savedProviders.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to seed database',
      message: error.message
    });
  }
});

module.exports = router; 