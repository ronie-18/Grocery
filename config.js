// Configuration file for API keys and settings
// WARNING: This file should not contain actual API keys in production!
// API keys should be loaded from environment variables or a secure config service
// SECURITY NOTE: API keys in this file are for development only
// In production, use environment variables or secure backend endpoints

const CONFIG = {
    // Google Maps API - This will be loaded securely
    GOOGLE_MAPS_API_KEY: null, // Will be set by loadSecureConfig()

    // App settings
    LOCATION_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    SEARCH_RADIUS_KM: 2, // 2km radius for nearby shops
    MAX_SAVED_ADDRESSES: 5
};

// Function to load secure configuration
async function loadSecureConfig() {
    try {
        // Check if we're in production (live website)
        const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' &&
                           !window.location.hostname.includes('localhost')
        
        if (isProduction) {
            // For production, load from production config
            // IMPORTANT: Production API key must be configured securely
            if (typeof window !== 'undefined' && window.PRODUCTION_CONFIG && window.PRODUCTION_CONFIG.GOOGLE_MAPS_API_KEY) {
                CONFIG.GOOGLE_MAPS_API_KEY = window.PRODUCTION_CONFIG.GOOGLE_MAPS_API_KEY
                console.log('✅ Production API key loaded for:', window.location.hostname)
            } else {
                console.error('❌ Production API key not configured - please set up production-config.js')
                CONFIG.GOOGLE_MAPS_API_KEY = null
            }
        } else {
            // For development, try to load from local config
            console.log('🔧 Development mode - loading from local config')
            CONFIG.GOOGLE_MAPS_API_KEY = await loadFromSecureSource()
        }
    } catch (error) {
        console.error('Failed to load secure configuration:', error)
        // Fallback - try to get from local config if available
        if (typeof window !== 'undefined' && window.LOCAL_CONFIG && window.LOCAL_CONFIG.GOOGLE_MAPS_API_KEY) {
            CONFIG.GOOGLE_MAPS_API_KEY = window.LOCAL_CONFIG.GOOGLE_MAPS_API_KEY
            console.log('🔧 Using fallback from LOCAL_CONFIG')
        } else {
            // Last resort fallback - show error instead of hardcoded key
            console.error('❌ No API key available - please configure local-config.js')
            CONFIG.GOOGLE_MAPS_API_KEY = null
        }
    }
}

// Temporary fallback function for development
async function loadFromSecureSource() {
    // Load from local config file (not committed to git)
    try {
        if (typeof window !== 'undefined' && window.LOCAL_CONFIG) {
            return window.LOCAL_CONFIG.GOOGLE_MAPS_API_KEY;
        }
        // Fallback - no hardcoded keys for security
        console.error('❌ No API key found in LOCAL_CONFIG');
        return null;
    } catch (error) {
        console.error('Failed to load from local config:', error);
        // No hardcoded fallback for security
        return null;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
