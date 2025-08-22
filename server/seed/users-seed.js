const User = require('../models/User');

const seedUsers = [
  {
    userId: 'user123',
    name: 'Johnson Legend',
    email: 'johnson.legend@email.com',
    phone: '+1-555-0123',
    address: {
      street: '123 Energy Street',
      city: 'Green City',
      state: 'CA',
      zipCode: '90210',
      country: 'USA'
    },
    energyProfile: {
      monthlyUsage: 450,
      averageCost: 54.00,
      currentProvider: 'Solar Power Co',
      carbonFootprint: 2.1,
      preferences: {
        renewableEnergy: true,
        notifications: true,
        autoPurchase: false
      }
    },
    balance: 150.50
  },
  {
    userId: 'user456',
    name: 'Sarah Green',
    email: 'sarah.green@email.com',
    phone: '+1-555-0456',
    address: {
      street: '456 Eco Avenue',
      city: 'Solar Town',
      state: 'NY',
      zipCode: '10001',
      country: 'USA'
    },
    energyProfile: {
      monthlyUsage: 320,
      averageCost: 38.40,
      currentProvider: 'Wind Energy Ltd',
      carbonFootprint: 1.8,
      preferences: {
        renewableEnergy: true,
        notifications: true,
        autoPurchase: true
      }
    },
    balance: 75.25
  },
  {
    userId: 'user789',
    name: 'Mike Power',
    email: 'mike.power@email.com',
    phone: '+1-555-0789',
    address: {
      street: '789 Renewable Road',
      city: 'Wind City',
      state: 'TX',
      zipCode: '75001',
      country: 'USA'
    },
    energyProfile: {
      monthlyUsage: 580,
      averageCost: 69.60,
      currentProvider: 'Hydro Electric',
      carbonFootprint: 2.5,
      preferences: {
        renewableEnergy: false,
        notifications: false,
        autoPurchase: false
      }
    },
    balance: 200.00
  },
  {
    userId: 'user101',
    name: 'Emma Solar',
    email: 'emma.solar@email.com',
    phone: '+1-555-0101',
    address: {
      street: '101 Sun Street',
      city: 'Bright City',
      state: 'FL',
      zipCode: '33101',
      country: 'USA'
    },
    energyProfile: {
      monthlyUsage: 280,
      averageCost: 33.60,
      currentProvider: 'Green Energy Plus',
      carbonFootprint: 1.2,
      preferences: {
        renewableEnergy: true,
        notifications: true,
        autoPurchase: true
      }
    },
    balance: 45.75
  },
  {
    userId: 'user202',
    name: 'David Wind',
    email: 'david.wind@email.com',
    phone: '+1-555-0202',
    address: {
      street: '202 Breeze Boulevard',
      city: 'Air City',
      state: 'WA',
      zipCode: '98101',
      country: 'USA'
    },
    energyProfile: {
      monthlyUsage: 420,
      averageCost: 50.40,
      currentProvider: 'Nuclear Power',
      carbonFootprint: 2.8,
      preferences: {
        renewableEnergy: false,
        notifications: false,
        autoPurchase: false
      }
    },
    balance: 125.00
  }
];

async function seedUsersData() {
  try {
    console.log('🌱 Seeding users data...');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('✅ Cleared existing users');
    
    // Insert new users
    const insertedUsers = await User.insertMany(seedUsers);
    console.log(`✅ Inserted ${insertedUsers.length} users`);
    
    // Log created users
    insertedUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.userId}) - Balance: $${user.balance}`);
    });
    
    console.log('🎉 Users seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Export for use in other files
module.exports = { seedUsersData, seedUsers };

// Run if this file is executed directly
if (require.main === module) {
  seedUsersData();
} 