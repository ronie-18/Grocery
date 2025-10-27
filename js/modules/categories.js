/**
 * Categories Module
 * Handles category display and filtering
 */

import { categories, allProducts, setCategories } from './globals.js';
import { filterByCategory } from './products.js';
import { formatCategoryName } from './utils.js';

/**
 * Load categories from Supabase
 */
async function loadCategoriesFromSupabase() {
    try {
        console.log('📦 Loading categories from Supabase...');
        
        if (!window.supabaseClient) {
            console.warn('⚠️ Supabase client not available');
            return [];
        }
        
        const { data: categoriesData, error } = await window.supabaseClient
            .from('categories')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('❌ Error loading categories:', error);
            return [];
        }
        
        console.log(`✅ Loaded ${categoriesData?.length || 0} categories from Supabase`);
        
        // Transform Supabase categories to match frontend format
        const transformedCategories = (categoriesData || []).map(cat => ({
            id: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
            name: cat.name,
            description: cat.description || 'Fresh & Quality',
            image: cat.image || cat.image_url || `https://via.placeholder.com/300x200?text=${cat.name}`,
            color: convertColorToGradient(cat.color || '#3b82f6')
        }));
        
        setCategories(transformedCategories);
        return transformedCategories;
        
    } catch (error) {
        console.error('❌ Error in loadCategoriesFromSupabase:', error);
        return [];
    }
}

/**
 * Convert hex color to Tailwind gradient class
 */
function convertColorToGradient(hexColor) {
    // Map common colors to Tailwind gradients
    const colorMap = {
        '#3b82f6': 'from-blue-100 to-blue-200',
        '#10b981': 'from-green-100 to-green-200',
        '#f59e0b': 'from-yellow-100 to-yellow-200',
        '#ef4444': 'from-red-100 to-red-200',
        '#8b5cf6': 'from-purple-100 to-purple-200',
        '#ec4899': 'from-pink-100 to-pink-200',
        '#6366f1': 'from-indigo-100 to-indigo-200',
    };
    
    return colorMap[hexColor] || 'from-gray-100 to-gray-200';
}

/**
 * Initialize categories
 */
export async function initializeCategories() {
    // Load categories from Supabase first
    await loadCategoriesFromSupabase();
    
    // Then render them
    renderCategories();
    populateHeaderCategoryDropdown();
}

/**
 * Render categories grid
 */
function renderCategories() {
    const categoriesGrid = document.getElementById("categoriesGrid");
    if (!categoriesGrid) {
        console.warn('Categories grid not found');
        return;
    }

    categoriesGrid.innerHTML = categories.map((category) => `
        <div class="category-item cursor-pointer transition-all duration-300 transform hover:scale-105"
             onclick="window.categoriesModule.filterByCategory('${category.id}')">
            <div class="bg-gradient-to-br ${category.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl h-full flex flex-col items-center justify-center text-center group">
                <div class="relative mb-4 w-20 h-20 rounded-full overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img src="${category.image}" 
                         alt="${category.name}"
                         class="w-full h-full object-cover"
                         onerror="this.src='https://via.placeholder.com/80?text=${category.name.charAt(0)}'">
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-1">${category.name}</h3>
                <p class="text-sm text-gray-600">${category.description}</p>
            </div>
        </div>
    `).join('');

    console.log(`✅ Rendered ${categories.length} categories`);
}

/**
 * Populate header category dropdown
 */
export function populateHeaderCategoryDropdown() {
    const dropdown = document.getElementById("mobileCategoriesDropdown");
    if (!dropdown) {
        console.warn('Mobile categories dropdown not found');
        return;
    }

    // Get unique categories from products (if loaded) or use predefined categories
    let categoriesToShow = categories;
    
    if (allProducts && allProducts.length > 0) {
        // Get unique categories from actual products
        const productCategories = [...new Set(allProducts.map(p => p.category))];
        console.log('📋 Product categories found:', productCategories);
        
        // Match with predefined categories or add new ones
        categoriesToShow = categories.filter(cat => 
            productCategories.some(pc => pc.toLowerCase() === cat.id.toLowerCase())
        );
    }

    dropdown.innerHTML = categoriesToShow.map((category) => `
        <a href="#"
           class="block py-2 px-4 text-sm text-gray-600 hover:text-primary transition duration-300 category-filter"
           data-category="${category.id}">
            ${category.name}
        </a>
    `).join('');

    // Add event listeners to category filters
    document.querySelectorAll('.category-filter').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = link.dataset.category;
            filterByCategory(category);
            
            // Close mobile nav if open
            if (window.closeMobileNavigation) {
                window.closeMobileNavigation();
            }
        });
    });

    console.log(`✅ Populated dropdown with ${categoriesToShow.length} categories`);
}

/**
 * Refresh categories from Supabase
 */
export async function refreshCategories() {
    console.log('🔄 Refreshing categories...');
    await loadCategoriesFromSupabase();
    renderCategories();
    populateHeaderCategoryDropdown();
}

// Export for global access
export const categoriesModule = {
    filterByCategory,
    refreshCategories
};

