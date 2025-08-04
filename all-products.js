// --- Product Data ---
// Products are loaded from Supabase

let allProducts = [];
let displayedProducts = [];
let currentCategory = 'all';
let currentSort = 'default';
let currentPage = 1;
const productsPerPage = 12;

// New Global Variables for Enhanced Features
let currentFilters = {
    priceRange: { min: 0, max: 1000 },
    categories: [],
    ratings: [],
    availability: [],
    brands: [],
    searchTerm: ''
};
let searchSuggestions = [];
let quickViewProduct = null;
let mobileNavOpen = false;
let availableBrands = [];
let maxPrice = 1000;

// Authentication Variables
let currentStep = 1;
let userDetails = {};
let otpTimer = null;
let resendTimer = 30;
let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
// Cart items will be managed by CartManager
let cartItems = [];
let cartCount = 0;

// --- DOM Elements ---
const productsGrid = document.getElementById('productsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const sortProducts = document.getElementById('sortProducts');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const footerCategories = document.getElementById('footerCategories');

// --- Render Functions ---
function renderCategoryOptions() {
    const categories = getAvailableCategories();
    categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
}

function renderFooterCategories() {
    const categories = getAvailableCategories();
    footerCategories.innerHTML = categories.map(cat => `<li><a href="#" class="text-gray-400 hover:text-white transition duration-300">${cat.charAt(0).toUpperCase() + cat.slice(1)}</a></li>`).join('');
}

function renderProducts() {
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    const productsToShow = displayedProducts.slice(startIndex, endIndex);
    productsGrid.innerHTML = productsToShow.map(createProductCard).join('');
    loadMoreBtn.style.display = endIndex >= displayedProducts.length ? 'none' : 'block';


}

function createProductCard(product) {
    // Remove any leading ₹ from price and originalPrice
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;
    return `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-3 left-3"><span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">-${product.discount}%</span></div>` : ''}
                <div class="absolute top-3 right-3 flex flex-col space-y-2">
                    <button class="quick-view-btn bg-white bg-opacity-90 hover:bg-opacity-100 p-1.5 rounded-full shadow-md transition duration-300 transform scale-0 group-hover:scale-100" title="Quick View">
                        <i class="fas fa-eye text-gray-600 hover:text-primary text-sm"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-1.5">
                    <div class="flex text-yellow-400 text-xs">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-xs">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-base mb-1 cursor-pointer hover:text-primary transition duration-300 product-name line-clamp-2">${product.name}</h3>
                ${product.size ? `<p class="text-xs text-gray-500 mb-2 flex items-center"><i class="fas fa-weight-hanging mr-1"></i>${product.size}</p>` : ''}
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-1.5">
                        <span class="text-primary font-bold text-base">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-xs">₹${originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn-mobile bg-primary text-white px-3 py-1.5 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-1">
                        <i class="fas fa-plus text-xs"></i>
                        <span class="text-sm">Add</span>
                        </button>
                    </div>
                ${product.inStock ? '<div><span class="text-green-600 text-xs font-semibold"><i class="fas fa-check-circle mr-1"></i>In Stock</span></div>' : '<div><span class="text-red-600 text-xs font-semibold"><i class="fas fa-times-circle mr-1"></i>Out of Stock</span></div>'}
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// --- Enhanced Filter System ---
function initializeEnhancedFilters() {
    // Calculate max price from all products
    maxPrice = Math.ceil(Math.max(...allProducts.map(p => parseFloat((typeof p.price === 'string' ? p.price.replace(/^₹/, '') : p.price)))));

    // Set price range sliders
    document.getElementById('priceRangeMin').max = maxPrice;
    document.getElementById('priceRangeMax').max = maxPrice;
    document.getElementById('priceRangeMax').value = maxPrice;
    document.getElementById('maxPriceDisplay').textContent = maxPrice;
    document.getElementById('maxPriceInput').placeholder = maxPrice;
    currentFilters.priceRange.max = maxPrice;

    // Get available brands
    availableBrands = [...new Set(allProducts.map(p => p.brand || 'Unknown').filter(Boolean))].sort();

    // Populate filter sections
    populateCategoryFilters();
    populateBrandFilters();

    // Initialize event listeners
    initializeFilterEventListeners();

    // Initialize mobile filter functionality
    initializeMobileFilters();
}

function populateCategoryFilters() {
    const categories = getAvailableCategories();
    const container = document.getElementById('categoryFilterContainer');

    container.innerHTML = categories.map(category => `
        <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" value="${category}" class="category-filter rounded border-gray-300 text-primary focus:ring-primary">
            <i class="fas fa-tag text-primary"></i>
            <span class="text-sm text-gray-600 group-hover:text-gray-800 capitalize">${category}</span>
            <span class="text-xs text-gray-400 ml-auto">${allProducts.filter(p => p.category === category).length}</span>
        </label>
    `).join('');
}

function populateBrandFilters() {
    const container = document.getElementById('brandFilterContainer');

    container.innerHTML = availableBrands.map(brand => `
        <label class="flex items-center space-x-3 cursor-pointer group">
            <input type="checkbox" value="${brand}" class="brand-filter rounded border-gray-300 text-primary focus:ring-primary">
            <i class="fas fa-certificate text-primary"></i>
            <span class="text-sm text-gray-600 group-hover:text-gray-800">${brand}</span>
            <span class="text-xs text-gray-400 ml-auto">${allProducts.filter(p => (p.brand || 'Unknown') === brand).length}</span>
        </label>
    `).join('');
}

function initializeFilterEventListeners() {
    // Price Range Sliders
    const minSlider = document.getElementById('priceRangeMin');
    const maxSlider = document.getElementById('priceRangeMax');
    const minInput = document.getElementById('minPriceInput');
    const maxInput = document.getElementById('maxPriceInput');
    const minDisplay = document.getElementById('minPriceDisplay');
    const maxDisplay = document.getElementById('maxPriceDisplay');

    function updatePriceRange() {
        let minVal = parseInt(minSlider.value);
        let maxVal = parseInt(maxSlider.value);

        if (minVal >= maxVal) {
            minVal = maxVal - 1;
            minSlider.value = minVal;
        }

        minDisplay.textContent = minVal;
        maxDisplay.textContent = maxVal;
        minInput.value = minVal;
        maxInput.value = maxVal;

        currentFilters.priceRange = { min: minVal, max: maxVal };
    }

    minSlider.addEventListener('input', updatePriceRange);
    maxSlider.addEventListener('input', updatePriceRange);

    minInput.addEventListener('change', function() {
        const val = parseInt(this.value) || 0;
        minSlider.value = Math.min(val, maxPrice - 1);
        updatePriceRange();
    });

    maxInput.addEventListener('change', function() {
        const val = parseInt(this.value) || maxPrice;
        maxSlider.value = Math.max(val, 1);
        updatePriceRange();
    });

    // Category Filters
    document.addEventListener('change', function(e) {
        if (e.target.classList.contains('category-filter')) {
            updateCategoryFilters();
        } else if (e.target.classList.contains('rating-filter')) {
            updateRatingFilters();
        } else if (e.target.classList.contains('availability-filter')) {
            updateAvailabilityFilters();
        } else if (e.target.classList.contains('brand-filter')) {
            updateBrandFilters();
        }
    });

    // Filter Search
    document.getElementById('filterSearchInput').addEventListener('input', function(e) {
        currentFilters.searchTerm = e.target.value.toLowerCase();
        applyAllFilters();
    });

    // Clear All Filters
    document.getElementById('clearAllFilters').addEventListener('click', clearAllFilters);
    document.getElementById('clearFiltersFromNoResults').addEventListener('click', clearAllFilters);

    // Apply Filters Button
    document.getElementById('applyAllFilters').addEventListener('click', applyAllFilters);
}

function updateCategoryFilters() {
    const checkedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
    currentFilters.categories = checkedCategories;
    applyAllFilters();
}

function updateRatingFilters() {
    const checkedRatings = Array.from(document.querySelectorAll('.rating-filter:checked')).map(cb => parseInt(cb.value));
    currentFilters.ratings = checkedRatings;
    applyAllFilters();
}

function updateAvailabilityFilters() {
    const checkedAvailability = Array.from(document.querySelectorAll('.availability-filter:checked')).map(cb => cb.value);
    currentFilters.availability = checkedAvailability;
    applyAllFilters();
}

function updateBrandFilters() {
    const checkedBrands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);
    currentFilters.brands = checkedBrands;
    applyAllFilters();
}

function applyAllFilters() {
    let filtered = [...allProducts];

    // Apply category filter
    if (currentFilters.categories.length > 0) {
        filtered = filtered.filter(p => currentFilters.categories.includes(p.category));
    }

    // Apply legacy category filter
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Apply price range filter
    filtered = filtered.filter(p => {
        const price = parseFloat((typeof p.price === 'string' ? p.price.replace(/^₹/, '') : p.price));
        return price >= currentFilters.priceRange.min && price <= currentFilters.priceRange.max;
    });

    // Apply rating filter
    if (currentFilters.ratings.length > 0) {
        filtered = filtered.filter(p => {
            return currentFilters.ratings.some(rating => {
                if (rating === 5) return p.rating === 5;
                return p.rating >= rating && p.rating < rating + 1;
            });
        });
    }

    // Apply availability filter
    if (currentFilters.availability.length > 0) {
        filtered = filtered.filter(p => {
            return currentFilters.availability.some(filter => {
                switch (filter) {
                    case 'inStock': return p.inStock;
                    case 'discount': return p.discount > 0;
                    case 'new': return p.isNew; // Assuming there's an isNew property
                    default: return true;
                }
            });
        });
    }

    // Apply brand filter
    if (currentFilters.brands.length > 0) {
        filtered = filtered.filter(p => currentFilters.brands.includes(p.brand || 'Unknown'));
    }

    // Apply search filter
    const searchQuery = currentFilters.searchTerm || searchInput.value.trim().toLowerCase();
    if (searchQuery) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(searchQuery) ||
            p.description.toLowerCase().includes(searchQuery) ||
            (p.brand && p.brand.toLowerCase().includes(searchQuery))
        );
    }

    // Apply sorting
    sortFilteredProducts(filtered);

    // Update display
    displayedProducts = filtered;
    currentPage = 1;
    renderProducts();
    updateProductsCount();
    updateActiveFiltersDisplay();
    showNoResultsIfEmpty();
}

function sortFilteredProducts(products) {
    switch (currentSort) {
        case 'price-low':
            products.sort((a, b) => parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)) - parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)));
            break;
        case 'price-high':
            products.sort((a, b) => parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)) - parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)));
            break;
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            products.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            products.sort((a, b) => new Date(b.dateAdded || '2024-01-01') - new Date(a.dateAdded || '2024-01-01'));
            break;
        default:
            // Keep original order for 'featured'
            break;
    }
}

function clearAllFilters() {
    // Reset all filter states
    currentFilters = {
        priceRange: { min: 0, max: maxPrice },
        categories: [],
        ratings: [],
        availability: [],
        brands: [],
        searchTerm: ''
    };

    // Reset UI elements
    document.getElementById('priceRangeMin').value = 0;
    document.getElementById('priceRangeMax').value = maxPrice;
    document.getElementById('minPriceDisplay').textContent = 0;
    document.getElementById('maxPriceDisplay').textContent = maxPrice;
    document.getElementById('minPriceInput').value = '';
    document.getElementById('maxPriceInput').value = '';
    document.getElementById('filterSearchInput').value = '';

    // Uncheck all checkboxes
    document.querySelectorAll('.category-filter, .rating-filter, .availability-filter, .brand-filter').forEach(cb => cb.checked = false);

    // Reset legacy filters
    currentCategory = 'all';
    document.getElementById('categoryFilter').value = 'all';
    searchInput.value = '';

    // Apply filters
    applyAllFilters();
}

function updateProductsCount() {
    const count = displayedProducts.length;
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        const countSpan = countElement.querySelector('span');
        if (countSpan) {
            countSpan.textContent = count;
        }
    }
}

function updateActiveFiltersDisplay() {
    const container = document.getElementById('activeFiltersContainer');
    const list = document.getElementById('activeFiltersList');
    const activeFilters = [];

    // Check for active filters
    if (currentFilters.categories.length > 0) {
        currentFilters.categories.forEach(cat => {
            activeFilters.push({ type: 'category', value: cat, label: `Category: ${cat}` });
        });
    }

    if (currentFilters.priceRange.min > 0 || currentFilters.priceRange.max < maxPrice) {
        activeFilters.push({
            type: 'price',
            value: 'price',
            label: `₹${currentFilters.priceRange.min} - ₹${currentFilters.priceRange.max}`
        });
    }

    if (currentFilters.ratings.length > 0) {
        currentFilters.ratings.forEach(rating => {
            activeFilters.push({ type: 'rating', value: rating, label: `${rating}+ Stars` });
        });
    }

    if (currentFilters.availability.length > 0) {
        currentFilters.availability.forEach(avail => {
            const labels = { inStock: 'In Stock', discount: 'On Sale', new: 'New Arrivals' };
            activeFilters.push({ type: 'availability', value: avail, label: labels[avail] });
        });
    }

    if (currentFilters.brands.length > 0) {
        currentFilters.brands.forEach(brand => {
            activeFilters.push({ type: 'brand', value: brand, label: `Brand: ${brand}` });
        });
    }

    if (currentFilters.searchTerm) {
        activeFilters.push({ type: 'search', value: 'search', label: `Search: "${currentFilters.searchTerm}"` });
    }

    if (activeFilters.length > 0) {
        container.classList.remove('hidden');
        list.innerHTML = activeFilters.map(filter => `
            <div class="active-filter-badge">
                ${filter.label}
                <button onclick="removeActiveFilter('${filter.type}', '${filter.value}')">
                    <i class="fas fa-times text-xs"></i>
                </button>
            </div>
        `).join('');
    } else {
        container.classList.add('hidden');
    }
}

function removeActiveFilter(type, value) {
    switch (type) {
        case 'category':
            currentFilters.categories = currentFilters.categories.filter(c => c !== value);
            const categoryCheckbox = document.querySelector(`.category-filter[value="${value}"]`);
            if (categoryCheckbox) categoryCheckbox.checked = false;
            break;
        case 'rating':
            currentFilters.ratings = currentFilters.ratings.filter(r => r !== parseInt(value));
            const ratingCheckbox = document.querySelector(`.rating-filter[value="${value}"]`);
            if (ratingCheckbox) ratingCheckbox.checked = false;
            break;
        case 'availability':
            currentFilters.availability = currentFilters.availability.filter(a => a !== value);
            const availabilityCheckbox = document.querySelector(`.availability-filter[value="${value}"]`);
            if (availabilityCheckbox) availabilityCheckbox.checked = false;
            break;
        case 'brand':
            currentFilters.brands = currentFilters.brands.filter(b => b !== value);
            const brandCheckbox = document.querySelector(`.brand-filter[value="${value}"]`);
            if (brandCheckbox) brandCheckbox.checked = false;
            break;
        case 'price':
            currentFilters.priceRange = { min: 0, max: maxPrice };
            document.getElementById('priceRangeMin').value = 0;
            document.getElementById('priceRangeMax').value = maxPrice;
            document.getElementById('minPriceDisplay').textContent = 0;
            document.getElementById('maxPriceDisplay').textContent = maxPrice;
            document.getElementById('minPriceInput').value = '';
            document.getElementById('maxPriceInput').value = '';
            break;
        case 'search':
            currentFilters.searchTerm = '';
            document.getElementById('filterSearchInput').value = '';
            break;
    }
    applyAllFilters();
}

// Make removeActiveFilter globally accessible
window.removeActiveFilter = removeActiveFilter;

function showNoResultsIfEmpty() {
    const noResultsMessage = document.getElementById('noResultsMessage');
    const productsGrid = document.getElementById('productsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (displayedProducts.length === 0) {
        noResultsMessage.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        loadMoreBtn.style.display = 'none';
    } else {
        noResultsMessage.classList.add('hidden');
        productsGrid.classList.remove('hidden');
    }
}

function initializeMobileFilters() {
    const showFiltersBtn = document.getElementById('showFiltersBtn');
    const hideFiltersBtn = document.getElementById('hideFiltersBtn');
    const filterSidebar = document.querySelector('aside');

    if (showFiltersBtn) {
        showFiltersBtn.addEventListener('click', function() {
            // Create mobile overlay
            let overlay = document.querySelector('.filter-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'filter-overlay';
                document.body.appendChild(overlay);
            }

            // Show mobile filters
            filterSidebar.classList.add('filter-sidebar-mobile', 'open');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Close when clicking overlay
            overlay.addEventListener('click', closeMobileFilters);
        });
    }

    if (hideFiltersBtn) {
        hideFiltersBtn.addEventListener('click', closeMobileFilters);
    }
}

function closeMobileFilters() {
    const filterSidebar = document.querySelector('aside');
    const overlay = document.querySelector('.filter-overlay');

    if (filterSidebar) {
        filterSidebar.classList.remove('open');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
    document.body.style.overflow = '';
}

// --- Legacy Filter Functions (Updated) ---
function filterAndSortProducts() {
    applyAllFilters();
}

// --- Event Listeners ---
categoryFilter.addEventListener('change', function () {
    currentCategory = this.value;
    filterAndSortProducts();
});
sortProducts.addEventListener('change', function () {
    currentSort = this.value;
    filterAndSortProducts();
});
searchInput.addEventListener('input', function () {
    filterAndSortProducts();
});
loadMoreBtn.addEventListener('click', function () {
    currentPage++;
    renderProducts();
});

// --- Init ---
renderCategoryOptions();
renderFooterCategories();
initializeEnhancedFilters();
filterAndSortProducts();

// Initialize enhanced features
initializeAdvancedFilters();
initializeEnhancedSearch();
initializeProductReviews();
addProductEventListeners();



// ===== ENHANCED FEATURES =====

// Quick View Functionality
function initializeQuickView() {
    // Event listeners for quick view buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quick-view-btn') || e.target.closest('.quick-view-btn-mobile') || e.target.closest('.product-name')) {
            const productCard = e.target.closest('.product-card')
            if (productCard && productCard.dataset.productId) {
                const productId = productCard.dataset.productId
                showQuickView(productId)
            }
        }
    })

    // Close quick view modal
    const closeBtn = document.getElementById('closeQuickView')
    if (closeBtn) {
        closeBtn.addEventListener('click', closeQuickView)
    }

    const modal = document.getElementById('quickViewModal')
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'quickViewModal') {
                closeQuickView()
            }
        })
    }

    // Quick view quantity controls
    const decreaseBtn = document.getElementById('decreaseQuantity')
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            const quantitySpan = document.getElementById('quickViewQuantity')
            if (quantitySpan) {
                let quantity = parseInt(quantitySpan.textContent)
                if (quantity > 1) {
                    quantitySpan.textContent = quantity - 1
                }
            }
        })
    }

    const increaseBtn = document.getElementById('increaseQuantity')
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            const quantitySpan = document.getElementById('quickViewQuantity')
            if (quantitySpan) {
                let quantity = parseInt(quantitySpan.textContent)
                quantitySpan.textContent = quantity + 1
            }
        })
    }

    // Quick view add to cart
    const addToCartBtn = document.getElementById('quickViewAddToCart')
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (quickViewProduct) {
                const quantitySpan = document.getElementById('quickViewQuantity')
                const quantity = quantitySpan ? parseInt(quantitySpan.textContent) : 1
                // Add the product multiple times based on quantity since addToCart only accepts productId
                for (let i = 0; i < quantity; i++) {
                    addToCart(quickViewProduct.id)
                }
                closeQuickView()
                // Notification removed - visual feedback provided by quantity controls
            }
        })
    }
}

function showQuickView(productId) {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    quickViewProduct = product
    const modal = document.getElementById('quickViewModal')
    if (!modal) return

    // Populate quick view content
    const imageEl = document.getElementById('quickViewImage')
    const nameEl = document.getElementById('quickViewName')

    if (imageEl) {
        imageEl.src = product.image
        imageEl.alt = product.name
    }
    if (nameEl) {
        nameEl.textContent = product.name
    }

    // Size information
    const sizeEl = document.getElementById('quickViewSize')
    if (sizeEl && product.size) {
        const sizeSpan = sizeEl.querySelector('span')
        if (sizeSpan) {
            sizeSpan.textContent = product.size
            sizeEl.classList.remove('hidden')
        }
    } else if (sizeEl) {
        sizeEl.classList.add('hidden')
    }

    // Price and discount
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null

    const priceEl = document.getElementById('quickViewPrice')
    const originalPriceEl = document.getElementById('quickViewOriginalPrice')
    const discountTextEl = document.getElementById('quickViewDiscountText')

    if (priceEl) {
        priceEl.textContent = `₹${price}`
    }

    if (originalPriceEl && discountTextEl) {
        if (originalPrice) {
            originalPriceEl.textContent = `₹${originalPrice}`
            originalPriceEl.classList.remove('hidden')
            discountTextEl.textContent = `Save ₹${originalPrice - price}`
            discountTextEl.classList.remove('hidden')
        } else {
            originalPriceEl.classList.add('hidden')
            discountTextEl.classList.add('hidden')
        }
    }

    // Discount badge
    const discountEl = document.getElementById('quickViewDiscount')
    if (discountEl) {
        if (product.discount > 0) {
            discountEl.textContent = `-${product.discount}%`
            discountEl.classList.remove('hidden')
        } else {
            discountEl.classList.add('hidden')
        }
    }

    // Rating and reviews
    const ratingEl = document.getElementById('quickViewRating')
    const ratingTextEl = document.getElementById('quickViewRatingText')
    const reviewsEl = document.getElementById('quickViewReviews')

    if (ratingEl) {
        ratingEl.innerHTML = generateStarRating(product.rating)
    }
    if (ratingTextEl) {
        ratingTextEl.textContent = product.rating
    }
    if (reviewsEl) {
        reviewsEl.textContent = `${product.reviews} reviews`
    }

    // Stock status
    const stockEl = document.getElementById('quickViewStock')
    if (stockEl) {
        stockEl.textContent = product.inStock ? 'In Stock' : 'Out of Stock'
        stockEl.className = product.inStock ? 'text-sm text-green-600 font-semibold' : 'text-sm text-red-600 font-semibold'
    }

    // Reset quantity
    const quantityEl = document.getElementById('quickViewQuantity')
    if (quantityEl) {
        quantityEl.textContent = '1'
    }

    // Load reviews
    loadQuickViewReviews(product)

    // Show modal
    modal.classList.remove('hidden')
    modal.classList.add('flex')

    const overlay = document.getElementById('modalOverlay')
    if (overlay) {
        overlay.classList.remove('hidden')
    }
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal')
    if (modal) {
        modal.classList.add('hidden')
        modal.classList.remove('flex')
    }

    const overlay = document.getElementById('modalOverlay')
    if (overlay) {
        overlay.classList.add('hidden')
    }

    quickViewProduct = null
}

function loadQuickViewReviews(product) {
    const reviewsContainer = document.getElementById('quickViewReviewsList')
    if (!reviewsContainer) return

    if (product.reviewsList && product.reviewsList.length > 0) {
        const reviewsHTML = product.reviewsList.slice(0, 3).map(review => `
            <div class="border-b border-gray-200 pb-3 last:border-b-0">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold text-gray-800">${review.userName}</span>
                        ${review.verified ? '<span class="text-blue-500 text-xs"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    </div>
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${review.comment}</p>
                <span class="text-gray-400 text-xs">${new Date(review.date).toLocaleDateString()}</span>
            </div>
        `).join('')

        reviewsContainer.innerHTML = reviewsHTML
    } else {
        reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>'
    }
}

function updateQuickViewWishlistButton() {
    if (!quickViewProduct) {
        return;
    }

    const isInWishlist = wishlistItems.some(item => item.id === quickViewProduct.id);
    const wishlistBtn = document.getElementById('quickViewWishlist');
    const icon = wishlistBtn.querySelector('i');

    if (isInWishlist) {
        wishlistBtn.classList.add('text-red-500');
        icon.className = 'fas fa-heart';
    } else {
        wishlistBtn.classList.remove('text-red-500');
        icon.className = 'far fa-heart';
    }
}

function loadQuickViewReviews(product) {
    const reviewsContainer = document.getElementById('quickViewReviewsList');

    if (product.reviewsList && product.reviewsList.length > 0) {
        const reviewsHTML = product.reviewsList.slice(0, 3).map(review => `
            <div class="border-b border-gray-200 pb-3 last:border-b-0">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold text-gray-800">${review.userName}</span>
                        ${review.verified ? '<span class="text-blue-500 text-xs"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    </div>
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <span class="text-gray-400 text-xs">${new Date(review.date).toLocaleDateString()}</span>
            </div>
        `).join('');

        reviewsContainer.innerHTML = reviewsHTML;
    } else {
        reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>';
    }
}

// Advanced Filtering Functionality
function initializeAdvancedFilters() {
    // This function can be expanded to add advanced filtering to the all-products page
    console.log('Advanced filters initialized for all products page');
}

// Enhanced Search Functionality
function initializeEnhancedSearch() {
    const searchInput = document.getElementById('searchInput');

    // Debounced search function
    let searchTimeout;
    const debouncedSearch = (query) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performEnhancedSearch(query);
        }, 300);
    };

    // Enhanced search
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 0) {
                debouncedSearch(query);
            } else {
                filterAndSortProducts();
            }
        });
    }
}

function performEnhancedSearch(query) {
    if (!query) {
        filterAndSortProducts();
        return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm));
    });

    displayedProducts = filtered;
    currentPage = 1;
    renderProducts();
}

// Product Reviews System
function initializeProductReviews() {
    console.log('Product reviews system initialized for all products page');
}

// Enhanced Product Event Listeners - Using event delegation to prevent duplicates
function addProductEventListeners() {
    // Add to cart buttons - Fixed to use correct CSS classes
    document.addEventListener('click', (e) => {
        if (e.target.closest('.add-to-cart-btn-mobile')) {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            const { productId } = productCard.dataset;
            addToCart(productId, 1);
            // showNotification('Product added to cart!', 'success');
        }
    });

    // Wishlist buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) {
            e.preventDefault();
            const productCard = e.target.closest('.product-card');
            const { productId } = productCard.dataset;
            toggleWishlist(productId);

            // Update button appearance
            const wishlistBtn = e.target.closest('.wishlist-btn');
            const icon = wishlistBtn.querySelector('i');
            const isInWishlist = wishlistItems.some(item => item.id === productId);

            if (isInWishlist) {
                wishlistBtn.classList.add('text-red-500');
                icon.className = 'fas fa-heart';
                // showNotification('Added to wishlist!', 'success');
            } else {
                wishlistBtn.classList.remove('text-red-500');
                icon.className = 'far fa-heart';
                // showNotification('Removed from wishlist', 'info');
            }
        }
    });
}



// Enhanced add to cart function
function addToCart(productId, quantity = 1) {
    // Use CartManager if available, otherwise fallback to global function
    if (window.cartManager) {
        return window.cartManager.addToCart(productId, quantity);
    } else if (window.addToCart) {
        return window.addToCart(productId, quantity);
    }
}

// Remove from cart function
function removeFromCart(productId) {
    // Use CartManager if available, otherwise fallback to global function
    if (window.cartManager) {
        return window.cartManager.removeFromCart(productId);
    } else if (window.removeFromCart) {
        return window.removeFromCart(productId);
    }
}

// Update cart quantity function
function updateCartQuantity(productId, quantity) {
    // Use CartManager if available, otherwise fallback to global function
    if (window.cartManager) {
        return window.cartManager.updateQuantity(productId, quantity);
    } else if (window.updateCartQuantity) {
        return window.updateCartQuantity(productId, quantity);
    }
}

// Enhanced wishlist function
function toggleWishlist(productId) {
    const existingIndex = wishlistItems.findIndex(item => item.id === productId);

    if (existingIndex !== -1) {
        wishlistItems.splice(existingIndex, 1);
    } else {
        const product = allProducts.find(p => p.id === productId);
        if (product) {
            wishlistItems.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image
            });
        }
    }

    saveWishlistToStorage();
    updateWishlistCount();
}

// Storage functions - now handled by CartManager
function saveCartToStorage() {
    // This is now handled by CartManager
    console.log('saveCartToStorage called - now handled by CartManager');
}

function saveWishlistToStorage() {
    localStorage.setItem('nearNowWishlistItems', JSON.stringify(wishlistItems));
}

function updateCartCount() {
    // Get current cart data from CartManager if available
    if (window.cartManager) {
        cartCount = window.cartManager.getCount();
        cartItems = window.cartManager.getItems();
    } else {
        // Fallback to calculating from local cartItems
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    }

    // Update main cart count badge
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;

        // Add bounce animation
        cartCountElement.classList.add("animate-bounce");
        setTimeout(() => {
            cartCountElement.classList.remove("animate-bounce");
        }, 1000);
    }

    // Update mobile cart count if it exists
    const mobileCartCountElement = document.getElementById("mobileCartCount");
    if (mobileCartCountElement) {
        mobileCartCountElement.textContent = cartCount;
    }
}

function updateWishlistCount() {
    wishlistCount = wishlistItems.length;
    const wishlistCountElement = document.getElementById('wishlistCount');
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlistCount;
    }
}

function updateCartDisplay() {
    // Get current cart data from CartManager if available
    if (window.cartManager) {
        cartItems = window.cartManager.getItems();
    }

    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotal = document.getElementById("cartTotal");

    if (!cartItemsContainer || !cartTotal) {
        console.log('Cart elements not found, cart updated:', cartItems);
        return;
    }

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">Your cart is empty</p>
                <p class="text-gray-400">Add some products to get started</p>
            </div>
        `;
        cartTotal.textContent = "₹0";
        return;
    }

    cartItemsContainer.innerHTML = cartItems
        .map(
            (item) => `
        <div class="flex items-center space-x-4 p-4 border-b border-gray-200">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.name}</h4>
                <p class="text-sm text-gray-600">₹${typeof item.price === 'string' ? item.price.replace(/^₹/, '') : item.price} each</p>
                <div class="flex items-center space-x-2 mt-2">
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-semibold px-3">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary">₹${(typeof item.price === 'string' ? parseFloat(item.price.replace(/^₹/, '')) : item.price) * item.quantity}</p>
                <button class="text-red-500 hover:text-red-700 mt-2" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("");

    const total = cartItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/^₹/, '')) : item.price;
        return sum + (price * item.quantity);
    }, 0);
    cartTotal.textContent = `₹${total}`;
}

// Notification function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
        }`;
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// User display function
function updateUserDisplay() {
    const accountBtn = document.getElementById("accountBtn")
    if (currentUser) {
        accountBtn.innerHTML = `
            <div class="relative">
                <div class="text-center cursor-pointer user-menu-trigger">
                    <i class="fas fa-user-circle text-2xl"></i>
                    <p class="text-sm mt-1">${currentUser.name}</p>
                </div>
                <div class="user-dropdown absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible transform scale-95 transition-all duration-200 z-50">
                    <div class="py-2">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="font-semibold text-gray-800">${currentUser.name}</p>
                            <p class="text-sm text-gray-500">${currentUser.fullMobile}</p>
                        </div>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="profile">
                            <i class="fas fa-user mr-3 text-primary"></i>View Profile
                        </a>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="orders">
                            <i class="fas fa-shopping-bag mr-3 text-primary"></i>Order History
                        </a>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="settings">
                            <i class="fas fa-cog mr-3 text-primary"></i>Settings
                        </a>
                        <div class="border-t border-gray-100 mt-1 pt-1">
                            <a href="#" class="user-menu-item block px-4 py-2 text-red-600 hover:bg-red-50 transition duration-200" data-action="logout">
                                <i class="fas fa-sign-out-alt mr-3"></i>Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Add event listeners for the dropdown
        initializeUserDropdown()
    } else {
        // Reset account button to login state when user is logged out
        accountBtn.innerHTML = `
            <div class="relative mb-2">
                <div
                    class="absolute -inset-3 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow">
                </div>
                <div
                    class="relative bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-primary group-hover:to-secondary p-4 rounded-full transition-all duration-500 shadow-lg group-hover:shadow-xl">
                    <i
                        class="fas fa-user text-2xl text-gray-600 group-hover:text-white transition-all duration-500 transform group-hover:scale-110"></i>
                </div>
            </div>
            <div class="text-center">
                <span
                    class="text-sm font-semibold text-gray-700 group-hover:text-primary transition-all duration-300 group-hover:scale-105 block">Login</span>
            </div>
        `
    }
}

// User dropdown functions
function initializeUserDropdown() {
    const userMenuTrigger = document.querySelector(".user-menu-trigger")
    const userDropdown = document.querySelector(".user-dropdown")
    const userMenuItems = document.querySelectorAll(".user-menu-item")

    if (!userMenuTrigger || !userDropdown) return

    // Toggle dropdown on click
    userMenuTrigger.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleUserDropdown()
    })

    // Handle menu item clicks
    userMenuItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()

            const action = this.dataset.action
            handleUserMenuAction(action)
            hideUserDropdown()
        })
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
            hideUserDropdown()
        }
    })
}

function toggleUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    const isVisible = !userDropdown.classList.contains("opacity-0")

    if (isVisible) {
        hideUserDropdown()
    } else {
        showUserDropdown()
    }
}

function showUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    userDropdown.classList.remove("opacity-0", "invisible", "scale-95")
    userDropdown.classList.add("opacity-100", "visible", "scale-100")
}

function hideUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    userDropdown.classList.remove("opacity-100", "visible", "scale-100")
    userDropdown.classList.add("opacity-0", "invisible", "scale-95")
}

function handleUserMenuAction(action) {
    switch (action) {
        case "profile":
            showNotification("View Profile feature coming soon!", "info")
            break
        case "orders":
            showNotification("Order History feature coming soon!", "info")
            break
        case "settings":
            showNotification("Settings feature coming soon!", "info")
            break
        case "logout":
            logout()
            break
    }
}

// Logout function
function logout() {
    // Handle cart logout using CartManager
    if (window.handleUserLogout) {
        window.handleUserLogout();
    }

    localStorage.removeItem("nearNowCurrentUser")
    currentUser = null

    // Update the display
    updateUserDisplay()

    showNotification("Logged out successfully!", "success")
}

// Modal functions (simplified versions for all-products page)
function showLoginModal() {
    const loginModal = document.getElementById("loginModal")
    const modalOverlay = document.getElementById("modalOverlay")

    if (loginModal && modalOverlay) {
        loginModal.classList.remove("hidden")
        loginModal.classList.add("flex")
        modalOverlay.classList.remove("hidden")
    }
}

function hideLoginModal() {
    const loginModal = document.getElementById("loginModal")
    const modalOverlay = document.getElementById("modalOverlay")

    if (loginModal && modalOverlay) {
        loginModal.classList.add("hidden")
        loginModal.classList.remove("flex")
        modalOverlay.classList.add("hidden")
    }
}

// Full login system functionality
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateUserId() {
    return 'USER_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function handleMobileSubmit(e) {
    e.preventDefault();

    const userName = document.getElementById('userName').value.trim();
    const userMobile = document.getElementById('userMobile').value.trim();

    if (!userName || !userMobile) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (userMobile.length !== 10) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Store user details
    userDetails = {
        name: userName,
        mobile: userMobile,
        otp: generateOTP(),
        userId: generateUserId()
    };

    // Show the generated OTP (for demo purposes)
    console.log('Generated OTP:', userDetails.otp);
    showNotification(`Demo OTP generated: ${userDetails.otp}`, 'info');

    // Update display mobile
    document.getElementById('displayMobile').textContent = `+91 ${userMobile}`;

    // Move to step 2
    showStep(2);

    // Start resend timer
    startResendTimer();
}

function handleOtpSubmit(e) {
    e.preventDefault();

    const enteredOtp = getEnteredOtp();

    if (!enteredOtp) {
        showNotification('Please enter the OTP', 'error');
        return;
    }

    if (enteredOtp.length !== 6) {
        showNotification('Please enter a valid 6-digit OTP', 'error');
        return;
    }

    if (enteredOtp === userDetails.otp) {
        // OTP is correct
        currentUser = {
            id: userDetails.userId,
            name: userDetails.name,
            mobile: userDetails.mobile,
            loginTime: new Date().toISOString()
        };

        // Store in localStorage
        localStorage.setItem('nearNowCurrentUser', JSON.stringify(currentUser));

        // Move to success step
        showStep(3);

        // Update user display
        updateUserDisplay();

        showNotification('Login successful!', 'success');

        // Auto-continue after 2 seconds
        setTimeout(() => {
            continueAfterLogin();
        }, 2000);
    } else {
        showNotification('Invalid OTP. Please try again.', 'error');
        clearOtpInputs();
    }
}

function getEnteredOtp() {
    const otpInputs = document.querySelectorAll('.otp-input');
    return Array.from(otpInputs).map(input => input.value).join('');
}

function clearOtpInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');
    otpInputs.forEach(input => {
        input.value = '';
    });
    // Focus on first input
    if (otpInputs.length > 0) {
        otpInputs[0].focus();
    }
}

function initializeOtpInputs() {
    const otpInputs = document.querySelectorAll('.otp-input');

    otpInputs.forEach((input, index) => {
        input.addEventListener('input', function(e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');

            // Move to next input if current is filled
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', function(e) {
            // Move to previous input on backspace if current is empty
            if (e.key === 'Backspace' && this.value === '' && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('paste', function(e) {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

            // Fill inputs with pasted data
            for (let i = 0; i < Math.min(pastedData.length, otpInputs.length - index); i++) {
                if (otpInputs[index + i]) {
                    otpInputs[index + i].value = pastedData[i];
                }
            }

            // Focus on next empty input or last input
            const nextIndex = Math.min(index + pastedData.length, otpInputs.length - 1);
            otpInputs[nextIndex].focus();
        });
    });
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.login-step').forEach(el => el.classList.add('hidden'));

    // Show current step
    const currentStepEl = document.getElementById(`step${step}`);
    if (currentStepEl) {
        currentStepEl.classList.remove('hidden');
        currentStep = step;
    }
}

function startResendTimer() {
    resendTimer = 30;
    const resendBtn = document.getElementById('resendOtpBtn');
    const timerSpan = document.getElementById('resendTimer');

    if (resendBtn) resendBtn.disabled = true;

    otpTimer = setInterval(() => {
        resendTimer--;
        if (timerSpan) timerSpan.textContent = resendTimer;

        if (resendTimer <= 0) {
            clearInterval(otpTimer);
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.innerHTML = 'Resend OTP';
            }
        }
    }, 1000);
}

function resendOtp() {
    // Generate new OTP
    userDetails.otp = generateOTP();
    console.log('New OTP:', userDetails.otp);
    showNotification(`New demo OTP: ${userDetails.otp}`, 'info');

    // Clear current OTP inputs
    clearOtpInputs();

    // Restart timer
    startResendTimer();
}

function changeNumber() {
    // Clear form and go back to step 1
    document.getElementById('userName').value = '';
    document.getElementById('userMobile').value = '';
    clearOtpInputs();

    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }

    // Reset user details
    userDetails = {};

    showStep(1);
}

function continueAfterLogin() {
    hideLoginModal();

    // Check if user was trying to checkout
    if (window.pendingCheckout) {
        window.pendingCheckout = false;
        window.location.href = 'checkout.html';
    } else {
        showNotification('Welcome back!', 'success');
    }
}

// Initialize authentication
function initializeAuth() {
    document.getElementById("accountBtn").addEventListener("click", () => {
        if (currentUser) {
            toggleUserDropdown()
        } else {
            showLoginModal()
        }
    })

    document.getElementById("closeLogin").addEventListener("click", hideLoginModal)

    // Always call updateUserDisplay to set the correct initial state
    updateUserDisplay()
}

// Initialize login system
function initializeLoginSystem() {
    // Form event listeners
    document.getElementById("mobileForm").addEventListener("submit", handleMobileSubmit)
    document.getElementById("otpForm").addEventListener("submit", handleOtpSubmit)

    // Button event listeners
    document.getElementById("resendOtpBtn").addEventListener("click", resendOtp)
    document.getElementById("changeNumberBtn").addEventListener("click", changeNumber)
    document.getElementById("continueShoppingBtn").addEventListener("click", continueAfterLogin)

    // OTP input handling
    initializeOtpInputs()
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Load products from Supabase first
        console.log('🔄 Loading products from Supabase...')
        allProducts = await getAllProducts()
        displayedProducts = [...allProducts]
        console.log(`✅ Loaded ${allProducts.length} products`)

        // Initialize the UI components
        initializeFilters()
        renderProducts()
        
        // Cart items will be loaded by CartManager
        if (window.cartManager) {
            cartItems = window.cartManager.getItems();
            cartCount = window.cartManager.getCount();
        } else {
            // Fallback: Load cart items from localStorage
            const savedCart = localStorage.getItem("nearNowCartItems");
            if (savedCart) {
                cartItems = JSON.parse(savedCart);
                cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
            }
        }

        // Initialize authentication
        initializeAuth()
        initializeLoginSystem()

        // Initialize cart functionality
        initializeCart()

        // Initialize quick view functionality
        initializeQuickView()

        // Update cart and wishlist counts after loading from localStorage
        updateCartCount();
        updateWishlistCount();
        
        console.log('✅ All products page initialized successfully')
    } catch (error) {
        console.error('❌ Error initializing all products page:', error)
        showErrorMessage('Failed to load products. Please refresh the page.')
    }
});

// Error message function
function showErrorMessage(message) {
    // Create or update error banner
    let errorBanner = document.getElementById('error-banner')
    if (!errorBanner) {
        errorBanner = document.createElement('div')
        errorBanner.id = 'error-banner'
        errorBanner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-3 px-4 z-50'
        document.body.insertBefore(errorBanner, document.body.firstChild)
    }
    
    errorBanner.innerHTML = `
        <div class="container mx-auto flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.style.display='none'" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    errorBanner.style.display = 'block'
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (errorBanner) errorBanner.style.display = 'none'
    }, 10000)
}

// Cart Functionality
function initializeCart() {
    // Sync with CartManager if available
    if (window.cartManager) {
        cartItems = window.cartManager.getItems();
        cartCount = window.cartManager.getCount();
    }

    // Update cart count and display immediately
    updateCartCount()
    updateCartDisplay()

    document.getElementById("cartBtn").addEventListener("click", toggleCartSidebar)
    document.getElementById("closeCart").addEventListener("click", closeCartSidebar)
    document.getElementById("checkoutBtn").addEventListener("click", proceedToCheckout)

    // Close cart when clicking overlay
    document.getElementById("modalOverlay").addEventListener("click", closeCartSidebar)
}

function toggleCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar")
    const modalOverlay = document.getElementById("modalOverlay")

    cartSidebar.classList.toggle("open")
    modalOverlay.classList.toggle("hidden")
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar")
    const modalOverlay = document.getElementById("modalOverlay")

    cartSidebar.classList.remove("open")
    modalOverlay.classList.add("hidden")
}

function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification("Your cart is empty!", "error")
        return
    }

    if (!currentUser) {
        // Set flag to indicate user was trying to checkout
        window.pendingCheckout = true;
        showNotification("Please login to proceed to checkout", "info")
        showLoginModal()
        return
    }

    // Redirect to checkout page
    window.location.href = 'checkout.html'
}