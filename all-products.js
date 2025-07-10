// --- Product Data ---
// products, getAllProducts, getAvailableCategories are loaded from products-data.js

let allProducts = products;
let displayedProducts = [...allProducts];
let currentCategory = 'all';
let currentSort = 'default';
let currentPage = 1;
const productsPerPage = 12;

// New Global Variables for Enhanced Features
let currentFilters = {
    priceRange: { min: 0, max: 1000 },
    categories: [],
    ratings: [],
    availability: []
};
let searchSuggestions = [];
let quickViewProduct = null;
let mobileNavOpen = false;

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
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-4 left-4"><span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">-${product.discount}%</span></div>` : ''}
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                    <button class="quick-view-btn bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition duration-300 transform scale-0 group-hover:scale-100" title="Quick View">
                        <i class="fas fa-eye text-gray-600 hover:text-primary"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-sm">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-lg mb-2 cursor-pointer hover:text-primary transition duration-300 product-name">${product.name}</h3>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-primary font-bold text-xl">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-sm">₹${originalPrice}</span>` : ''}
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="quick-view-btn-mobile md:hidden bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition duration-300" title="Quick View">
                            <i class="fas fa-eye text-gray-600"></i>
                        </button>
                        <button class="add-to-cart-btn-mobile bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-2">
                            <i class="fas fa-plus"></i>
                            <span>Add</span>
                        </button>
                    </div>
                </div>
                ${product.inStock ? '<div class="mt-2"><span class="text-green-600 text-sm font-semibold"><i class="fas fa-check-circle mr-1"></i>In Stock</span></div>' : '<div class="mt-2"><span class="text-red-600 text-sm font-semibold"><i class="fas fa-times-circle mr-1"></i>Out of Stock</span></div>'}
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

// --- Filter, Sort, Search ---
function filterAndSortProducts() {
    let filtered = [...allProducts];
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    // Search
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }
    // Sort
    switch (currentSort) {
        case 'price-low':
            filtered.sort((a, b) => parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)) - parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)));
            break;
        case 'price-high':
            filtered.sort((a, b) => parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)) - parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    displayedProducts = filtered;
    currentPage = 1;
    renderProducts();
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
filterAndSortProducts();

// Initialize enhanced features
initializeQuickView();
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
            const productCard = e.target.closest('.product-card');
            const { productId } = productCard.dataset;
            showQuickView(productId);
        }
    });

    // Close quick view modal
    document.getElementById('closeQuickView').addEventListener('click', closeQuickView);
    document.getElementById('quickViewModal').addEventListener('click', (e) => {
        if (e.target.id === 'quickViewModal') {
            closeQuickView();
        }
    });

    // Quick view quantity controls
    document.getElementById('decreaseQuantity').addEventListener('click', () => {
        const quantitySpan = document.getElementById('quickViewQuantity');
        let quantity = parseInt(quantitySpan.textContent);
        if (quantity > 1) {
            quantitySpan.textContent = quantity - 1;
        }
    });

    document.getElementById('increaseQuantity').addEventListener('click', () => {
        const quantitySpan = document.getElementById('quickViewQuantity');
        let quantity = parseInt(quantitySpan.textContent);
        quantitySpan.textContent = quantity + 1;
    });

    // Quick view add to cart
    document.getElementById('quickViewAddToCart').addEventListener('click', () => {
        if (quickViewProduct) {
            const quantity = parseInt(document.getElementById('quickViewQuantity').textContent);
            addToCart(quickViewProduct.id, quantity);
            closeQuickView();
            // showNotification(`${quickViewProduct.name} added to cart!`, 'success');
        }
    });

    // Quick view wishlist
    document.getElementById('quickViewWishlist').addEventListener('click', () => {
        if (quickViewProduct) {
            toggleWishlist(quickViewProduct.id);
            updateQuickViewWishlistButton();
        }
    });
}

function showQuickView(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        return;
    }

    quickViewProduct = product;
    const modal = document.getElementById('quickViewModal');

    // Populate quick view content
    document.getElementById('quickViewImage').src = product.image;
    document.getElementById('quickViewImage').alt = product.name;
    document.getElementById('quickViewName').textContent = product.name;

    // Price and discount
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;

    document.getElementById('quickViewPrice').textContent = `₹${price}`;
    if (originalPrice) {
        document.getElementById('quickViewOriginalPrice').textContent = `₹${originalPrice}`;
        document.getElementById('quickViewOriginalPrice').classList.remove('hidden');
        document.getElementById('quickViewDiscountText').textContent = `Save ₹${originalPrice - price}`;
        document.getElementById('quickViewDiscountText').classList.remove('hidden');
    } else {
        document.getElementById('quickViewOriginalPrice').classList.add('hidden');
        document.getElementById('quickViewDiscountText').classList.add('hidden');
    }

    // Discount badge
    if (product.discount > 0) {
        document.getElementById('quickViewDiscount').textContent = `-${product.discount}%`;
        document.getElementById('quickViewDiscount').classList.remove('hidden');
    } else {
        document.getElementById('quickViewDiscount').classList.add('hidden');
    }

    // Rating and reviews
    document.getElementById('quickViewRating').innerHTML = generateStarRating(product.rating);
    document.getElementById('quickViewRatingText').textContent = product.rating;
    document.getElementById('quickViewReviews').textContent = `${product.reviews} reviews`;

    // Stock status
    document.getElementById('quickViewStock').textContent = product.inStock ? 'In Stock' : 'Out of Stock';
    document.getElementById('quickViewStock').className = product.inStock ? 'text-sm text-green-600 font-semibold' : 'text-sm text-red-600 font-semibold';

    // Reset quantity
    document.getElementById('quickViewQuantity').textContent = '1';

    // Update wishlist button
    updateQuickViewWishlistButton();

    // Load reviews
    loadQuickViewReviews(product);

    // Show modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.getElementById('modalOverlay').classList.remove('hidden');
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('modalOverlay').classList.add('hidden');
    quickViewProduct = null;
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

// Placeholder functions for login system (redirected to main page for full functionality)
function handleMobileSubmit(e) {
    e.preventDefault()
    showNotification("Please use the main page for login functionality", "info")
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1500)
}

function handleOtpSubmit(e) {
    e.preventDefault()
    showNotification("Please use the main page for login functionality", "info")
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1500)
}

function resendOtp() {
    showNotification("Please use the main page for login functionality", "info")
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1500)
}

function changeNumber() {
    showNotification("Please use the main page for login functionality", "info")
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1500)
}

function continueAfterLogin() {
    showNotification("Please use the main page for login functionality", "info")
    setTimeout(() => {
        window.location.href = 'index.html'
    }, 1500)
}

function initializeOtpInputs() {
    // Placeholder - full functionality available on main page
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
document.addEventListener('DOMContentLoaded', function () {
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

    // Update cart and wishlist counts after loading from localStorage
    updateCartCount();
    updateWishlistCount();
});