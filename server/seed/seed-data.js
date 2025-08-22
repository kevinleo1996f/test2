const mongoose = require('mongoose');
require('dotenv').config();

// Import seed functions
const { seedProvidersData } = require('./providers-seed');
const { seedPurchasesData } = require('./purchases-seed');
const { seedUsersData } = require('./users-seed');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/powergrid-marketplace';

async function seedAllData() {
  try {
    console.log('🚀 Starting database seeding...\n');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');
    
    // Seed all collections
    await seedProvidersData();
    console.log('');
    
    await seedUsersData();
    console.log('');
    
    await seedPurchasesData();
    console.log('');
    
    console.log('🎉 All data seeded successfully!');
    console.log('\n📊 Database now contains:');
    console.log('   - Electricity providers');
    console.log('   - User profiles');
    console.log('   - Purchase transactions');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedAllData();
}

module.exports = { seedAllData }; 