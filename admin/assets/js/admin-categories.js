/**
 * Admin Categories Management
 * Handles category CRUD operations with enhanced features
 */

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
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => {
                this.showAddCategoryModal();
            });
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

            // Build query parameters - try enhanced table first, then fallback to original
            let query = window.supabaseClient
                .from('categories_enhanced')
                .select('*');

            // Apply filters
            if (this.currentFilter !== 'all') {
                switch (this.currentFilter) {
                    case 'active':
                        query = query.eq('is_active', true);
                        break;
                    case 'inactive':
                        query = query.eq('is_active', false);
                        break;
                    case 'featured':
                        query = query.eq('is_featured', true);
                        break;
                }
            }

            // Apply search
            if (this.searchQuery) {
                query = query.or(`name.ilike.%${this.searchQuery}%,description.ilike.%${this.searchQuery}%`);
            }

            // Apply pagination
            query = query.order('created_at', { ascending: false });
            const from = (this.currentPage - 1) * this.itemsPerPage;
            const to = from + this.itemsPerPage - 1;
            query = query.range(from, to);

            const { data: categories, error } = await query;

            if (error) {
                console.error('❌ Error loading categories:', error);
                this.showError('Failed to load categories. Please try again.');
                return;
            }

            console.log(`✅ Loaded ${categories?.length || 0} categories from enhanced table`);

            // If no categories in enhanced table, try original categories table
            if (!categories || categories.length === 0) {
                console.log('🏷️ No categories in enhanced table, trying original categories table...');
                try {
                    const { data: originalCategories, error: originalError } = await window.supabaseClient
                        .from('categories')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (!originalError && originalCategories && originalCategories.length > 0) {
                        console.log(`✅ Loaded ${originalCategories.length} categories from original table`);
                        this.renderCategories(originalCategories);
                        return;
                    }
                } catch (fallbackError) {
                    console.warn('⚠️ Fallback to original categories table failed:', fallbackError);
                }
            }

            this.renderCategories(categories || []);

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

        return `
            <div class="category-card bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="category-icon" style="background-color: ${color}">
                        <i class="${icon}"></i>
                    </div>
                    <span class="status-badge ${statusClass}">${status}</span>
                </div>
                
                <div class="mb-4">
                    <h3 class="font-semibold text-gray-900 text-lg mb-2">${category.name}</h3>
                    <p class="text-sm text-gray-600 mb-3">${category.description || 'No description'}</p>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">Products:</span>
                        <span class="text-sm font-semibold">${productCount}</span>
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

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="rounded border-gray-300" value="${category.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="category-icon w-10 h-10 mr-3" style="background-color: ${color}">
                            <i class="${icon} text-sm"></i>
                        </div>
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
                    <span class="text-sm font-medium">${productCount}</span>
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
        const modal = document.getElementById('categoryModal');
        const modalTitle = document.getElementById('modalTitle');
        if (modal) {
            modalTitle.textContent = 'Add Category';
            modal.classList.remove('hidden');
        }
    }

    hideCategoryModal() {
        const modal = document.getElementById('categoryModal');
        if (modal) {
            modal.classList.add('hidden');
            document.getElementById('categoryForm').reset();
        }
    }

    handleCategorySubmit(e) {
        e.preventDefault();
        // Handle form submission
        console.log('Category form submitted');
        this.hideCategoryModal();
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
        // You could show a toast notification here instead of alert
        console.log('❌ Error:', message);
    }

    showSuccess(message) {
        console.log('✅ Categories Success:', message);
        // You could show a toast notification here instead of alert
        console.log('✅ Success:', message);
    }
}

// Global functions for modal handling
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

// Initialize when DOM is loaded (only on admin pages)
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize on admin pages
    if (window.location.pathname.includes('/admin/') && window.AdminCategoriesManager) {
        window.adminCategoriesManager = new AdminCategoriesManager();
    }
});

window.AdminCategoriesManager = AdminCategoriesManager;
