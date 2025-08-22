# MongoDB Setup Guide for PowerGrid Project

This guide will help you set up MongoDB collections for the PowerGrid electricity marketplace application.

## 🗄️ Database Collections Overview

The PowerGrid application uses the following MongoDB collections:

1. **`providers`** - Electricity providers and their offerings
2. **`purchases`** - User purchase transactions
3. **`users`** - User profiles and energy data

## 📋 Prerequisites

- MongoDB installed and running (local or cloud)
- Node.js and npm installed
- Access to MongoDB (MongoDB Compass, mongo shell, or Atlas)

## 🚀 Quick Setup

### 1. Start MongoDB

**Local MongoDB:**
```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

**MongoDB Atlas (Cloud):**
- Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a new cluster
- Get your connection string

### 2. Configure Connection

Create a `.env` file in your project root:
```env
MONGODB_URI=mongodb://localhost:27017/powergrid-marketplace
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/powergrid-marketplace
```

### 3. Start Server with Database Seeding

```bash
# This will create collections and seed sample data
npm run server:full
```

## 📊 Collection Schemas

### 1. Providers Collection

**Collection Name:** `providers`

**Schema:**
```javascript
{
  _id: ObjectId,
  name: String,           // Provider name (required)
  type: String,           // Energy type: Solar, Wind, Hydro, Nuclear, Biomass, Geothermal
  price: Number,          // Price per kWh (required)
  rating: Number,         // Rating 0-5
  available: Number,      // Available capacity in kWh
  description: String,    // Provider description (required)
  location: String,       // Provider location
  contactEmail: String,   // Contact email
  contactPhone: String,   // Contact phone
  isActive: Boolean,      // Whether provider is active
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

**Indexes:**
- `type: 1, isActive: 1` - For filtering by energy type and status
- `price: 1` - For price-based sorting
- `rating: -1` - For rating-based sorting

### 2. Purchases Collection

**Collection Name:** `purchases`

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: String,         // User ID (required)
  providerId: ObjectId,   // Reference to provider (required)
  providerName: String,   // Provider name (required)
  amount: Number,         // Purchase amount in kWh (required)
  cost: Number,           // Total cost (required)
  type: String,           // Energy type
  status: String,         // Status: pending, completed, cancelled, failed
  paymentMethod: String,  // Payment method: credit_card, debit_card, bank_transfer, crypto, wallet
  transactionId: String,  // Unique transaction ID
  notes: String,          // Additional notes
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

**Indexes:**
- `userId: 1, createdAt: -1` - For user purchase history
- `providerId: 1` - For provider-based queries
- `status: 1` - For status-based filtering
- `transactionId: 1` - For transaction lookups

### 3. Users Collection

**Collection Name:** `users`

**Schema:**
```javascript
{
  _id: ObjectId,
  userId: String,         // Unique user ID (required)
  name: String,           // User name (required)
  email: String,          // User email (required, unique)
  phone: String,          // Phone number
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  energyProfile: {
    monthlyUsage: Number,     // Monthly energy usage in kWh
    averageCost: Number,      // Average monthly cost
    currentProvider: String,  // Current energy provider
    carbonFootprint: Number,  // Carbon footprint in tons CO2/year
    preferences: {
      renewableEnergy: Boolean,  // Preference for renewable energy
      notifications: Boolean,    // Notification preferences
      autoPurchase: Boolean      // Auto-purchase settings
    }
  },
  balance: Number,         // Current energy balance in kWh
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

**Indexes:**
- `userId: 1` - For user lookups
- `email: 1` - For email-based queries

## 🛠️ Manual Collection Setup

If you prefer to set up collections manually:

### 1. Connect to MongoDB

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Create database: `powergrid-marketplace`

**Using mongo shell:**
```bash
mongo
use powergrid-marketplace
```

### 2. Create Collections

```javascript
// Create providers collection
db.createCollection("providers")

// Create purchases collection
db.createCollection("purchases")

// Create users collection
db.createCollection("users")
```

### 3. Create Indexes

```javascript
// Providers indexes
db.providers.createIndex({ "type": 1, "isActive": 1 })
db.providers.createIndex({ "price": 1 })
db.providers.createIndex({ "rating": -1 })

// Purchases indexes
db.purchases.createIndex({ "userId": 1, "createdAt": -1 })
db.purchases.createIndex({ "providerId": 1 })
db.purchases.createIndex({ "status": 1 })
db.purchases.createIndex({ "transactionId": 1 })

// Users indexes
db.users.createIndex({ "userId": 1 })
db.users.createIndex({ "email": 1 })
```

### 4. Insert Sample Data

```javascript
// Insert sample providers
db.providers.insertMany([
  {
    name: "Solar Power Co",
    type: "Solar",
    price: 0.12,
    rating: 4.5,
    available: 150,
    description: "Clean solar energy from rooftop panels",
    location: "California, USA",
    contactEmail: "info@solarpowerco.com",
    contactPhone: "+1-555-0123",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Wind Energy Ltd",
    type: "Wind",
    price: 0.10,
    rating: 4.2,
    available: 200,
    description: "Sustainable wind power generation",
    location: "Texas, USA",
    contactEmail: "contact@windenergyltd.com",
    contactPhone: "+1-555-0124",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Insert sample user
db.users.insertOne({
  userId: "user123",
  name: "Johnson Legend",
  email: "johnson@example.com",
  phone: "+1-555-0128",
  address: {
    street: "123 Energy St",
    city: "Green City",
    state: "CA",
    zipCode: "90210",
    country: "USA"
  },
  energyProfile: {
    monthlyUsage: 450,
    averageCost: 54.00,
    currentProvider: "Solar Power Co",
    carbonFootprint: 2.1,
    preferences: {
      renewableEnergy: true,
      notifications: true,
      autoPurchase: false
    }
  },
  balance: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔧 CRUD Operations

### Providers CRUD

**Create Provider:**
```javascript
db.providers.insertOne({
  name: "New Energy Co",
  type: "Solar",
  price: 0.11,
  rating: 4.0,
  available: 100,
  description: "New solar energy provider",
  location: "Arizona, USA",
  contactEmail: "info@newenergy.com",
  contactPhone: "+1-555-0129",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Read Providers:**
```javascript
// Get all active providers
db.providers.find({ isActive: true })

// Get providers by type
db.providers.find({ type: "Solar" })

// Get providers sorted by price
db.providers.find().sort({ price: 1 })
```

**Update Provider:**
```javascript
db.providers.updateOne(
  { _id: ObjectId("provider_id_here") },
  {
    $set: {
      price: 0.13,
      available: 120,
      updatedAt: new Date()
    }
  }
)
```

**Delete Provider (Soft Delete):**
```javascript
db.providers.updateOne(
  { _id: ObjectId("provider_id_here") },
  {
    $set: {
      isActive: false,
      updatedAt: new Date()
    }
  }
)
```

### Purchases CRUD

**Create Purchase:**
```javascript
db.purchases.insertOne({
  userId: "user123",
  providerId: ObjectId("provider_id_here"),
  providerName: "Solar Power Co",
  amount: 50,
  cost: 6.00,
  type: "Solar",
  status: "completed",
  paymentMethod: "credit_card",
  transactionId: "TXN_123456789",
  notes: "Monthly energy purchase",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Read Purchases:**
```javascript
// Get user purchases
db.purchases.find({ userId: "user123" })

// Get completed purchases
db.purchases.find({ status: "completed" })

// Get purchases with provider details
db.purchases.aggregate([
  {
    $lookup: {
      from: "providers",
      localField: "providerId",
      foreignField: "_id",
      as: "provider"
    }
  }
])
```

### Users CRUD

**Create User:**
```javascript
db.users.insertOne({
  userId: "user456",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1-555-0130",
  address: {
    street: "456 Green Ave",
    city: "Eco City",
    state: "NY",
    zipCode: "10001",
    country: "USA"
  },
  energyProfile: {
    monthlyUsage: 380,
    averageCost: 45.60,
    currentProvider: "Wind Energy Ltd",
    carbonFootprint: 1.8,
    preferences: {
      renewableEnergy: true,
      notifications: true,
      autoPurchase: true
    }
  },
  balance: 25.5,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🔍 Useful Queries

### Analytics Queries

**Total Revenue:**
```javascript
db.purchases.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$cost" } } }
])
```

**Energy Type Distribution:**
```javascript
db.providers.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: "$type", count: { $sum: 1 }, totalAvailable: { $sum: "$available" } } }
])
```

**User Purchase History:**
```javascript
db.purchases.aggregate([
  { $match: { userId: "user123" } },
  { $sort: { createdAt: -1 } },
  { $limit: 10 }
])
```

## 🚨 Troubleshooting

### Common Issues

1. **Connection Failed:**
   - Check if MongoDB is running
   - Verify connection string format
   - Check network connectivity (for cloud MongoDB)

2. **Collection Not Found:**
   - Run the seeding script: `npm run seed`
   - Or manually create collections as shown above

3. **Index Errors:**
   - Drop and recreate indexes if needed
   - Check for duplicate key errors

4. **Data Not Loading:**
   - Verify API connection in the app
   - Check server logs for errors
   - Ensure collections have data

### Verification Commands

```javascript
// Check if collections exist
show collections

// Check collection counts
db.providers.countDocuments()
db.purchases.countDocuments()
db.users.countDocuments()

// Check indexes
db.providers.getIndexes()
db.purchases.getIndexes()
db.users.getIndexes()
```

## 📱 Testing the Setup

1. **Start the server:**
   ```bash
   npm run server:full
   ```

2. **Start the app:**
   ```bash
   npm start
   ```

3. **Test CRUD operations:**
   - Go to Marketplace tab
   - Toggle to Admin Mode
   - Try adding, editing, and deleting providers
   - Make purchases as a user

## 🎯 Next Steps

- Set up authentication and user management
- Add more complex analytics queries
- Implement real-time updates with WebSockets
- Add data validation and sanitization
- Set up automated backups

Your MongoDB setup is now complete! The PowerGrid application will automatically connect to these collections and provide full CRUD functionality through the marketplace interface. 