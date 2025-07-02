# 🔐 Authentication Debugging Guide

## Issues Found & Fixed

### 1. **JWT Token Mismatch** ✅ FIXED
- **Problem**: JWT token was generated with `{ userId }` but middleware was looking for `decoded.id`
- **Fix**: Updated middleware to use `decoded.userId` consistently
- **Location**: `backend/middleware/auth.js`

### 2. **Missing Logging** ✅ FIXED
- **Problem**: No visibility into authentication flow
- **Fix**: Added comprehensive logging to:
  - Frontend AuthContext
  - API Service
  - Backend Auth Routes
  - Auth Middleware

## 🔍 How to Debug Authentication Issues

### Step 1: Check Browser Console
Open your browser's developer tools and look for these log messages:

```
🔐 [AuthContext] Component mounted
🔐 [AuthContext] Checking localStorage token
🌐 [API] Request to POST /auth/connect-wallet
✅ [API] Response from POST /auth/connect-wallet
```

### Step 2: Check Backend Logs
In your backend terminal, look for:

```
🔐 [AUTH] Wallet connection attempt
🔐 [AUTH] Finding or creating user for wallet
🔐 [AUTH] User found/created
🔐 [AUTH] JWT token generated for user
🔐 [AUTH] Wallet connection successful
```

### Step 3: Check Network Tab
1. Open browser dev tools → Network tab
2. Connect your wallet
3. Look for requests to `/auth/connect-wallet` and `/auth/me`
4. Check request headers for `Authorization: Bearer <token>`
5. Check response status codes and data

## 🚨 Common Issues & Solutions

### Issue 1: "Wallet connected but not authenticated"
**Symptoms**: 
- Wallet connects successfully
- `isAuthenticated` remains `false`
- No "Dashboard" in navigation

**Debug Steps**:
1. Check browser console for `🔐 [AuthContext]` logs
2. Check Network tab for `/auth/connect-wallet` request
3. Check backend logs for authentication errors

**Possible Causes**:
- Backend `/auth/connect-wallet` failing
- JWT token not being stored properly
- API service not setting token correctly

### Issue 2: "Authentication lost on page refresh"
**Symptoms**:
- Works after wallet connect
- Loses authentication after refresh
- `isAuthenticated` becomes `false`

**Debug Steps**:
1. Check localStorage for `authToken`
2. Check Network tab for `/auth/me` request
3. Check backend logs for JWT verification errors

**Possible Causes**:
- Invalid/expired JWT token
- Backend JWT_SECRET mismatch
- Token not being sent in requests

### Issue 3: "401 Unauthorized errors"
**Symptoms**:
- API requests failing with 401
- User being logged out unexpectedly

**Debug Steps**:
1. Check JWT token in localStorage
2. Verify token is being sent in Authorization header
3. Check backend logs for JWT verification errors

## 🛠️ Testing Commands

### Test Backend Auth Route
```bash
# Test wallet connection
curl -X POST http://localhost:4567/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "addr_test1..."}'
```

### Test Protected Route
```bash
# Test with valid token
curl -X GET http://localhost:4567/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📋 Checklist for Authentication Flow

- [ ] Wallet connects successfully (Mesh SDK)
- [ ] Frontend gets wallet address
- [ ] Frontend calls `/auth/connect-wallet`
- [ ] Backend validates wallet address
- [ ] Backend finds/creates user
- [ ] Backend generates JWT token
- [ ] Frontend receives token and user data
- [ ] Frontend stores token in localStorage
- [ ] Frontend sets token in API service
- [ ] Frontend updates `isAuthenticated` to `true`
- [ ] Navigation shows "Dashboard" option

## 🔧 Environment Variables to Check

**Backend**:
```env
JWT_SECRET=your-secret-key
MONGODB_URI=your-mongodb-connection
```

**Frontend**:
```env
VITE_API_BASE_URL=http://localhost:4567/api
```

## 📞 Next Steps

1. **Start both servers** (backend and frontend)
2. **Open browser console** and backend terminal
3. **Connect wallet** and watch the logs
4. **Check Network tab** for API requests
5. **Report any errors** you see in the logs

The enhanced logging will help us identify exactly where the authentication flow is breaking! 