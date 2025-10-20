/**
 * Utility Functions
 * Helper functions used across the application
 */

/**
 * Debounce function to limit function execution rate
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Generate star rating HTML
 */
export function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

/**
 * Format category name for display
 */
export function formatCategoryName(category) {
    return category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

/**
 * Calculate distance between two geographic points
 */
export function calculateDistance(pos1, pos2) {
    const R = 6371; // Earth's radius in km
    const lat1 = pos1.lat * Math.PI / 180;
    const lat2 = pos2.lat * Math.PI / 180;
    const deltaLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const deltaLng = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
}

/**
 * Calculate distance between two points
 */
export function calculateDistanceBetweenPoints(pos1, pos2) {
    const R = 6371; // Earth's radius in kilometers
    const lat1 = pos1.lat * (Math.PI / 180);
    const lat2 = pos2.lat * (Math.PI / 180);
    const dLat = lat2 - lat1;
    const dLon = (pos2.lng - pos1.lng) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Get time ago string from timestamp
 */
export function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return past.toLocaleDateString();
}

/**
 * Generate a random OTP for demo purposes
 */
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate a simple user ID
 */
export function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

/**
 * Format address for header display
 */
export function formatAddressForHeader(fullAddress) {
    const parts = fullAddress.split(',');
    if (parts.length > 2) {
        return parts.slice(0, 2).join(',');
    }
    return fullAddress;
}

/**
 * Calculate estimated delivery time based on address
 */
export function calculateDeliveryTime(address) {
    // Simple calculation - can be enhanced with real distance/traffic data
    const baseTime = 30; // 30 minutes base
    const randomExtra = Math.floor(Math.random() * 20); // 0-20 minutes random
    return baseTime + randomExtra;
}

/**
 * Get order status color
 */
export function getOrderStatusColor(status) {
    const colors = {
        'placed': 'bg-blue-100 text-blue-800',
        'confirmed': 'bg-green-100 text-green-800',
        'preparing': 'bg-yellow-100 text-yellow-800',
        'out_for_delivery': 'bg-purple-100 text-purple-800',
        'delivered': 'bg-green-100 text-green-800',
        'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get order status icon
 */
export function getOrderStatusIcon(status) {
    const icons = {
        'placed': 'fa-shopping-cart',
        'confirmed': 'fa-check-circle',
        'preparing': 'fa-utensils',
        'out_for_delivery': 'fa-truck',
        'delivered': 'fa-check-double',
        'cancelled': 'fa-times-circle'
    };
    return icons[status] || 'fa-shopping-cart';
}

/**
 * Calculate estimated delivery based on order date and current status
 */
export function calculateEstimatedDelivery(orderDate, currentStatus) {
    const baseTime = new Date(orderDate);
    
    const statusDelays = {
        'placed': 45,
        'confirmed': 35,
        'preparing': 25,
        'out_for_delivery': 15,
        'delivered': 0,
        'cancelled': 0
    };
    
    const delay = statusDelays[currentStatus] || 45;
    baseTime.setMinutes(baseTime.getMinutes() + delay);
    
    return baseTime;
}

