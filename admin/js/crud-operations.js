// Main CRUD Operations Class for Admin Panel
class AdminCRUD {
    constructor() {
        this.firebase = window.adminFirebase;
        this.auth = window.adminAuth;
        this.initialized = false;
    }

    async initialize() {
        try {
            console.log('🚀 Initializing Admin CRUD...');
            
            if (!this.firebase || !this.firebase.initialized) {
                await this.firebase.initialize();
            }
            
            if (!this.auth || !this.auth.isAuthenticated) {
                throw new Error('Admin authentication required');
            }
            
            this.initialized = true;
            console.log('✅ Admin CRUD initialized successfully');
            return { success: true };
        } catch (error) {
            console.error('❌ Admin CRUD initialization failed:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= PRODUCT OPERATIONS =============
    
    async createProduct(productData) {
        try {
            if (!this.auth.hasPermission('products')) {
                throw new Error('No permission to create products');
            }

            // Validate required fields
            const validation = this.validateProductData(productData);
            if (!validation.isValid) {
                throw new Error('Validation failed: ' + validation.errors.join(', '));
            }

            // Add metadata
            const product = {
                ...productData,
                id: productData.id || this.generateProductId(productData.name),
                createdAt: this.firebase.utils.timestamp(),
                createdBy: this.auth.getUserInfo().email,
                updatedAt: this.firebase.utils.timestamp()
            };

            // Save to Firestore
            await this.firebase.collections.products.doc(product.id).set(product);
            
            console.log('✅ Product created:', product.id);
            return { success: true, product: product };
        } catch (error) {
            console.error('❌ Failed to create product:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, updateData) {
        try {
            if (!this.auth.hasPermission('products')) {
                throw new Error('No permission to update products');
            }

            // Add update metadata
            const updates = {
                ...updateData,
                updatedAt: this.firebase.utils.timestamp(),
                updatedBy: this.auth.getUserInfo().email
            };

            // Update in Firestore
            await this.firebase.collections.products.doc(productId).update(updates);
            
            console.log('✅ Product updated:', productId);
            return { success: true, productId: productId };
        } catch (error) {
            console.error('❌ Failed to update product:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        try {
            if (!this.auth.hasPermission('products')) {
                throw new Error('No permission to delete products');
            }

            // Soft delete - mark as deleted instead of removing
            await this.firebase.collections.products.doc(productId).update({
                deleted: true,
                deletedAt: this.firebase.utils.timestamp(),
                deletedBy: this.auth.getUserInfo().email
            });
            
            console.log('✅ Product deleted (soft):', productId);
            return { success: true, productId: productId };
        } catch (error) {
            console.error('❌ Failed to delete product:', error);
            return { success: false, error: error.message };
        }
    }

    async getProducts(options = {}) {
        try {
            const {
                category = null,
                inStock = null,
                limit = 50,
                orderBy = 'createdAt',
                orderDirection = 'desc',
                includeDeleted = false
            } = options;

            let query = this.firebase.collections.products;

            // Apply filters
            if (!includeDeleted) {
                query = query.where('deleted', '!=', true);
            }
            
            if (category) {
                query = query.where('category', '==', category);
            }
            
            if (inStock !== null) {
                query = query.where('inStock', '==', inStock);
            }

            // Apply ordering and limit
            query = query.orderBy(orderBy, orderDirection).limit(limit);

            const snapshot = await query.get();
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log(`✅ Retrieved ${products.length} products`);
            return { success: true, products: products };
        } catch (error) {
            console.error('❌ Failed to get products:', error);
            return { success: false, error: error.message };
        }
    }

    async getProduct(productId) {
        try {
            const doc = await this.firebase.collections.products.doc(productId).get();
            
            if (!doc.exists) {
                throw new Error('Product not found');
            }

            const product = { id: doc.id, ...doc.data() };
            return { success: true, product: product };
        } catch (error) {
            console.error('❌ Failed to get product:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= ORDER OPERATIONS =============
    
    async getOrders(options = {}) {
        try {
            if (!this.auth.hasPermission('orders')) {
                throw new Error('No permission to view orders');
            }

            const {
                status = null,
                limit = 50,
                orderBy = 'createdAt',
                orderDirection = 'desc'
            } = options;

            let query = this.firebase.collections.orders;

            if (status) {
                query = query.where('status', '==', status);
            }

            query = query.orderBy(orderBy, orderDirection).limit(limit);

            const snapshot = await query.get();
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, orders: orders };
        } catch (error) {
            console.error('❌ Failed to get orders:', error);
            return { success: false, error: error.message };
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            if (!this.auth.hasPermission('orders')) {
                throw new Error('No permission to update orders');
            }

            const updates = {
                status: newStatus,
                updatedAt: this.firebase.utils.timestamp(),
                updatedBy: this.auth.getUserInfo().email
            };

            await this.firebase.collections.orders.doc(orderId).update(updates);
            
            console.log('✅ Order status updated:', orderId, newStatus);
            return { success: true, orderId: orderId };
        } catch (error) {
            console.error('❌ Failed to update order status:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= CUSTOMER OPERATIONS =============
    
    async getCustomers(options = {}) {
        try {
            if (!this.auth.hasPermission('customers')) {
                throw new Error('No permission to view customers');
            }

            const { limit = 50, orderBy = 'createdAt', orderDirection = 'desc' } = options;

            const query = this.firebase.collections.customers
                .orderBy(orderBy, orderDirection)
                .limit(limit);

            const snapshot = await query.get();
            const customers = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, customers: customers };
        } catch (error) {
            console.error('❌ Failed to get customers:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= ANALYTICS OPERATIONS =============
    
    async getDashboardStats() {
        try {
            if (!this.auth.hasPermission('analytics')) {
                throw new Error('No permission to view analytics');
            }

            // Get basic counts
            const [productsSnapshot, ordersSnapshot, customersSnapshot] = await Promise.all([
                this.firebase.collections.products.where('deleted', '!=', true).get(),
                this.firebase.collections.orders.get(),
                this.firebase.collections.customers.get()
            ]);

            // Calculate stats
            const stats = {
                totalProducts: productsSnapshot.size,
                totalOrders: ordersSnapshot.size,
                totalCustomers: customersSnapshot.size,
                inStockProducts: 0,
                outOfStockProducts: 0,
                pendingOrders: 0,
                completedOrders: 0,
                totalRevenue: 0
            };

            // Calculate product stats
            productsSnapshot.docs.forEach(doc => {
                const product = doc.data();
                if (product.inStock) {
                    stats.inStockProducts++;
                } else {
                    stats.outOfStockProducts++;
                }
            });

            // Calculate order stats
            ordersSnapshot.docs.forEach(doc => {
                const order = doc.data();
                if (order.status === 'pending') {
                    stats.pendingOrders++;
                } else if (order.status === 'completed') {
                    stats.completedOrders++;
                    stats.totalRevenue += order.total || 0;
                }
            });

            return { success: true, stats: stats };
        } catch (error) {
            console.error('❌ Failed to get dashboard stats:', error);
            return { success: false, error: error.message };
        }
    }

    // ============= UTILITY FUNCTIONS =============
    
    validateProductData(productData) {
        const errors = [];
        const required = ['name', 'price', 'category'];

        required.forEach(field => {
            if (!productData[field]) {
                errors.push(`${field} is required`);
            }
        });

        if (productData.price && isNaN(parseFloat(productData.price))) {
            errors.push('Price must be a valid number');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    generateProductId(productName) {
        const slug = productName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        
        const randomSuffix = Math.random().toString(36).substr(2, 8);
        return `${slug}-${randomSuffix}`;
    }

    // Image upload helper
    async uploadProductImage(file, productId) {
        try {
            if (!file) throw new Error('No file provided');

            const fileName = `${productId}_${Date.now()}.${file.name.split('.').pop()}`;
            const storageRef = this.firebase.storageRefs.products.child(fileName);
            
            const uploadTask = await storageRef.put(file);
            const downloadURL = await uploadTask.ref.getDownloadURL();
            
            console.log('✅ Image uploaded:', downloadURL);
            return { success: true, url: downloadURL };
        } catch (error) {
            console.error('❌ Failed to upload image:', error);
            return { success: false, error: error.message };
        }
    }

    // Batch operations
    async importProducts(productsArray) {
        try {
            if (!this.auth.hasPermission('products')) {
                throw new Error('No permission to import products');
            }

            const results = [];
            const batch = this.firebase.db.batch();

            for (const productData of productsArray) {
                const validation = this.validateProductData(productData);
                if (!validation.isValid) {
                    results.push({ 
                        product: productData, 
                        success: false, 
                        error: validation.errors.join(', ') 
                    });
                    continue;
                }

                const product = {
                    ...productData,
                    id: productData.id || this.generateProductId(productData.name),
                    createdAt: this.firebase.utils.timestamp(),
                    createdBy: this.auth.getUserInfo().email
                };

                const docRef = this.firebase.collections.products.doc(product.id);
                batch.set(docRef, product);
                
                results.push({ product: product, success: true });
            }

            await batch.commit();
            console.log(`✅ Imported ${results.filter(r => r.success).length} products`);
            
            return { success: true, results: results };
        } catch (error) {
            console.error('❌ Failed to import products:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize CRUD operations
const adminCRUD = new AdminCRUD();

// Export for global access
window.adminCRUD = adminCRUD;
window.AdminCRUD = AdminCRUD;

console.log('✅ Admin CRUD Operations loaded'); 