const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users - Get all users (with pagination)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-__v')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
      message: error.message
    });
  }
});

// GET /api/users/:userId - Get user by userId
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      name,
      email,
      phone,
      address,
      energyProfile
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ userId }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this userId or email'
      });
    }

    // Create new user
    const user = new User({
      userId,
      name,
      email,
      phone,
      address,
      energyProfile
    });

    await user.save();

    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: error.message
    });
  }
});

// PUT /api/users/:userId - Update user
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'userId' && key !== '_id') {
        user[key] = updateData[key];
      }
    });

    await user.save();

    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: error.message
    });
  }
});

// PATCH /api/users/:userId/energy-profile - Update energy profile
router.patch('/:userId/energy-profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.updateEnergyProfile(profileData);

    res.json({
      success: true,
      data: user,
      message: 'Energy profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating energy profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update energy profile',
      message: error.message
    });
  }
});

// PATCH /api/users/:userId/balance - Add balance
router.patch('/:userId/balance', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await user.addBalance(parseFloat(amount));

    res.json({
      success: true,
      data: user,
      message: `Balance updated successfully. New balance: ${user.balance}`
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update balance',
      message: error.message
    });
  }
});

// DELETE /api/users/:userId - Delete user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    await User.deleteOne({ userId });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: error.message
    });
  }
});

// GET /api/users/:userId/analytics - Get user analytics
router.get('/:userId/analytics', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByUserId(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Calculate analytics
    const analytics = {
      totalBalance: user.balance,
      monthlyUsage: user.energyProfile.monthlyUsage,
      averageCost: user.energyProfile.averageCost,
      carbonFootprint: user.energyProfile.carbonFootprint,
      energyEfficiency: user.energyProfile.monthlyUsage > 0 ? 
        (user.energyProfile.averageCost / user.energyProfile.monthlyUsage) : 0,
      preferences: user.energyProfile.preferences
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user analytics',
      message: error.message
    });
  }
});

module.exports = router; 