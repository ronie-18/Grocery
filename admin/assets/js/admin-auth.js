/**
 * Admin Authentication System
 * Near & Now Grocery App
 * Handles admin login, logout, and session management
 */

class AdminAuth {
    constructor() {
        this.currentAdmin = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.sessionExpiry = null;
        
        // Initialize auth system
        this.init();
    }

    /**
     * Initialize the authentication system
     */
    async init() {
        try {
            // Check for existing session
            await this.checkExistingSession();
            
            // Set up event listeners
            this.setupEventListeners();
            
            console.log('🔐 Admin authentication system initialized');
        } catch (error) {
            console.error('❌ Error initializing admin auth:', error);
        }
    }

    /**
     * Check for existing admin session
     */
    async checkExistingSession() {
        try {
            const token = localStorage.getItem('admin_session_token');
            const expiry = localStorage.getItem('admin_session_expiry');
            
            if (token && expiry && new Date(expiry) > new Date()) {
                // Validate session with server
                const isValid = await this.validateSession(token);
                if (isValid) {
                    this.sessionToken = token;
                    this.sessionExpiry = new Date(expiry);
                    this.isAuthenticated = true;
                    
                    // Get admin user data
                    await this.loadAdminData();
                    
                    console.log('✅ Admin session restored');
                    return true;
                } else {
                    // Invalid session, clear it
                    this.clearSession();
                }
            }
            
            return false;
        } catch (error) {
            console.error('❌ Error checking existing session:', error);
            this.clearSession();
            return false;
        }
    }

    /**
     * Validate session with server
     */
    async validateSession(token) {
        try {
            if (!window.supabaseClient) {
                console.error('❌ Supabase client not available');
                return false;
            }

            const { data, error } = await window.supabaseClient
                .from('admin_sessions')
                .select('admin_id, expires_at')
                .eq('session_token', token)
                .single();

            if (error || !data) {
                return false;
            }

            // Check if session is expired
            if (new Date(data.expires_at) <= new Date()) {
                return false;
            }

            return true;
        } catch (error) {
            console.error('❌ Error validating session:', error);
            return false;
        }
    }

    /**
     * Load admin user data
     */
    async loadAdminData() {
        try {
            if (!this.sessionToken) return;

            const { data, error } = await window.supabaseClient
                .from('admin_sessions')
                .select(`
                    admin_id,
                    admin_users (
                        id,
                        username,
                        email,
                        role,
                        last_login
                    )
                `)
                .eq('session_token', this.sessionToken)
                .single();

            if (error || !data) {
                throw new Error('Failed to load admin data');
            }

            this.currentAdmin = data.admin_users;
            console.log('✅ Admin data loaded:', this.currentAdmin.username);
            
            // Update UI
            this.updateAdminUI();
            
        } catch (error) {
            console.error('❌ Error loading admin data:', error);
            this.clearSession();
        }
    }

    /**
     * Admin login
     */
    async login(username, password) {
        try {
            console.log('🔐 Attempting admin login for:', username);
            
            // Show loading state
            this.showLoginLoading(true);
            
            // Hash password (in production, this should be done server-side)
            const passwordHash = await this.hashPassword(password);
            
            // Verify credentials
            const { data, error } = await window.supabaseClient
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('password_hash', passwordHash)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                throw new Error('Invalid credentials');
            }

            // Create session
            const sessionToken = this.generateSessionToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Store session in database
            const { error: sessionError } = await window.supabaseClient
                .from('admin_sessions')
                .insert({
                    admin_id: data.id,
                    session_token: sessionToken,
                    expires_at: expiresAt.toISOString(),
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });

            if (sessionError) {
                throw new Error('Failed to create session');
            }

            // Update last login
            await window.supabaseClient
                .from('admin_users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', data.id);

            // Log activity
            await this.logActivity(data.id, 'login', null, null, null, null);

            // Store session locally
            this.sessionToken = sessionToken;
            this.sessionExpiry = expiresAt;
            this.isAuthenticated = true;
            this.currentAdmin = data;

            localStorage.setItem('admin_session_token', sessionToken);
            localStorage.setItem('admin_session_expiry', expiresAt.toISOString());

            console.log('✅ Admin login successful');
            
            // Hide loading state
            this.showLoginLoading(false);
            
            // Redirect to dashboard
            window.location.href = 'index.html';
            
            return { success: true, admin: data };

        } catch (error) {
            console.error('❌ Admin login failed:', error);
            this.showLoginLoading(false);
            this.showLoginError(error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Admin logout
     */
    async logout() {
        try {
            if (this.sessionToken && this.currentAdmin) {
                // Log activity
                await this.logActivity(this.currentAdmin.id, 'logout');
                
                // Remove session from database
                await window.supabaseClient
                    .from('admin_sessions')
                    .delete()
                    .eq('session_token', this.sessionToken);
            }

            // Clear local session
            this.clearSession();
            
            console.log('✅ Admin logout successful');
            
            // Redirect to login
            window.location.href = 'login.html';
            
        } catch (error) {
            console.error('❌ Error during logout:', error);
            // Still clear session and redirect
            this.clearSession();
            window.location.href = 'login.html';
        }
    }

    /**
     * Clear admin session
     */
    clearSession() {
        this.currentAdmin = null;
        this.isAuthenticated = false;
        this.sessionToken = null;
        this.sessionExpiry = null;
        
        localStorage.removeItem('admin_session_token');
        localStorage.removeItem('admin_session_expiry');
        
        this.updateAdminUI();
    }

    /**
     * Check if admin is authenticated
     */
    isAdminAuthenticated() {
        return this.isAuthenticated && this.sessionToken && this.currentAdmin;
    }

    /**
     * Require authentication (redirect to login if not authenticated)
     */
    requireAuth() {
        if (!this.isAdminAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * Hash password (simple implementation - use proper bcrypt in production)
     */
    async hashPassword(password) {
        // Simple hash for demo purposes - in production use proper bcrypt
        return btoa(password + 'nearandnow_salt');
    }

    /**
     * Generate session token
     */
    generateSessionToken() {
        return 'admin_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    }

    /**
     * Get client IP (simplified)
     */
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return '127.0.0.1'; // Fallback
        }
    }

    /**
     * Log admin activity
     */
    async logActivity(adminId, action, tableName = null, recordId = null, oldValues = null, newValues = null) {
        try {
            if (!window.supabaseClient) return;

            await window.supabaseClient
                .from('admin_activity_logs')
                .insert({
                    admin_id: adminId,
                    action: action,
                    table_name: tableName,
                    record_id: recordId,
                    old_values: oldValues,
                    new_values: newValues,
                    ip_address: await this.getClientIP(),
                    user_agent: navigator.userAgent
                });
        } catch (error) {
            console.error('❌ Error logging activity:', error);
        }
    }

    /**
     * Update admin UI elements
     */
    updateAdminUI() {
        // Update admin info in header
        const adminInfo = document.getElementById('adminInfo');
        if (adminInfo && this.currentAdmin) {
            adminInfo.innerHTML = `
                <span class="admin-name">${this.currentAdmin.username}</span>
                <span class="admin-role">${this.currentAdmin.role}</span>
            `;
        }

        // Show/hide admin elements
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = this.isAuthenticated ? 'block' : 'none';
        });

        const guestElements = document.querySelectorAll('.guest-only');
        guestElements.forEach(element => {
            element.style.display = this.isAuthenticated ? 'none' : 'block';
        });
    }

    /**
     * Show login loading state
     */
    showLoginLoading(show) {
        const submitBtn = document.getElementById('loginSubmitBtn');
        const loadingSpinner = document.getElementById('loginLoadingSpinner');
        
        if (submitBtn) {
            submitBtn.disabled = show;
            submitBtn.textContent = show ? 'Logging in...' : 'Login';
        }
        
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'inline-block' : 'none';
        }
    }

    /**
     * Show login error message
     */
    showLoginError(message) {
        const errorDiv = document.getElementById('loginError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            
            // Hide error after 5 seconds
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value.trim();
                const password = document.getElementById('password').value;
                
                if (!username || !password) {
                    this.showLoginError('Please enter both username and password');
                    return;
                }
                
                await this.login(username, password);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Check session expiry every minute
        setInterval(() => {
            if (this.sessionExpiry && new Date() >= this.sessionExpiry) {
                console.log('⏰ Admin session expired');
                this.logout();
            }
        }, 60000);
    }
}

// Initialize admin auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminAuth = new AdminAuth();
});

// Export for use in other files
window.AdminAuth = AdminAuth;
