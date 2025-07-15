// Admin Authentication System
class AdminAuth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.adminCredentials = {
            // Hardcoded credentials for initial setup
            'admin@nearnow.com': {
                password: 'admin123',
                name: 'Super Admin',
                role: 'super_admin',
                permissions: ['products', 'orders', 'customers', 'analytics']
            },
            'manager@nearnow.com': {
                password: 'manager123',
                name: 'Store Manager',
                role: 'manager',
                permissions: ['products', 'orders']
            }
        };
        
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedAuth = localStorage.getItem('adminAuth');
        if (savedAuth) {
            try {
                const authData = JSON.parse(savedAuth);
                if (this.validateAuthData(authData)) {
                    this.currentUser = authData;
                    this.isAuthenticated = true;
                    console.log('✅ Admin auto-login successful:', authData.email);
                }
            } catch (error) {
                console.error('Invalid saved auth data:', error);
                localStorage.removeItem('adminAuth');
            }
        }
    }

    validateAuthData(authData) {
        return authData && 
               authData.email && 
               authData.name && 
               authData.role && 
               authData.timestamp &&
               (Date.now() - authData.timestamp) < (24 * 60 * 60 * 1000); // 24 hours
    }

    async login(email, password) {
        try {
            console.log('🔐 Attempting admin login for:', email);
            
            // Check hardcoded credentials
            const adminCred = this.adminCredentials[email];
            if (!adminCred || adminCred.password !== password) {
                throw new Error('Invalid credentials');
            }

            // Create user session
            const userData = {
                email: email,
                name: adminCred.name,
                role: adminCred.role,
                permissions: adminCred.permissions,
                timestamp: Date.now()
            };

            // Save to localStorage
            localStorage.setItem('adminAuth', JSON.stringify(userData));
            
            this.currentUser = userData;
            this.isAuthenticated = true;

            console.log('✅ Admin login successful:', email);
            
            // Try to sync with Firebase if available
            if (window.adminFirebase && window.adminFirebase.initialized) {
                await this.syncWithFirebase(userData);
            }

            return { success: true, user: userData };
        } catch (error) {
            console.error('❌ Admin login failed:', error);
            return { success: false, error: error.message };
        }
    }

    async syncWithFirebase(userData) {
        try {
            // Check if admin exists in Firebase
            const adminDoc = await window.adminFirebase.collections.admins.doc(userData.email).get();
            
            if (!adminDoc.exists) {
                // Create admin record in Firebase
                await window.adminFirebase.collections.admins.doc(userData.email).set({
                    email: userData.email,
                    name: userData.name,
                    role: userData.role,
                    isAdmin: true,
                    permissions: userData.permissions.reduce((acc, perm) => {
                        acc[perm] = true;
                        return acc;
                    }, {}),
                    createdAt: window.adminFirebase.utils.timestamp(),
                    lastLogin: window.adminFirebase.utils.timestamp()
                });
                console.log('✅ Admin record created in Firebase');
            } else {
                // Update last login
                await window.adminFirebase.collections.admins.doc(userData.email).update({
                    lastLogin: window.adminFirebase.utils.timestamp()
                });
                console.log('✅ Admin last login updated in Firebase');
            }
        } catch (error) {
            console.warn('⚠️ Firebase sync failed (continuing with local auth):', error);
        }
    }

    logout() {
        try {
            console.log('🔓 Admin logout');
            
            localStorage.removeItem('adminAuth');
            this.currentUser = null;
            this.isAuthenticated = false;
            
            // Redirect to login
            if (window.location.pathname !== '/admin/login.html') {
                window.location.href = '/admin/login.html';
            }
            
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false, error: error.message };
        }
    }

    requireAuth() {
        if (!this.isAuthenticated) {
            console.warn('⚠️ Access denied - authentication required');
            window.location.href = '/admin/login.html';
            return false;
        }
        return true;
    }

    hasPermission(permission) {
        if (!this.isAuthenticated || !this.currentUser) {
            return false;
        }
        
        return this.currentUser.permissions.includes(permission) || 
               this.currentUser.role === 'super_admin';
    }

    getUserInfo() {
        return this.currentUser;
    }

    getRole() {
        return this.currentUser ? this.currentUser.role : null;
    }

    // Form validation helpers
    validateLoginForm(email, password) {
        const errors = [];
        
        if (!email || !email.trim()) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }
        
        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Setup helpers for first-time admin creation
    async setupInitialAdmin(email, password, name) {
        try {
            if (!window.adminFirebase || !window.adminFirebase.initialized) {
                throw new Error('Firebase not available for admin setup');
            }

            const result = await window.adminFirebase.createInitialAdmin(email, password, name);
            
            if (result.success) {
                // Add to hardcoded credentials for immediate use
                this.adminCredentials[email] = {
                    password: password,
                    name: name,
                    role: 'super_admin',
                    permissions: ['products', 'orders', 'customers', 'analytics']
                };
                
                console.log('✅ Initial admin setup completed');
                return { success: true, message: 'Initial admin created successfully' };
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Initial admin setup failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize admin authentication
const adminAuth = new AdminAuth();

// Export for global access
window.adminAuth = adminAuth;
window.AdminAuth = AdminAuth;

console.log('✅ Admin Authentication System loaded');

// Helper function for login form
function handleAdminLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('adminEmail')?.value;
    const password = document.getElementById('adminPassword')?.value;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = document.getElementById('loginSubmit');
    
    // Clear previous errors
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }
    
    // Validate form
    const validation = adminAuth.validateLoginForm(email, password);
    if (!validation.isValid) {
        if (errorDiv) {
            errorDiv.textContent = validation.errors.join(', ');
            errorDiv.style.display = 'block';
        }
        return;
    }
    
    // Disable submit button
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
    }
    
    // Attempt login
    adminAuth.login(email, password)
        .then(result => {
            if (result.success) {
                console.log('Login successful, redirecting...');
                window.location.href = '/admin/index.html';
            } else {
                if (errorDiv) {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error('Login error:', error);
            if (errorDiv) {
                errorDiv.textContent = 'Login failed. Please try again.';
                errorDiv.style.display = 'block';
            }
        })
        .finally(() => {
            // Re-enable submit button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
} 