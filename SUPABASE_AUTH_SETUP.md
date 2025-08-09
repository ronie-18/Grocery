# Supabase Authentication Setup Guide

## Overview
This document explains how Supabase authentication with phone OTP has been integrated into the Near & Now grocery app.

## What's Changed

### 1. Authentication Flow
- **Before**: Demo OTP system with hardcoded 6-digit codes
- **After**: Real SMS OTP via Supabase Auth with Twilio integration

### 2. Key Components

#### supabase-client.js
- Added complete authentication module with phone OTP support
- Functions: `sendPhoneOTP()`, `verifyPhoneOTP()`, `resendPhoneOTP()`, `signOut()`
- Automatic session management and auth state changes
- Backward compatibility with existing user state

#### script.js
- Updated authentication functions to use Supabase Auth
- Real-time auth state synchronization
- Maintains existing cart and user management features

#### index.html
- Updated UI text to reflect real OTP sending
- Removed demo OTP references

### 3. Authentication Functions

```javascript
// Send OTP to phone number
await window.supabaseAuth.sendPhoneOTP(phoneNumber, userName)

// Verify OTP
await window.supabaseAuth.verifyPhoneOTP(phoneNumber, otpCode, userName)

// Sign out user
await window.supabaseAuth.signOut()

// Check auth status
const isLoggedIn = window.supabaseAuth.isAuthenticated()
const currentUser = window.supabaseAuth.getCurrentUser()
```

### 4. Supabase Configuration Required

#### Authentication Settings
1. **Enable Phone Authentication**:
   - Go to Supabase Dashboard > Authentication > Providers
   - Enable "Phone" provider
   - Configure Twilio credentials

2. **Phone Validation**:
   - Set up phone number validation rules
   - Configure rate limiting for OTP requests

3. **Security Settings**:
   - Set appropriate session timeouts
   - Configure JWT settings
   - Set up RLS policies if needed

#### Environment Variables
Make sure your Supabase project has:
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
```

### 5. SMS Provider Setup (Twilio)

1. **Twilio Account**:
   - Create Twilio account
   - Get Account SID and Auth Token
   - Purchase phone number for SMS

2. **Supabase Integration**:
   - In Supabase Dashboard > Settings > Auth
   - Add Twilio credentials
   - Configure SMS templates

### 6. Phone Number Format
- Supports Indian phone numbers (+91)
- Automatically formats 10-digit numbers to +91xxxxxxxxxx
- Handles various input formats

### 7. Error Handling
- Network connectivity issues
- Invalid phone numbers
- Rate limiting (too many requests)
- Expired OTP codes
- Invalid OTP verification

### 8. User Experience Features
- Real-time OTP delivery via SMS
- Resend OTP functionality with timer
- Loading states during API calls
- Clear error messages
- Seamless session management

### 9. Security Features
- Real OTP codes (not demo)
- Automatic session expiry
- Rate limiting protection
- Secure phone verification
- JWT-based authentication

### 10. Backward Compatibility
- Maintains existing user data structure
- Compatible with cart management
- Preserves localStorage user state
- No breaking changes to existing UI

## Testing the Integration

1. **Development Testing**:
   - Use valid phone numbers for testing
   - Check browser console for auth events
   - Verify OTP delivery via SMS

2. **Error Scenarios**:
   - Test with invalid phone numbers
   - Try expired OTP codes
   - Test rate limiting

3. **User Flow**:
   - Complete registration flow
   - Test login/logout
   - Verify cart persistence
   - Check session restoration

## Production Considerations

1. **SMS Costs**: Monitor Twilio usage and costs
2. **Rate Limiting**: Implement appropriate limits
3. **Phone Verification**: Consider phone number validation
4. **Error Monitoring**: Set up error tracking
5. **Performance**: Monitor auth API response times

## Support

For issues with Supabase Auth:
1. Check Supabase Dashboard logs
2. Monitor browser console for errors
3. Verify Twilio SMS delivery logs
4. Check network connectivity

The integration maintains full backward compatibility while providing real SMS-based authentication.
