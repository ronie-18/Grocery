# Build Setup Guide

This guide explains how to use the `.env` file with your client-side application.

## Why We Need a Build Process

Since this is a client-side application (HTML/JavaScript), browsers cannot directly read `.env` files. We use a build process to convert your `.env` file into JavaScript configuration files.

## Setup Instructions

### 1. Install Node.js
Make sure you have Node.js installed on your system:
- Download from: https://nodejs.org/
- Verify installation: `node --version`

### 2. Configure Your .env File
Your `.env` file should contain:
```env
# Environment variables for Near & Now Grocery App

# Google Maps API Key
GOOGLE_MAPS_API_KEY=your_api_key_here

# Production API Key (optional - uses development key if not set)
# PRODUCTION_GOOGLE_MAPS_API_KEY=your_production_key_here
```

### 3. Build Configuration Files

**Option A: Using the build script directly**
```bash
node build-config.js
```

**Option B: Using npm scripts**
```bash
npm run build-config
```

**Option C: Using the Windows batch file**
```bash
build.bat
```

**Option D: Build and start server in one command**
```bash
npm start
```

## How It Works

1. **Build Script** (`build-config.js`) reads your `.env` file
2. **Generates** `local-config.js` and `production-config.js` files
3. **Your app** loads the appropriate config file based on environment
4. **API keys** are securely loaded without being hardcoded

## File Structure

```
├── .env                    # Your environment variables (not committed)
├── build-config.js         # Build script
├── local-config.js         # Generated from .env (not committed)
├── production-config.js    # Generated from .env (not committed)
├── config.js              # Main configuration loader
└── index.html             # Your app
```

## Security

- ✅ `.env` file is not committed to git
- ✅ Generated config files are not committed to git
- ✅ No hardcoded API keys in public files
- ✅ Environment-specific configuration

## Development Workflow

1. **Update** your `.env` file with new API keys
2. **Run** `node build-config.js` to regenerate config files
3. **Start** your development server
4. **Test** your application

## Production Deployment

1. **Set** `PRODUCTION_GOOGLE_MAPS_API_KEY` in your `.env` file
2. **Run** `node build-config.js` to generate production config
3. **Deploy** your files to your production server
4. **Configure** domain restrictions in Google Cloud Console

## Troubleshooting

### Build Script Fails
- Check that Node.js is installed
- Verify `.env` file exists and has correct format
- Ensure no special characters in API keys

### API Key Not Loading
- Run `node build-config.js` after updating `.env`
- Check browser console for error messages
- Verify config files were generated correctly

### Domain Restrictions Error
- Update Google Cloud Console with your domain
- Add `localhost` and `127.0.0.1` for development
- Add your production domain for live deployment
