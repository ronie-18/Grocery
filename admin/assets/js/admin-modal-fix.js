/**
 * Admin Modal and UI Fixes
 * Handles missing event listeners and UI interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Initializing admin modal fixes...');
    
    // ========================================
    // Modal Close Handlers
    // ========================================
    
    // Generic modal close function
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
    
    // Product Modal
    const closeProductModal = document.getElementById('closeProductModal');
    const closeProductModalBtn = document.getElementById('closeProductModalBtn');
    const cancelProduct = document.getElementById('cancelProduct');
    
    if (closeProductModal) {
        closeProductModal.addEventListener('click', () => hideModal('productModal'));
    }
    if (closeProductModalBtn) {
        closeProductModalBtn.addEventListener('click', () => hideModal('productModal'));
    }
    if (cancelProduct) {
        cancelProduct.addEventListener('click', () => hideModal('productModal'));
    }
    
    // Category Modal
    const closeCategoryModal = document.getElementById('closeModal');
    const cancelCategory = document.getElementById('cancelCategory');
    
    if (closeCategoryModal && document.getElementById('categoryModal')) {
        closeCategoryModal.addEventListener('click', () => hideModal('categoryModal'));
    }
    if (cancelCategory) {
        cancelCategory.addEventListener('click', () => hideModal('categoryModal'));
    }
    
    // Order Modal
    const closeOrderModal = document.getElementById('closeModal');
    const closeOrderModalBtn = document.getElementById('closeOrderModalBtn');
    
    if (closeOrderModal && document.getElementById('orderModal')) {
        closeOrderModal.addEventListener('click', () => hideModal('orderModal'));
    }
    if (closeOrderModalBtn) {
        closeOrderModalBtn.addEventListener('click', () => hideModal('orderModal'));
    }
    
    // Status Modal
    const closeStatusModal = document.getElementById('closeStatusModal');
    const cancelStatusUpdate = document.getElementById('cancelStatusUpdate');
    
    if (closeStatusModal) {
        closeStatusModal.addEventListener('click', () => hideModal('statusModal'));
    }
    if (cancelStatusUpdate) {
        cancelStatusUpdate.addEventListener('click', () => hideModal('statusModal'));
    }
    
    // Delete Modal
    const cancelDelete = document.getElementById('cancelDelete');
    if (cancelDelete) {
        cancelDelete.addEventListener('click', () => hideModal('deleteModal'));
    }
    
    // User Modal
    const closeUserModal = document.getElementById('closeModal');
    if (closeUserModal && document.getElementById('userModal')) {
        closeUserModal.addEventListener('click', () => hideModal('userModal'));
    }
    
    // Edit User Modal
    const closeEditModal = document.getElementById('closeEditModal');
    const cancelEditUser = document.getElementById('cancelEditUser');
    
    if (closeEditModal) {
        closeEditModal.addEventListener('click', () => hideModal('editUserModal'));
    }
    if (cancelEditUser) {
        cancelEditUser.addEventListener('click', () => hideModal('editUserModal'));
    }
    
    // ========================================
    // View Toggle (Grid/Table)
    // ========================================
    
    const gridViewBtn = document.getElementById('gridViewBtn');
    const tableViewBtn = document.getElementById('tableViewBtn');
    const gridView = document.getElementById('gridView');
    const tableView = document.getElementById('tableView');
    
    if (gridViewBtn && tableViewBtn && gridView && tableView) {
        gridViewBtn.addEventListener('click', function() {
            gridView.style.display = 'block';
            tableView.style.display = 'none';
            gridViewBtn.classList.add('bg-blue-50', 'text-blue-600');
            tableViewBtn.classList.remove('bg-blue-50', 'text-blue-600');
            
            // Save preference
            localStorage.setItem('adminViewMode', 'grid');
        });
        
        tableViewBtn.addEventListener('click', function() {
            tableView.style.display = 'block';
            gridView.style.display = 'none';
            tableViewBtn.classList.add('bg-blue-50', 'text-blue-600');
            gridViewBtn.classList.remove('bg-blue-50', 'text-blue-600');
            
            // Save preference
            localStorage.setItem('adminViewMode', 'table');
        });
        
        // Restore saved view preference
        const savedView = localStorage.getItem('adminViewMode');
        if (savedView === 'grid') {
            gridViewBtn.click();
        }
    }
    
    // ========================================
    // Sidebar Toggle for Mobile
    // ========================================
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    const adminSidebar = document.getElementById('adminSidebar');
    
    if (sidebarToggle && adminSidebar) {
        sidebarToggle.addEventListener('click', function() {
            adminSidebar.classList.toggle('sidebar-collapsed');
        });
    }
    
    // ========================================
    // Click Outside Modal to Close
    // ========================================
    
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal(modal.id);
            }
        });
    });
    
    // ========================================
    // Escape Key to Close Modals
    // ========================================
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
            activeModals.forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
    
    // ========================================
    // Bulk Selection Checkbox
    // ========================================
    
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('tbody input[type="checkbox"]');
            checkboxes.forEach(cb => {
                cb.checked = selectAllCheckbox.checked;
            });
            
            // Show/hide bulk actions button
            const bulkActionsBtn = document.getElementById('bulkActionsBtn');
            if (bulkActionsBtn) {
                bulkActionsBtn.style.display = selectAllCheckbox.checked ? 'inline-flex' : 'none';
            }
        });
    }
    
    // ========================================
    // Image Upload Preview
    // ========================================
    
    const productImages = document.getElementById('productImages');
    if (productImages) {
        const uploadArea = productImages.parentElement;
        
        uploadArea.addEventListener('click', () => productImages.click());
        
        productImages.addEventListener('change', function(e) {
            const files = e.target.files;
            if (files.length > 0) {
                uploadArea.querySelector('p').textContent = `${files.length} file(s) selected`;
            }
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('border-blue-500', 'bg-blue-50');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('border-blue-500', 'bg-blue-50');
            
            const files = e.dataTransfer.files;
            productImages.files = files;
            
            if (files.length > 0) {
                uploadArea.querySelector('p').textContent = `${files.length} file(s) selected`;
            }
        });
    }
    
    // ========================================
    // Auto-generate Slug from Name
    // ========================================
    
    const categoryName = document.getElementById('categoryName');
    const categorySlug = document.getElementById('categorySlug');
    
    if (categoryName && categorySlug) {
        categoryName.addEventListener('input', function() {
            // Only auto-generate if slug is empty or hasn't been manually edited
            if (!categorySlug.dataset.manuallyEdited) {
                const slug = categoryName.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
                categorySlug.value = slug;
            }
        });
        
        categorySlug.addEventListener('input', function() {
            // Mark as manually edited if user types in slug field
            if (categorySlug.value) {
                categorySlug.dataset.manuallyEdited = 'true';
            }
        });
    }
    
    // ========================================
    // Status Badge Color Updates
    // ========================================
    
    function updateStatusBadgeColor(selectElement) {
        const status = selectElement.value;
        const statusClasses = {
            'placed': 'status-placed',
            'confirmed': 'status-confirmed',
            'preparing': 'status-preparing',
            'out_for_delivery': 'status-out-for-delivery',
            'delivered': 'status-delivered',
            'cancelled': 'status-cancelled'
        };
        
        // Remove all status classes
        Object.values(statusClasses).forEach(cls => {
            selectElement.classList.remove(cls);
        });
        
        // Add current status class
        if (statusClasses[status]) {
            selectElement.classList.add(statusClasses[status]);
        }
    }
    
    const statusSelects = document.querySelectorAll('select[name="status"]');
    statusSelects.forEach(select => {
        select.addEventListener('change', function() {
            updateStatusBadgeColor(this);
        });
        updateStatusBadgeColor(select);
    });
    
    // ========================================
    // Confirmation Dialogs for Destructive Actions
    // ========================================
    
    window.confirmDelete = function(itemType, itemName) {
        return confirm(`Are you sure you want to delete this ${itemType}?\n\n${itemName || ''}\n\nThis action cannot be undone.`);
    };
    
    console.log('✅ Admin modal fixes initialized successfully');
});

