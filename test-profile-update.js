// Test script to verify profile update functionality
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

async function testProfileUpdate() {
  try {
    console.log('🧪 Testing profile update functionality...');
    
    // First, let's test the wallet login to get a token
    console.log('1. Testing wallet login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/wallet-login`, {
      walletAddress: 'addr_test1qzx0y7avtk868vwvsqccvw62ns8yf67aye32kxgpc5u3lmy2wxx5d800rqg5ry68kpg3pw3f92h9t69yl0pgk4vzsvxs5nxn97',
      displayName: 'Test User'
    });
    
    if (!loginResponse.data.success) {
      throw new Error('Wallet login failed');
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Wallet login successful, token:', token.slice(0, 20) + '...');
    
    // Now test the profile update
    console.log('2. Testing profile update...');
    const updateResponse = await axios.put(`${API_BASE_URL}/auth/profile`, {
      displayName: 'Updated Test User',
      email: 'test@example.com',
      role: 'student'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updateResponse.data.success) {
      console.log('✅ Profile update successful!');
      console.log('Updated user data:', updateResponse.data.data.user);
    } else {
      console.log('❌ Profile update failed:', updateResponse.data);
    }
    
    // Test profile fetch to verify persistence
    console.log('3. Testing profile fetch...');
    const fetchResponse = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (fetchResponse.data.success) {
      console.log('✅ Profile fetch successful!');
      console.log('Fetched user data:', fetchResponse.data.data.user);
      
      // Check if the updates persisted
      const user = fetchResponse.data.data.user;
      if (user.displayName === 'Updated Test User' && user.email === 'test@example.com' && user.role === 'student') {
        console.log('🎉 Profile persistence test PASSED!');
      } else {
        console.log('❌ Profile persistence test FAILED!');
        console.log('Expected: displayName=Updated Test User, email=test@example.com, role=student');
        console.log('Actual:', { displayName: user.displayName, email: user.email, role: user.role });
      }
    } else {
      console.log('❌ Profile fetch failed:', fetchResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testProfileUpdate();
