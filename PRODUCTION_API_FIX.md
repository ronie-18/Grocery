# Production Google Maps API Fix Guide

## 🚨 Issue: API works on dev server but not on nearandnow.in

This is a **domain restriction** issue in your Google Cloud Console configuration.

## 🔧 Step-by-Step Fix

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with your Google Maps API key)
3. Navigate to **"APIs & Services"** → **"Credentials"**

### Step 2: Edit API Key Restrictions
1. Find your Google Maps API key in the list
2. Click the **pencil icon** (Edit) next to your API key
3. Under **"Application restrictions"**, select **"HTTP referrers (web sites)"**
4. In the **"Website restrictions"** section, add these entries:

```
https://nearandnow.in/*
https://www.nearandnow.in/*
https://nearandnow.in
https://www.nearandnow.in
```

### Step 3: Verify API Restrictions
Ensure these APIs are enabled for your key:
- ✅ **Maps JavaScript API**
- ✅ **Geocoding API**
- ✅ **Places API** (optional)

### Step 4: Check Billing
- Ensure billing is enabled for your Google Cloud project
- Check that you haven't exceeded usage quotas

### Step 5: Wait for Propagation
- Changes can take **5-10 minutes** to propagate
- Clear your browser cache after making changes

## 🧪 Testing Steps

### 1. Upload Debug Tool
Upload the `production-debug.html` file to your server and visit:
```
https://nearandnow.in/production-debug.html
```

### 2. Check Debug Results
The debug tool will show:
- ✅ Environment information
- ✅ API key status
- ✅ Google Maps API test results
- ✅ Network connectivity
- ✅ Configuration details

### 3. Browser Console Check
Open browser developer tools (F12) and look for:
- API key loading status
- Domain detection results
- Any authentication errors

## 🔍 Common Issues & Solutions

### Issue 1: "Google Maps API authentication failed"
**Cause**: Domain not added to restrictions
**Solution**: Add `https://nearandnow.in/*` to HTTP referrers

### Issue 2: "RefererNotAllowedMapError"
**Cause**: Domain restrictions are too strict
**Solution**: Ensure both `https://nearandnow.in/*` and `https://www.nearandnow.in/*` are added

### Issue 3: "QuotaExceededError"
**Cause**: API usage limits exceeded
**Solution**: Check billing and increase quotas in Google Cloud Console

### Issue 4: "RequestDeniedMapError"
**Cause**: API not enabled or billing not set up
**Solution**: Enable required APIs and set up billing

## 📋 Verification Checklist

- [ ] API key has HTTP referrer restrictions set
- [ ] `https://nearandnow.in/*` is in the allowed list
- [ ] `https://www.nearandnow.in/*` is in the allowed list
- [ ] Maps JavaScript API is enabled
- [ ] Geocoding API is enabled
- [ ] Billing is enabled
- [ ] No usage quota exceeded
- [ ] Changes have propagated (wait 5-10 minutes)
- [ ] Browser cache cleared
- [ ] Tested on production domain

## 🚀 Quick Test Commands

After making changes, test with these browser console commands:

```javascript
// Check if API key is loaded
console.log('API Key:', APP_CONFIG.getApiKey() ? 'Present' : 'Missing');

// Check domain detection
console.log('Is Production Domain:', APP_CONFIG.isProductionDomain());

// Test Google Maps manually
if (typeof google !== 'undefined') {
    console.log('Google Maps loaded:', google.maps.version);
} else {
    console.log('Google Maps not loaded');
}
```

## 📞 If Still Not Working

1. **Check the debug tool results** at `https://nearandnow.in/production-debug.html`
2. **Verify domain restrictions** in Google Cloud Console
3. **Test with a different browser** (Chrome, Firefox, Safari)
4. **Check browser console** for specific error messages
5. **Wait longer** for changes to propagate (up to 30 minutes)

## 🔄 Alternative Solutions

If domain restrictions don't work:

### Option 1: Use IP Restrictions (Not Recommended)
- Add your server's IP address to restrictions
- Less secure but might work temporarily

### Option 2: Create New API Key
- Create a new API key specifically for production
- Configure restrictions from scratch

### Option 3: Server-Side Proxy
- Load Google Maps API from your server
- Hide API key from client-side code

---

**Most Common Fix**: Adding `https://nearandnow.in/*` to HTTP referrer restrictions in Google Cloud Console.

**Expected Result**: Location functionality works on both dev and production environments.
