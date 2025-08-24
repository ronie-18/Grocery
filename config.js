// Configuration file for API keys and settings
// WARNING: This file should not contain actual API keys in production!
// API keys should be loaded from environment variables or a secure config service

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
        // In development, try to load from a secure endpoint or local config
        // In production, this should load from your backend API
        const response = await fetch('/api/config')
        if (response.ok) {
            const secureConfig = await response.json()
            CONFIG.GOOGLE_MAPS_API_KEY = secureConfig.GOOGLE_MAPS_API_KEY
        } else {
            // Fallback for development - load from local secure file
            // This is temporary and should be replaced with proper backend integration
            console.warn('Loading API key from fallback method - not recommended for production')
            CONFIG.GOOGLE_MAPS_API_KEY = await loadFromSecureSource()
        }
    } catch (error) {
        console.error('Failed to load secure configuration:', error)
        // Use a placeholder that will fail gracefully
        CONFIG.GOOGLE_MAPS_API_KEY = 'SECURE_CONFIG_FAILED_TO_LOAD'
    }
}

// Temporary fallback function for development
async function loadFromSecureSource() {
    // Load from local config file (not committed to git)
    try {
        if (typeof window !== 'undefined' && window.LOCAL_CONFIG) {
            return window.LOCAL_CONFIG.GOOGLE_MAPS_API_KEY;
        }
        // Fallback - this should be replaced with backend API in production
        return 'API_KEY_NOT_FOUND_PLEASE_CONFIGURE';
    } catch (error) {
        console.error('Failed to load from local config:', error);
        return 'API_KEY_LOAD_FAILED';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
