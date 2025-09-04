/**
 * Supabase Client Configuration
 * Centralized Supabase client for all frontend operations
 * Works with script tags (non-module)
 */

// Supabase configuration
const SUPABASE_URL = 'https://mpbszymyubxavjoxhzfm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnN6eW15dWJ4YXZqb3hoemZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTc5OTQsImV4cCI6MjA2OTg3Mzk5NH0.NnHFwGCkNpTWorV8O6vgn6uuqYPRek1QK4Sk_rcqLOg'

// Create Supabase client (will be available globally)
let supabaseClient = null

// Initialize Supabase immediately when script loads
function initializeSupabaseClient() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        console.log('✅ Supabase client initialized')
        return true
    } else {
        console.error('❌ Supabase library not loaded')
        return false
    }
}

// Try to initialize immediately
if (typeof supabase !== 'undefined') {
    initializeSupabaseClient()
} else {
    // If not loaded yet, wait for it
    document.addEventListener('DOMContentLoaded', function() {
        // Wait a bit for external script to load
        setTimeout(initializeSupabaseClient, 100)
    })
}

/**
 * Product API Functions
 * These replace all the functions from products-data.js
 */

// Get all products (replaces getAllProducts())
async function getAllProducts() {
    try {
        // Wait for client to be ready if it's not initialized yet
        if (!supabaseClient) {
            console.log('⏳ Waiting for Supabase client to initialize...')
            // Wait up to 3 seconds for client to initialize
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 100))
                if (supabaseClient) break
            }
            
            if (!supabaseClient) {
                console.error('❌ Supabase client failed to initialize after 3 seconds')
                throw new Error('Supabase client not available')
            }
        }

        console.log('🔄 Fetching products from Supabase...')
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('in_stock', true)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('❌ Supabase error:', error)
            throw new Error(`Database error: ${error.message}`)
        }

        console.log(`✅ Successfully fetched ${data?.length || 0} products`)
        
        // Transform products to match frontend expectations
        return transformSupabaseProducts(data || [])
    } catch (error) {
        console.error('❌ Error in getAllProducts:', error)
        throw error // Re-throw so calling code can handle it
    }
}

// Get products by category (replaces getProductsByCategory())
async function getProductsByCategory(categoryName) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning empty array')
            return []
        }

        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('category', categoryName)
            .eq('in_stock', true)
            .order('rating', { ascending: false })

        if (error) {
            console.error('Error fetching products by category:', error)
            return []
        }

        return transformSupabaseProducts(data || [])
    } catch (error) {
        console.error('Error in getProductsByCategory:', error)
        return []
    }
}

// Get available categories (replaces getAvailableCategories())
async function getAvailableCategories() {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning empty array')
            return []
        }

        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return []
        }

        // Check if oil category exists, if not add it
        const oilCategoryExists = data?.some(cat => cat.name === 'Oils')
        if (!oilCategoryExists) {
            console.log('🛢️ Oils category not found in database, adding it...')
            await addOilCategory()
        }
        
        // Check if pasta-noodles-vermicelli category exists, if not add it
        const pastaNoodlesVermicelliCategoryExists = data?.some(cat => cat.name === 'Pasta, Noodles & Vermicelli')
        if (!pastaNoodlesVermicelliCategoryExists) {
            console.log('🍝 Pasta, Noodles & Vermicelli category not found in database, adding it...')
            await addPastaNoodlesVermicelliCategory()
        }
        
        // Check if bakery category exists, if not add it
        const bakeryCategoryExists = data?.some(cat => cat.name === 'Bakery')
        if (!bakeryCategoryExists) {
            console.log('🥖 Bakery category not found in database, adding it...')
            await addBakeryCategory()
        }
        
        // Check if salt-sugar category exists, if not add it
        const saltSugarCategoryExists = data?.some(cat => cat.name === 'Salt and Sugar')
        if (!saltSugarCategoryExists) {
            console.log('🧂 Salt and Sugar category not found in database, adding it...')
            await addSaltSugarCategory()
        }
        
        // If we added any categories, fetch updated list
        if (!oilCategoryExists || !pastaNoodlesVermicelliCategoryExists || !bakeryCategoryExists || !saltSugarCategoryExists) {
            const { data: updatedData, error: updatedError } = await supabaseClient
                .from('categories')
                .select('*')
                .order('display_order', { ascending: true })
            
            if (updatedError) {
                console.error('Error fetching categories after adding new categories:', updatedError)
                return data || []
            }
            
            return updatedData || []
        }

        return data || []
    } catch (error) {
        console.error('Error in getAvailableCategories:', error)
        return []
    }
}

// Function to add oil category to Supabase
async function addOilCategory() {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        // Get the highest display_order to place oil after spices
        const { data: existingCategories, error: fetchError } = await supabaseClient
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: true })

        if (fetchError) {
            console.error('Error fetching existing categories:', fetchError)
            return false
        }

        // Find spices category to place oil after it
        const spicesCategory = existingCategories?.find(cat => cat.name === 'Spices')
        let displayOrder = 3 // Default position after spices

        if (spicesCategory) {
            // Place oil after spices
            displayOrder = spicesCategory.display_order + 1
        } else if (existingCategories && existingCategories.length > 0) {
            // If no spices found, place after the second category
            displayOrder = existingCategories[1]?.display_order + 1 || 3
        }

        // Insert oils category
        const { error: insertError } = await supabaseClient
            .from('categories')
            .insert({
                name: 'Oils',
                description: 'Cooking & Essential Oils',
                display_order: displayOrder,
                image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                color: 'from-amber-100 to-yellow-200',
                active: true
            })

        if (insertError) {
            console.error('Error adding oil category:', insertError)
            return false
        }

        console.log('✅ Oils category added successfully to Supabase')
        return true
    } catch (error) {
        console.error('Error in addOilCategory:', error)
        return false
    }
}

// Function to add pasta-noodles-vermicelli category to Supabase
async function addPastaNoodlesVermicelliCategory() {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        // Get existing categories to find proper display order
        const { data: existingCategories, error: fetchError } = await supabaseClient
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: true })

        if (fetchError) {
            console.error('Error fetching existing categories:', fetchError)
            return false
        }

        // Find oils category to place pasta-noodles-vermicelli after it
        const oilsCategory = existingCategories?.find(cat => cat.name === 'Oils')
        let displayOrder = 4 // Default position after oils

        if (oilsCategory) {
            // Place pasta-noodles-vermicelli after oils
            displayOrder = oilsCategory.display_order + 1
        } else if (existingCategories && existingCategories.length > 0) {
            // If no oils found, place after the third category
            displayOrder = existingCategories[2]?.display_order + 1 || 4
        }

        // Insert pasta-noodles-vermicelli category
        const { error: insertError } = await supabaseClient
            .from('categories')
            .insert({
                name: 'Pasta, Noodles & Vermicelli',
                description: 'Fresh & Instant Pasta, Noodles and Vermicelli',
                display_order: displayOrder,
                image_url: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                color: 'from-orange-100 to-red-200',
                active: true
            })

        if (insertError) {
            console.error('Error adding pasta-noodles-vermicelli category:', insertError)
            return false
        }

        console.log('✅ Pasta, Noodles & Vermicelli category added successfully to Supabase')
        return true
    } catch (error) {
        console.error('Error in addPastaNoodlesVermicelliCategory:', error)
        return false
    }
}

// Function to add bakery category to Supabase
async function addBakeryCategory() {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        // Get existing categories to find proper display order
        const { data: existingCategories, error: fetchError } = await supabaseClient
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: true })

        if (fetchError) {
            console.error('Error fetching existing categories:', fetchError)
            return false
        }

        // Find pasta-noodles-vermicelli category to place bakery after it
        const pastaCategory = existingCategories?.find(cat => cat.name === 'Pasta, Noodles & Vermicelli')
        let displayOrder = 5 // Default position after pasta-noodles-vermicelli

        if (pastaCategory) {
            // Place bakery after pasta-noodles-vermicelli
            displayOrder = pastaCategory.display_order + 1
        } else if (existingCategories && existingCategories.length > 0) {
            // If no pasta category found, place after the fourth category
            displayOrder = existingCategories[3]?.display_order + 1 || 5
        }

        // Insert bakery category
        const { error: insertError } = await supabaseClient
            .from('categories')
            .insert({
                name: 'Bakery',
                description: 'Fresh Bread & Pastries',
                display_order: displayOrder,
                image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                color: 'from-brown-100 to-amber-200',
                active: true
            })

        if (insertError) {
            console.error('Error adding bakery category:', insertError)
            return false
        }

        console.log('✅ Bakery category added successfully to Supabase')
        return true
    } catch (error) {
        console.error('Error in addBakeryCategory:', error)
        return false
    }
}

// Function to add salt-sugar category to Supabase
async function addSaltSugarCategory() {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        // Get existing categories to find proper display order
        const { data: existingCategories, error: fetchError } = await supabaseClient
            .from('categories')
            .select('display_order')
            .order('display_order', { ascending: true })

        if (fetchError) {
            console.error('Error fetching existing categories:', fetchError)
            return false
        }

        // Find bakery category to place salt-sugar after it
        const bakeryCategory = existingCategories?.find(cat => cat.name === 'Bakery')
        let displayOrder = 6 // Default position after bakery

        if (bakeryCategory) {
            // Place salt-sugar after bakery
            displayOrder = bakeryCategory.display_order + 1
        } else if (existingCategories && existingCategories.length > 0) {
            // If no bakery category found, place after the fifth category
            displayOrder = existingCategories[4]?.display_order + 1 || 6
        }

        // Insert salt-sugar category
        const { error: insertError } = await supabaseClient
            .from('categories')
            .insert({
                name: 'Salt and Sugar',
                description: 'Essential Cooking Ingredients',
                display_order: displayOrder,
                image_url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
                color: 'from-gray-100 to-white',
                active: true
            })

        if (insertError) {
            console.error('Error adding salt-sugar category:', insertError)
            return false
        }

        console.log('✅ Salt and Sugar category added successfully to Supabase')
        return true
    } catch (error) {
        console.error('Error in addSaltSugarCategory:', error)
        return false
    }
}

// Search products by name/keywords
async function searchProducts(searchTerm) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning empty array')
            return []
        }

        if (!searchTerm || searchTerm.trim() === '') {
            return getAllProducts()
        }

        // Simple search using ilike for better compatibility
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,search_keywords.ilike.%${searchTerm}%`)
            .eq('in_stock', true)
            .order('rating', { ascending: false })

        if (error) {
            console.error('Error searching products:', error)
            return []
        }

        return transformSupabaseProducts(data || [])
    } catch (error) {
        console.error('Error in searchProducts:', error)
        return []
    }
}

// Get featured products
async function getFeaturedProducts(limit = 8) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning empty array')
            return []
        }

        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('featured', true)
            .eq('in_stock', true)
            .order('rating', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching featured products:', error)
            return []
        }

        return transformSupabaseProducts(data || [])
    } catch (error) {
        console.error('Error in getFeaturedProducts:', error)
        return []
    }
}

// Get products with filters (price range, rating, etc.)
async function getFilteredProducts(filters = {}) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning empty array')
            return []
        }

        let query = supabaseClient
            .from('products')
            .select('*')
            .eq('in_stock', true)

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            query = query.eq('category', filters.category)
        }

        // Apply price range filter
        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice)
        }
        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice)
        }

        // Apply rating filter
        if (filters.minRating !== undefined) {
            query = query.gte('rating', filters.minRating)
        }

        // Apply sorting
        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'price_low':
                    query = query.order('price', { ascending: true })
                    break
                case 'price_high':
                    query = query.order('price', { ascending: false })
                    break
                case 'rating':
                    query = query.order('rating', { ascending: false })
                    break
                case 'newest':
                    query = query.order('created_at', { ascending: false })
                    break
                default:
                    query = query.order('name', { ascending: true })
            }
        }

        // Apply limit if specified
        if (filters.limit) {
            query = query.limit(filters.limit)
        }

        const { data, error } = await query

        if (error) {
            console.error('Error fetching filtered products:', error)
            return []
        }

        return transformSupabaseProducts(data || [])
    } catch (error) {
        console.error('Error in getFilteredProducts:', error)
        return []
    }
}

// Get single product by ID
async function getProductById(productId) {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, returning null')
            return null
        }

        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single()

        if (error) {
            console.error('Error fetching product by ID:', error)
            return null
        }

        return transformSupabaseProduct(data)
    } catch (error) {
        console.error('Error in getProductById:', error)
        return null
    }
}

/**
 * Real-time subscriptions for live updates
 */

// Subscribe to product changes
function subscribeToProducts(callback) {
    if (!supabaseClient) {
        console.warn('Supabase client not initialized')
        return null
    }

    const subscription = supabaseClient
        .channel('products')
        .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'products' 
        }, (payload) => {
            console.log('Product change detected:', payload)
            if (callback) callback(payload)
        })
        .subscribe()

    return subscription
}

// Unsubscribe from real-time updates
function unsubscribeFromProducts(subscription) {
    if (subscription && supabaseClient) {
        supabaseClient.removeChannel(subscription)
    }
}

/**
 * Utility functions for data transformation
 */

// Transform Supabase product to match frontend expectations
function transformSupabaseProduct(product) {
    if (!product) return null

    return {
        ...product,
        // Convert price back to string format for compatibility
        price: product.price ? `₹${product.price}` : '₹0',
        originalPrice: product.original_price ? `₹${product.original_price}` : null,
        inStock: product.in_stock,
        image: product.image_url || 'https://via.placeholder.com/300x200?text=No+Image',
        // Keep size instead of converting to size for backward compatibility
        size: product.size
    }
}

// Transform multiple products
function transformSupabaseProducts(products) {
    if (!Array.isArray(products)) return []
    return products.map(transformSupabaseProduct)
}

/**
 * Cache management for better performance
 */
let productsCache = {
    data: null,
    timestamp: null,
    ttl: 5 * 60 * 1000 // 5 minutes cache
}

// Get products with caching
async function getCachedProducts() {
    const now = Date.now()
    
    // Return cached data if it's still fresh
    if (productsCache.data && productsCache.timestamp && (now - productsCache.timestamp) < productsCache.ttl) {
        return productsCache.data
    }
    
    // Fetch fresh data
    const products = await getAllProducts()
    
    // Update cache
    productsCache.data = products
    productsCache.timestamp = now
    
    return products
}

// Clear cache (useful when products are updated)
function clearProductsCache() {
    productsCache = {
        data: null,
        timestamp: null,
        ttl: 5 * 60 * 1000
    }
}

/**
 * Backward compatibility functions
 * These maintain the same API as products-data.js
 */

// For backward compatibility, make functions available globally
window.getAllProducts = getAllProducts
window.getProductsByCategory = getProductsByCategory
window.getAvailableCategories = getAvailableCategories
window.addOilCategory = addOilCategory
window.addPastaNoodlesVermicelliCategory = addPastaNoodlesVermicelliCategory
window.addBakeryCategory = addBakeryCategory
window.addSaltSugarCategory = addSaltSugarCategory
window.searchProducts = searchProducts
window.getFeaturedProducts = getFeaturedProducts
window.getFilteredProducts = getFilteredProducts
window.getProductById = getProductById
window.getCachedProducts = getCachedProducts
window.clearProductsCache = clearProductsCache

// Also make the client available globally if needed
window.supabaseClient = null

// Initialize products on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait a bit for Supabase to initialize
        setTimeout(async () => {
            window.supabaseClient = supabaseClient
            
            // Ensure oil category exists in database
            console.log('🛢️ Checking for oil category...')
            await getAvailableCategories() // This will automatically add oil if missing
            
            // Pre-load products for better performance
            console.log('🔄 Pre-loading products...')
            const products = await getCachedProducts()
            console.log(`✅ Loaded ${products.length} products from Supabase`)
            
            // Trigger a custom event to let other scripts know products are ready
            window.dispatchEvent(new CustomEvent('productsLoaded', { 
                detail: { products, count: products.length } 
            }))
            
        }, 500)
        
    } catch (error) {
        console.error('Error initializing products:', error)
    }
})

console.log('🚀 Supabase client script loaded')

// Manual function to add oil category (can be called from browser console)
window.manuallyAddOilCategory = async function() {
    console.log('🛢️ Manually adding oils category...')
    const success = await addOilCategory()
    if (success) {
        console.log('✅ Oils category added successfully!')
        // Refresh the page to see the changes
        window.location.reload()
    } else {
        console.error('❌ Failed to add oils category')
    }
}

// Manual function to add pasta-noodles-vermicelli category (can be called from browser console)
window.manuallyAddPastaNoodlesVermicelliCategory = async function() {
    console.log('🍝 Manually adding pasta-noodles-vermicelli category...')
    const success = await addPastaNoodlesVermicelliCategory()
    if (success) {
        console.log('✅ Pasta, Noodles & Vermicelli category added successfully!')
        // Refresh the page to see the changes
        window.location.reload()
    } else {
        console.error('❌ Failed to add pasta-noodles-vermicelli category')
    }
}

console.log('💡 To manually add oils category, run: manuallyAddOilCategory()')
console.log('💡 To manually add pasta-noodles-vermicelli category, run: manuallyAddPastaNoodlesVermicelliCategory()')
console.log('💡 To manually add bakery category, run: manuallyAddBakeryCategory()')
console.log('💡 To manually add salt-sugar category, run: manuallyAddSaltSugarCategory()')

// Manual function to add bakery category (can be called from browser console)
window.manuallyAddBakeryCategory = async function() {
    console.log('🥖 Manually adding bakery category...')
    const success = await addBakeryCategory()
    if (success) {
        console.log('✅ Bakery category added successfully!')
        // Refresh the page to see the changes
        window.location.reload()
    } else {
        console.error('❌ Failed to add bakery category')
    }
}

// Manual function to add salt-sugar category (can be called from browser console)
window.manuallyAddSaltSugarCategory = async function() {
    console.log('🧂 Manually adding salt-sugar category...')
    const success = await addSaltSugarCategory()
    if (success) {
        console.log('✅ Salt and Sugar category added successfully!')
        // Refresh the page to see the changes
        window.location.reload()
    } else {
        console.error('❌ Failed to add salt-sugar category')
    }
}

// Function to view all categories in database
window.viewAllCategories = async function() {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return
        }

        const { data, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('display_order', { ascending: true })

        if (error) {
            console.error('Error fetching categories:', error)
            return
        }

        console.log('📋 All categories in database:', data)
        return data
    } catch (error) {
        console.error('Error in viewAllCategories:', error)
    }
}

// Function to remove a category from database
window.removeCategory = async function(categoryName) {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        const { error } = await supabaseClient
            .from('categories')
            .delete()
            .eq('name', categoryName)

        if (error) {
            console.error('Error removing category:', error)
            return false
        }

        console.log(`✅ Category "${categoryName}" removed successfully`)
        return true
    } catch (error) {
        console.error('Error in removeCategory:', error)
        return false
    }
}

console.log('💡 To view all categories, run: viewAllCategories()')
console.log('💡 To remove a category, run: removeCategory("CategoryName")')

// Function to update category name in database
window.updateCategoryName = async function(oldName, newName) {
    try {
        if (!supabaseClient) {
            console.error('Supabase client not initialized')
            return false
        }

        const { error } = await supabaseClient
            .from('categories')
            .update({ name: newName })
            .eq('name', oldName)

        if (error) {
            console.error('Error updating category name:', error)
            return false
        }

        console.log(`✅ Category "${oldName}" updated to "${newName}" successfully`)
        return true
    } catch (error) {
        console.error('Error in updateCategoryName:', error)
        return false
    }
}

console.log('💡 To update category name, run: updateCategoryName("Old Name", "New Name")')

/**
 * Authentication Functions
 * Supabase Auth with Phone OTP Integration
 */

// Authentication state management
let currentAuthUser = null
let authSession = null

// Initialize authentication state
async function initializeAuth() {
    try {
        if (!supabaseClient) {
            console.warn('Supabase client not initialized, waiting...')
            // Wait for client to be ready
            for (let i = 0; i < 30; i++) {
                await new Promise(resolve => setTimeout(resolve, 100))
                if (supabaseClient) break
            }
            
            if (!supabaseClient) {
                console.error('❌ Supabase client failed to initialize for auth')
                return false
            }
        }

        // Get current session
        const { data: { session }, error } = await supabaseClient.auth.getSession()
        
        if (error) {
            console.error('Error getting session:', error)
            return false
        }

        if (session) {
            authSession = session
            currentAuthUser = session.user
            console.log('✅ User session restored:', currentAuthUser.phone)
            
            // Update UI with logged in user
            updateAuthUI(currentAuthUser)
            
            // Trigger user login event
            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user: currentAuthUser, session: authSession } 
            }))
        } else {
            console.log('📝 No active session found')
        }

        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            console.log('🔄 Auth state changed:', event)
            
            authSession = session
            currentAuthUser = session?.user || null
            
            if (event === 'SIGNED_IN') {
                console.log('✅ User signed in:', currentAuthUser.phone)
                updateAuthUI(currentAuthUser)
                
                // Trigger user login event
                window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                    detail: { user: currentAuthUser, session: authSession } 
                }))
            } else if (event === 'SIGNED_OUT') {
                console.log('👋 User signed out')
                updateAuthUI(null)
                
                // Trigger user logout event
                window.dispatchEvent(new CustomEvent('userLoggedOut'))
            }
        })

        return true
    } catch (error) {
        console.error('Error initializing auth:', error)
        return false
    }
}

// Send OTP to phone number
async function sendPhoneOTP(phoneNumber, userName = '') {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        // Format phone number to E.164 format (+91xxxxxxxxxx)
        const formattedPhone = formatPhoneNumber(phoneNumber)
        
        console.log('📱 Sending OTP to:', formattedPhone)

        const { data, error } = await supabaseClient.auth.signInWithOtp({
            phone: formattedPhone,
            options: {
                // You can add custom data here if needed
                data: {
                    name: userName || 'User'
                }
            }
        })

        if (error) {
            console.error('❌ Error sending OTP:', error)
            throw error
        }

        console.log('✅ OTP sent successfully')
        return { success: true, data }
    } catch (error) {
        console.error('Error in sendPhoneOTP:', error)
        throw error
    }
}

// Verify OTP
async function verifyPhoneOTP(phoneNumber, otpCode, userName = '') {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        const formattedPhone = formatPhoneNumber(phoneNumber)
        
        console.log('🔐 Verifying OTP for:', formattedPhone)

        const { data, error } = await supabaseClient.auth.verifyOtp({
            phone: formattedPhone,
            token: otpCode,
            type: 'sms'
        })

        if (error) {
            console.error('❌ Error verifying OTP:', error)
            throw error
        }

        console.log('✅ OTP verified successfully')
        
        // Set auth state immediately after successful verification
        authSession = data.session
        currentAuthUser = data.user

        // Update user profile with name if provided - with a small delay to ensure session is established
        if (userName && data.user && data.session) {
            try {
                console.log('📝 Updating user profile with name:', userName)
                
                // Small delay to ensure session is fully established
                await new Promise(resolve => setTimeout(resolve, 100))
                
                await updateUserProfile({ name: userName })
                console.log('✅ User profile updated successfully')
            } catch (profileError) {
                console.warn('⚠️ Profile update failed, but authentication succeeded:', profileError)
                // Don't throw here - authentication was successful
            }
        }

        return { success: true, user: data.user, session: data.session }
    } catch (error) {
        console.error('Error in verifyPhoneOTP:', error)
        throw error
    }
}

// Update user profile
async function updateUserProfile(updates) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        // Check if we have a current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        if (sessionError) {
            console.error('❌ Error getting session:', sessionError)
            throw new Error('Session error: ' + sessionError.message)
        }

        if (!session || !session.user) {
            throw new Error('User not authenticated - no valid session')
        }

        console.log('📝 Updating profile for user:', session.user.id)

        const { data, error } = await supabaseClient.auth.updateUser({
            data: updates
        })

        if (error) {
            console.error('❌ Error updating profile:', error)
            throw error
        }

        console.log('✅ Profile updated successfully')
        
        // Update our local auth state
        currentAuthUser = data.user
        
        return { success: true, user: data.user }
    } catch (error) {
        console.error('Error in updateUserProfile:', error)
        throw error
    }
}

// Sign out user
async function signOut() {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        const { error } = await supabaseClient.auth.signOut()

        if (error) {
            console.error('❌ Error signing out:', error)
            throw error
        }

        console.log('✅ Signed out successfully')
        
        authSession = null
        currentAuthUser = null

        return { success: true }
    } catch (error) {
        console.error('Error in signOut:', error)
        throw error
    }
}

// Get current authenticated user
function getCurrentUser() {
    return currentAuthUser
}

// Get current session
function getCurrentSession() {
    return authSession
}

// Check if user is authenticated
function isAuthenticated() {
    return !!currentAuthUser && !!authSession
}

// Format phone number to E.164 format
function formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '')
    
    // If it's a 10-digit Indian number, add +91
    if (cleanNumber.length === 10) {
        return `+91${cleanNumber}`
    }
    
    // If it already has country code but no +, add +
    if (cleanNumber.length === 12 && cleanNumber.startsWith('91')) {
        return `+${cleanNumber}`
    }
    
    // If it already has +, return as is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber
    }
    
    // Default case - assume it's Indian number
    return `+91${cleanNumber}`
}

// Update authentication UI
function updateAuthUI(user) {
    try {
        // Update the existing currentUser variable for backward compatibility
        if (typeof window !== 'undefined') {
            if (user) {
                // Try to get name from various possible sources
                const userName = user.user_metadata?.name || 
                               user.user_metadata?.full_name || 
                               user.user_metadata?.display_name ||
                               (typeof window !== 'undefined' && window.userDetails?.name) ||
                               user.email?.split('@')[0] ||
                               'User'
                
                window.currentUser = {
                    id: user.id,
                    name: userName,
                    mobile: user.phone?.replace('+91', '') || '',
                    fullMobile: user.phone || '',
                    loginTime: new Date().toISOString(),
                    isVerified: !!user.phone_confirmed_at,
                    supabaseUser: user
                }
                
                console.log('🔄 Updated currentUser with name:', userName)
                
                // Store in localStorage for backward compatibility
                localStorage.setItem("nearNowCurrentUser", JSON.stringify(window.currentUser))
                
                // Update UI elements
                if (window.updateUserDisplay) {
                    window.updateUserDisplay()
                }
            } else {
                window.currentUser = null
                localStorage.removeItem("nearNowCurrentUser")
                
                // Update UI elements
                if (window.updateUserDisplay) {
                    window.updateUserDisplay()
                }
            }
        }
    } catch (error) {
        console.error('Error updating auth UI:', error)
    }
}

// Resend OTP (same as sendPhoneOTP but with different logging)
async function resendPhoneOTP(phoneNumber, userName = '') {
    console.log('🔄 Resending OTP...')
    return await sendPhoneOTP(phoneNumber, userName)
}

/**
 * Export authentication functions globally
 */
window.supabaseAuth = {
    initializeAuth,
    sendPhoneOTP,
    verifyPhoneOTP,
    resendPhoneOTP,
    updateUserProfile,
    signOut,
    getCurrentUser,
    getCurrentSession,
    isAuthenticated,
    formatPhoneNumber
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Wait a bit for supabase client to initialize
    setTimeout(async () => {
        try {
            await initializeAuth()
            console.log('🔐 Supabase authentication initialized')
        } catch (error) {
            console.error('Failed to initialize Supabase auth:', error)
        }
    }, 1000)
})

console.log('🔐 Supabase authentication module loaded')

/**
 * Order Management Functions
 * Handle order creation, retrieval, and status updates
 */

// Create a new order
async function createOrder(orderData) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        // Get current user
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        if (sessionError) {
            throw new Error('Session error: ' + sessionError.message)
        }

        if (!session || !session.user) {
            throw new Error('User must be authenticated to create orders')
        }

        console.log('📝 Creating new order for user:', session.user.id)

        // Calculate totals
        const subtotal = orderData.totals.subtotal || 0
        const deliveryFee = orderData.totals.deliveryFee || 50
        const handlingCharge = orderData.totals.handlingCharge || 20
        const gstAmount = orderData.totals.gst || 0
        const totalAmount = orderData.totals.total || 0

        // Prepare order data for database
        const dbOrderData = {
            user_id: session.user.id,
            customer_name: `${orderData.firstName} ${orderData.lastName}`,
            customer_email: orderData.email,
            customer_phone: orderData.phone,
            
            // Store delivery address as JSON
            shipping_address: {
                streetAddress: orderData.streetAddress,
                aptSuite: orderData.aptSuite || '',
                landmark: orderData.landmark || '',
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode
            },
            
            // Store billing address if different
            billing_address: orderData.useAsBilling ? null : {
                streetAddress: orderData.streetAddress,
                aptSuite: orderData.aptSuite || '',
                landmark: orderData.landmark || '',
                city: orderData.city,
                state: orderData.state,
                zipCode: orderData.zipCode
            },
            
            // Store cart items as JSON
            items: orderData.items,
            
            // Financial details
            subtotal: subtotal,
            delivery_fee: deliveryFee,
            handling_charge: handlingCharge,
            gst_amount: gstAmount,
            order_total: totalAmount,
            
            // Order details
            order_status: 'placed',
            payment_method: orderData.paymentMethod || 'cod',
            payment_status: 'pending',
            order_notes: orderData.specialInstructions || '',
            is_gift: orderData.isGift || false,
            source: orderData.source || 'Near & Now Checkout',
            
            // Estimated delivery (30-60 minutes from now)
            estimated_delivery_time: new Date(Date.now() + 45 * 60 * 1000).toISOString()
        }

        // Insert order into database
        const { data, error } = await supabaseClient
            .from('orders')
            .insert(dbOrderData)
            .select()
            .single()

        if (error) {
            console.error('❌ Error creating order:', error)
            throw new Error(`Order creation failed: ${error.message}`)
        }

        console.log('✅ Order created successfully:', data.order_number)

        // Create initial status history entry
        await createOrderStatusHistory(data.id, 'placed', 'Order placed successfully')

        return {
            success: true,
            order: data,
            orderNumber: data.order_number
        }
    } catch (error) {
        console.error('❌ Error in createOrder:', error)
        throw error
    }
}

// Get orders for current user
async function getUserOrders(limit = 10) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession()
        
        if (sessionError || !session?.user) {
            console.warn('User not authenticated, returning empty orders')
            return []
        }

        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('❌ Error fetching orders:', error)
            throw error
        }

        console.log(`✅ Fetched ${data?.length || 0} orders for user`)
        return data || []
    } catch (error) {
        console.error('❌ Error in getUserOrders:', error)
        return []
    }
}

// Get single order by ID
async function getOrderById(orderId) {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        const { data, error } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (error) {
            console.error('❌ Error fetching order:', error)
            throw error
        }

        return data
    } catch (error) {
        console.error('❌ Error in getOrderById:', error)
        return null
    }
}

// Update order status
async function updateOrderStatus(orderId, newStatus, notes = '') {
    try {
        if (!supabaseClient) {
            throw new Error('Supabase client not initialized')
        }

        // Update order status
        const { data, error } = await supabaseClient
            .from('orders')
            .update({ 
                order_status: newStatus,
                ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
            })
            .eq('id', orderId)
            .select()
            .single()

        if (error) {
            console.error('❌ Error updating order status:', error)
            throw error
        }

        // Create status history entry
        await createOrderStatusHistory(orderId, newStatus, notes)

        console.log(`✅ Order ${orderId} status updated to: ${newStatus}`)
        return data
    } catch (error) {
        console.error('❌ Error in updateOrderStatus:', error)
        throw error
    }
}

// Create order status history entry
async function createOrderStatusHistory(orderId, status, notes = '') {
    try {
        if (!supabaseClient) {
            return false
        }

        const { data: { session } } = await supabaseClient.auth.getSession()

        const { error } = await supabaseClient
            .from('order_status_history')
            .insert({
                order_id: orderId,
                status: status,
                notes: notes,
                updated_by: session?.user?.id || null
            })

        if (error) {
            console.error('❌ Error creating status history:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('❌ Error in createOrderStatusHistory:', error)
        return false
    }
}

// Get order status history
async function getOrderStatusHistory(orderId) {
    try {
        if (!supabaseClient) {
            return []
        }

        const { data, error } = await supabaseClient
            .from('order_status_history')
            .select('*')
            .eq('order_id', orderId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('❌ Error fetching order status history:', error)
            return []
        }

        return data || []
    } catch (error) {
        console.error('❌ Error in getOrderStatusHistory:', error)
        return []
    }
}

// Export order functions globally
window.orderManager = {
    createOrder,
    getUserOrders,
    getOrderById,
    updateOrderStatus,
    getOrderStatusHistory
}

console.log('📦 Order management functions loaded')