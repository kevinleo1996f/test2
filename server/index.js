const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB Connection
// CHANGE THIS URL TO YOUR MONGODB CONNECTION STRING
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/powergrid-marketplace';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB successfully');
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Import routes
const marketplaceRoutes = require('./routes/marketplace');
const userRoutes = require('./routes/users');

// Routes
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'PowerGrid Marketplace API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'The requested endpoint does not exist' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PowerGrid Marketplace API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🛒 Marketplace API: http://localhost:${PORT}/api/marketplace`);
}); 