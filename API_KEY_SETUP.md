# API Key Setup Guide

## 🔒 Security Notice

**IMPORTANT:** Never commit API keys to version control. This guide shows you how to set up your API keys securely.

## 📋 Setup Instructions

### 1. Development Setup (Local)

1. **Edit `config.local.js`:**
   ```javascript
   const LOCAL_CONFIG = {
       GOOGLE_MAPS_API_KEY: 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE'
   };
   ```

2. **Replace `YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE`** with your real API key

3. **Test locally:**
   - Open `index.html` in your browser
   - Check console for: `✅ Development API key loaded for: localhost`

### 2. Production Setup (Live Website)

1. **Edit `production-config.js`:**
   ```javascript
   window.PRODUCTION_CONFIG = {
       "GOOGLE_MAPS_API_KEY": "YOUR_ACTUAL_PRODUCTION_API_KEY_HERE",
       "NODE_ENV": "production"
   };
   ```

2. **Replace `YOUR_ACTUAL_PRODUCTION_API_KEY_HERE`** with your production API key

3. **Deploy to your live site:**
   - Upload files to your web server
   - Check console for: `✅ Production API key loaded for: yourdomain.com`

## 🔑 Google Maps API Key Configuration

### Required APIs:
- ✅ Maps JavaScript API
- ✅ Geocoding API
- ✅ Places API

### HTTP Referrer Restrictions:

**For Development:**
```
http://localhost/*
https://localhost/*
http://127.0.0.1/*
https://127.0.0.1/*
```

**For Production:**
```
https://nearandnow.in/*
https://www.nearandnow.in/*
```

## 🛡️ Security Best Practices

1. **Never commit API keys** to version control
2. **Use different API keys** for development and production
3. **Set proper domain restrictions** in Google Cloud Console
4. **Monitor API usage** in Google Cloud Console
5. **Enable billing** (required for Google Maps)

## 🚨 Troubleshooting

### Error: "API key not configured"
- Check that you've replaced the placeholder with your actual API key
- Verify the config file is being loaded correctly

### Error: "Google Maps authentication failed"
- Check domain restrictions in Google Cloud Console
- Verify all required APIs are enabled
- Ensure billing is enabled

### Error: "No API key found"
- Make sure you're editing the correct config file
- Check that the config file is included in your HTML

## 📁 Files to Configure

- `config.local.js` - Development API key
- `production-config.js` - Production API key

## 🔄 After Setup

1. **Test locally** with your development API key
2. **Deploy to production** with your production API key
3. **Verify functionality** on both environments
4. **Monitor usage** in Google Cloud Console

---

**Remember:** Keep your API keys secure and never share them publicly!
