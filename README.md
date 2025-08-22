# PowerGrid - Smart Energy Management App

A comprehensive mobile app for electricity providers with storage calculator, marketplace, and personal data tracking.

## Features

- ⚡ **Electricity Storage Calculator** - Calculate costs and payback periods
- 🛒 **P2P Electricity Marketplace** - Buy and sell electricity from various providers
- 👤 **Personal Dashboard** - Track usage, costs, and environmental impact
- 📊 **Real-time Analytics** - Monitor consumption trends and carbon footprint
- 🗄️ **Database-Only Data** - All marketplace data is loaded exclusively from the database when the server is running

## Backend Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure MongoDB**
   
   Create a `.env` file in the root directory:
   ```bash
   # Copy the example file
   cp env.example .env
   ```
   
   **Update the MongoDB connection string in `.env`:**
   ```env
   # For local MongoDB
   MONGODB_URI=mongodb://localhost:27017/powergrid-marketplace
   
   # For MongoDB Atlas (cloud)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/powergrid-marketplace
   
   # For other MongoDB providers
   MONGODB_URI=mongodb://your-mongodb-url/powergrid-marketplace
   ```

3. **Start the Backend Server**
   ```bash
   # Start server with database seeding (recommended)
   npm run server:full
   
   # Development mode with auto-restart
   npm run dev:server
   
   # Production mode (server only)
   npm run server
   ```

4. **Seed Initial Data** (Optional)
   ```bash
   # Seed database with sample data
   npm run seed
   
   # Or make a POST request to seed the database
   curl -X POST http://localhost:3000/api/marketplace/seed
   ```

## API Endpoints

### Providers
- `GET /api/marketplace/providers` - Get all providers
- `GET /api/marketplace/providers/:id` - Get single provider
- `POST /api/marketplace/providers` - Create new provider
- `PUT /api/marketplace/providers/:id` - Update provider
- `DELETE /api/marketplace/providers/:id` - Deactivate provider

### Purchases
- `GET /api/marketplace/purchases/:userId` - Get user purchases
- `GET /api/marketplace/purchases/detail/:id` - Get purchase details
- `POST /api/marketplace/purchases` - Create new purchase
- `PUT /api/marketplace/purchases/:id/status` - Update purchase status

### Analytics
- `GET /api/marketplace/analytics` - Get marketplace analytics

### Utilities
- `GET /health` - Health check
- `POST /api/marketplace/seed` - Seed initial data

## Frontend Setup

1. **Start the Expo Development Server**
   ```bash
   npm start
   ```

2. **Run on Device/Simulator**
   ```bash
   # Android
   npm run android
   
   # iOS
   npm run ios
   
   # Web
   npm run web
   ```

## Database-Only Data Behavior

The app is configured to load data exclusively from the database when the server is running:

### When Server is Running (Connected)
- ✅ Marketplace shows providers from database
- ✅ Purchases are saved to database
- ✅ Real-time data updates
- ✅ Status indicator shows "🟢 Connected to Database"

### When Server is Not Running (Disconnected)
- ❌ No providers displayed in marketplace
- ❌ "Database Not Available" message shown
- ❌ Purchases are stored locally only
- ❌ Status indicator shows "🟡 Database Not Available"
- 🔄 Retry button available to reconnect

### Benefits
- **Data Integrity**: Ensures all data comes from a single source of truth
- **Real-time Updates**: Changes in database are immediately reflected
- **No Fallback Data**: Prevents confusion from outdated or inconsistent data
- **Clear Status**: Users always know the connection state

## MongoDB Configuration

### Where to Change MongoDB URL

1. **Environment File** (Recommended)
   - Edit `.env` file in the root directory
   - Update `MONGODB_URI` variable

2. **Server File** (Fallback)
   - Edit `server/index.js`
   - Update line 18: `const MONGODB_URI = process.env.MONGODB_URI || 'your-mongodb-url';`

### MongoDB Connection Examples

```javascript
// Local MongoDB
mongodb://localhost:27017/powergrid-marketplace

// MongoDB Atlas
mongodb+srv://username:password@cluster.mongodb.net/powergrid-marketplace

// MongoDB with authentication
mongodb://username:password@host:port/powergrid-marketplace

// MongoDB with options
mongodb://localhost:27017/powergrid-marketplace?retryWrites=true&w=majority
```

## Database Schema

### Provider Collection
```javascript
{
  name: String,
  type: String, // Solar, Wind, Hydro, Nuclear, Biomass, Geothermal
  price: Number,
  rating: Number,
  available: Number,
  description: String,
  location: String,
  contactEmail: String,
  contactPhone: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Purchase Collection
```javascript
{
  userId: String,
  providerId: ObjectId,
  providerName: String,
  amount: Number,
  cost: Number,
  type: String,
  status: String, // pending, completed, cancelled, failed
  paymentMethod: String,
  transactionId: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Development

### Scripts
- `npm start` - Start Expo development server
- `npm run server` - Start backend server
- `npm run dev:server` - Start backend with auto-restart
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

### Project Structure
```
├── app/                 # React Native app (Expo Router)
│   └── index.tsx       # Main app component
├── server/             # Express.js backend
│   ├── index.js        # Main server file
│   ├── models/         # MongoDB schemas
│   └── routes/         # API routes
├── .env                # Environment variables
└── package.json        # Dependencies and scripts
```

## Troubleshooting

### MongoDB Connection Issues
1. Check if MongoDB is running
2. Verify connection string format
3. Ensure network access (for cloud MongoDB)
4. Check authentication credentials

### Server Issues
1. Check if port 3000 is available
2. Verify all dependencies are installed
3. Check environment variables
4. Review server logs for errors

## License

This project is licensed under the MIT License.
