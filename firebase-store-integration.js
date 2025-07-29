// Firebase Store Integration for Main Website
// This file allows the main store to load products from Firebase instead of local data

class StoreFirebaseManager {
    constructor() {
        this.initialized = false;
        this.products = [];
        this.categories = [];
        this.fallbackToLocal = true;
        this.realtimeDb = null; // Added for Realtime Database
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Store Firebase Manager...');
            
            // Firebase configuration (same as admin)
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

            // Check if Firebase is available
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK not available, using local data');
                this.loadLocalData();
                return;
            }

            // Initialize Firebase app
            let app;
            try {
                app = firebase.app();
            } catch (error) {
                app = firebase.initializeApp(firebaseConfig);
            }

            // Initialize Firestore and Realtime Database
            this.db = firebase.firestore();
            this.realtimeDb = firebase.database(); // Initialize Realtime Database
            
            console.log('✅ Realtime Database connected to:', firebaseConfig.databaseURL);
            
            // Try to load products from Firebase
            await this.loadProductsFromFirebase();
            
            // Setup real-time updates
            await this.setupRealtimeUpdates();
            
            // Initial sync from Firestore to Realtime Database
            await this.syncToRealtimeDB();
            
            this.initialized = true;
            console.log('✅ Store Firebase Manager initialized with real-time updates');
            
        } catch (error) {
            console.warn('⚠️ Firebase initialization failed, using local data:', error);
            this.loadLocalData();
        }
    }

    async loadProductsFromFirebase() {
        try {
            console.log('📦 Loading products from Firebase...');
            
            const snapshot = await this.db.collection('products')
                .where('deleted', '!=', true)
                .orderBy('name')
                .get();
            
            if (snapshot.empty) {
                console.warn('⚠️ No products found in Firebase, using local data');
                this.loadLocalData();
                return;
            }

            this.products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Loaded ${this.products.length} products from Firebase`);
            
            // Extract categories
            this.categories = [...new Set(this.products.map(p => p.category))];
            
            // Update global variables for backward compatibility
            if (typeof window !== 'undefined') {
                window.products = this.products;
                window.allProducts = this.products;
                
                // Trigger product update if main store is already loaded
                if (typeof window.updateProductsFromFirebase === 'function') {
                    window.updateProductsFromFirebase(this.products);
                }
            }
            
        } catch (error) {
            console.error('❌ Failed to load from Firebase:', error);
            this.loadLocalData();
        }
    }

    loadLocalData() {
        try {
            console.log('📦 Loading products from local data...');
            
            // Check if local data is available
            if (typeof getAllProducts === 'function') {
                this.products = getAllProducts();
                this.categories = typeof getAvailableCategories === 'function' ? 
                    getAvailableCategories() : 
                    [...new Set(this.products.map(p => p.category))];
                
                console.log(`✅ Loaded ${this.products.length} products from local data`);
                
                // Update global variables
                if (typeof window !== 'undefined') {
                    window.products = this.products;
                    window.allProducts = this.products;
                }
            } else {
                console.error('❌ No local product data available');
                this.products = [];
                this.categories = [];
            }
        } catch (error) {
            console.error('❌ Failed to load local data:', error);
            this.products = [];
            this.categories = [];
        }
    }

    // Public methods for the main store to use
    getProducts() {
        return this.products;
    }

    getCategories() {
        return this.categories;
    }

    getProductById(id) {
        return this.products.find(p => p.id === id);
    }

    getProductsByCategory(category) {
        if (category === 'all') return this.products;
        return this.products.filter(p => p.category === category);
    }

    searchProducts(query) {
        if (!query) return this.products;
        
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
        );
    }

    // Real-time updates (listen for changes)
    startListening() {
        if (!this.db) return;
        
        console.log('👂 Starting real-time product updates...');
        
        this.db.collection('products')
            .where('deleted', '!=', true)
            .onSnapshot((snapshot) => {
                console.log('🔄 Products updated in Firebase');
                
                this.products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Update global variables
                if (typeof window !== 'undefined') {
                    window.products = this.products;
                    window.allProducts = this.products;
                    
                    // Trigger update in main store
                    if (typeof window.updateProductsFromFirebase === 'function') {
                        window.updateProductsFromFirebase(this.products);
                    }
                }
            }, (error) => {
                console.error('❌ Real-time updates failed:', error);
            });
    }

    // Real-time Database methods for instant updates
    async setupRealtimeUpdates() {
        if (!this.realtimeDb) {
            console.warn('⚠️ Realtime Database not initialized');
            return;
        }

        try {
            console.log('🔄 Setting up Realtime Database listeners...');

            // Listen for product updates in Realtime Database
            const productsRef = this.realtimeDb.ref('products');
            productsRef.on('value', (snapshot) => {
                if (snapshot.exists()) {
                    const realtimeProducts = snapshot.val();
                    console.log('🔄 Real-time products update received:', Object.keys(realtimeProducts).length, 'products');
                    
                    // Convert object to array
                    const productsArray = Object.keys(realtimeProducts).map(key => ({
                        id: key,
                        ...realtimeProducts[key]
                    }));

                    // Update local state
                    this.products = productsArray;
                    
                    // Update global variables
                    if (typeof window !== 'undefined') {
                        window.products = this.products;
                        window.allProducts = this.products;
                        
                        // Trigger update in main store
                        if (typeof window.updateProductsFromFirebase === 'function') {
                            window.updateProductsFromFirebase(this.products);
                        }
                    }
                }
            }, (error) => {
                console.error('❌ Realtime Database listener error:', error);
            });

            // Listen for notifications
            const notificationsRef = this.realtimeDb.ref('notifications');
            notificationsRef.on('child_added', (snapshot) => {
                if (snapshot.exists()) {
                    const notification = snapshot.val();
                    console.log('🔔 New notification:', notification);
                    
                    // Handle notification (you can customize this)
                    if (typeof window.showNotification === 'function') {
                        window.showNotification(notification.message, notification.type);
                    }
                }
            });

            console.log('✅ Realtime Database listeners setup complete');
            
        } catch (error) {
            console.error('❌ Failed to setup Realtime Database listeners:', error);
        }
    }

    // Method to write data to Realtime Database
    async writeToRealtimeDB(path, data) {
        if (!this.realtimeDb) {
            console.warn('⚠️ Realtime Database not initialized');
            return { success: false, error: 'Realtime Database not initialized' };
        }

        try {
            await this.realtimeDb.ref(path).set(data);
            console.log('✅ Data written to Realtime Database:', path);
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to write to Realtime Database:', error);
            return { success: false, error: error.message };
        }
    }

    // Method to update data in Realtime Database
    async updateRealtimeDB(path, updates) {
        if (!this.realtimeDb) {
            console.warn('⚠️ Realtime Database not initialized');
            return { success: false, error: 'Realtime Database not initialized' };
        }

        try {
            await this.realtimeDb.ref(path).update(updates);
            console.log('✅ Data updated in Realtime Database:', path);
            return { success: true };
        } catch (error) {
            console.error('❌ Failed to update Realtime Database:', error);
            return { success: false, error: error.message };
        }
    }

    // Method to sync Firestore data to Realtime Database for real-time updates
    async syncToRealtimeDB() {
        if (!this.realtimeDb || !this.db) {
            console.warn('⚠️ Firebase services not fully initialized');
            return;
        }

        try {
            console.log('🔄 Syncing Firestore data to Realtime Database...');

            // Get all products from Firestore
            const snapshot = await this.db.collection('products')
                .where('deleted', '!=', true)
                .get();

            if (!snapshot.empty) {
                const productsData = {};
                snapshot.docs.forEach(doc => {
                    productsData[doc.id] = doc.data();
                });

                // Write to Realtime Database
                await this.realtimeDb.ref('products').set(productsData);
                console.log('✅ Products synced to Realtime Database:', snapshot.docs.length, 'products');
            }

        } catch (error) {
            console.error('❌ Failed to sync to Realtime Database:', error);
        }
    }

    stopListening() {
        if (this.unsubscribe) {
            this.unsubscribe();
            console.log('🔇 Stopped real-time product updates');
        }
    }
}

// Initialize the store Firebase manager
const storeFirebaseManager = new StoreFirebaseManager();

// Export for global access
window.storeFirebaseManager = storeFirebaseManager;

// Backward compatibility functions
window.getAllProducts = function() {
    return storeFirebaseManager.getProducts();
};

window.getAvailableCategories = function() {
    return storeFirebaseManager.getCategories();
};

window.getProductsByCategory = function(category) {
    return storeFirebaseManager.getProductsByCategory(category);
};

// Function to refresh products from Firebase
window.refreshProductsFromFirebase = async function() {
    if (storeFirebaseManager.db) {
        await storeFirebaseManager.loadProductsFromFirebase();
        console.log('🔄 Products refreshed from Firebase');
    }
};

// Function for main store to handle product updates
window.updateProductsFromFirebase = function(updatedProducts) {
    console.log('🔄 Updating main store with Firebase products...');
    
    // Update main store variables
    if (typeof window.displayedProducts !== 'undefined') {
        window.allProducts = updatedProducts;
        window.displayedProducts = [...updatedProducts];
        
        // Re-render products if render function exists
        if (typeof window.renderProducts === 'function') {
            window.renderProducts();
        }
        
        // Update filters if filter function exists
        if (typeof window.applyAllFilters === 'function') {
            window.applyAllFilters();
        }
        
        console.log('✅ Main store updated with Firebase products');
    }
};

console.log('✅ Firebase Store Integration loaded'); 