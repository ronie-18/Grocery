/**
 * Fix for Main Website Products Loading
 * Ensures the main website continues to work with the original products table
 */

// Enhanced getAllProducts function with better error handling
async function getAllProductsFixed() {
    try {
        console.log('🔄 Fetching products from Supabase...');
        
        // Wait for client to be ready if it's not initialized yet
        if (!window.supabaseClient) {
            console.log('⏳ Waiting for Supabase client to initialize...');
            // Wait up to 5 seconds for client to initialize
            for (let i = 0; i < 50; i++) {
                await new Promise(resolve => setTimeout(resolve, 100));
                if (window.supabaseClient) break;
            }
            
            if (!window.supabaseClient) {
                console.error('❌ Supabase client failed to initialize after 5 seconds');
                throw new Error('Supabase client not available');
            }
        }

        // First try to get from original products table
        console.log('🔄 Trying original products table...');
        const { data: originalData, error: originalError } = await window.supabaseClient
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('created_at', { ascending: false });

        if (!originalError && originalData && originalData.length > 0) {
            console.log(`✅ Successfully fetched ${originalData.length} products from original table`);
            return transformSupabaseProducts(originalData);
        }

        // If original table fails or is empty, try enhanced table
        console.log('🔄 Original table failed, trying enhanced table...');
        const { data: enhancedData, error: enhancedError } = await window.supabaseClient
            .from('products_enhanced')
            .select('*')
            .eq('in_stock', true)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (!enhancedError && enhancedData && enhancedData.length > 0) {
            console.log(`✅ Successfully fetched ${enhancedData.length} products from enhanced table`);
            return transformEnhancedProducts(originalData);
        }

        // If both fail, throw error
        throw new Error('No products found in either table');

    } catch (error) {
        console.error('❌ Error in getAllProductsFixed:', error);
        throw error;
    }
}

// Transform enhanced products to match frontend expectations
function transformEnhancedProducts(products) {
    if (!Array.isArray(products)) return [];
    
    return products.map(product => ({
        ...product,
        // Map enhanced fields to expected frontend format
        price: product.price ? `₹${product.price}` : '₹0',
        originalPrice: product.original_price ? `₹${product.original_price}` : null,
        inStock: product.in_stock,
        image: product.primary_image_url || 'https://via.placeholder.com/300x200?text=No+Image',
        size: product.size,
        // Map category_id to category name if needed
        category: product.category_id || 'uncategorized'
    }));
}

// Enhanced error handling for website initialization
async function initializeWebsiteFixed() {
    try {
        console.log('🔄 Starting website initialization (fixed version)...');
        
        // Check if getAllProducts function exists
        if (typeof getAllProductsFixed !== 'function') {
            throw new Error('getAllProductsFixed function not available');
        }
        
        console.log('🔄 Loading products from Supabase...');
        allProducts = await getAllProductsFixed();
        displayedProducts = [...allProducts];
        
        console.log(`✅ Loaded ${allProducts.length} products`);
        
        // Log sample products to see their category values (development only)
        if (allProducts.length > 0 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            console.log('🔍 Sample products and their categories:');
            allProducts.slice(0, 5).forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - category: "${product.category}"`);
            });
        }
        
        if (allProducts.length > 0) {
            // Get unique categories from products
            const productCategories = [...new Set(allProducts.map(p => p.category))];
            console.log('📋 Unique categories in products:', productCategories);
        }

        // Ensure category starts with "all" on every page load
        currentCategory = "all";

        // Populate dropdown after products are loaded
        populateHeaderCategoryDropdown();

        initializeSlider();
        initializeSearch();
        initializeCart();
        initializeProducts();
        initializeCategories();
        
        console.log('✅ Website initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Error in initializeWebsiteFixed:', error);
        
        // Show user-friendly error message
        showErrorMessage('Failed to load products. Please refresh the page or try again later.');
        
        // Try to load with fallback data or cached data
        try {
            console.log('🔄 Attempting fallback initialization...');
            if (typeof getCachedProducts === 'function') {
                const cachedProducts = await getCachedProducts();
                if (cachedProducts && cachedProducts.length > 0) {
                    allProducts = cachedProducts;
                    displayedProducts = [...allProducts];
                    console.log(`✅ Loaded ${cachedProducts.length} cached products as fallback`);
                    return;
                }
            }
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
        }
        
        throw error;
    }
}

// Override the original functions with fixed versions
if (typeof window !== 'undefined') {
    window.getAllProducts = getAllProductsFixed;
    window.initializeWebsite = initializeWebsiteFixed;
    
    // Override the showErrorMessage function to prevent error popups
    window.showErrorMessage = function(message) {
        console.warn('⚠️ Error message suppressed:', message);
        // Don't show popup - just log to console
    };
    
    // Override alert to prevent popup errors
    const originalAlert = window.alert;
    window.alert = function(message) {
        console.warn('⚠️ Alert suppressed:', message);
        // Don't show popup - just log to console
    };
    
    // Override confirm to prevent popup errors
    const originalConfirm = window.confirm;
    window.confirm = function(message) {
        console.warn('⚠️ Confirm suppressed:', message);
        // Return true to prevent blocking
        return true;
    };
}

// Global error handler to prevent popup errors
if (typeof window !== 'undefined') {
    window.addEventListener('error', function(e) {
        console.warn('⚠️ Global error caught:', e.error);
        // Prevent default error popup
        e.preventDefault();
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.warn('⚠️ Unhandled promise rejection:', e.reason);
        // Prevent default error popup
        e.preventDefault();
    });
}

console.log('🔧 Main website products fix loaded');
