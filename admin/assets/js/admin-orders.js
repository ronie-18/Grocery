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
        const ordersBody = document.getElementById('ordersBody');
        if (!ordersBody) return;

        if (this.orders.length === 0) {
            ordersBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-8">
                        <div class="text-gray-500">
                            <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                            <p>No orders found</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        ordersBody.innerHTML = this.orders.map(order => `
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
}

window.AdminOrdersManager = AdminOrdersManager;