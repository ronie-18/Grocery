/**
 * Admin Dashboard Main Controller
 * Near & Now Grocery App
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing admin dashboard...');
            
            // Check authentication (simplified)
            if (!this.checkAuth()) {
                console.log('❌ Not authenticated, redirecting to login');
                window.location.href = 'login.html';
                return;
            }
            
            console.log('✅ Authentication passed, setting up dashboard...');
            this.setupNavigation();
            
            console.log('🔧 Setting up event listeners...');
            this.setupEventListeners();
            
            console.log('📊 Loading dashboard data...');
            await this.loadDashboardData();
            
            console.log('✅ Admin dashboard initialized successfully');
            
        } catch (error) {
            console.warn('⚠️ Error initializing dashboard:', error);
            console.log('📊 Dashboard will use fallback data');
        }
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('admin_logged_in') === 'true';
        const username = localStorage.getItem('admin_username');
        
        if (isLoggedIn && username) {
            this.updateAdminInfo(username);
            return true;
        }
        return false;
    }

    updateAdminInfo(username) {
        const adminName = document.getElementById('adminName');
        const adminAvatar = document.getElementById('adminAvatar');
        
        if (adminName) adminName.textContent = username;
        if (adminAvatar) adminAvatar.textContent = username.charAt(0).toUpperCase();
    }

    setupNavigation() {
        // Navigation is handled by regular links to separate pages
        // No section switching needed in dashboard
        console.log('✅ Navigation setup - using separate pages');
    }

    async loadDashboardData() {
        console.log('📊 Loading dashboard data...');
        // Load all dashboard sections
        await this.loadOrdersAndStats();
        await this.loadAllOrders();
        await this.loadDashboardProducts();
        await this.loadDashboardCategories();
        await this.loadDashboardUsers();
        console.log('📊 Dashboard data loaded');
    }
    
    async loadAllOrders() {
        try {
            console.log('📦 Loading all orders for dashboard...');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available');
                return;
            }
            
            const { data: orders, error } = await window.supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5); // Show latest 5 orders
            
            if (error) {
                console.warn('⚠️ Error loading all orders:', error);
                return;
            }
            
            const tbody = document.getElementById('allOrdersTableBody');
            if (!tbody) return;
            
            if (!orders || orders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
                return;
            }
            
            tbody.innerHTML = orders.map(order => `
                <tr>
                    <td>#${order.id.slice(-8)}</td>
                    <td>${order.customer_name || 'N/A'}</td>
                    <td>${this.getItemsCount(order.items)}</td>
                    <td>₹${(order.order_total || 0).toLocaleString()}</td>
                    <td><span class="badge badge-${this.getStatusClass(order.order_status)}">${this.formatStatus(order.order_status)}</span></td>
                    <td>${this.formatDate(order.created_at)}</td>
                </tr>
            `).join('');
            
            console.log('✅ All orders loaded');
        } catch (error) {
            console.warn('⚠️ Error in loadAllOrders:', error);
        }
    }
    
    async loadDashboardProducts() {
        try {
            console.log('📦 Loading products for dashboard...');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available');
                return;
            }
            
            // Try enhanced table first
            let { data: products, error } = await window.supabaseClient
                .from('products_enhanced')
                .select('*')
                .limit(5);
            
            if (error || !products || products.length === 0) {
                // Fallback to original table
                const result = await window.supabaseClient
                    .from('products')
                    .select('*')
                    .limit(5);
                products = result.data;
            }
            
            const tbody = document.getElementById('dashboardProductsTableBody');
            if (!tbody) return;
            
            if (!products || products.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No products found</td></tr>';
                return;
            }
            
            tbody.innerHTML = products.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.category || 'N/A'}</td>
                    <td>₹${(product.price || product.selling_price || 0).toLocaleString()}</td>
                    <td>${product.stock_quantity || product.quantity || 0}</td>
                    <td><span class="badge badge-${(product.in_stock !== false && product.is_active !== false) ? 'success' : 'secondary'}">${(product.in_stock !== false && product.is_active !== false) ? 'Active' : 'Inactive'}</span></td>
                </tr>
            `).join('');
            
            console.log('✅ Products loaded');
        } catch (error) {
            console.warn('⚠️ Error in loadDashboardProducts:', error);
        }
    }
    
    async loadDashboardCategories() {
        try {
            console.log('🏷️ Loading categories for dashboard...');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available');
                return;
            }
            
            // Load categories
            let { data: categories, error } = await window.supabaseClient
                .from('categories_enhanced')
                .select('*')
                .limit(5);
            
            if (error || !categories || categories.length === 0) {
                // Fallback to original table
                const result = await window.supabaseClient
                    .from('categories')
                    .select('*')
                    .limit(5);
                categories = result.data;
            }
            
            const grid = document.getElementById('dashboardCategoriesGrid');
            if (!grid) return;
            
            if (!categories || categories.length === 0) {
                grid.innerHTML = '<div style="text-align: center; padding: 2rem; grid-column: 1 / -1;">No categories found</div>';
                return;
            }
            
            // Load products to count per category
            let { data: products, error: productsError } = await window.supabaseClient
                .from('products_enhanced')
                .select('category');
            
            if (productsError || !products) {
                // Fallback to original products table
                const result = await window.supabaseClient
                    .from('products')
                    .select('category');
                products = result.data || [];
            }
            
            // Count products per category
            const productCounts = {};
            if (products && products.length > 0) {
                products.forEach(product => {
                    const category = product.category || 'Uncategorized';
                    productCounts[category] = (productCounts[category] || 0) + 1;
                });
            }
            
            console.log('📊 Product counts by category:', productCounts);
            
            grid.innerHTML = categories.map(cat => {
                const icon = cat.icon || 'fas fa-tag';
                const color = cat.color || '#3b82f6';
                const count = productCounts[cat.name] || 0;
                return `
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; text-align: center;">
                        <div style="width: 50px; height: 50px; background: ${color}; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.5rem; color: white;">
                            <i class="${icon}"></i>
                        </div>
                        <div style="font-weight: 600; color: #1f2937;">${cat.name}</div>
                        <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">${count} products</div>
                    </div>
                `;
            }).join('');
            
            console.log('✅ Categories loaded with product counts');
        } catch (error) {
            console.warn('⚠️ Error in loadDashboardCategories:', error);
        }
    }
    
    async loadDashboardUsers() {
        try {
            console.log('👥 Loading users for dashboard...');
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available');
                return;
            }
            
            const { data: ordersData, error } = await window.supabaseClient
                .from('orders')
                .select('customer_name, customer_phone, customer_email, created_at, order_total')
                .order('created_at', { ascending: false });
            
            if (error) {
                console.warn('⚠️ Error loading orders for users:', error);
                return;
            }
            
            // Aggregate users from orders
            const userMap = new Map();
            ordersData.forEach(order => {
                const phone = order.customer_phone;
                if (phone && !userMap.has(phone)) {
                    userMap.set(phone, {
                        name: order.customer_name || 'Unknown',
                        phone: phone,
                        email: order.customer_email || '',
                        total_orders: 1,
                        total_spent: order.order_total || 0
                    });
                } else if (phone) {
                    const user = userMap.get(phone);
                    user.total_orders += 1;
                    user.total_spent += (order.order_total || 0);
                }
            });
            
            const users = Array.from(userMap.values()).slice(0, 5); // Top 5 users
            
            const tbody = document.getElementById('dashboardUsersTableBody');
            if (!tbody) return;
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
                return;
            }
            
            tbody.innerHTML = users.map(user => `
                <tr>
                    <td>${user.name}</td>
                    <td>${user.phone}</td>
                    <td>${user.total_orders}</td>
                    <td>₹${user.total_spent.toLocaleString()}</td>
                    <td><span class="badge badge-${user.total_spent > 5000 ? 'info' : 'success'}">${user.total_spent > 5000 ? 'VIP' : 'Active'}</span></td>
                </tr>
            `).join('');
            
            console.log('✅ Users loaded');
        } catch (error) {
            console.warn('⚠️ Error in loadDashboardUsers:', error);
        }
    }
    
    getItemsCount(items) {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (item.quantity || 0), 0);
    }

    async loadStats() {
        // This function is now handled by loadOrdersAndStats
        console.log('📊 loadStats called - redirecting to loadOrdersAndStats');
        await this.loadOrdersAndStats();
    }

    /**
     * Wait for Supabase client to be available
     */
    async waitForSupabaseClient(maxAttempts = 10, delay = 500) {
        for (let i = 0; i < maxAttempts; i++) {
            if (window.supabaseClient) {
                console.log('✅ Supabase client is now available');
                return true;
            }
            console.log(`⏳ Waiting for Supabase client... attempt ${i + 1}/${maxAttempts}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        console.error('❌ Supabase client never became available');
        return false;
    }

    /**
     * Load orders data once and use it for both stats and recent orders
     */
    async loadOrdersAndStats() {
        try {
            console.log('📊 Loading orders data for dashboard...');
            console.log('🔍 Supabase client available:', !!window.supabaseClient);
            console.log('🔍 Supabase client type:', typeof window.supabaseClient);
            
            // Wait for Supabase client to be available
            if (!window.supabaseClient) {
                console.log('⏳ Supabase client not ready, waiting...');
                await this.waitForSupabaseClient();
            }
            
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase client not available, using mock data');
                this.loadMockStats();
                this.loadMockRecentOrders();
                return;
            }
            
            // Load all orders data once
            console.log('🔍 Making orders query...');
            const { data: ordersData, error: ordersError } = await window.supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            console.log('🔍 Orders query result:', { 
                dataLength: ordersData?.length, 
                error: ordersError,
                sampleData: ordersData?.slice(0, 2)
            });

            if (ordersError) {
                console.warn('⚠️ Error loading orders data:', ordersError);
                console.log('📊 Using mock data as fallback');
                this.loadMockStats();
                this.loadMockRecentOrders();
                return;
            }

            if (!ordersData || ordersData.length === 0) {
                console.log('📊 No orders data found, using mock data');
                this.loadMockStats();
                this.loadMockRecentOrders();
                return;
            }

            // Calculate statistics from the loaded data
            const totalOrders = ordersData.length;
            const totalRevenue = ordersData.reduce((sum, order) => sum + (order.order_total || 0), 0);
            
            // Get unique users count from orders
            const uniquePhones = new Set(ordersData.map(order => order.customer_phone).filter(phone => phone));
            const totalUsers = uniquePhones.size;
            
            // Get unique products count from orders
            const allItems = ordersData.flatMap(order => order.items || []);
            console.log('🔍 Sample items data:', allItems.slice(0, 3));
            
            // Handle different item structures
            const uniqueProducts = new Set();
            allItems.forEach(item => {
                if (item && typeof item === 'object') {
                    // Try different possible ID fields
                    const productId = item.id || item.product_id || item.name || item.title;
                    if (productId) {
                        uniqueProducts.add(productId);
                    }
                } else if (typeof item === 'string') {
                    uniqueProducts.add(item);
                }
            });
            const totalProducts = uniqueProducts.size;
            
            console.log('🔍 Products calculation:', {
                totalItems: allItems.length,
                uniqueProducts: Array.from(uniqueProducts),
                totalProducts
            });

            // Try to get products count from dedicated products table if it exists
            let finalProductsCount = totalProducts;
            try {
                // First try original products table
                const { count: productsCount, error: productsError } = await window.supabaseClient
                    .from('products')
                    .select('*', { count: 'exact', head: true });
                
                if (!productsError && productsCount !== null) {
                    finalProductsCount = productsCount;
                    console.log('✅ Using products count from original products table:', finalProductsCount);
                } else {
                    // If original table fails, try enhanced table
                    console.log('📊 Original products table not accessible, trying enhanced table...');
                    const { count: enhancedProductsCount, error: enhancedError } = await window.supabaseClient
                        .from('products_enhanced')
                        .select('*', { count: 'exact', head: true });
                    
                    if (!enhancedError && enhancedProductsCount !== null) {
                        finalProductsCount = enhancedProductsCount;
                        console.log('✅ Using products count from enhanced products table:', finalProductsCount);
                    } else {
                        console.log('📊 Both products tables not accessible, using calculated count from orders:', finalProductsCount);
                    }
                }
            } catch (error) {
                console.log('📊 Products tables not accessible, using calculated count from orders:', finalProductsCount);
            }

            // Get categories count
            let totalCategories = 0;
            try {
                const { count: categoriesCount, error: categoriesError } = await window.supabaseClient
                    .from('categories')
                    .select('*', { count: 'exact', head: true });
                
                if (!categoriesError && categoriesCount !== null) {
                    totalCategories = categoriesCount;
                    console.log('✅ Categories count from categories table:', totalCategories);
                } else {
                    console.log('📊 Categories table not accessible, trying enhanced table...');
                    // Try enhanced categories table
                    const { count: enhancedCategoriesCount, error: enhancedCategoriesError } = await window.supabaseClient
                        .from('categories_enhanced')
                        .select('*', { count: 'exact', head: true });
                    
                    if (!enhancedCategoriesError && enhancedCategoriesCount !== null) {
                        totalCategories = enhancedCategoriesCount;
                        console.log('✅ Categories count from enhanced table:', totalCategories);
                    }
                }
            } catch (error) {
                console.log('📊 Categories tables not accessible');
            }

            console.log('🔍 Calculated stats:', {
                totalOrders,
                totalRevenue,
                totalUsers,
                totalProducts: finalProductsCount,
                totalCategories
            });

            // Update the dashboard with real data
            this.updateStatCard('totalOrders', totalOrders);
            this.updateStatCard('totalRevenue', `₹${totalRevenue.toLocaleString()}`);
            this.updateStatCard('totalUsers', totalUsers);
            this.updateStatCard('totalProducts', finalProductsCount);
            this.updateStatCard('totalCategories', totalCategories);

            console.log('✅ Real statistics loaded and updated in UI');

            // Load recent orders from the same data
            this.loadRecentOrdersFromData(ordersData.slice(0, 5));

        } catch (error) {
            console.warn('⚠️ Error loading orders and stats:', error);
            console.log('📊 Using mock data as fallback');
            this.loadMockStats();
            this.loadMockRecentOrders();
        }
    }

    /**
     * Load recent orders from already loaded data
     */
    loadRecentOrdersFromData(ordersData) {
        const ordersBody = document.getElementById('recentOrdersBody');
        if (!ordersBody) return;
        
        if (!ordersData || ordersData.length === 0) {
            ordersBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500">No recent orders</td></tr>';
            return;
        }

        ordersBody.innerHTML = ordersData.map(order => `
            <tr>
                <td class="px-4 py-2">#${order.id}</td>
                <td class="px-4 py-2">${order.customer_name || 'N/A'}</td>
                <td class="px-4 py-2">₹${(order.order_total || 0).toLocaleString()}</td>
                <td class="px-4 py-2">
                    <span class="px-2 py-1 rounded text-xs ${this.getStatusClass(order.order_status)}">
                        ${order.order_status || 'pending'}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Fallback to mock statistics if database fails
     */
    loadMockStats() {
        console.log('📊 Using fallback mock statistics');
        const stats = {
            totalOrders: 0,
            totalRevenue: 0,
            totalUsers: 0,
            totalProducts: 0,
            totalCategories: 0
        };
        
        this.updateStatCard('totalOrders', stats.totalOrders);
        this.updateStatCard('totalRevenue', `₹${stats.totalRevenue.toLocaleString()}`);
        this.updateStatCard('totalUsers', stats.totalUsers);
        this.updateStatCard('totalProducts', stats.totalProducts);
        this.updateStatCard('totalCategories', stats.totalCategories);
    }

    /**
     * Fallback to mock recent orders if database fails
     */
    loadMockRecentOrders() {
        const ordersBody = document.getElementById('recentOrdersBody');
        if (!ordersBody) return;
        
        ordersBody.innerHTML = '<tr><td colspan="4" class="text-center text-gray-500">No recent orders available</td></tr>';
    }


    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        console.log(`🔍 Updating stat card ${elementId}:`, { element: !!element, value });
        if (element) {
            element.textContent = value;
            console.log(`✅ Updated ${elementId} to: ${value}`);
        } else {
            console.error(`❌ Element ${elementId} not found!`);
        }
    }

    async loadRecentOrders() {
        // This function is now handled by loadOrdersAndStats
        console.log('📊 loadRecentOrders called - redirecting to loadOrdersAndStats');
        await this.loadOrdersAndStats();
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

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Add refresh stats when orders are updated
        window.addEventListener('ordersUpdated', () => {
            console.log('📊 Orders updated, refreshing stats...');
            this.loadOrdersAndStats();
        });
    }

    logout() {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_username');
        window.location.href = 'login.html';
    }
}

window.AdminDashboard = AdminDashboard;