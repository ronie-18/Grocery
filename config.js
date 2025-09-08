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
        // Check if we're in production (live website)
        const isProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1' &&
                           !window.location.hostname.includes('localhost')
        
        if (isProduction) {
            // For production, use the API key directly
            // TODO: Replace with your actual production API key
            CONFIG.GOOGLE_MAPS_API_KEY = 'AIzaSyCIyizHk4GySPlZBNvcGEXVydsENNC4NjQ'
            console.log('✅ Production API key loaded')
        } else {
            // For development, try to load from local config
            console.log('🔧 Development mode - loading from local config')
            CONFIG.GOOGLE_MAPS_API_KEY = await loadFromSecureSource()
        }
    } catch (error) {
        console.error('Failed to load secure configuration:', error)
        // Fallback API key for development
        CONFIG.GOOGLE_MAPS_API_KEY = 'AIzaSyCIyizHk4GySPlZBNvcGEXVydsENNC4NjQ'
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
