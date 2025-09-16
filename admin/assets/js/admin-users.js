/**
 * Admin Users Management
 * Handles user CRUD operations and user analytics
 */

class AdminUsersManager {
    constructor() {
        if (!window.location.pathname.includes('/admin/')) {
            console.log('⚠️ AdminUsersManager: Not on admin page, skipping initialization');
            return;
        }
        
        this.users = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalUsers = 0;
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.selectedUsers = [];
        this.init();
    }

    async init() {
        try {
            console.log('👥 Initializing Admin Users Manager...');
            this.setupEventListeners();
            console.log('✅ Admin Users Manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing Admin Users Manager:', error);
        }
    }

    setupEventListeners() {
        const searchInput = document.getElementById('userSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.loadUsers();
                }, 500);
            });
        }

        const filterSelect = document.getElementById('statusFilter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.loadUsers();
            });
        }

        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                filterTabs.forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.loadUsers();
            });
        });

        const refreshBtn = document.getElementById('refreshUsers');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadUsers();
            });
        }
    }

    async loadUsers() {
        try {
            console.log('👥 Loading users...');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available, skipping user loading');
                return;
            }
            
            this.showLoadingState();

            const { data: ordersData, error: ordersError } = await window.supabaseClient
                .from('orders')
                .select('customer_name, customer_phone, customer_email, created_at, order_total')
                .order('created_at', { ascending: false });

            if (ordersError) {
                console.error('❌ Error loading orders data:', ordersError);
                this.showError('Failed to load users. Please try again.');
                return;
            }

            const userMap = new Map();
            ordersData.forEach(order => {
                const phone = order.customer_phone;
                if (phone && !userMap.has(phone)) {
                    userMap.set(phone, {
                        id: phone,
                        name: order.customer_name || 'Unknown',
                        phone: phone,
                        email: order.customer_email || '',
                        first_order: order.created_at,
                        last_order: order.created_at,
                        total_orders: 1,
                        total_spent: order.order_total || 0,
                        status: 'active'
                    });
                } else if (phone && userMap.has(phone)) {
                    const user = userMap.get(phone);
                    user.total_orders += 1;
                    user.total_spent += (order.order_total || 0);
                    if (new Date(order.created_at) > new Date(user.last_order)) {
                        user.last_order = order.created_at;
                    }
                }
            });

            this.users = Array.from(userMap.values());
            console.log(`✅ Loaded ${this.users.length} unique users from orders data`);

            this.renderUsers();

        } catch (error) {
            console.error('❌ Error in loadUsers:', error);
            this.showError('An unexpected error occurred while loading users.');
        }
    }

    renderUsers() {
        const usersGrid = document.getElementById('usersGrid');
        const usersTableBody = document.getElementById('usersTableBody');
        
        if (!usersGrid && !usersTableBody) return;

        let filteredUsers = this.users;
        
        if (this.currentFilter !== 'all') {
            switch (this.currentFilter) {
                case 'active':
                    filteredUsers = filteredUsers.filter(u => u.status === 'active');
                    break;
                case 'new':
                    const oneMonthAgo = new Date();
                    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                    filteredUsers = filteredUsers.filter(u => new Date(u.first_order) > oneMonthAgo);
                    break;
                case 'verified':
                    filteredUsers = filteredUsers.filter(u => u.email && u.email.includes('@'));
                    break;
                case 'vip':
                    filteredUsers = filteredUsers.filter(u => u.total_spent > 5000);
                    break;
            }
        }

        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filteredUsers = filteredUsers.filter(u => 
                u.name.toLowerCase().includes(query) ||
                u.phone.includes(query) ||
                (u.email && u.email.toLowerCase().includes(query))
            );
        }

        if (filteredUsers.length === 0) {
            const emptyMessage = `
                <div class="text-center py-12">
                    <i class="fas fa-users text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Users Found</h3>
                    <p class="text-gray-500 mb-4">${this.searchQuery ? 'Try adjusting your search criteria.' : 'No users match the current filter.'}</p>
                </div>
            `;
            
            if (usersGrid) {
                usersGrid.innerHTML = emptyMessage;
            }
            if (usersTableBody) {
                usersTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${emptyMessage}</td></tr>`;
            }
            return;
        }

        this.updateStats(filteredUsers);

        if (usersGrid) {
            usersGrid.innerHTML = filteredUsers.map(user => this.createUserCard(user)).join('');
        }
        if (usersTableBody) {
            usersTableBody.innerHTML = filteredUsers.map(user => this.createUserRow(user)).join('');
        }
    }

    createUserCard(user) {
        const initials = this.getInitials(user.name);
        const statusClass = this.getStatusClass(user);
        const statusText = this.getStatusText(user);
        const activityClass = this.getActivityClass(user);
        const totalSpent = user.total_spent || 0;

        return `
            <div class="user-card bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="user-avatar bg-blue-500">
                        ${initials}
                    </div>
                    <div class="flex items-center">
                        <span class="activity-indicator ${activityClass}"></span>
                        <span class="status-badge ${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="mb-4">
                    <h3 class="font-semibold text-gray-900 text-lg mb-1">${user.name}</h3>
                    <p class="text-sm text-gray-600 mb-2">${user.phone}</p>
                    ${user.email ? `<p class="text-sm text-gray-500 mb-3">${user.email}</p>` : ''}
                    
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Orders:</span>
                            <span class="text-sm font-semibold">${user.total_orders}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Total Spent:</span>
                            <span class="text-sm font-semibold">₹${totalSpent.toLocaleString()}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-sm text-gray-600">Joined:</span>
                            <span class="text-sm">${this.formatDate(user.first_order)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="viewUserDetails('${user.id}')" class="flex-1 btn-secondary text-sm">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    <button onclick="editUser('${user.id}')" class="flex-1 btn-primary text-sm">
                        <i class="fas fa-edit mr-1"></i>Edit
                    </button>
                </div>
            </div>
        `;
    }

    createUserRow(user) {
        const initials = this.getInitials(user.name);
        const statusClass = this.getStatusClass(user);
        const statusText = this.getStatusText(user);
        const activityClass = this.getActivityClass(user);
        const totalSpent = user.total_spent || 0;
        const joinedDate = this.formatDate(user.first_order);

        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <input type="checkbox" class="rounded border-gray-300" value="${user.id}">
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="user-avatar w-10 h-10 mr-3 bg-blue-500 text-sm">
                            ${initials}
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${user.name}</div>
                            <div class="text-sm text-gray-500 flex items-center">
                                <span class="activity-indicator ${activityClass}"></span>
                                ${this.getActivityText(user)}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${user.phone}</div>
                    ${user.email ? `<div class="text-sm text-gray-500">${user.email}</div>` : ''}
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm font-medium">${user.total_orders}</div>
                    <div class="text-sm text-gray-500">₹${totalSpent.toLocaleString()}</div>
                </td>
                <td class="px-6 py-4">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${joinedDate}</div>
                </td>
                <td class="px-6 py-4">
                    <div class="flex space-x-2">
                        <button onclick="viewUserDetails('${user.id}')" class="btn-secondary text-sm">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button onclick="editUser('${user.id}')" class="btn-primary text-sm">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateStats(users) {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const newUsers = users.filter(u => new Date(u.first_order) > oneMonthAgo).length;
        
        const totalOrders = users.reduce((sum, u) => sum + u.total_orders, 0);
        
        const totalEl = document.getElementById('totalUsers');
        const activeEl = document.getElementById('activeUsers');
        const newEl = document.getElementById('newUsers');
        const ordersEl = document.getElementById('totalOrders');
        
        if (totalEl) totalEl.textContent = totalUsers;
        if (activeEl) activeEl.textContent = activeUsers;
        if (newEl) newEl.textContent = newUsers;
        if (ordersEl) ordersEl.textContent = totalOrders;
    }

    showLoadingState() {
        const usersGrid = document.getElementById('usersGrid');
        const usersTableBody = document.getElementById('usersTableBody');
        
        const loadingHtml = `
            <div class="text-center py-12">
                <div class="loading-spinner mx-auto mb-4"></div>
                <p class="text-gray-500">Loading users...</p>
            </div>
        `;
        
        if (usersGrid) {
            usersGrid.innerHTML = loadingHtml;
        }
        if (usersTableBody) {
            usersTableBody.innerHTML = `<tr><td colspan="7" class="px-6 py-12">${loadingHtml}</td></tr>`;
        }
    }

    getInitials(name) {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }

    getStatusClass(user) {
        if (user.total_spent > 5000) return 'status-verified';
        if (user.email && user.email.includes('@')) return 'status-verified';
        return 'status-active';
    }

    getStatusText(user) {
        if (user.total_spent > 5000) return 'VIP';
        if (user.email && user.email.includes('@')) return 'Verified';
        return 'Active';
    }

    getActivityClass(user) {
        const lastOrder = new Date(user.last_order);
        const now = new Date();
        const daysDiff = (now - lastOrder) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 1) return 'activity-online';
        if (daysDiff < 7) return 'activity-recent';
        return 'activity-offline';
    }

    getActivityText(user) {
        const lastOrder = new Date(user.last_order);
        const now = new Date();
        const daysDiff = (now - lastOrder) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 1) return 'Active today';
        if (daysDiff < 7) return 'Active this week';
        return 'Inactive';
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
        console.error('❌ Users Error:', message);
    }

    showSuccess(message) {
        console.log('✅ Users Success:', message);
    }
}

function viewUserDetails(userId) {
    console.log('View user details:', userId);
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function editUser(userId) {
    console.log('Edit user:', userId);
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('/admin/') && window.AdminUsersManager) {
        window.adminUsersManager = new AdminUsersManager();
    }
});

window.AdminUsersManager = AdminUsersManager;
