# Auto-Sync Setup Guide

This guide will help you set up automatic synchronization between the admin panel and the `products-data.js` file, eliminating the need for manual file downloads and replacements.

## 🎯 Overview

When you add/edit products in the admin panel:
1. ✅ Products are saved to Firestore (as before)
2. ✅ **NEW**: Products are automatically synced to `products-data.js` file
3. ✅ No more manual file downloads or replacements!

## 🚀 Quick Setup (Recommended)

### Step 1: Install Dependencies
```bash
cd admin
npm install
```

### Step 2: Add Firebase Service Account
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → Service Accounts
3. Click "Generate new private key"
4. Save the downloaded file as `firebase-service-account.json` in the `admin/` directory

### Step 3: Update Firebase Config
Edit `admin/sync-products.js` line 18:
```javascript
databaseURL: "https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com"
```

### Step 4: Start the Sync Server
```bash
npm run start-sync-server
```

### Step 5: Test Auto-Sync
1. Open admin panel
2. Add/edit a product
3. Check that `products-data.js` is automatically updated! 🎉

## 📖 Detailed Setup Options

### Option A: Full Auto-Sync (Recommended)
- **Benefits**: Zero manual intervention
- **Requirements**: Node.js server running
- **Setup**: Follow Quick Setup above

### Option B: Manual Sync Button
- **Benefits**: No server required
- **Requirements**: Run sync script manually
- **Usage**: Click sync button in admin panel, then run `npm run sync-products`

### Option C: Periodic Auto-Sync (Advanced)
Set up a cron job or scheduled task:
```bash
# Run every hour
0 * * * * cd /path/to/your/project/admin && npm run sync-products
```

## 🔧 Configuration

### Environment Variables
Create `.env` file in `admin/` directory:
```env
SYNC_PORT=3001
FIREBASE_PROJECT_ID=your-project-id
NODE_ENV=production
```

### Custom Sync Endpoint
Update `admin/js/products-data-updater.js` line 35 if using different URL:
```javascript
const response = await fetch('http://localhost:3001/api/sync-products', {
```

## 🛠️ Troubleshooting

### Issue: Auto-sync not working
**Solution**: 
1. Check if sync server is running: `http://localhost:3001/health`
2. Check browser console for errors
3. Verify Firebase service account permissions

### Issue: "No document to update" error
**Solution**: 
This is now fixed! The system automatically detects local vs Firestore products and handles them correctly.

### Issue: Manual sync required
**Solution**: 
1. Start the sync server: `npm run start-sync-server`
2. Or use manual sync: `npm run sync-products`

### Issue: Firebase permissions error
**Solution**: 
1. Verify service account has Firestore read/write permissions
2. Check that Firebase rules allow admin access
3. Ensure correct project ID in config

## 📁 File Structure

```
admin/
├── sync-products.js          # Main sync script
├── sync-server.js            # Express server for auto-sync
├── package.json              # Dependencies
├── firebase-service-account.json  # Your Firebase credentials
├── js/
│   └── products-data-updater.js   # Browser-side sync logic
└── AUTO_SYNC_SETUP.md        # This guide
```

## 🚀 Production Deployment

### For Production Use:
1. Use environment variables for sensitive data
2. Set up proper logging and monitoring
3. Use process manager (PM2) for the sync server:
   ```bash
   npm install -g pm2
   pm2 start sync-server.js --name "products-sync"
   pm2 startup
   pm2 save
   ```

### Security Considerations:
- Keep `firebase-service-account.json` secure
- Use firewall rules to restrict sync server access
- Implement authentication for sync endpoints in production

## 🎉 Benefits

✅ **Zero Manual Work**: Products sync automatically
✅ **Real-time Updates**: Changes appear immediately  
✅ **Backup Safety**: Automatic backups created
✅ **Error Handling**: Graceful fallbacks if sync fails
✅ **Consistent Data**: Single source of truth (Firestore)

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all setup steps were completed
3. Test manual sync first: `npm run sync-products`
4. Check Firebase console for any errors

---

**Happy syncing! 🚀** 