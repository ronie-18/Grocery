// Firebase Store Integration for Main Website
// This file allows the main store to load products from Firebase instead of local data

class StoreFirebaseManager {
    constructor() {
        this.initialized = false;
        this.products = [];
        this.categories = [];
        this.fallbackToLocal = true;
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Store Firebase Manager...');
            
            // Firebase configuration (same as admin)
            const firebaseConfig = {
                apiKey: "AIzaSyACAL8qq0mNxlVvsd1fIF0v6Z67jrV4kvI",
                authDomain: "near-and-now.firebaseapp.com",
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

            // Initialize Firestore
            this.db = firebase.firestore();
            
            // Try to load products from Firebase
            await this.loadProductsFromFirebase();
            
            this.initialized = true;
            console.log('✅ Store Firebase Manager initialized');
            
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