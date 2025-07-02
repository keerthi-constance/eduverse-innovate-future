import dotenv from 'dotenv';
import { connectDB } from './config/database.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

async function testServer() {
  console.log('🧪 Testing EduFund Backend...\n');

  try {
    // Test 1: Environment variables
    console.log('1️⃣ Testing environment variables...');
    const requiredEnvVars = [
      'PORT',
      'NODE_ENV',
      'MONGODB_URI',
      'JWT_SECRET',
      'BLOCKFROST_PROJECT_ID',
      'CARDANO_NETWORK',
      'NFT_POLICY_ID'
    ];

    const missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
      console.log('📝 Please check your .env file');
      return false;
    }
    console.log('✅ Environment variables OK');

    // Test 2: Database connection
    console.log('\n2️⃣ Testing database connection...');
    try {
      await connectDB();
      console.log('✅ Database connection OK');
    } catch (error) {
      console.log('❌ Database connection failed:', error.message);
      console.log('💡 Make sure MongoDB is running');
      return false;
    }

    // Test 3: Import models
    console.log('\n3️⃣ Testing model imports...');
    try {
      const User = (await import('./models/User.js')).default;
      const Donation = (await import('./models/Donation.js')).default;
      const NFT = (await import('./models/NFT.js')).default;
      console.log('✅ Models imported successfully');
    } catch (error) {
      console.log('❌ Model import failed:', error.message);
      return false;
    }

    // Test 4: Import services
    console.log('\n4️⃣ Testing service imports...');
    try {
      const { blockchainService } = await import('./services/blockchainService.js');
      const { emailService } = await import('./services/emailService.js');
      console.log('✅ Services imported successfully');
    } catch (error) {
      console.log('❌ Service import failed:', error.message);
      return false;
    }

    // Test 5: Import routes
    console.log('\n5️⃣ Testing route imports...');
    try {
      const donationRoutes = await import('./routes/donations.js');
      const userRoutes = await import('./routes/users.js');
      const nftRoutes = await import('./routes/nfts.js');
      const dashboardRoutes = await import('./routes/dashboard.js');
      const blockchainRoutes = await import('./routes/blockchain.js');
      console.log('✅ Routes imported successfully');
    } catch (error) {
      console.log('❌ Route import failed:', error.message);
      return false;
    }

    console.log('\n🎉 All tests passed! Server is ready to start.');
    console.log('\n📋 Next steps:');
    console.log('   1. Start MongoDB (if not already running)');
    console.log('   2. Configure your .env file with real values');
    console.log('   3. Run: npm run dev');
    console.log('   4. Test the API at: http://localhost:5000/api');

    return true;

  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Run the test
testServer().then((success) => {
  if (success) {
    console.log('\n✅ Server test completed successfully');
    process.exit(0);
  } else {
    console.log('\n❌ Server test failed');
    process.exit(1);
  }
}).catch((error) => {
  console.log('❌ Unexpected error:', error);
  process.exit(1);
}); 
 