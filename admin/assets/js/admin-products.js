/**
 * Admin Product Management System
 * Handles enhanced product CRUD operations with legacy compatibility
 */

class AdminProductsManager {
    constructor() {
        // Only initialize on admin pages
        if (!window.location.pathname.includes('/admin/')) {
            console.log('⚠️ AdminProductsManager: Not on admin page, skipping initialization');
            return;
        }
        
        this.currentPage = 1;
        this.productsPerPage = 10;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedProducts = [];
        this.totalProductsCount = 0;
        this.allProducts = [];
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Admin Products Manager...');
            this.setupEventListeners();
            // Don't auto-load products in dashboard context - let the dashboard call loadProducts when needed
            const isStandalonePage = window.location.pathname.includes('products.html');
            if (isStandalonePage) {
                await this.loadProducts();
            }
            console.log('✅ Admin Products Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Admin Products Manager:', error);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('productSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.debounceSearch();
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('productFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.loadProducts();
            });
        }

        // Product type change handler
        const productTypeSelect = document.getElementById('productType');
        if (productTypeSelect) {
            productTypeSelect.addEventListener('change', (e) => {
                toggleLooseConfig(e.target.value === 'loose');
            });
        }

        // Loose product category change handler
        const looseCategorySelect = document.getElementById('looseProductCategory');
        if (looseCategorySelect) {
            looseCategorySelect.addEventListener('change', (e) => {
                updateCommonSizes(e.target.value);
            });
        }

        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showAddProductModal();
            });
        }
    }

    // Debounced search to avoid too many API calls
    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadProducts();
        }, 500);
    }

    async loadProducts() {
        try {
            console.log('📦 Loading products...');
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available, skipping product loading');
                return;
            }
            
            // DIAGNOSTIC: Check what tables exist and their counts
            console.log('🔍 DIAGNOSTIC: Checking Supabase tables...');
            try {
                // Check products table
                const { count: productsCount, error: productsError } = await window.supabaseClient
                    .from('products')
                    .select('*', { count: 'exact', head: true });
                console.log('📊 products table count:', productsCount, productsError ? `(Error: ${productsError.message})` : '');
                
                // Check products_enhanced table
                const { count: enhancedCount, error: enhancedError } = await window.supabaseClient
                    .from('products_enhanced')
                    .select('*', { count: 'exact', head: true });
                console.log('📊 products_enhanced table count:', enhancedCount, enhancedError ? `(Error: ${enhancedError.message})` : '');
            } catch (diagError) {
                console.warn('⚠️ Diagnostic check failed:', diagError);
            }
            
            this.showLoadingState();

            // USE PRODUCTS TABLE FROM SUPABASE DIRECTLY
            console.log('📦 Loading from Supabase products table...');
            
            // First get total count from products table
            const { count: totalCount, error: countError } = await window.supabaseClient
                .from('products')
                .select('*', { count: 'exact', head: true });
            
            if (countError) {
                console.error('❌ Error getting product count:', countError);
                this.showError('Failed to get product count from Supabase.');
                return;
            }
            
            this.totalProductsCount = totalCount || 0;
            console.log(`📊 Total products in Supabase: ${this.totalProductsCount}`);
            
            // Get ALL products for stats calculation (no filters, no pagination)
            const { data: allProducts, error: allError } = await window.supabaseClient
                .from('products')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (allError) {
                console.error('❌ Error loading all products:', allError);
            } else {
                this.allProducts = allProducts || [];
                console.log(`✅ Loaded ${this.allProducts.length} total products for stats`);
            }
            
            // Build query for paginated display
            let displayQuery = window.supabaseClient
                .from('products')
                .select('*');

            // Apply filters
            if (this.currentFilter !== 'all') {
                switch (this.currentFilter) {
                    case 'active':
                        displayQuery = displayQuery.eq('in_stock', true);
                        break;
                    case 'inactive':
                        displayQuery = displayQuery.eq('in_stock', false);
                        break;
                    case 'out_of_stock':
                        displayQuery = displayQuery.eq('in_stock', false);
                        break;
                }
            }

            // Apply search
            if (this.searchQuery) {
                displayQuery = displayQuery.or(`name.ilike.%${this.searchQuery}%,category.ilike.%${this.searchQuery}%`);
            }

            // Apply sorting and pagination for display
            displayQuery = displayQuery.order('created_at', { ascending: false });
            const from = (this.currentPage - 1) * this.productsPerPage;
            const to = from + this.productsPerPage - 1;
            displayQuery = displayQuery.range(from, to);

            const { data: displayProducts, error: displayError } = await displayQuery;

            if (displayError) {
                console.error('❌ Error loading products for display:', displayError);
                this.showError('Failed to load products from Supabase. Please try again.');
                return;
            }

            console.log(`✅ Loaded ${displayProducts?.length || 0} products for display (page ${this.currentPage})`);
            if (displayProducts && displayProducts.length > 0) {
                console.log('📊 Sample product:', displayProducts[0]);
            }

            this.renderProducts(displayProducts || []);

        } catch (error) {
            console.error('❌ Error in loadProducts:', error);
            this.showError('An unexpected error occurred while loading products.');
        }
    }

    renderProducts(products) {
        const productsTableBody = document.getElementById('productsTableBody');
        const productsGrid = document.getElementById('productsGrid');
        
        if (!productsTableBody && !productsGrid) return;

        if (products.length === 0) {
            const emptyMessage = `
                <div class="text-center py-12">
                    <i class="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Products Found</h3>
                    <p class="text-gray-500 mb-4">${this.searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first product.'}</p>
                    ${!this.searchQuery ? '<button class="btn-primary" onclick="adminProductsManager.showAddProductModal()">Add Product</button>' : ''}
                </div>
            `;
            
            if (productsTableBody) {
                productsTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${emptyMessage}</td></tr>`;
            }
            if (productsGrid) {
                productsGrid.innerHTML = emptyMessage;
            }
            return;
        }

        // Update stats
        this.updateStats(products);

        if (productsTableBody) {
            productsTableBody.innerHTML = products.map(product => this.createProductRow(product)).join('');
        }
        if (productsGrid) {
            productsGrid.innerHTML = products.map(product => this.createProductCard(product)).join('');
        }
    }

    createProductRow(product) {
        // Try multiple possible image field names
        const primaryImage = product.primary_image_url || 
                            product.image_url || 
                            product.image || 
                            product.img || 
                            'https://via.placeholder.com/50x50?text=No+Image';
        const categoryName = product.categories_enhanced?.name || product.category || 'Uncategorized';
        const status = product.status || (product.in_stock ? 'active' : 'inactive');
        const statusClass = status === 'active' ? 'badge-success' : 'badge-secondary';
        const stock = product.stock_quantity || product.quantity || 0;
        const price = product.price || product.selling_price || 0;

        return `
            <tr>
                <td>
                    <img src="${primaryImage}" alt="${product.name}" class="w-12 h-12 object-cover rounded">
                </td>
                <td>
                    <div class="font-medium">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.description || ''}</div>
                    ${product.size ? `<div class="text-xs text-blue-600 font-medium mt-1"><i class="fas fa-weight-hanging mr-1"></i>${product.size}</div>` : ''}
                </td>
                <td>
                    <span class="badge badge-outline">${categoryName}</span>
                </td>
                <td class="font-medium">₹${price}</td>
                <td>${stock}</td>
                <td>
                    <span class="badge ${statusClass}">${status}</span>
                </td>
                <td>
                    <div class="flex space-x-2">
                        <button class="btn btn-sm btn-outline" onclick="adminProductsManager.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline btn-danger" onclick="adminProductsManager.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateStats(products) {
        // Use all products for stats, not just current page
        const statsProducts = this.allProducts.length > 0 ? this.allProducts : products;
        
        const totalProducts = this.totalProductsCount || statsProducts.length;
        const activeProducts = statsProducts.filter(p => p.is_active !== false && p.in_stock !== false).length;
        const lowStockProducts = statsProducts.filter(p => (p.stock_quantity || p.quantity || 0) < 10).length;
        
        console.log(`📊 Stats: Total=${totalProducts}, Active=${activeProducts}, Low Stock=${lowStockProducts}`);
        
        // Update stats cards
        const totalEl = document.getElementById('totalProducts');
        const activeEl = document.getElementById('activeProducts');
        const lowStockEl = document.getElementById('lowStockProducts');
        
        if (totalEl) totalEl.textContent = totalProducts;
        if (activeEl) activeEl.textContent = activeProducts;
        if (lowStockEl) lowStockEl.textContent = lowStockProducts;
    }

    showLoadingState() {
        const productsTableBody = document.getElementById('productsTableBody');
        const productsGrid = document.getElementById('productsGrid');
        
        const loadingHtml = `
            <div class="text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-500">Loading products...</p>
            </div>
        `;
        
        if (productsTableBody) {
            productsTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${loadingHtml}</td></tr>`;
        }
        if (productsGrid) {
            productsGrid.innerHTML = loadingHtml;
        }
    }

    createProductCard(product) {
        // Try multiple possible image field names
        const primaryImage = product.primary_image_url || 
                            product.image_url || 
                            product.image || 
                            product.img || 
                            'https://via.placeholder.com/300x200?text=No+Image';
        const categoryName = product.categories_enhanced?.name || product.category || 'Uncategorized';
        const isLegacy = !!product.legacy_product_id;

        return `
            <div class="product-card bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6" data-product-id="${product.id}">
                <div class="flex items-start space-x-4">
                    <!-- Product Image -->
                    <div class="flex-shrink-0">
                        <img src="${primaryImage}" alt="${product.name}" class="w-20 h-20 object-cover rounded-lg">
                    </div>

                    <!-- Product Details -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between">
                            <div class="flex-1">
                                <h3 class="text-lg font-semibold text-gray-900 truncate">${product.name}</h3>
                                <p class="text-sm text-gray-600 mt-1">${categoryName}</p>
                                <div class="flex items-center space-x-4 mt-2">
                                    <span class="text-lg font-bold text-primary">₹${product.price}</span>
                                    ${product.original_price && product.original_price > product.price ? 
                                        `<span class="text-sm text-gray-500 line-through">₹${product.original_price}</span>` : ''}
                                    ${product.discount_percentage > 0 ? 
                                        `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">${product.discount_percentage}% OFF</span>` : ''}
                                </div>
                            </div>
                            
                            <!-- Status Badges -->
                            <div class="flex flex-col space-y-1">
                                <span class="px-2 py-1 text-xs rounded-full ${this.getStatusClass(product.status)}">${product.status}</span>
                                ${product.featured ? '<span class="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Featured</span>' : ''}
                                ${isLegacy ? '<span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Legacy</span>' : ''}
                            </div>
                        </div>

                        <!-- Product Info -->
                        <div class="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                            <span class="flex items-center">
                                <i class="fas fa-box mr-1"></i>
                                Stock: ${product.stock_quantity || 0}
                            </span>
                            ${product.size ? `<span class="flex items-center">
                                <i class="fas fa-weight-hanging mr-1"></i>
                                ${product.size}
                            </span>` : ''}
                            <span class="flex items-center">
                                <i class="fas fa-star mr-1"></i>
                                ${product.rating || 0}
                            </span>
                            ${product.sku ? `<span class="flex items-center"><i class="fas fa-barcode mr-1"></i>${product.sku}</span>` : ''}
                        </div>

                        <!-- Actions -->
                        <div class="mt-4 flex items-center space-x-2">
                            <button class="btn btn-sm btn-outline" onclick="adminProductsManager.viewProduct('${product.id}')">
                                <i class="fas fa-eye mr-1"></i>View
                            </button>
                            <button class="btn btn-sm btn-primary" onclick="adminProductsManager.editProduct('${product.id}')">
                                <i class="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="adminProductsManager.deleteProduct('${product.id}')">
                                <i class="fas fa-trash mr-1"></i>Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Legacy reference validation
    async validateLegacyReference(tableName, legacyId) {
        if (!legacyId) return true;

        try {
            const { data, error } = await window.supabaseClient
                .from(tableName)
                .select('id')
                .eq('id', legacyId)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.warn(`Legacy reference validation failed for ${tableName}:`, error);
                return false;
            }

            return !!data;
        } catch (error) {
            console.warn(`Legacy reference validation error for ${tableName}:`, error);
            return false;
        }
    }

    // Product CRUD operations
    async createProduct(productData) {
        try {
            // Validate legacy references if provided
            if (productData.legacy_product_id) {
                const isValid = await this.validateLegacyReference('products', productData.legacy_product_id);
                if (!isValid) {
                    throw new Error('Invalid legacy product reference');
                }
            }

            const { data, error } = await window.supabaseClient
                .from('products_enhanced')
                .insert([productData])
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error creating product:', error);
            throw error;
        }
    }

    async updateProduct(productId, updates) {
        try {
            const { data, error } = await window.supabaseClient
                .from('products_enhanced')
                .update(updates)
                .eq('id', productId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('❌ Error updating product:', error);
            throw error;
        }
    }

    async deleteProduct(productId) {
        try {
            const { error } = await window.supabaseClient
                .from('products_enhanced')
                .delete()
                .eq('id', productId);

            if (error) throw error;
        } catch (error) {
            console.error('❌ Error deleting product:', error);
            throw error;
        }
    }

    // UI Helper methods
    getStatusClass(status) {
        const statusClasses = {
            'active': 'bg-green-100 text-green-800',
            'inactive': 'bg-gray-100 text-gray-800',
            'draft': 'bg-yellow-100 text-yellow-800',
            'discontinued': 'bg-red-100 text-red-800'
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800';
    }

    showLoadingState() {
        const productsContainer = document.getElementById('productsContainer');
        if (productsContainer) {
            productsContainer.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
                    <p class="text-gray-600">Loading products...</p>
                </div>
            `;
        }
    }

    showError(message) {
        console.error('Error:', message);
        alert(message); // Temporary - replace with proper notification
    }

    showSuccess(message) {
        console.log('Success:', message);
        alert(message); // Temporary - replace with proper notification
    }

    // Modal methods (to be implemented)
    showAddProductModal() {
        console.log('Show add product modal');
        // Implement add product modal
    }

    editProduct(productId) {
        console.log('Edit product:', productId);
        // Implement edit product modal
    }

    viewProduct(productId) {
        console.log('View product:', productId);
        // Implement view product modal
    }

    deleteProduct(productId) {
        if (confirm('Are you sure you want to delete this product?')) {
            this.deleteProduct(productId).then(() => {
                this.loadProducts();
                this.showSuccess('Product deleted successfully');
            }).catch(error => {
                this.showError('Failed to delete product');
            });
        }
    }
}

// Initialize when DOM is loaded (only on standalone products page)
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on standalone products page, not dashboard
    const isProductsPage = window.location.pathname.includes('/admin/') && 
                           window.location.pathname.includes('products.html');
    if (isProductsPage && window.AdminProductsManager) {
        window.adminProductsManager = new AdminProductsManager();
    }
});

// Global functions for modal handling
function showAddProductModal() {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    if (modal) {
        modalTitle.textContent = 'Add Product';
        modal.classList.remove('hidden');
    }
}

function hideProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.classList.add('hidden');
        document.getElementById('productForm').reset();
    }
}

function handleProductSubmit(e) {
    e.preventDefault();
    // Handle form submission
    console.log('Product form submitted');
    hideProductModal();
}

function editProduct(productId) {
    console.log('Edit product:', productId);
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    if (modal) {
        modalTitle.textContent = 'Edit Product';
        modal.classList.remove('hidden');
    }
}

function deleteProduct(productId) {
    console.log('Delete product:', productId);
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Loose Products Helper Functions
function toggleLooseConfig(isLoose) {
    const looseConfig = document.getElementById('looseConfig');
    const sizeInput = document.getElementById('productSize');
    
    if (looseConfig) {
        if (isLoose) {
            looseConfig.classList.remove('hidden');
            if (sizeInput) {
                sizeInput.disabled = true;
                sizeInput.placeholder = 'Size will be configured below for loose products';
            }
        } else {
            looseConfig.classList.add('hidden');
            if (sizeInput) {
                sizeInput.disabled = false;
                sizeInput.placeholder = 'e.g., 1kg, 500ml, 1 dozen';
            }
        }
    }
}

function updateCommonSizes(productCategory) {
    const container = document.getElementById('commonSizesContainer');
    if (!container) return;

    if (productCategory === 'solid') {
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                    <input type="checkbox" value="250gm" class="mr-2"> 250gm
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="500gm" class="mr-2"> 500gm
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="1kg" class="mr-2"> 1kg
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="2kg" class="mr-2"> 2kg
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="5kg" class="mr-2"> 5kg
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="10kg" class="mr-2"> 10kg
                </label>
            </div>
        `;
    } else if (productCategory === 'liquid') {
        container.innerHTML = `
            <div class="grid grid-cols-2 gap-2">
                <label class="flex items-center">
                    <input type="checkbox" value="250ml" class="mr-2"> 250ml
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="500ml" class="mr-2"> 500ml
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="1L" class="mr-2"> 1L
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="2L" class="mr-2"> 2L
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="5L" class="mr-2"> 5L
                </label>
                <label class="flex items-center">
                    <input type="checkbox" value="10L" class="mr-2"> 10L
                </label>
            </div>
        `;
    }
}

function getSelectedCommonSizes() {
    const checkboxes = document.querySelectorAll('#commonSizesContainer input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function calculateLooseProductPrice(quantity, basePrice, baseUnit) {
    // Convert quantity to base unit and calculate price
    const numericQuantity = parseFloat(quantity.replace(/[^\d.]/g, ''));
    const unit = quantity.replace(/[\d.]/g, '');
    
    // Convert to base unit
    let baseQuantity = numericQuantity;
    if (baseUnit === 'kg' && unit === 'gm') {
        baseQuantity = numericQuantity / 1000;
    } else if (baseUnit === 'liter' && unit === 'ml') {
        baseQuantity = numericQuantity / 1000;
    }
    
    return (baseQuantity * basePrice).toFixed(2);
}

window.AdminProductsManager = AdminProductsManager;