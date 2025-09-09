# Google Maps Integration Setup Guide

## Overview

This document provides comprehensive setup instructions for the Google Maps integration in the Near & Now grocery application, including best practices for API key security.

## Features Implemented

### ✅ Core Features

- **First-time location capture** with localStorage tracking
- **PIN code geocoding** to convert postal codes to coordinates
- **Interactive map** with user location marker
- **2km radius circle** visualization
- **Mock shop listings** within the radius
- **Shop information windows** with ratings, hours, and actions
- **Call and directions functionality**
- **Responsive design** with mobile-friendly interface

### 🔄 Future-Ready Features

- **Places API integration** ready for real shop data
- **Distance calculations** for accurate shop positioning
- **Shop filtering and sorting** capabilities
- **Real-time location updates**

## Setup Instructions

### 1. Get Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (for future shop discovery)
4. Create credentials (API Key)
5. Configure API key restrictions (see security section below)

### 2. Environment Variable Setup

The API key is automatically loaded from your `.env` file:

```bash
# .env file
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

The script dynamically loads Google Maps with the API key from the configuration.

### 3. Test the Integration

1. Open `index.html` in a web browser
2. On first visit, you should see either:
   - Geolocation permission request, OR
   - PIN code input modal
3. After providing location/PIN, the map section will appear below categories
4. Verify mock shops appear within the 2km radius circle

## API Key Security Best Practices

### 🔒 Development Environment

**For Development/Testing:**

```html
<!-- Temporary - Replace before production -->
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_DEV_API_KEY&libraries=places,geometry&callback=initializeGoogleMaps"></script>
```

### 🏭 Production Environment

**Option 1: Environment Variables (Recommended)**

1. **Server-Side Rendering:**

   ```javascript
   // server.js or build script
   const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

   // Inject into HTML template
   const htmlContent = template.replace('{{GOOGLE_MAPS_API_KEY}}', googleMapsApiKey);
   ```
2. **HTML Template:**

   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key={{GOOGLE_MAPS_API_KEY}}&libraries=places,geometry&callback=initializeGoogleMaps"></script>
   ```
3. **Environment Configuration:**

   ```bash
   # .env file (never commit this)
   GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

**Option 2: Secure Proxy Endpoint**

1. **Create API Proxy:**

   ```javascript
   // api/maps-proxy.js
   app.get('/api/maps-config', (req, res) => {
     // Validate request origin, user authentication, etc.
     res.json({
       apiKey: process.env.GOOGLE_MAPS_API_KEY
     });
   });
   ```
2. **Frontend Integration:**

   ```javascript
   // Load API key securely
   async function loadMapsAPI() {
     const response = await fetch('/api/maps-config');
     const { apiKey } = await response.json();

     const script = document.createElement('script');
     script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initializeGoogleMaps`;
     document.head.appendChild(script);
   }
   ```

**Option 3: Build-Time Injection**

1. **Webpack/Vite Configuration:**

   ```javascript
   // webpack.config.js
   new webpack.DefinePlugin({
     'process.env.GOOGLE_MAPS_API_KEY': JSON.stringify(process.env.GOOGLE_MAPS_API_KEY)
   })
   ```
2. **Usage in Code:**

   ```javascript
   const apiKey = process.env.GOOGLE_MAPS_API_KEY;
   // Use apiKey in script loading
   ```

### 🛡️ API Key Restrictions

**Always Configure These Restrictions:**

1. **HTTP Referrer Restrictions:**

   ```
   https://yourdomain.com/*
   https://www.yourdomain.com/*
   https://staging.yourdomain.com/*
   ```
2. **API Restrictions:**

   - Enable only required APIs:
     - Maps JavaScript API
     - Geocoding API
     - Places API (if using real shop data)
3. **Usage Quotas:**

   - Set daily quotas to prevent abuse
   - Monitor usage in Google Cloud Console

### 🚫 What NOT to Do

```html
<!-- ❌ NEVER do this in production -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx&libraries=places,geometry"></script>

<!-- ❌ NEVER commit API keys to version control -->
const API_KEY = "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

<!-- ❌ NEVER store in localStorage or client-side -->
localStorage.setItem('googleMapsKey', 'AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
```

## Usage Examples

### Testing Functions

```javascript
// Test PIN code entry
window.triggerPINCodeEntry();

// Reset location data to test first-visit behavior
window.resetLocationData();

// Enable real Places API search (when ready)
window.nearNowMaps.searchNearbyShopsWithPlacesAPI();
```

### Customizing Mock Shops

Edit the `mockShops` array in `script.js`:

```javascript
const mockShops = [
  {
    id: 1,
    name: "Your Custom Shop",
    address: "Custom Address",
    phone: "+91 1234567890",
    rating: 4.5,
    image: "https://your-image-url.com/shop.jpg",
    categories: ["Grocery", "Fresh Produce"],
    openingHours: "9:00 AM - 9:00 PM",
    deliveryTime: "30 mins",
    distance: 1.0, // Will be calculated automatically
    lat: null, // Will be set automatically
    lng: null
  }
  // Add more shops...
];
```

## Troubleshooting

### Common Issues

1. **"Google is not defined" Error:**

   - Ensure the Google Maps script loads before your script.js
   - Check that the callback function is correctly named
2. **Geolocation Permission Denied:**

   - The PIN code modal should appear automatically
   - User can manually trigger it with `window.triggerPINCodeEntry()`
3. **Map Not Displaying:**

   - Check API key is valid and has Maps JavaScript API enabled
   - Verify domain restrictions in Google Cloud Console
   - Check browser console for specific error messages
4. **Shops Not Appearing:**

   - Ensure location is captured successfully
   - Check console logs for any JavaScript errors
   - Verify mock shop generation is working

### Development vs Production Checklist

**Before Going Live:**

- [ ] Replace development API key with production key
- [ ] Configure HTTP referrer restrictions
- [ ] Set up API usage quotas and monitoring
- [ ] Implement API key security (environment variables/proxy)
- [ ] Test with restricted API key
- [ ] Enable error logging and monitoring

## API Usage and Costs

### Current Implementation Costs

- **Maps JavaScript API:** ~$7 per 1,000 map loads
- **Geocoding API:** ~$5 per 1,000 requests (PIN to coordinates)
- **Places API:** ~$17 per 1,000 requests (when enabled)

### Cost Optimization Tips

1. **Cache location data** (already implemented with localStorage)
2. **Limit API calls** with debouncing and validation
3. **Use static maps** for non-interactive displays
4. **Implement quotas** to prevent unexpected charges

## Next Steps for Real Shop Integration

### 1. Enable Places API Search

```javascript
// Replace mock shops with real data
window.nearNowMaps.searchNearbyShopsWithPlacesAPI();
```

### 2. Connect to Your Database

```javascript
// Custom API integration
async function fetchShopsFromDatabase(location, radius) {
  const response = await fetch('/api/shops/nearby', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, radius })
  });
  return response.json();
}
```

### 3. Real-Time Updates

```javascript
// Update shop availability in real-time
function updateShopStatus(shopId, isOpen, deliveryTime) {
  // Update shop marker and info window
}
```

---

**Need Help?** Check the [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript) for detailed API reference.
