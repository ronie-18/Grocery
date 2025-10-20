/**
 * Products Module
 * Handles product display, filtering, sorting, and infinite scroll
 */

import { 
    allProducts, displayedProducts, currentCategory, currentSort, 
    productsPerPage, currentPage, isPageInitializing, cartItems,
    setAllProducts, setDisplayedProducts, setCurrentCategory, 
    setCurrentSort, setCurrentPage
} from './globals.js';
import { generateStarRating } from './utils.js';
import { showNotification } from './ui.js';

/**
 * Initialize products display
 */
export function initializeProducts() {
    // Add sort event listener
    const sortSelect = document.getElementById("sortProducts");
    if (sortSelect) {
        sortSelect.addEventListener("change", sortProducts);
    }

    // Initial render
    renderProducts();
    
    // Initialize infinite scroll
    initializeInfiniteScroll();
}

/**
 * Render products to the grid
 */
export function renderProducts() {
    const productsGrid = document.getElementById("productsGrid");
    if (!productsGrid) {
        console.error('Products grid not found');
        return;
    }

    // Show loading state if no products yet
    if (displayedProducts.length === 0) {
        productsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-gray-600">Loading products...</p>
            </div>
        `;
        return;
    }

    // Calculate pagination
    const startIndex = 0;
    const endIndex = Math.min(currentPage * productsPerPage, displayedProducts.length);
    const productsToShow = displayedProducts.slice(startIndex, endIndex);

    // Render products
    productsGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');

    // Add event listeners
    addProductEventListeners();

    // Handle infinite scroll indicators
    handleInfiniteScrollIndicators(endIndex);
    
    console.log(`📦 Rendered ${productsToShow.length} of ${displayedProducts.length} products`);
}

/**
 * Create product card HTML
 */
function createProductCard(product) {
    const price = typeof product.price === 'string' ? product.price : `₹${product.price}`;
    const originalPrice = product.originalPrice || product.original_price;
    const discount = product.discount;
    const rating = product.rating || 4.5;
    const reviews = product.reviews || Math.floor(Math.random() * 500) + 50;
    const inStock = product.inStock !== false && product.in_stock !== false;
    
    // Check if product is in cart
    const cartItem = cartItems.find(item => item.id === product.id && !item.isLoose);
    const quantity = cartItem ? cartItem.quantity : 0;

    return `
        <div class="product-card bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 fade-in group"
             data-product-id="${product.id}">
            ${discount ? `
                <div class="absolute top-3 left-3 z-10">
                    <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                        ${discount}% OFF
                    </span>
                </div>
            ` : ''}
            
            <div class="relative overflow-hidden bg-gray-50">
                <img src="${product.image || product.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}" 
                     alt="${product.name}"
                     class="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-300"
                     onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
                ${!inStock ? `
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span class="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">Out of Stock</span>
                    </div>
                ` : ''}
            </div>

            <div class="p-5">
                <div class="mb-2">
                    <span class="text-xs font-semibold text-primary bg-primary bg-opacity-10 px-2 py-1 rounded">
                        ${product.category}
                    </span>
                </div>
                
                <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
                    ${product.name}
                </h3>
                
                ${product.size ? `
                    <p class="text-sm text-gray-600 mb-2">
                        <i class="fas fa-weight-hanging mr-1"></i>${product.size}
                    </p>
                ` : ''}

                <div class="flex items-center mb-3">
                    <div class="flex text-yellow-400 text-sm mr-2">
                        ${generateStarRating(rating)}
                    </div>
                    <span class="text-sm text-gray-600">${rating.toFixed(1)} (${reviews})</span>
                </div>

                <div class="flex items-center justify-between mb-4">
                    <div>
                        <span class="text-2xl font-bold text-primary">${price}</span>
                        ${originalPrice ? `
                            <span class="text-sm text-gray-400 line-through ml-2">${originalPrice}</span>
                        ` : ''}
                    </div>
                </div>

                ${inStock ? `
                    <button class="add-to-cart-btn w-full bg-gradient-to-r from-primary to-secondary text-white py-3 rounded-lg font-bold hover:from-secondary hover:to-primary transform hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg ${quantity > 0 ? 'hidden' : ''}"
                            data-product-id="${product.id}">
                        <i class="fa-solid fa-cart-shopping mr-2"></i>Add to Cart
                    </button>
                    
                    <div class="quantity-controls bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-between shadow-md ${quantity > 0 ? '' : 'hidden'}"
                         data-product-id="${product.id}">
                        <button class="decrease-quantity-btn w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity-display text-lg font-bold px-4">${quantity}</span>
                        <button class="increase-quantity-btn w-8 h-8 bg-white text-primary rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                ` : `
                    <button class="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-bold cursor-not-allowed" disabled>
                        Out of Stock
                    </button>
                `}
            </div>
        </div>
    `;
}

/**
 * Add event listeners to product cards
 */
function addProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productId = btn.dataset.productId;
            // Use window.addToCart which is exported by main.js
            if (window.addToCart) {
                window.addToCart(productId);
            }
        });
    });

    // Quantity control buttons
    document.querySelectorAll('.decrease-quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = btn.closest('[data-product-id]').dataset.productId;
            if (window.cartModule) {
                window.cartModule.decreaseCartQuantity(productId);
            }
        });
    });

    document.querySelectorAll('.increase-quantity-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = btn.closest('[data-product-id]').dataset.productId;
            const cartItem = cartItems.find(item => item.id === productId);
            if (cartItem && window.cartModule) {
                window.cartModule.updateCartQuantity(productId, parseInt(cartItem.quantity) + 1);
            }
        });
    });
}

/**
 * Sort products
 */
function sortProducts() {
    const sortSelect = document.getElementById("sortProducts");
    if (!sortSelect) return;

    const sortValue = sortSelect.value;
    setCurrentSort(sortValue);

    let sorted = [...displayedProducts];

    switch (sortValue) {
        case "price-low":
            sorted.sort((a, b) => {
                const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace('₹', '')) : a.price;
                const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace('₹', '')) : b.price;
                return priceA - priceB;
            });
            break;
        case "price-high":
            sorted.sort((a, b) => {
                const priceA = typeof a.price === 'string' ? parseFloat(a.price.replace('₹', '')) : a.price;
                const priceB = typeof b.price === 'string' ? parseFloat(b.price.replace('₹', '')) : b.price;
                return priceB - priceA;
            });
            break;
        case "name":
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "rating":
            sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
        default:
            // default sorting
            break;
    }

    setDisplayedProducts(sorted);
    setCurrentPage(1);
    renderProducts();

    showNotification("Products sorted successfully", "success");
}

/**
 * Filter products by category
 */
export function filterByCategory(category) {
    console.log(`🔍 Filtering by category: ${category}`);
    
    setCurrentCategory(category);
    setCurrentPage(1);

    if (category === "all") {
        setDisplayedProducts([...allProducts]);
    } else {
        const filtered = allProducts.filter((product) => {
            const productCategory = (product.category || '').toLowerCase();
            const searchCategory = category.toLowerCase();
            return productCategory === searchCategory;
        });
        setDisplayedProducts(filtered);
    }

    renderProducts();

    // Scroll to products section (only after page initialization)
    if (!isPageInitializing) {
        const productsSection = document.getElementById("productsSection");
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
        }
    }

    showNotification(`Showing ${displayedProducts.length} products`, "info");
}

/**
 * Initialize infinite scroll
 */
function initializeInfiniteScroll() {
    const infiniteScrollTrigger = document.getElementById("infiniteScrollTrigger");
    
    if (!infiniteScrollTrigger) {
        console.warn('Infinite scroll trigger not found');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isPageInitializing) {
                loadMoreProducts();
            }
        });
    }, {
        rootMargin: '100px'
    });

    observer.observe(infiniteScrollTrigger);
}

/**
 * Load more products (infinite scroll)
 */
function loadMoreProducts() {
    const maxPage = Math.ceil(displayedProducts.length / productsPerPage);
    
    if (currentPage < maxPage) {
        setCurrentPage(currentPage + 1);
        renderProducts();
        console.log(`📄 Loaded page ${currentPage} of ${maxPage}`);
    }
}

/**
 * Handle infinite scroll indicators
 */
function handleInfiniteScrollIndicators(endIndex) {
    const infiniteScrollTrigger = document.getElementById("infiniteScrollTrigger");
    const endOfProductsIndicator = document.getElementById("endOfProductsIndicator");

    if (!infiniteScrollTrigger || !endOfProductsIndicator) return;

    if (endIndex >= displayedProducts.length) {
        // All products loaded
        infiniteScrollTrigger.classList.add("hidden");
        endOfProductsIndicator.classList.remove("hidden");
    } else {
        // More products to load
        infiniteScrollTrigger.classList.remove("hidden");
        endOfProductsIndicator.classList.add("hidden");
    }
}

// Export for global access
export const productsModule = {
    filterByCategory,
    renderProducts
};

