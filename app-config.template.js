// Application Configuration Template
// Copy this file to app-config.js and add your actual API key

const APP_CONFIG = {
    // Google Maps API Key - Replace with your actual API key
    GOOGLE_MAPS_API_KEY: 'YOUR_GOOGLE_MAPS_API_KEY_HERE',
    
    // App settings
    LOCATION_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    SEARCH_RADIUS_KM: 2, // 2km radius for nearby shops
    MAX_SAVED_ADDRESSES: 5,
    
    // Environment detection
    isProduction: function() {
        return window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('localhost') &&
               !window.location.hostname.includes('127.0.0.1') &&
               window.location.hostname !== '0.0.0.0' &&
               !window.location.hostname.includes('192.168.') &&
               !window.location.hostname.includes('10.0.') &&
               window.location.protocol !== 'file:'
    },
    
    // Get the appropriate API key based on environment
    getApiKey: function() {
        return this.GOOGLE_MAPS_API_KEY
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
} else {
    window.APP_CONFIG = APP_CONFIG;
    window.CONFIG = APP_CONFIG; // Backward compatibility
}

// Log configuration status
console.log('🔧 App configuration loaded');
console.log('🌐 Environment:', APP_CONFIG.isProduction() ? 'Production' : 'Development');
console.log('🔑 API Key Status:', APP_CONFIG.getApiKey() ? 'Present' : 'NOT FOUND');
