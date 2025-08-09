// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://mpbszymyubxavjoxhzfm.supabase.co'; // e.g., 'https://xyzcompany.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnN6eW15dWJ4YXZqb3hoemZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTc5OTQsImV4cCI6MjA2OTg3Mzk5NH0.NnHFwGCkNpTWorV8O6vgn6uuqYPRek1QK4Sk_rcqLOg';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Application State
let allProducts = [];
let filteredProducts = [];
let categories = [];
let brands = [];
let currentPage = 1;
let productsPerPage = 12;
let cart = [];

// DOM Elements
const productsGrid = document.getElementById('productsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const categoryFilters = document.getElementById('categoryFilters');
const brandFilters = document.getElementById('brandFilters');
const minPriceSlider = document.getElementById('minPrice');
const maxPriceSlider = document.getElementById('maxPrice');
const minPriceValue = document.getElementById('minPriceValue');
const maxPriceValue = document.getElementById('maxPriceValue');
const pagination = document.getElementById('pagination');
const productModal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const cartCount = document.querySelector('.cart-count');

// Initialize Application
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    try {
        await loadProducts();
        setupEventListeners();
        initializeFilters();
        displayProducts();
    } catch (error) {
        console.error('Error initializing app:', error);
        showError('Failed to load products. Please check your Supabase configuration.');
    }
}

// Load Products from Supabase
async function loadProducts() {
    try {
        showLoading(true);

        // Adjust this query based on your actual database schema
        const { data, error } = await supabase
            .from('products') // Replace 'products' with your actual table name
            .select('*');

        if (error) {
            throw error;
        }

        // If no data is returned, show sample data structure
        if (!data || data.length === 0) {
            console.warn('No products found in database. Using sample data structure.');
            allProducts = generateSampleProducts();
        } else {
            allProducts = data;
        }

        filteredProducts = [...allProducts];
        extractFiltersData();
        showLoading(false);

    } catch (error) {
        console.error('Error loading products:', error);
        showLoading(false);
        // Use sample data if database connection fails
        allProducts = generateSampleProducts();
        filteredProducts = [...allProducts];
        extractFiltersData();
    }
}

// Generate Sample Products (for demonstration)
function generateSampleProducts() {
    const sampleCategories = ['Fruits', 'Vegetables', 'Dairy', 'Beverages', 'Snacks', 'Bakery'];
    const sampleBrands = ['Fresh Valley', 'Green Farm', 'Pure Dairy', 'Mountain Spring', 'Golden Harvest'];
    const products = [];

    for (let i = 1; i <= 50; i++) {
        const category = sampleCategories[Math.floor(Math.random() * sampleCategories.length)];
        const brand = sampleBrands[Math.floor(Math.random() * sampleBrands.length)];
        const originalPrice = Math.floor(Math.random() * 500) + 50;
        const discount = Math.floor(Math.random() * 50);
        const currentPrice = Math.floor(originalPrice * (1 - discount / 100));

        products.push({
            id: i,
            name: `Product ${i}`,
            category: category,
            brand: brand,
            price: currentPrice,
            original_price: originalPrice,
            discount: discount,
            rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
            rating_count: Math.floor(Math.random() * 1000) + 10,
            image_url: `https://via.placeholder.com/300x200?text=${category}`,
            description: `High quality ${category.toLowerCase()} product from ${brand}`,
            in_stock: Math.random() > 0.1 // 90% chance of being in stock
        });
    }

    return products;
}

// Extract unique categories and brands for filters
function extractFiltersData() {
    categories = [...new Set(allProducts.map(product => product.category))].sort();
    brands = [...new Set(allProducts.map(product => product.brand))].sort();

    // Update price range based on actual product prices
    const prices = allProducts.map(product => product.price || product.current_price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    minPriceSlider.min = 0;
    minPriceSlider.max = maxPrice;
    minPriceSlider.value = 0;

    maxPriceSlider.min = 0;
    maxPriceSlider.max = maxPrice;
    maxPriceSlider.value = maxPrice;

    minPriceValue.textContent = '0';
    maxPriceValue.textContent = maxPrice;
}

// Initialize Filter UI
function initializeFilters() {
    // Populate category filters
    categoryFilters.innerHTML = categories.map(category => `
        <label>
            <input type="checkbox" value="${category}" name="category">
            ${category}
        </label>
    `).join('');

    // Populate brand filters
    brandFilters.innerHTML = brands.map(brand => `
        <label>
            <input type="checkbox" value="${brand}" name="brand">
            ${brand}
        </label>
    `).join('');
}

// Setup Event Listeners
function setupEventListeners() {
    // Search
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    document.getElementById('searchBtn').addEventListener('click', handleSearch);

    // Sort
    sortSelect.addEventListener('change', handleSort);

    // Price range sliders
    minPriceSlider.addEventListener('input', handlePriceRangeChange);
    maxPriceSlider.addEventListener('input', handlePriceRangeChange);

    // Filter checkboxes
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
            handleFilterChange();
        }
    });

    // Clear filters
    document.getElementById('clearFilters').addEventListener('click', clearAllFilters);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === productModal) {
            closeModal();
        }
    });

    // Cart icon
    document.querySelector('.cart-icon').addEventListener('click', () => {
        showToast('Cart functionality would be implemented here');
    });
}

// Search Handler
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = allProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    } else {
        filteredProducts = [...allProducts];
    }

    applyFilters();
}

// Sort Handler
function handleSort() {
    const sortBy = sortSelect.value;

    filteredProducts.sort((a, b) => {
        switch (sortBy) {
            case 'name_asc':
                return a.name.localeCompare(b.name);
            case 'name_desc':
                return b.name.localeCompare(a.name);
            case 'price_asc':
                return (a.price || a.current_price) - (b.price || b.current_price);
            case 'price_desc':
                return (b.price || b.current_price) - (a.price || a.current_price);
            case 'rating_desc':
                return parseFloat(b.rating) - parseFloat(a.rating);
            case 'discount_desc':
                return (b.discount || 0) - (a.discount || 0);
            default:
                return 0;
        }
    });

    currentPage = 1;
    displayProducts();
}

// Price Range Handler
function handlePriceRangeChange() {
    const minPrice = parseInt(minPriceSlider.value);
    const maxPrice = parseInt(maxPriceSlider.value);

    // Ensure min is not greater than max
    if (minPrice > maxPrice) {
        if (event.target === minPriceSlider) {
            minPriceSlider.value = maxPrice;
        } else {
            maxPriceSlider.value = minPrice;
        }
    }

    minPriceValue.textContent = minPriceSlider.value;
    maxPriceValue.textContent = maxPriceSlider.value;

    debounce(applyFilters, 200)();
}

// Filter Change Handler
function handleFilterChange() {
    applyFilters();
}

// Apply All Filters
function applyFilters() {
    let filtered = [...allProducts];

    // Search filter
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.brand.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }

    // Category filter
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(input => input.value);
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Brand filter
    const selectedBrands = Array.from(document.querySelectorAll('input[name="brand"]:checked'))
        .map(input => input.value);
    if (selectedBrands.length > 0) {
        filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Price range filter
    const minPrice = parseInt(minPriceSlider.value);
    const maxPrice = parseInt(maxPriceSlider.value);
    filtered = filtered.filter(product => {
        const price = product.price || product.current_price;
        return price >= minPrice && price <= maxPrice;
    });

    // Rating filter
    const selectedRatings = Array.from(document.querySelectorAll('input[name="rating"]:checked'))
        .map(input => parseInt(input.value));
    if (selectedRatings.length > 0) {
        const minRating = Math.max(...selectedRatings);
        filtered = filtered.filter(product => parseFloat(product.rating) >= minRating);
    }

    // Discount filter
    const selectedDiscounts = Array.from(document.querySelectorAll('input[name="discount"]:checked'))
        .map(input => parseInt(input.value));
    if (selectedDiscounts.length > 0) {
        const minDiscount = Math.max(...selectedDiscounts);
        filtered = filtered.filter(product => (product.discount || 0) >= minDiscount);
    }

    filteredProducts = filtered;
    currentPage = 1;
    displayProducts();
}

// Clear All Filters
function clearAllFilters() {
    // Clear search
    searchInput.value = '';

    // Clear checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset price range
    minPriceSlider.value = minPriceSlider.min;
    maxPriceSlider.value = maxPriceSlider.max;
    minPriceValue.textContent = minPriceSlider.min;
    maxPriceValue.textContent = maxPriceSlider.max;

    // Reset sort
    sortSelect.value = 'name_asc';

    // Reset products
    filteredProducts = [...allProducts];
    currentPage = 1;
    displayProducts();
}

// Display Products
function displayProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    // Update results count
    resultsCount.textContent = `Showing ${productsToShow.length} of ${filteredProducts.length} products`;

    if (productsToShow.length === 0) {
        productsGrid.style.display = 'none';
        noResults.style.display = 'block';
        pagination.style.display = 'none';
    } else {
        productsGrid.style.display = 'grid';
        noResults.style.display = 'none';
        pagination.style.display = 'flex';

        productsGrid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
        setupProductEventListeners();
        setupPagination();
    }
}

// Create Product Card HTML
function createProductCard(product) {
    const price = product.price || product.current_price;
    const originalPrice = product.original_price || product.price;
    const discount = product.discount || 0;
    const rating = parseFloat(product.rating);
    const ratingStars = generateStars(rating);

    return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image">
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                ${product.image_url ?
                    `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'">` :
                    `<i class="fas fa-image"></i>`
                }
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-brand">${product.brand}</div>
                <div class="product-rating">
                    <div class="rating-stars">${ratingStars}</div>
                    <span class="rating-value">${rating.toFixed(1)}</span>
                    <span class="rating-count">(${product.rating_count || 0})</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${price.toLocaleString()}</span>
                    ${originalPrice && originalPrice !== price ?
                        `<span class="original-price">₹${originalPrice.toLocaleString()}</span>` :
                        ''
                    }
                </div>
                <button class="add-to-cart-btn" data-product-id="${product.id}" ${!product.in_stock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart"></i>
                    ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
}

// Generate Star Rating HTML
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }

    return stars;
}

// Setup Product Event Listeners
function setupProductEventListeners() {
    // Product card clicks
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = parseInt(card.dataset.productId);
                showProductModal(productId);
            }
        });
    });

    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!button.disabled) {
                const productId = parseInt(button.dataset.productId);
                addToCart(productId);
            }
        });
    });
}

// Setup Pagination
function setupPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // Previous button
    paginationHTML += `
        <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button ${i === currentPage ? 'class="active"' : ''} onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    paginationHTML += `
        <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;

    pagination.innerHTML = paginationHTML;
}

// Change Page
function changePage(page) {
    currentPage = page;
    displayProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Product Modal
function showProductModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const price = product.price || product.current_price;
    const originalPrice = product.original_price || product.price;
    const rating = parseFloat(product.rating);
    const ratingStars = generateStars(rating);

    modalContent.innerHTML = `
        <div class="modal-product">
            <div class="modal-product-image">
                ${product.image_url ?
                    `<img src="${product.image_url}" alt="${product.name}">` :
                    `<div class="placeholder-image"><i class="fas fa-image"></i></div>`
                }
            </div>
            <div class="modal-product-details">
                <div class="product-category">${product.category}</div>
                <h2>${product.name}</h2>
                <div class="product-brand">${product.brand}</div>
                <div class="product-rating">
                    <div class="rating-stars">${ratingStars}</div>
                    <span class="rating-value">${rating.toFixed(1)}</span>
                    <span class="rating-count">(${product.rating_count || 0} reviews)</span>
                </div>
                <div class="product-price">
                    <span class="current-price">₹${price.toLocaleString()}</span>
                    ${originalPrice && originalPrice !== price ?
                        `<span class="original-price">₹${originalPrice.toLocaleString()}</span>` :
                        ''
                    }
                    ${product.discount ? `<span class="discount">${product.discount}% OFF</span>` : ''}
                </div>
                <div class="product-description">
                    <h4>Description</h4>
                    <p>${product.description || 'No description available.'}</p>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})" ${!product.in_stock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i>
                        ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `;

    productModal.style.display = 'block';
}

// Close Modal
function closeModal() {
    productModal.style.display = 'none';
}

// Add to Cart
function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product || !product.in_stock) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartCount();
    showToast(`${product.name} added to cart!`);
}

// Update Cart Count
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Show Toast Notification
function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show/Hide Loading
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
    productsGrid.style.display = show ? 'none' : 'grid';
}

// Show Error Message
function showError(message) {
    resultsCount.textContent = message;
    productsGrid.innerHTML = `
        <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #ff4757;">
            <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
            <h3>${message}</h3>
            <p>Please check your Supabase configuration in the JavaScript file.</p>
        </div>
    `;
}

// Utility Functions
function debounce(func, wait) {
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

// Make functions globally available for onclick handlers
window.changePage = changePage;
window.addToCart = addToCart;