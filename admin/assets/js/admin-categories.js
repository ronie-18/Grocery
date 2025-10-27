/**
 * Admin Categories Management
 * Handles category CRUD operations with enhanced features
 * Version: 2.4 - Removed icon and color fields from form
 */

console.log('🏷️ Admin Categories Manager v2.4 loaded - Form simplified!');

class AdminCategoriesManager {
    constructor() {
        // Only initialize on admin pages
        if (!window.location.pathname.includes('/admin/')) {
            console.log('⚠️ AdminCategoriesManager: Not on admin page, skipping initialization');
            return;
        }
        
        this.categories = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalCategories = 0;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedCategories = [];
        this.init();
    }

    async init() {
        try {
            console.log('🏷️ Initializing Admin Categories Manager...');
            this.setupEventListeners();
            this.populateIconPicker();
            // Don't auto-load categories in dashboard context - let the dashboard call loadCategories when needed
            const isStandalonePage = window.location.pathname.includes('categories.html');
            if (isStandalonePage) {
                await this.loadCategories();
            }
            console.log('✅ Admin Categories Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Admin Categories Manager:', error);
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('categorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadCategories();
                }, 500);
            });
        }

        // Filter functionality
        const filterSelect = document.getElementById('statusFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.loadCategories();
            });
        }

        // Add category button
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        console.log('🔍 Add Category Button found:', !!addCategoryBtn);
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                console.log('🔘 Add Category button clicked!');
                this.showAddCategoryModal();
            });
            console.log('✅ Add Category button event listener attached');
        } else {
            console.error('❌ Add Category button not found in DOM');
        }

        // Modal controls
        const closeModal = document.getElementById('closeModal');
        const cancelCategory = document.getElementById('cancelCategory');
        if (closeModal) closeModal.addEventListener('click', () => this.hideCategoryModal());
        if (cancelCategory) cancelCategory.addEventListener('click', () => this.hideCategoryModal());

        // Category form
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) {
            categoryForm.addEventListener('submit', (e) => this.handleCategorySubmit(e));
        }

        // Filter tabs
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                filterTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.loadCategories();
            });
        });

        // View toggle
        const gridViewBtn = document.getElementById('gridViewBtn');
        const tableViewBtn = document.getElementById('tableViewBtn');
        const gridView = document.getElementById('gridView');
        const tableView = document.getElementById('tableView');

        if (gridViewBtn && tableViewBtn && gridView && tableView) {
            gridViewBtn.addEventListener('click', () => {
                gridView.style.display = 'block';
                tableView.style.display = 'none';
                gridViewBtn.classList.add('bg-blue-50', 'text-blue-600');
                tableViewBtn.classList.remove('bg-blue-50', 'text-blue-600');
            });

            tableViewBtn.addEventListener('click', () => {
                tableView.style.display = 'block';
                gridView.style.display = 'none';
                tableViewBtn.classList.add('bg-blue-50', 'text-blue-600');
                gridViewBtn.classList.remove('bg-blue-50', 'text-blue-600');
            });
        }

        // Refresh button
        const refreshBtn = document.getElementById('refreshCategories');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadCategories();
            });
        }
    }

    async loadCategories() {
        try {
            console.log('🏷️ Loading categories...');
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available, skipping category loading');
                return;
            }
            
            this.showLoadingState();

            // Load categories from Supabase
            console.log('🏷️ Loading from categories table...');
            const { data: categories, error } = await window.supabaseClient
                .from('categories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('❌ Error loading categories:', error);
                this.showError('Failed to load categories from Supabase.');
                return;
            }

            console.log(`✅ Loaded ${categories?.length || 0} categories`);
            if (categories && categories.length > 0) {
                console.log('📊 Sample category:', categories[0]);
            }

            // Load ALL products to count per category
            console.log('📦 Loading products to count per category...');
            const { data: products, error: productsError } = await window.supabaseClient
                .from('products')
                .select('category');

            if (productsError) {
                console.error('❌ Error loading products for counting:', productsError);
            }

            // Count products per category
            const productCounts = {};
            if (products && products.length > 0) {
                products.forEach(product => {
                    const categoryName = product.category || 'Uncategorized';
                    productCounts[categoryName] = (productCounts[categoryName] || 0) + 1;
                });
                console.log('📊 Product counts by category:', productCounts);
            }

            // Add product count to each category
            const categoriesWithCounts = (categories || []).map(cat => ({
                ...cat,
                product_count: productCounts[cat.name] || 0
            }));

            console.log(`✅ Added product counts to categories`);
            this.renderCategories(categoriesWithCounts);

        } catch (error) {
            console.error('❌ Error in loadCategories:', error);
            this.showError('An unexpected error occurred while loading categories.');
        }
    }

    renderCategories(categories) {
        const categoriesGrid = document.getElementById('categoriesGrid');
        const categoriesTableBody = document.getElementById('categoriesTableBody');
        
        if (!categoriesGrid && !categoriesTableBody) return;

        if (categories.length === 0) {
            const emptyMessage = `
                <div class="text-center py-12">
                    <i class="fas fa-tags text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Categories Found</h3>
                    <p class="text-gray-500 mb-4">${this.searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first category.'}</p>
                    ${!this.searchQuery ? '<button class="btn-primary" onclick="adminCategoriesManager.showAddCategoryModal()">Add Category</button>' : ''}
                </div>
            `;
            
            if (categoriesGrid) {
                categoriesGrid.innerHTML = emptyMessage;
            }
            if (categoriesTableBody) {
                categoriesTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${emptyMessage}</td></tr>`;
            }
            return;
        }

        // Update stats
        this.updateStats(categories);

        if (categoriesGrid) {
            categoriesGrid.innerHTML = categories.map(category => this.createCategoryCard(category)).join('');
        }
        if (categoriesTableBody) {
            categoriesTableBody.innerHTML = categories.map(category => this.createCategoryRow(category)).join('');
        }
    }

    createCategoryCard(category) {
        const icon = category.icon || 'fas fa-tag';
        const color = category.color || '#3b82f6';
        const status = category.is_active !== undefined ? (category.is_active ? 'Active' : 'Inactive') : 'Active';
        const statusClass = category.is_active !== undefined ? (category.is_active ? 'status-active' : 'status-inactive') : 'status-active';
        const productCount = category.product_count || 0;
        
        // Check for image - try multiple possible field names
        const categoryImage = category.image || category.image_url || category.icon_url || null;

        return `
            <div class="category-card bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    ${categoryImage ? `
                        <div class="category-icon" style="background-color: ${color}; overflow: hidden;">
                            <img src="${categoryImage}" alt="${category.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            <i class="${icon}" style="display: none;"></i>
                        </div>
                    ` : `
                        <div class="category-icon" style="background-color: ${color}">
                            <i class="${icon}"></i>
                        </div>
                    `}
                    <span class="status-badge ${statusClass}">${status}</span>
                </div>
                
                <div class="mb-4">
                    <h3 class="font-semibold text-gray-900 text-lg mb-2">${category.name}</h3>
                    <p class="text-sm text-gray-600 mb-3">${category.description || 'No description'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Products:</span>
                        <span class="text-sm font-semibold text-blue-600">${productCount}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="editCategory('${category.id}')" class="flex-1 btn-secondary text-sm">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                    <button onclick="deleteCategory('${category.id}')" class="flex-1 btn-danger text-sm">
                        <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                </div>
            </div>
        `;
    }

    createCategoryRow(category) {
        const icon = category.icon || 'fas fa-tag';
        const color = category.color || '#3b82f6';
        const status = category.is_active !== undefined ? (category.is_active ? 'Active' : 'Inactive') : 'Active';
        const statusClass = category.is_active !== undefined ? (category.is_active ? 'status-active' : 'status-inactive') : 'status-active';
        const productCount = category.product_count || 0;
        const createdDate = this.formatDate(category.created_at);
        
        // Check for image - try multiple possible field names
        const categoryImage = category.image || category.image_url || category.icon_url || null;

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="rounded border-gray-300" value="${category.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        ${categoryImage ? `
                            <div class="category-icon w-10 h-10 mr-3" style="background-color: ${color}; overflow: hidden;">
                                <img src="${categoryImage}" alt="${category.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <i class="${icon} text-sm" style="display: none;"></i>
                            </div>
                        ` : `
                            <div class="category-icon w-10 h-10 mr-3" style="background-color: ${color}">
                                <i class="${icon} text-sm"></i>
                            </div>
                        `}
                        <div>
                            <div class="font-medium text-gray-900">${category.name}</div>
                            <div class="text-sm text-gray-500">${category.slug || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${category.description || 'No description'}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="text-sm font-bold text-blue-600">${productCount}</span>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${statusClass}">${status}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${createdDate}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="editCategory('${category.id}')" class="btn-secondary text-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCategory('${category.id}')" class="btn-danger text-sm">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateStats(categories) {
        const totalCategories = categories.length;
        const activeCategories = categories.filter(c => c.is_active !== false).length;
        const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);
        const popularCategory = categories.reduce((max, c) => (c.product_count || 0) > (max.product_count || 0) ? c : max, categories[0]);
        
        // Update stats cards
        const totalEl = document.getElementById('totalCategories');
        const activeEl = document.getElementById('activeCategories');
        const productsEl = document.getElementById('totalProducts');
        const popularEl = document.getElementById('popularCategory');
        
        if (totalEl) totalEl.textContent = totalCategories;
        if (activeEl) activeEl.textContent = activeCategories;
        if (productsEl) productsEl.textContent = totalProducts;
        if (popularEl) popularEl.textContent = popularCategory ? popularCategory.name : '-';
    }

    showLoadingState() {
        const categoriesGrid = document.getElementById('categoriesGrid');
        const categoriesTableBody = document.getElementById('categoriesTableBody');
        
        const loadingHtml = `
            <div class="text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-500">Loading categories...</p>
            </div>
        `;
        
        if (categoriesGrid) {
            categoriesGrid.innerHTML = loadingHtml;
        }
        if (categoriesTableBody) {
            categoriesTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${loadingHtml}</td></tr>`;
        }
    }

    populateIconPicker() {
        const iconPicker = document.getElementById('iconPicker');
        if (!iconPicker) return;

        const icons = [
            'fas fa-tag', 'fas fa-tags', 'fas fa-apple-alt', 'fas fa-carrot', 'fas fa-bread-slice',
            'fas fa-cheese', 'fas fa-fish', 'fas fa-drumstick-bite', 'fas fa-egg', 'fas fa-milk',
            'fas fa-coffee', 'fas fa-wine-bottle', 'fas fa-beer', 'fas fa-ice-cream', 'fas fa-cookie',
            'fas fa-candy-cane', 'fas fa-birthday-cake', 'fas fa-pizza-slice', 'fas fa-hamburger',
            'fas fa-hotdog', 'fas fa-bacon', 'fas fa-lemon', 'fas fa-pepper-hot', 'fas fa-seedling',
            'fas fa-leaf', 'fas fa-tree', 'fas fa-flower', 'fas fa-spa', 'fas fa-heart',
            'fas fa-star', 'fas fa-gem', 'fas fa-crown', 'fas fa-gift', 'fas fa-birthday-cake'
        ];

        iconPicker.innerHTML = icons.map(icon => `
            <div class="icon-option" data-icon="${icon}">
                <i class="${icon}"></i>
            </div>
        `).join('');

        // Add click handlers for icon selection
        iconPicker.addEventListener('click', (e) => {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                // Remove previous selection
                iconPicker.querySelectorAll('.icon-option').forEach(opt => opt.classList.remove('selected'));
                // Add selection to clicked option
                iconOption.classList.add('selected');
                // Update hidden input
                document.getElementById('selectedIcon').value = iconOption.dataset.icon;
            }
        });
    }

    showAddCategoryModal() {
        console.log('🔓 showAddCategoryModal called');
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('modalTitle');
        
        console.log('🔍 Modal element:', !!modal);
        console.log('🔍 Modal title element:', !!modalTitle);
        
        if (modal) {
            if (modalTitle) {
                modalTitle.textContent = 'Add Category';
            }
            modal.classList.remove('hidden');
            console.log('✅ Modal should now be visible');
            
            // Setup auto-slug generation
            const nameInput = document.getElementById('categoryName');
            const slugInput = document.getElementById('categorySlug');
            
            console.log('🔍 Name input:', !!nameInput);
            console.log('🔍 Slug input:', !!slugInput);
            
            if (nameInput && slugInput) {
                // Remove previous listeners to avoid duplicates
                const newNameInput = nameInput.cloneNode(true);
                nameInput.parentNode.replaceChild(newNameInput, nameInput);
                
                newNameInput.addEventListener('input', function() {
                    // Auto-generate slug from name
                    const slug = this.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '') // Remove special characters
                        .replace(/\s+/g, '-') // Replace spaces with hyphens
                        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
                    slugInput.value = slug;
                    console.log('📝 Auto-generated slug:', slug);
                });
                console.log('✅ Auto-slug generation setup');
            }
        } else {
            console.error('❌ Modal element not found in DOM!');
        }
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('categoryForm').reset();
        }
    }

    async handleCategorySubmit(e) {
        e.preventDefault();
        
        try {
            console.log('💾 Submitting category form...');
            
            // Get form values
            const name = document.getElementById('categoryName').value.trim();
            const slug = document.getElementById('categorySlug').value.trim();
            const status = document.getElementById('categoryStatus').value;
            const description = document.getElementById('categoryDescription').value.trim();
            const imageUrl = document.getElementById('categoryImage')?.value.trim() || '';
            
            // Set default icon and color
            const icon = 'fas fa-tag';
            const color = '#3b82f6';
            
            // Validate required fields
            if (!name || !slug) {
                this.showError('Please fill in all required fields');
                return;
            }
            
            console.log('📝 Category data:', { name, slug, icon, color, status, description });
            
            // Check if Supabase client is available
            if (!window.supabaseClient) {
                this.showError('Database connection not available');
                return;
            }
            
            // Create category object matching Supabase schema
            const categoryData = {
                name: name,
                slug: slug,
                icon: icon,
                color: color,
                image: imageUrl || null,
                description: description || null,
                is_active: status === 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('💾 Inserting category into Supabase...', categoryData);
            
            // Insert into Supabase
            const { data, error } = await window.supabaseClient
                .from('categories')
                .insert([categoryData])
                .select();
            
            if (error) {
                console.error('❌ Supabase error:', error);
                this.showError(`Failed to save category: ${error.message}`);
                return;
            }
            
            console.log('✅ Category saved successfully:', data);
            this.showSuccess(`Category "${name}" added successfully!`);
            
            // Close modal and reload categories
            this.hideCategoryModal();
            await this.loadCategories();
            
        } catch (error) {
            console.error('❌ Error saving category:', error);
            this.showError(`An error occurred: ${error.message}`);
        }
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    showError(message) {
        console.error('❌ Categories Error:', message);
        alert('❌ Error: ' + message);
    }

    showSuccess(message) {
        console.log('✅ Categories Success:', message);
        alert('✅ ' + message);
    }
}

// Global functions for modal handling
function showAddCategoryModal() {
    console.log('🔘 Global showAddCategoryModal called');
    if (window.adminCategoriesManager) {
        window.adminCategoriesManager.showAddCategoryModal();
    } else {
        console.error('❌ adminCategoriesManager not found');
    }
}

function editCategory(categoryId) {
    console.log('Edit category:', categoryId);
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    if (modal) {
        modalTitle.textContent = 'Edit Category';
        modal.classList.remove('hidden');
    }
}

function deleteCategory(categoryId) {
    console.log('Delete category:', categoryId);
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Initialize when DOM is loaded (only on standalone categories page)
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on standalone categories page, not dashboard
    const isCategoriesPage = window.location.pathname.includes('/admin/') && 
                             window.location.pathname.includes('categories.html');
    if (isCategoriesPage && window.AdminCategoriesManager) {
        window.adminCategoriesManager = new AdminCategoriesManager();
    }
});

window.AdminCategoriesManager = AdminCategoriesManager;
