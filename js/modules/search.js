/**
 * Search Functionality Module
 * Handles product search and suggestions
 */

import { allProducts, searchSuggestions, setSearchSuggestions } from './globals.js';

/**
 * Initialize search functionality
 */
export function initializeSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const searchSuggestionsEl = document.getElementById("searchSuggestions");

    if (!searchInput || !searchBtn) {
        console.warn('Search elements not found');
        return;
    }

    // Handle search button click - always redirect to search page
    searchBtn.addEventListener("click", performURLSearch);
    
    // Handle enter key press - redirect to search page
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            performURLSearch(e);
        }
    });

    // Show suggestions as user types
    searchInput.addEventListener("input", function () {
        const query = this.value.trim();
        if (query.length > 1) {
            showSearchSuggestions(query);
        } else {
            hideSearchSuggestions();
        }
    });

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && searchSuggestionsEl && !searchSuggestionsEl.contains(e.target)) {
            hideSearchSuggestions();
        }
    });
}

/**
 * Show search suggestions
 */
function showSearchSuggestions(query) {
    console.log(`🔍 SUGGESTIONS: Searching for "${query}" in ${allProducts.length} products`);
    
    if (allProducts.length === 0) {
        console.log('⚠️ No products loaded from Supabase yet');
        hideSearchSuggestions();
        return;
    }
    
    // Enhanced search: match name, category, description, brand
    const suggestions = allProducts
        .filter((product) => {
            const searchTerm = query.toLowerCase();
            const productName = (product.name || '').toLowerCase();
            const productCategory = (product.category || '').toLowerCase();
            const productDescription = (product.description || '').toLowerCase();
            const productBrand = (product.brand || '').toLowerCase();
            
            return productName.includes(searchTerm) ||
                   productCategory.includes(searchTerm) ||
                   productDescription.includes(searchTerm) ||
                   productBrand.includes(searchTerm);
        })
        .slice(0, 5);

    console.log(`✅ Found ${suggestions.length} matching products`);

    const searchSuggestionsEl = document.getElementById("searchSuggestions");
    if (!searchSuggestionsEl) return;

    if (suggestions.length === 0) {
        searchSuggestionsEl.innerHTML = `
            <div class="p-4 text-center text-gray-500">
                <i class="fas fa-search mb-2 text-2xl"></i>
                <p>No products found for "${query}"</p>
                <p class="text-sm mt-1">Try different keywords</p>
            </div>
        `;
        searchSuggestionsEl.classList.remove("hidden");
        return;
    }

    let suggestionsHTML = suggestions.map((product) => {
        const price = typeof product.price === 'string' ? product.price : `₹${product.price}`;
        return `
            <div class="suggestion-item p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex items-center gap-3"
                 onclick="window.searchModule.selectSearchSuggestion('${product.name.replace(/'/g, "\\'")}')">
                <img src="${product.image || product.image_url || 'https://via.placeholder.com/40'}" 
                     alt="${product.name}" 
                     class="w-10 h-10 object-cover rounded"
                     onerror="this.src='https://via.placeholder.com/40'">
                <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-800 truncate">${product.name}</div>
                    <div class="text-sm text-gray-600">${product.category}</div>
                </div>
                <div class="text-primary font-semibold">${price}</div>
            </div>
        `;
    }).join('');

    searchSuggestionsEl.innerHTML = suggestionsHTML;
    searchSuggestionsEl.classList.remove("hidden");
    
    setSearchSuggestions(suggestions);
}

/**
 * Hide search suggestions
 */
function hideSearchSuggestions() {
    const searchSuggestionsEl = document.getElementById("searchSuggestions");
    if (searchSuggestionsEl) {
        searchSuggestionsEl.classList.add("hidden");
        searchSuggestionsEl.innerHTML = '';
    }
    setSearchSuggestions([]);
}

/**
 * Select search suggestion
 */
function selectSearchSuggestion(productName) {
    console.log('Selected suggestion:', productName);
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.value = productName;
    }
    hideSearchSuggestions();
    // Redirect to search page with the product name
    window.location.href = `search.html?q=${encodeURIComponent(productName)}`;
}

/**
 * Perform URL-based search
 */
function performURLSearch(event) {
    if (event) event.preventDefault();
    
    const searchInput = document.getElementById("searchInput");
    const query = searchInput?.value.trim();
    
    if (!query) {
        console.log('⚠️ Empty search query');
        return;
    }
    
    console.log(`🔍 SEARCH: Redirecting to search.html with query: "${query}"`);
    
    // Hide suggestions
    hideSearchSuggestions();
    
    // Redirect to search.html with query parameter
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// Export search operations for global access
export const searchModule = {
    selectSearchSuggestion,
    performURLSearch: performURLSearch
};

