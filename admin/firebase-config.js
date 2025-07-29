// Enhanced Firebase Configuration for Admin Panel
// Extends the existing Firebase setup with admin-specific features

// Firebase configuration (same as main app)
const firebaseConfig = {
    apiKey: "AIzaSyACAL8qq0mNxlVvsd1fIF0v6Z67jrV4kvI",
    authDomain: "near-and-now.firebaseapp.com",
    databaseURL: "https://near-and-now-default-rtdb.firebaseio.com/", // Added for Realtime Database
    projectId: "near-and-now",
    storageBucket: "near-and-now.firebasestorage.app",
    messagingSenderId: "529594163070",
    appId: "1:529594163070:web:2d5d9ccb8d74298e4e5d2f",
    measurementId: "G-4FTNVR9RXC"
};

// Admin-specific Firebase setup
class AdminFirebaseManager {
    constructor() {
        this.app = null;
        this.db = null;
        this.realtimeDb = null; // Added for Realtime Database
        this.storage = null;
        this.auth = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Admin Firebase...');
            
            // Check if Firebase is loaded
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK not loaded. Please check your internet connection.');
            }
            
            // Initialize Firebase app if not already initialized
            try {
                this.app = firebase.app();
                console.log('✅ Firebase app already initialized:', this.app.name);
            } catch (error) {
                this.app = firebase.initializeApp(firebaseConfig);
                console.log('✅ Firebase app initialized:', this.app.name);
            }
            
            // Initialize Firebase services
            this.db = firebase.firestore();
            this.realtimeDb = firebase.database(); // Added Realtime Database initialization
            this.storage = firebase.storage();
            this.auth = firebase.auth();
            
            // Configure Firestore settings
            try {
                this.db.settings({
                    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
                });
            } catch (settingsError) {
                console.log('⚠️ Firestore settings already configured');
            }
            
            this.initialized = true;
            console.log('✅ Admin Firebase initialized successfully');
            console.log('✅ Realtime Database connected to:', firebaseConfig.databaseURL);
            
            return { success: true };
        } catch (error) {
            console.error('❌ Admin Firebase initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    // Collection references for admin operations
    get collections() {
        return {
            products: this.db.collection('products'),
            orders: this.db.collection('orders'),
            customers: this.db.collection('customers'),
            categories: this.db.collection('categories'),
            admins: this.db.collection('admins'),
            analytics: this.db.collection('analytics')
        };
    }

    // Realtime Database references for real-time operations
    get realtimeRefs() {
        return {
            products: this.realtimeDb.ref('products'),
            orders: this.realtimeDb.ref('orders'),
            customers: this.realtimeDb.ref('customers'),
            categories: this.realtimeDb.ref('categories'),
            analytics: this.realtimeDb.ref('analytics'),
            notifications: this.realtimeDb.ref('notifications')
        };
    }

    // Storage references for admin operations
    get storageRefs() {
        return {
            products: this.storage.ref('products'),
            categories: this.storage.ref('categories'),
            admin: this.storage.ref('admin')
        };
    }

    // Utility functions
    get utils() {
        return {
            timestamp: firebase.firestore.FieldValue.serverTimestamp,
            increment: firebase.firestore.FieldValue.increment,
            arrayUnion: firebase.firestore.FieldValue.arrayUnion,
            arrayRemove: firebase.firestore.FieldValue.arrayRemove,
            deleteField: firebase.firestore.FieldValue.delete
        };
    }

    // Admin authentication helpers
    async isAdmin(uid = null) {
        try {
            const user = uid || (this.auth.currentUser ? this.auth.currentUser.uid : null);
            if (!user) return false;
            
            const adminDoc = await this.collections.admins.doc(user).get();
            return adminDoc.exists && adminDoc.data().isAdmin === true;
        } catch (error) {
            console.error('Error checking admin status:', error);
            return false;
        }
    }

    async createInitialAdmin(email, password, name) {
        try {
            // Create admin user in Authentication
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Add admin record to Firestore
            await this.collections.admins.doc(user.uid).set({
                email: email,
                name: name,
                isAdmin: true,
                role: 'super_admin',
                createdAt: this.utils.timestamp(),
                permissions: {
                    products: true,
                    orders: true,
                    customers: true,
                    analytics: true
                }
            });
            
            console.log('✅ Initial admin created successfully');
            return { success: true, uid: user.uid };
        } catch (error) {
            console.error('❌ Failed to create initial admin:', error);
            return { success: false, error: error.message };
        }
    }

    // Test connection
    async testConnection() {
        try {
            if (!this.initialized) {
                throw new Error('Firebase not initialized');
            }
            
            // Test Firestore
            const testDoc = await this.db.collection('admin_test').add({
                test: true,
                timestamp: this.utils.timestamp()
            });
            await testDoc.delete();
            
            // Test Storage
            const testBlob = new Blob(['admin test'], { type: 'text/plain' });
            const testRef = this.storage.ref('admin_test/test.txt');
            await testRef.put(testBlob);
            await testRef.delete();
            
            return { success: true, message: 'Admin Firebase connection verified' };
        } catch (error) {
            console.error('❌ Admin Firebase connection test failed:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize admin Firebase manager
const adminFirebase = new AdminFirebaseManager();

// Export for global access
window.adminFirebase = adminFirebase;
window.AdminFirebaseManager = AdminFirebaseManager;

console.log('✅ Admin Firebase Manager loaded'); 