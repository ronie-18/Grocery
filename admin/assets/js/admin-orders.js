/**
 * Admin Orders Management
 * Near & Now Grocery App
 */

class AdminOrdersManager {
    constructor() {
        this.orders = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.totalOrders = 0;
        this.filters = {
            status: 'all',
            dateRange: 'all',
            search: ''
        };
        
        this.init();
    }

    async init() {
        try {
            console.log('📦 Initializing admin orders manager...');
            this.setupEventListeners();
            console.log('✅ Admin orders manager initialized');
            // Don't load orders immediately - wait for user to click on Orders section
        } catch (error) {
            console.error('❌ Error initializing orders manager:', error);
        }
    }

    async loadOrders() {
        try {
            console.log('📦 Loading orders from database...');
            
            // First, let's test if the orders table exists
            console.log('🔍 Testing Supabase connection...');
            console.log('Supabase client:', window.supabaseClient);
            
            if (!window.supabaseClient) {
                throw new Error('Supabase client not initialized');
            }

            // Test basic connection first
            console.log('🔍 Testing basic Supabase connection...');
            const { data: testData, error: testError } = await window.supabaseClient
                .from('orders')
                .select('count', { count: 'exact', head: true });
            
            if (testError) {
                console.error('❌ Basic connection test failed:', testError);
                throw new Error(`Connection test failed: ${testError.message}`);
            }
            
            console.log('✅ Basic connection test passed. Total orders:', testData);
            
            let query = window.supabaseClient
                .from('orders')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (this.filters.status !== 'all') {
                query = query.eq('order_status', this.filters.status);
            }

            if (this.filters.search) {
                query = query.or(`customer_name.ilike.%${this.filters.search}%,customer_phone.ilike.%${this.filters.search}%`);
            }

            const from = (this.currentPage - 1) * this.itemsPerPage;
            const to = from + this.itemsPerPage - 1;
            query = query.range(from, to);

            const { data, error, count } = await query;

            if (error) {
                console.error('❌ Supabase error details:', error);
                console.error('❌ Error code:', error.code);
                console.error('❌ Error message:', error.message);
                console.error('❌ Error details:', error.details);
                console.error('❌ Error hint:', error.hint);
                
                if (error.code === 'PGRST116') {
                    throw new Error('Orders table does not exist. Please run the orders-table-setup.sql script in your Supabase database.');
                } else if (error.code === '42P01') {
                    throw new Error('Orders table not found. Please create the orders table first.');
                } else {
                    throw new Error(`Database error: ${error.message}`);
                }
            }

            this.orders = data || [];
            this.totalOrders = count || 0;

            console.log(`✅ Loaded ${this.orders.length} orders (${this.totalOrders} total)`);
            
            this.renderOrders();
            
            // Update dashboard stats when orders are loaded
            if (window.adminDashboard) {
                window.adminDashboard.loadStats();
            }

        } catch (error) {
            console.error('❌ Error loading orders:', error);
            
            // Show error in the table instead of popup
            const ordersBody = document.getElementById('ordersBody');
            if (ordersBody) {
                ordersBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center py-8">
                            <div class="text-red-500">
                                <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                                <p>Error loading orders</p>
                                <p class="text-sm mt-2">${error.message}</p>
                                <button class="btn btn-primary btn-sm mt-4" onclick="adminOrdersManager.loadOrders()">
                                    <i class="fas fa-retry mr-2"></i>Retry
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
        }
    }

    renderOrders() {
        const ordersTableBody = document.getElementById('ordersTableBody');
        const ordersGrid = document.getElementById('ordersGrid');
        
        if (!ordersTableBody && !ordersGrid) return;

        if (this.orders.length === 0) {
            const emptyMessage = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No Orders Found</h3>
                    <p class="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                </div>
            `;
            
            if (ordersTableBody) {
                ordersTableBody.innerHTML = `<tr><td colspan="8" class="px-6 py-12">${emptyMessage}</td></tr>`;
            }
            if (ordersGrid) {
                ordersGrid.innerHTML = emptyMessage;
            }
            return;
        }

        // Update stats
        this.updateStats();

        if (ordersTableBody) {
            ordersTableBody.innerHTML = this.orders.map(order => this.createOrderRow(order)).join('');
        }
        if (ordersGrid) {
            ordersGrid.innerHTML = this.orders.map(order => this.createOrderCard(order)).join('');
        }
    }

    createOrderRow(order) {
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${order.order_number || `#${order.id.slice(-8)}`}</div>
                    <div class="text-sm text-gray-500">${this.formatDate(order.created_at)}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="font-medium">${order.customer_name || 'N/A'}</div>
                    <div class="text-sm text-gray-500">${order.customer_phone || 'N/A'}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm">${this.getItemsCount(order.items)} items</div>
                </td>
                <td class="px-4 py-3 font-medium">₹${order.order_total || 0}</td>
                <td class="px-4 py-3">
                    <span class="badge badge-${this.getStatusClass(order.order_status)}">
                        ${this.formatStatus(order.order_status)}
                    </span>
                </td>
                <td class="px-4 py-3">
                    <div class="text-sm">${this.formatDate(order.created_at)}</div>
                </td>
                <td class="px-4 py-3">
                    <div class="flex space-x-2">
                        <button class="btn btn-primary btn-sm" onclick="adminOrdersManager.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="adminOrdersManager.updateStatus('${order.id}')">
                            <i class="fas fa-cog"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getItemsCount(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    }

    getStatusClass(status) {
        const statusClasses = {
            'placed': 'info',
            'confirmed': 'info',
            'preparing': 'warning',
            'out_for_delivery': 'warning',
            'delivered': 'success',
            'cancelled': 'error'
        };
        return statusClasses[status] || 'secondary';
    }

    formatStatus(status) {
        const statusTexts = {
            'placed': 'Placed',
            'confirmed': 'Confirmed',
            'preparing': 'Preparing',
            'out_for_delivery': 'Out for Delivery',
            'delivered': 'Delivered',
            'cancelled': 'Cancelled'
        };
        return statusTexts[status] || status;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }


    async viewOrder(orderId) {
        try {
            const { data: order, error } = await window.supabaseClient
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) {
                throw new Error(`Failed to load order: ${error.message}`);
            }

            this.showOrderDetails(order);

        } catch (error) {
            console.error('❌ Error viewing order:', error);
            this.showError('Failed to load order details');
        }
    }

    showOrderDetails(order) {
        const itemsList = order.items ? order.items.map(item => 
            `<li>${item.name || item.product_name} x ${item.quantity} - ₹${item.price || 0}</li>`
        ).join('') : '<li>No items found</li>';

        const details = `
Order Details:
- Order Number: ${order.order_number || order.id}
- Customer: ${order.customer_name}
- Phone: ${order.customer_phone}
- Email: ${order.customer_email}
- Status: ${this.formatStatus(order.order_status)}
- Total: ₹${order.order_total}
- Items: ${itemsList}
        `;

        alert(details);
    }

    async updateStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        const statusOptions = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        const currentStatus = order.order_status;
        const availableStatuses = statusOptions.filter(status => status !== currentStatus);

        if (availableStatuses.length === 0) {
            this.showError('No status updates available');
            return;
        }

        const newStatus = prompt(`Update order status:\n\nCurrent: ${this.formatStatus(currentStatus)}\n\nAvailable: ${availableStatuses.join(', ')}`);
        
        if (newStatus && newStatus !== currentStatus && availableStatuses.includes(newStatus)) {
            await this.updateOrderStatus(orderId, newStatus);
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            console.log(`🔄 Updating order ${orderId} status to: ${newStatus}`);

            const { data, error } = await window.supabaseClient
                .from('orders')
                .update({ 
                    order_status: newStatus,
                    updated_at: new Date().toISOString(),
                    ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() })
                })
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to update order status: ${error.message}`);
            }

            this.showSuccess(`Order status updated to ${this.formatStatus(newStatus)}`);
            await this.loadOrders();
            
            // Trigger stats refresh in dashboard
            window.dispatchEvent(new CustomEvent('ordersUpdated'));

        } catch (error) {
            console.error('❌ Error updating order status:', error);
            this.showError('Failed to update order status');
        }
    }

    setupEventListeners() {
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.currentPage = 1;
                this.loadOrders();
            });
        }

        const searchInput = document.getElementById('orderSearch');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.filters.search = e.target.value;
                    this.currentPage = 1;
                    this.loadOrders();
                }, 500);
            });
        }

        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadOrders();
            });
        }
    }

    showError(message) {
        console.error('Orders Error:', message);
        // Don't show popup alerts - errors are now shown in the UI
    }

    showSuccess(message) {
        console.log('Orders Success:', message);
        // You could show a toast notification here instead of alert
        console.log('✅ Success:', message);
    }
    createOrderCard(order) {
        const statusClass = this.getStatusClass(order.order_status);
        const statusText = this.getStatusText(order.order_status);
        
        return `
            <div class="order-card bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h3 class="font-semibold text-gray-900">${order.order_number || `#${order.id.slice(-8)}`}</h3>
                        <p class="text-sm text-gray-500">${this.formatDate(order.created_at)}</p>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Customer:</span>
                        <span class="text-sm font-medium">${order.customer_name || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Phone:</span>
                        <span class="text-sm">${order.customer_phone || 'N/A'}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Items:</span>
                        <span class="text-sm">${this.getItemsCount(order.items)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm text-gray-600">Total:</span>
                        <span class="text-sm font-semibold">₹${order.order_total || 0}</span>
                    </div>
                </div>
                
                <div class="flex space-x-2">
                    <button onclick="viewOrderDetails('${order.id}')" class="flex-1 btn-secondary text-sm">
                        <i class="fas fa-eye mr-1"></i>View
                    </button>
                    <button onclick="updateOrderStatus('${order.id}', '${order.order_status}')" class="flex-1 btn-primary text-sm">
                        <i class="fas fa-edit mr-1"></i>Update
                    </button>
                </div>
            </div>
        `;
    }

    updateStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(o => ['placed', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.order_status)).length;
        const completedOrders = this.orders.filter(o => o.order_status === 'delivered').length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + (order.order_total || 0), 0);
        
        // Update stats cards
        const totalEl = document.getElementById('totalOrders');
        const pendingEl = document.getElementById('pendingOrders');
        const completedEl = document.getElementById('completedOrders');
        const revenueEl = document.getElementById('totalRevenue');
        
        if (totalEl) totalEl.textContent = totalOrders;
        if (pendingEl) pendingEl.textContent = pendingOrders;
        if (completedEl) completedEl.textContent = completedOrders;
        if (revenueEl) revenueEl.textContent = `₹${totalRevenue.toLocaleString()}`;
    }
}

// Global functions for modal handling

// Global functions for modal handling
function viewOrderDetails(orderId) {
    console.log('View order details:', orderId);
    const modal = document.getElementById('orderModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function updateOrderStatus(orderId, currentStatus) {
    console.log('Update order status:', orderId, currentStatus);
    const modal = document.getElementById('statusModal');
    if (modal) {
        document.getElementById('currentStatus').value = currentStatus;
        modal.classList.remove('hidden');
    }
}

window.AdminOrdersManager = AdminOrdersManager;