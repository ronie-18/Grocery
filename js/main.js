/**
 * Main Application Entry Point
 * Near & Now Grocery App - Modular Version
 * 
 * Orchestrates all modules and initializes the application
 */

// Import all modules
import { setAllProducts, setDisplayedProducts, setIsPageInitializing } from './modules/globals.js';
import { showErrorMessage, showNotification, initializeModals, initializeScrollEffects, initializeNewsletter, initializeNavigation } from './modules/ui.js';
import { initializeLoginSystem, initializeAuth, logoutUser } from './modules/auth.js';
import { initializeCart, cartModule } from './modules/cart.js';
import { initializeSearch, searchModule } from './modules/search.js';
import { initializeProducts, productsModule } from './modules/products.js';
import { initializeCategories, populateHeaderCategoryDropdown, categoriesModule } from './modules/categories.js';

console.log('🎯 Main application module loaded');

/**
 * Wait for non-module dependencies to be ready
 */
function waitForDependencies() {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        const checkDependencies = () => {
            attempts++;
            
            // Check if required globals are available
            const hasGetAllProducts = typeof window.getAllProducts === 'function';
            const hasSupabaseClient = typeof window.supabaseClient !== 'undefined';
            
            if (hasGetAllProducts && hasSupabaseClient) {
                console.log('✅ All dependencies loaded');
                resolve();
            } else if (attempts >= maxAttempts) {
                console.error('❌ Timeout waiting for dependencies');
                reject(new Error('Dependencies failed to load'));
            } else {
                console.log(`⏳ Waiting for dependencies... (${attempts}/${maxAttempts})`);
                setTimeout(checkDependencies, 100);
            }
        };
        
        checkDependencies();
    });
}

/**
 * Initialize the website
 */
async function initializeWebsite() {
    try {
        console.log('🚀 Starting Near & Now website initialization...');
        
        // Wait for dependencies
        await waitForDependencies();
        
        console.log('🔄 Loading products from Supabase...');
        
        // Use window.getAllProducts to ensure we're calling the global function
        const products = await window.getAllProducts();
        
        if (!products || products.length === 0) {
            throw new Error('No products loaded from database');
        }
        
        setAllProducts(products);
        setDisplayedProducts([...products]);
        
        console.log(`✅ Loaded ${products.length} products`);
        
        // Log sample products (development only)
        if (products.length > 0 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            console.log('🔍 Sample products:');
            products.slice(0, 3).forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - category: "${product.category}"`);
            });
        }

        // Initialize all modules in order
        console.log('📦 Initializing modules...');
        
        try {
            initializeAuth();
            console.log('✅ Auth module initialized');
        } catch (e) {
            console.error('❌ Auth initialization failed:', e);
        }
        
        try {
            initializeLoginSystem();
            console.log('✅ Login system initialized');
        } catch (e) {
            console.error('❌ Login system initialization failed:', e);
        }
        
        try {
            initializeCart();
            console.log('✅ Cart module initialized');
        } catch (e) {
            console.error('❌ Cart initialization failed:', e);
        }
        
        try {
            initializeSearch();
            console.log('✅ Search module initialized');
        } catch (e) {
            console.error('❌ Search initialization failed:', e);
        }
        
        try {
            await initializeCategories();
            console.log('✅ Categories module initialized');
        } catch (e) {
            console.error('❌ Categories initialization failed:', e);
        }
        
        try {
            populateHeaderCategoryDropdown();
            console.log('✅ Category dropdown populated');
        } catch (e) {
            console.error('❌ Category dropdown failed:', e);
        }
        
        try {
            initializeProducts();
            console.log('✅ Products module initialized');
        } catch (e) {
            console.error('❌ Products initialization failed:', e);
        }
        
        try {
            initializeModals();
            console.log('✅ Modals initialized');
        } catch (e) {
            console.error('❌ Modals initialization failed:', e);
        }
        
        try {
            initializeScrollEffects();
            console.log('✅ Scroll effects initialized');
        } catch (e) {
            console.error('❌ Scroll effects initialization failed:', e);
        }
        
        try {
            initializeNavigation();
            console.log('✅ Navigation initialized');
        } catch (e) {
            console.error('❌ Navigation initialization failed:', e);
        }
        
        try {
            initializeNewsletter();
            console.log('✅ Newsletter initialized');
        } catch (e) {
            console.error('❌ Newsletter initialization failed:', e);
        }

        console.log("✅ Near & Now website fully initialized!");
        
        // Allow scrolling after initialization is complete
        setIsPageInitializing(false);
        
        // Show success notification
        setTimeout(() => {
            showNotification('Welcome to Near & Now! 🛒', 'success');
        }, 1000);
        
    } catch (error) {
        console.error('❌ Critical error initializing website:', error);
        
        // Show user-friendly error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white p-4 text-center z-50';
        
        const title = document.createElement('strong');
        title.textContent = '⚠️ Website Initialization Error';
        
        const message = document.createElement('p');
        message.className = 'text-sm mt-1';
        message.textContent = error.message;
        
        const button = document.createElement('button');
        button.className = 'mt-2 bg-white text-red-500 px-4 py-2 rounded';
        button.textContent = '🔄 Reload Page';
        button.onclick = () => location.reload();
        
        errorDiv.appendChild(title);
        errorDiv.appendChild(message);
        errorDiv.appendChild(button);
        
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }
}

/**
 * Initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", async () => {
        console.log('📄 DOM loaded, starting initialization...');
        await initializeWebsite();
    });
} else {
    // DOM already loaded
    console.log('📄 DOM already loaded, starting initialization...');
    initializeWebsite();
}

/**
 * Export modules for global access (backward compatibility)
 * These allow the HTML onclick handlers and other scripts to work
 */
window.cartModule = cartModule;
window.searchModule = searchModule;
window.productsModule = productsModule;
window.categoriesModule = categoriesModule;
window.authModule = { logoutUser };

// Export individual functions that are called from HTML
window.addToCart = cartModule.addToCart;
window.removeFromCart = cartModule.removeFromCart;
window.updateCartQuantity = cartModule.updateCartQuantity;
window.decreaseCartQuantity = cartModule.decreaseCartQuantity;
window.clearCart = cartModule.clearCart;
window.filterByCategory = productsModule.filterByCategory;
window.logoutUser = logoutUser;
window.showNotification = showNotification;

console.log('✅ Global exports ready for backward compatibility');
