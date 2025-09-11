# Grocery App

A modern grocery shopping application with Google Maps integration.

## 🚀 Quick Start

### 1. Setup Configuration

Copy the template configuration file:
```bash
cp app-config.template.js app-config.js
```

### 2. Add Your API Key

Edit `app-config.js` and replace the placeholder with your Google Maps API key:
```javascript
GOOGLE_MAPS_API_KEY: 'YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE',
```

### 3. Run the Application

Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

## 🔑 Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable these APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials (API Key)
5. Set HTTP referrer restrictions:
   - For development: `http://localhost/*`, `https://localhost/*`
   - For production: `https://yourdomain.com/*`

## 📁 File Structure

```
Grocery/
├── index.html              # Main application
├── app-config.template.js  # Configuration template (safe to commit)
├── app-config.js          # Configuration (contains API key) - NOT COMMITTED
├── script.js              # Main JavaScript logic
├── checkout.html          # Checkout page
├── search.html            # Search results page
└── supabase-client.js     # Database client
```

## 🔒 Security

- `app-config.js` is gitignored to prevent API key exposure
- Use `app-config.template.js` as a template
- Never commit files with real API keys

## 🚀 Deployment

1. Create `app-config.js` on production server
2. Add production API key to the file
3. Upload other files (app-config.js stays on server)
4. Ensure domain restrictions are set in Google Cloud Console

## 🛠️ Development

- Pure client-side application
- No build process required
- Works with any web server
- Cross-platform compatible