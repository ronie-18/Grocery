// --- Product Data ---
// products, getAllProducts, getAvailableCategories are loaded from products-data.js

let allProducts = products;
let displayedProducts = [...allProducts];
let currentCategory = 'all';
let currentSort = 'default';
let currentPage = 1;
const productsPerPage = 12;

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
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-4 left-4"><span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">-${product.discount}%</span></div>` : ''}
            </div>
            <div class="p-6">
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-sm ml-2">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-lg mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-primary font-bold text-xl">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-sm">₹${originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
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
            filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            filtered.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
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