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
            
            this.setupNavigation();
            await this.loadDashboardData();
            this.setupEventListeners();
            
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

    async loadDashboardData() {
        await this.loadStats();
        await this.loadRecentOrders();
    }

    async loadStats() {
        const stats = {
            totalOrders: 156,
            totalRevenue: 125000,
            totalUsers: 89,
            totalProducts: 234
        };
        
        this.updateStatCard('totalOrders', stats.totalOrders);
        this.updateStatCard('totalRevenue', `₹${stats.totalRevenue.toLocaleString()}`);
        this.updateStatCard('totalUsers', stats.totalUsers);
        this.updateStatCard('totalProducts', stats.totalProducts);
    }

    updateStatCard(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) element.textContent = value;
    }

    async loadRecentOrders() {
        const ordersBody = document.getElementById('recentOrdersBody');
        if (!ordersBody) return;
        
        const recentOrders = [
            { id: 'ORD-001', customer: 'John Doe', amount: '₹450', status: 'delivered', date: '2024-01-15' },
            { id: 'ORD-002', customer: 'Jane Smith', amount: '₹320', status: 'preparing', date: '2024-01-15' },
            { id: 'ORD-003', customer: 'Mike Johnson', amount: '₹680', status: 'out_for_delivery', date: '2024-01-14' }
        ];
        
        ordersBody.innerHTML = '';
        recentOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer}</td>
                <td>${order.amount}</td>
                <td><span class="badge badge-${this.getStatusClass(order.status)}">${this.formatStatus(order.status)}</span></td>
                <td>${order.date}</td>
                <td><button class="btn btn-primary btn-sm">View</button></td>
            `;
            ordersBody.appendChild(row);
        });
    }

    getStatusClass(status) {
        const statusClasses = {
            'delivered': 'success',
            'preparing': 'warning',
            'out_for_delivery': 'warning'
        };
        return statusClasses[status] || 'secondary';
    }

    formatStatus(status) {
        const statusTexts = {
            'delivered': 'Delivered',
            'preparing': 'Preparing',
            'out_for_delivery': 'Out for Delivery'
        };
        return statusTexts[status] || status;
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    }

    logout() {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_username');
        window.location.href = 'login.html';
    }
}

window.AdminDashboard = AdminDashboard;