// Admin Utility Functions for Near & Now Admin Panel

class AdminUtils {
    constructor() {
        this.initialized = false;
    }

    // ============= FORMATTING UTILITIES =============
    
    static formatCurrency(amount, currency = '₹') {
        if (!amount) return currency + '0';
        
        const numAmount = typeof amount === 'string' ? 
            parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
        
        if (isNaN(numAmount)) return currency + '0';
        
        // Format with Indian number system
        return currency + numAmount.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    }

    static formatNumber(num) {
        if (!num) return '0';
        
        const number = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(number)) return '0';
        
        if (number >= 10000000) {
            return (number / 10000000).toFixed(1) + ' Cr';
        } else if (number >= 100000) {
            return (number / 100000).toFixed(1) + ' L';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        
        return number.toLocaleString('en-IN');
    }

    static formatDate(date, format = 'short') {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        const options = {
            short: { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            },
            long: { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            },
            time: {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }
        };
        
        return dateObj.toLocaleDateString('en-IN', options[format] || options.short);
    }

    static formatRelativeTime(date) {
        if (!date) return '';
        
        const dateObj = date instanceof Date ? date : new Date(date);
        const now = new Date();
        const diffMs = now - dateObj;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffSecs < 60) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return this.formatDate(dateObj);
    }

    // ============= VALIDATION UTILITIES =============
    
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePhone(phone) {
        const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
        return phoneRegex.test(phone.replace(/\s+/g, ''));
    }

    static validatePrice(price) {
        const numPrice = typeof price === 'string' ? 
            parseFloat(price.replace(/[^\d.-]/g, '')) : price;
        return !isNaN(numPrice) && numPrice >= 0;
    }

    static validateRequired(value, fieldName = 'Field') {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { isValid: false, error: `${fieldName} is required` };
        }
        return { isValid: true };
    }

    static validateUrl(url) {
        try {
            new URL(url);
            return { isValid: true };
        } catch {
            return { isValid: false, error: 'Invalid URL format' };
        }
    }

    // ============= DATA UTILITIES =============
    
    static generateId(prefix = 'item') {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `${prefix}-${timestamp}-${random}`;
    }

    static slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    // ============= UI UTILITIES =============
    
    static showNotification(message, type = 'info', duration = 5000) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            min-width: 300px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)} mr-2"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                float: right;
                font-size: 1.2rem;
                cursor: pointer;
                color: inherit;
                opacity: 0.7;
            ">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    static getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            danger: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    static showConfirmDialog(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const result = confirm(`${title}\n\n${message}`);
            resolve(result);
        });
    }

    static showLoadingOverlay(message = 'Loading...') {
        let overlay = document.getElementById('globalLoadingOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'globalLoadingOverlay';
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <div class="modal" style="max-width: 300px;">
                    <div class="modal-body text-center">
                        <div class="loading mb-3"></div>
                        <div id="globalLoadingText">${message}</div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);
        } else {
            document.getElementById('globalLoadingText').textContent = message;
        }
        overlay.classList.add('active');
    }

    static hideLoadingOverlay() {
        const overlay = document.getElementById('globalLoadingOverlay');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    // ============= STORAGE UTILITIES =============
    
    static setLocalStorage(key, value, expiry = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                expiry: expiry
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Error setting localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key) {
        try {
            const itemStr = localStorage.getItem(key);
            if (!itemStr) return null;
            
            const item = JSON.parse(itemStr);
            
            // Check expiry
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(key);
                return null;
            }
            
            return item.value;
        } catch (error) {
            console.error('Error getting localStorage:', error);
            return null;
        }
    }

    static removeLocalStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing localStorage:', error);
            return false;
        }
    }

    // ============= EXPORT/IMPORT UTILITIES =============
    
    static exportToCSV(data, filename = 'export.csv') {
        if (!data || !data.length) {
            this.showNotification('No data to export', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header] || '';
                    return `"${String(value).replace(/"/g, '""')}"`;
                }).join(',')
            )
        ].join('\n');
        
        this.downloadFile(csvContent, filename, 'text/csv');
    }

    static exportToJSON(data, filename = 'export.json') {
        if (!data) {
            this.showNotification('No data to export', 'warning');
            return;
        }
        
        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, filename, 'application/json');
    }

    static downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        this.showNotification(`File "${filename}" downloaded successfully`, 'success');
    }

    // ============= SEARCH & FILTER UTILITIES =============
    
    static searchInArray(array, searchTerm, searchFields = []) {
        if (!searchTerm) return array;
        
        const term = searchTerm.toLowerCase();
        
        return array.filter(item => {
            if (searchFields.length === 0) {
                // Search in all string fields
                return Object.values(item).some(value => 
                    typeof value === 'string' && 
                    value.toLowerCase().includes(term)
                );
            } else {
                // Search in specified fields
                return searchFields.some(field => 
                    item[field] && 
                    typeof item[field] === 'string' && 
                    item[field].toLowerCase().includes(term)
                );
            }
        });
    }

    static filterByCategory(array, category, categoryField = 'category') {
        if (!category) return array;
        return array.filter(item => item[categoryField] === category);
    }

    static sortArray(array, sortField, sortDirection = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = a[sortField];
            const bVal = b[sortField];
            
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                const result = aVal.localeCompare(bVal);
                return sortDirection === 'asc' ? result : -result;
            }
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                const result = aVal - bVal;
                return sortDirection === 'asc' ? result : -result;
            }
            
            // Handle dates
            if (aVal instanceof Date && bVal instanceof Date) {
                const result = aVal - bVal;
                return sortDirection === 'asc' ? result : -result;
            }
            
            return 0;
        });
    }

    // ============= ANALYTICS UTILITIES =============
    
    static calculateGrowthRate(current, previous) {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    }

    static getDateRange(range) {
        const now = new Date();
        const ranges = {
            today: () => ({
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                end: now
            }),
            yesterday: () => {
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                return {
                    start: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()),
                    end: new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59)
                };
            },
            week: () => ({
                start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
                end: now
            }),
            month: () => ({
                start: new Date(now.getFullYear(), now.getMonth(), 1),
                end: now
            }),
            quarter: () => {
                const quarter = Math.floor(now.getMonth() / 3);
                return {
                    start: new Date(now.getFullYear(), quarter * 3, 1),
                    end: now
                };
            },
            year: () => ({
                start: new Date(now.getFullYear(), 0, 1),
                end: now
            })
        };
        
        return ranges[range] ? ranges[range]() : ranges.today();
    }

    // ============= ERROR HANDLING =============
    
    static handleError(error, context = 'Operation') {
        console.error(`${context} failed:`, error);
        
        let message = 'An unexpected error occurred';
        
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showNotification(`${context} failed: ${message}`, 'danger', 8000);
        
        return {
            success: false,
            error: message,
            context: context
        };
    }

    // ============= DEBOUNCE UTILITY =============
    
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
}

// Global utility functions for convenience
window.AdminUtils = AdminUtils;

// Shortcuts
window.formatCurrency = AdminUtils.formatCurrency;
window.formatNumber = AdminUtils.formatNumber;
window.formatDate = AdminUtils.formatDate;
window.showNotification = AdminUtils.showNotification;
window.showConfirmDialog = AdminUtils.showConfirmDialog;
window.showLoadingOverlay = AdminUtils.showLoadingOverlay;
window.hideLoadingOverlay = AdminUtils.hideLoadingOverlay;
window.exportToCSV = AdminUtils.exportToCSV;
window.exportToJSON = AdminUtils.exportToJSON;
window.searchInArray = AdminUtils.searchInArray;
window.handleError = AdminUtils.handleError;

console.log('✅ Admin Utilities loaded'); 