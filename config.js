// Configuration file for API keys and settings
// In production, these should be loaded from environment variables

const CONFIG = {
    // Google Maps API - Replace with your actual API key
    GOOGLE_MAPS_API_KEY: 'AIzaSyCIyizHk4GySPlZBNvcGEXVydsENNC4NjQ',
    
    // App settings
    LOCATION_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    SEARCH_RADIUS_KM: 2, // 2km radius for nearby shops
    MAX_SAVED_ADDRESSES: 5
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
