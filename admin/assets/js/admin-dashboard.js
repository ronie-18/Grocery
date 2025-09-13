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
            console.error('❌ Error initializing dashboard:', error);
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
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                if (section) {
                    this.showSection(section);
                    this.updateActiveNav(item);
                }
            });
        });
    }

    showSection(sectionName) {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        const targetSection = document.getElementById(`${sectionName}-content`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            this.updatePageTitle(sectionName);
            
            // Load section-specific data when section is shown
            this.loadSectionData(sectionName);
        }
    }

    updateActiveNav(activeItem) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        activeItem.classList.add('active');
    }

    updatePageTitle(section) {
        const titleElement = document.getElementById('pageTitle');
        if (titleElement) {
            const titles = {
                'dashboard': 'Dashboard',
                'orders': 'Order Management',
                'products': 'Product Management',
                'users': 'User Management'
            };
            titleElement.textContent = titles[section] || 'Admin Panel';
        }
    }

    /**
     * Load section-specific data when section is shown
     */
    async loadSectionData(section) {
        switch (section) {
            case 'orders':
                // Load orders when orders section is shown
                if (window.adminOrdersManager) {
                    console.log('📦 Loading orders data...');
                    await window.adminOrdersManager.loadOrders();
                }
                break;
            case 'products':
                // Load products when products section is shown
                console.log('📦 Products section loaded');
                break;
            case 'users':
                // Load users when users section is shown
                console.log('👥 Users section loaded');
                break;
            default:
                console.log(`No specific data loading for section: ${section}`);
        }
    }

    async loadDashboardData() {
        console.log('📊 Loading dashboard data...');
        // Load orders data once and use it for both recent orders and stats
        await this.loadOrdersAndStats();
        console.log('📊 Dashboard data loaded');
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
                console.error('❌ Supabase client still not available after waiting!');
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
                console.error('❌ Error loading orders data:', ordersError);
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
                const { count: productsCount, error: productsError } = await window.supabaseClient
                    .from('products')
                    .select('*', { count: 'exact', head: true });
                
                if (!productsError && productsCount !== null) {
                    finalProductsCount = productsCount;
                    console.log('✅ Using products count from products table:', finalProductsCount);
                } else {
                    console.log('📊 Products table not found, using calculated count from orders:', finalProductsCount);
                }
            } catch (error) {
                console.log('📊 Products table not accessible, using calculated count from orders:', finalProductsCount);
            }

            console.log('🔍 Calculated stats:', {
                totalOrders,
                totalRevenue,
                totalUsers,
                totalProducts: finalProductsCount
            });

            // Update the dashboard with real data
            this.updateStatCard('totalOrders', totalOrders);
            this.updateStatCard('totalRevenue', `₹${totalRevenue.toLocaleString()}`);
            this.updateStatCard('totalUsers', totalUsers);
            this.updateStatCard('totalProducts', finalProductsCount);

            console.log('✅ Real statistics loaded and updated in UI');

            // Load recent orders from the same data
            this.loadRecentOrdersFromData(ordersData.slice(0, 5));

        } catch (error) {
            console.error('❌ Error loading orders and stats:', error);
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
            totalProducts: 0
        };
        
        this.updateStatCard('totalOrders', stats.totalOrders);
        this.updateStatCard('totalRevenue', `₹${stats.totalRevenue.toLocaleString()}`);
        this.updateStatCard('totalUsers', stats.totalUsers);
        this.updateStatCard('totalProducts', stats.totalProducts);
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