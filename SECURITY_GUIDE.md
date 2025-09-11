# Security Guide

## 🔒 **API Key Security**

### **Current Setup (Secure)**

✅ **API key protected** - `app-config.js` is gitignored
✅ **Template provided** - `app-config.template.js` for setup
✅ **Team friendly** - Simple one-time setup
✅ **Production ready** - Secure deployment

### **File Structure**

```
Grocery/
├── app-config.template.js  # ✅ SAFE TEMPLATE (no real keys)
├── app-config.js         # ❌ GITIGNORED (contains real API key)
├── index.html            # ✅ MAIN APPLICATION
└── script.js             # ✅ APPLICATION LOGIC
```

### **How It Works**

1. **Repository contains:** `app-config.template.js` (template with placeholder)
2. **Developer creates:** `app-config.js` (with real API key)
3. **Git ignores:** `app-config.js` (never committed)
4. **Application uses:** `app-config.js` (real configuration)

### **For New Team Members**

```bash
# 1. Clone repository
git clone <repo-url>
cd Grocery

# 2. Copy template
cp app-config.template.js app-config.js

# 3. Edit app-config.js and add your API key
# GOOGLE_MAPS_API_KEY: 'YOUR_ACTUAL_API_KEY_HERE'

# 4. Run application
open index.html
```

### **Security Benefits**

- ✅ **No API keys in version control**
- ✅ **Template provides structure**
- ✅ **Easy to update keys**
- ✅ **Team collaboration friendly**
- ✅ **Production deployment secure**

### **Production Deployment**

1. **Create `app-config.js`** on production server
2. **Add production API key** to the file
3. **Upload other files** (app-config.js stays on server)
4. **Done!** - Secure deployment

### **API Key Management**

#### **Development Keys**
- Use test/development API keys
- Set domain restrictions to `localhost/*`
- Monitor usage in Google Cloud Console

#### **Production Keys**
- Use production API keys
- Set domain restrictions to your live domain
- Enable billing and monitor usage

### **Best Practices**

1. **Never commit** `app-config.js` to version control
2. **Use different keys** for development and production
3. **Set proper domain restrictions** in Google Cloud Console
4. **Monitor API usage** regularly
5. **Rotate keys** periodically for security

### **Troubleshooting**

**If API key is not working:**
1. Check `app-config.js` exists and has correct key
2. Verify Google Cloud Console settings
3. Check domain restrictions
4. Ensure billing is enabled

**If getting "API key not found" error:**
1. Make sure `app-config.js` exists
2. Check the key is not a placeholder
3. Verify the file is being loaded correctly

### **Security Checklist**

- [ ] `app-config.js` is in `.gitignore`
- [ ] `app-config.template.js` contains no real keys
- [ ] Each developer has their own `app-config.js`
- [ ] Production has separate API key
- [ ] Domain restrictions are set correctly
- [ ] API usage is monitored

---

## 🛡️ **Summary**

**Secure by default:** API keys are never committed to version control.

**Team friendly:** Simple one-time setup with template file.

**Production ready:** Secure deployment with proper key management.
