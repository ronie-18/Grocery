/**
 * Products Data Updater
 * Handles automatic updating of products-data.js when products are added/modified from admin panel
 */

class ProductsDataUpdater {
    constructor() {
        this.productsFilePath = '../products-data.js';
        this.backupFilePath = '../products-data.js.backup';
        this.maxBackups = 5;
    }

    /**
     * Add a new product to products-data.js
     * @param {Object} productData - The product data to add
     * @returns {Promise<Object>} - Success/error result
     */
    async addProductToLocalFile(productData) {
        try {
            console.log('🔄 Adding product to local products-data.js:', productData.name);
            
            // Try to auto-sync using the sync endpoint
            const syncResult = await this.triggerAutoSync();
            
            if (syncResult.success) {
                console.log('✅ Auto-sync successful!');
                return { success: true, message: 'Product automatically synced to products-data.js' };
            } else {
                // Fallback to localStorage method
                console.log('⚠️ Auto-sync failed, using fallback method');
                await this.addToLocalStorage(productData);
                this.suggestFileUpdate(productData);
                return { success: true, message: 'Product queued for manual sync. Auto-sync unavailable.' };
            }
            
        } catch (error) {
            console.error('❌ Failed to add product to local file:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Add product to localStorage for later export
     * @param {Object} productData - The product data to add
     */
    async addToLocalStorage(productData) {
        try {
            // Get existing products from localStorage
            let pendingProducts = JSON.parse(localStorage.getItem('pendingProductsForExport') || '[]');
            
            // Add timestamp and unique identifier
            const productWithMeta = {
                ...productData,
                addedAt: new Date().toISOString(),
                addedFromAdmin: true,
                tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            };
            
            pendingProducts.push(productWithMeta);
            
            // Store back to localStorage
            localStorage.setItem('pendingProductsForExport', JSON.stringify(pendingProducts));
            
            // Update count for admin notification
            this.updatePendingCount();
            
            console.log('✅ Product added to pending export list');
            return true;
            
        } catch (error) {
            console.error('❌ Failed to add to localStorage:', error);
            throw error;
        }
    }

    /**
     * Update the pending products count in admin UI
     */
    updatePendingCount() {
        const pendingProducts = JSON.parse(localStorage.getItem('pendingProductsForExport') || '[]');
        const count = pendingProducts.length;
        
        // Update UI badge if it exists
        const badge = document.getElementById('pendingExportBadge');
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
        
        // Show notification if there are pending products
        if (count > 0) {
            this.showPendingNotification(count);
        }
    }

    /**
     * Show notification about pending products
     * @param {number} count - Number of pending products
     */
    showPendingNotification(count) {
        // Create or update notification
        let notification = document.getElementById('pendingProductsNotification');
        
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'pendingProductsNotification';
            notification.className = 'alert alert-info fixed-top-right';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 300px;
                padding: 15px;
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            document.body.appendChild(notification);
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div>
                    <i class="fas fa-info-circle" style="color: #155724; margin-right: 8px;"></i>
                    <strong>${count} product${count > 1 ? 's' : ''} pending export</strong>
                </div>
                <button onclick="productsDataUpdater.exportPendingProducts()" 
                        style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    Export Now
                </button>
            </div>
            <div style="margin-top: 8px; font-size: 0.9em; color: #155724;">
                Click "Export Now" to download updated products-data.js
            </div>
        `;
    }

    /**
     * Export pending products to a downloadable file
     */
    async exportPendingProducts() {
        try {
            const pendingProducts = JSON.parse(localStorage.getItem('pendingProductsForExport') || '[]');
            
            if (pendingProducts.length === 0) {
                alert('No pending products to export.');
                return;
            }

            // Load current products data
            const currentProducts = window.getAllProducts ? window.getAllProducts() : [];
            
            // Merge pending products with current products
            const updatedProducts = [...currentProducts];
            
            pendingProducts.forEach(product => {
                // Remove temporary fields
                const cleanProduct = { ...product };
                delete cleanProduct.addedAt;
                delete cleanProduct.addedFromAdmin;
                delete cleanProduct.tempId;
                
                // Add to appropriate category
                updatedProducts.push(cleanProduct);
            });

            // Generate updated products-data.js content
            const updatedContent = this.generateProductsFileContent(updatedProducts);
            
            // Create downloadable file
            this.downloadFile('products-data.js', updatedContent);
            
            // Clear pending products
            localStorage.removeItem('pendingProductsForExport');
            this.updatePendingCount();
            
            // Hide notification
            const notification = document.getElementById('pendingProductsNotification');
            if (notification) {
                notification.remove();
            }
            
            alert('✅ Products exported successfully! Replace your products-data.js file with the downloaded version.');
            
        } catch (error) {
            console.error('❌ Failed to export products:', error);
            alert('Failed to export products: ' + error.message);
        }
    }

    /**
     * Generate the content for products-data.js file
     * @param {Array} products - Array of all products
     * @returns {string} - File content
     */
    generateProductsFileContent(products) {
        // Group products by category
        const productsByCategory = {};
        
        products.forEach(product => {
            const category = product.category || 'miscellaneous';
            if (!productsByCategory[category]) {
                productsByCategory[category] = [];
            }
            productsByCategory[category].push(product);
        });

        // Generate the file content with predefined sizes
        let content = `// Predefined sizes/weights available for products\n`;
        content += `const predefinedSizes = [\n`;
        content += `  { value: "50g", label: "50g" },\n`;
        content += `  { value: "100g", label: "100g" },\n`;
        content += `  { value: "200g", label: "200g" },\n`;
        content += `  { value: "250g", label: "250g" },\n`;
        content += `  { value: "500g", label: "500g" },\n`;
        content += `  { value: "1kg", label: "1kg" },\n`;
        content += `  { value: "2kg", label: "2kg" },\n`;
        content += `  { value: "5kg", label: "5kg" },\n`;
        content += `  { value: "50ml", label: "50ml" },\n`;
        content += `  { value: "100ml", label: "100ml" },\n`;
        content += `  { value: "250ml", label: "250ml" },\n`;
        content += `  { value: "500ml", label: "500ml" },\n`;
        content += `  { value: "1L", label: "1L" },\n`;
        content += `  { value: "2L", label: "2L" },\n`;
        content += `  { value: "1pc", label: "1 piece" },\n`;
        content += `  { value: "2pc", label: "2 pieces" },\n`;
        content += `  { value: "5pc", label: "5 pieces" },\n`;
        content += `  { value: "10pc", label: "10 pieces" },\n`;
        content += `  { value: "1dozen", label: "1 dozen" },\n`;
        content += `  { value: "custom", label: "Custom Size" }\n`;
        content += `];\n\n`;
        
        content += `// Helper function to get predefined sizes\n`;
        content += `function getPredefinedSizes() {\n`;
        content += `  return predefinedSizes;\n`;
        content += `}\n\n`;
        
        content += `// Products organized by categories for better management\n`;
        content += `// Last updated: ${new Date().toISOString()}\n`;
        content += `const productsByCategory = {\n`;
        
        Object.keys(productsByCategory).forEach((category, index) => {
            content += `  ${category}: [`;
            
            productsByCategory[category].forEach((product, productIndex) => {
                content += `{\n`;
                content += `      "id": "${product.id}",\n`;
                content += `      "name": "${product.name}",\n`;
                content += `      "image": "${product.image || ''}",\n`;
                content += `      "price": "${product.price}",\n`;
                if (product.originalPrice) content += `      "originalPrice": "${product.originalPrice}",\n`;
                if (product.size) content += `      "size": "${product.size}",\n`;
                content += `      "rating": ${product.rating || 4.0},\n`;
                content += `      "reviews": ${product.reviews || 0},\n`;
                content += `      "inStock": ${product.inStock !== false},\n`;
                content += `      "discount": ${product.discount || 0},\n`;
                content += `      "category": "${category}"\n`;
                
                if (product.reviewsList) {
                    content += `      "reviewsList": ${JSON.stringify(product.reviewsList, null, 8)}\n`;
                }
                
                content += `    }`;
                if (productIndex < productsByCategory[category].length - 1) content += `,`;
                content += `\n`;
            });
            
            content += `]`;
            if (index < Object.keys(productsByCategory).length - 1) content += `,`;
            content += `\n`;
        });
        
        content += `};\n\n`;
        
        // Add helper functions
        content += `// Helper function to get all products in a flat array\n`;
        content += `function getAllProducts() {\n`;
        content += `  const allProducts = [];\n`;
        content += `  for (const [categoryName, products] of Object.entries(productsByCategory)) {\n`;
        content += `    const productsWithCategory = products.map(product => ({\n`;
        content += `      ...product,\n`;
        content += `      category: categoryName\n`;
        content += `    }));\n`;
        content += `    allProducts.push(...productsWithCategory);\n`;
        content += `  }\n`;
        content += `  return allProducts;\n`;
        content += `}\n\n`;
        
        content += `// Helper function to get products by specific category\n`;
        content += `function getProductsByCategory(categoryName) {\n`;
        content += `  const categoryProducts = productsByCategory[categoryName] || [];\n`;
        content += `  return categoryProducts.map(product => ({\n`;
        content += `    ...product,\n`;
        content += `    category: categoryName\n`;
        content += `  }));\n`;
        content += `}\n\n`;
        
        content += `// Helper function to get all available categories\n`;
        content += `function getAvailableCategories() {\n`;
        content += `  return Object.keys(productsByCategory);\n`;
        content += `}\n\n`;
        
        content += `// Main products array for backward compatibility\n`;
        content += `const products = getAllProducts();\n`;
        
        return content;
    }

    /**
     * Download a file with given content
     * @param {string} filename - Name of the file
     * @param {string} content - Content of the file
     */
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
    }

    /**
     * Show suggestion to update file
     * @param {Object} productData - The product that was added
     */
    suggestFileUpdate(productData) {
        console.log(`📁 Product "${productData.name}" added to pending export list. Use export function to update products-data.js file.`);
    }

    /**
     * Initialize the updater
     */
    init() {
        console.log('🚀 ProductsDataUpdater initialized');
        this.updatePendingCount();
        
        // Add export button to admin interface if not exists
        this.addExportButton();
        
        // Test auto-sync connection
        this.testAutoSyncConnection();
        
        return true;
    }

    /**
     * Test if auto-sync server is reachable
     */
    async testAutoSyncConnection() {
        try {
            console.log('🔍 Testing auto-sync server connection...');
            
            const response = await fetch('http://localhost:3001/health');
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Auto-sync server is running:', result);
                
                // Show success notification
                this.showSyncNotification('✅ Auto-sync server connected - manual exports disabled!', 'success');
                
                // Hide any pending export notifications since auto-sync is working
                const notification = document.getElementById('pendingProductsNotification');
                if (notification) {
                    notification.remove();
                }
                
                return true;
            } else {
                throw new Error('Server not responding');
            }
        } catch (error) {
            console.log('⚠️ Auto-sync server not reachable:', error.message);
            console.log('💡 To enable auto-sync, run: cd admin && npm run auto-sync');
            
            // Show warning about manual export mode
            setTimeout(() => {
                this.showSyncNotification('⚠️ Auto-sync server not running - using manual export mode', 'warning');
            }, 2000);
            
            return false;
        }
    }

    /**
     * Trigger auto-sync via Node.js script or API endpoint
     * @returns {Promise<Object>} - Success/error result
     */
    async triggerAutoSync(message = 'Product data updated') {
        try {
            console.log('🔄 Triggering auto-sync:', message);
            
            // Detect current port and adjust sync server URL accordingly
            const currentPort = window.location.port;
            let syncServerUrl = 'http://localhost:3001/api/sync-products';
            
            console.log('🌐 Current page port:', currentPort);
            console.log('🔗 Auto-sync server URL:', syncServerUrl);
            
            const response = await fetch(syncServerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString(),
                    source: 'admin-panel',
                    port: currentPort
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Auto-sync successful:', result);
                this.showNotification('Products file updated automatically', 'success');
                return { success: true, result };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.warn('⚠️ Auto-sync failed, will try fallback methods:', error.message);
            
            // Try fallback methods
            await this.syncViaFallback(message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Trigger local Node.js sync script
     * @returns {Promise<Object>} - Success/error result
     */
    async triggerLocalSync() {
        // This would require a local server or electron app
        // For now, we'll show instructions to the user
        console.log('💡 To enable auto-sync, run: cd admin && npm run sync-products');
        return { success: false, error: 'Manual sync required' };
    }

    /**
     * Add export button to admin interface
     */
    addExportButton() {
        // Check if button already exists
        if (document.getElementById('exportPendingBtn')) return;
        
        // Find a good place to add the button (header actions)
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const exportBtn = document.createElement('button');
            exportBtn.id = 'exportPendingBtn';
            exportBtn.className = 'header-btn';
            exportBtn.title = 'Sync Products Data';
            exportBtn.onclick = () => this.manualSync();
            exportBtn.innerHTML = `
                <i class="fas fa-sync-alt"></i>
                <span id="pendingExportBadge" class="sidebar-badge" style="display: none;">0</span>
            `;
            headerActions.appendChild(exportBtn);
        }
    }

    /**
     * Manual sync with better UX
     */
    async manualSync() {
        try {
            // First try auto-sync
            const autoResult = await this.triggerAutoSync();
            
            if (autoResult.success) {
                alert('✅ Products synced automatically!');
                // Clear pending products
                localStorage.removeItem('pendingProductsForExport');
                this.updatePendingCount();
                return;
            }
            
            // Fallback to export method
            await this.exportPendingProducts();
            
        } catch (error) {
            console.error('Sync failed:', error);
            alert('❌ Sync failed. Please try again or contact support.');
        }
    }

    /**
     * Automatically sync products-data.js file via sync server
     * This is the main method for auto-sync functionality
     * @returns {Promise<Object>} - Success/error result
     */
    async syncProductsFile() {
        try {
            console.log('🔄 Auto-syncing products-data.js file...');
            
            // Try multiple sync methods in order of preference
            const syncMethods = [
                () => this.syncViaServer(),
                () => this.syncViaLocalAPI(),
                () => this.syncViaFallback()
            ];
            
            for (const syncMethod of syncMethods) {
                try {
                    const result = await syncMethod();
                    if (result.success) {
                        console.log('✅ Auto-sync successful via', result.method);
                        this.showSyncNotification('✅ Products file updated successfully!', 'success');
                        return result;
                    }
                } catch (error) {
                    console.log('⚠️ Sync method failed, trying next...', error.message);
                }
            }
            
            // If all methods fail, show error
            throw new Error('All sync methods failed');
            
        } catch (error) {
            console.error('❌ Auto-sync failed:', error);
            this.showSyncNotification('⚠️ Auto-sync failed. Manual sync may be required.', 'warning');
            return { success: false, error: error.message };
        }
    }

    /**
     * Sync via the Express server (primary method)
     */
    async syncViaServer() {
        try {
            const response = await fetch('http://localhost:3001/api/sync-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    action: 'sync',
                    timestamp: Date.now(),
                    triggeredBy: 'admin-panel'
                })
            });

            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (result.success) {
                return { 
                    success: true, 
                    method: 'sync-server',
                    message: result.message,
                    timestamp: result.timestamp
                };
            } else {
                throw new Error(result.error || 'Server sync failed');
            }
            
        } catch (error) {
            console.log('🔄 Express server sync failed:', error.message);
            throw error;
        }
    }

    /**
     * Sync via local API endpoint (alternative method)
     */
    async syncViaLocalAPI() {
        try {
            // Try alternative port or endpoint
            const response = await fetch('http://localhost:8080/sync-products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'sync' })
            });

            if (response.ok) {
                const result = await response.json();
                return { 
                    success: true, 
                    method: 'local-api',
                    message: result.message 
                };
            } else {
                throw new Error('Local API sync failed');
            }
        } catch (error) {
            console.log('🔄 Local API sync failed:', error.message);
            throw error;
        }
    }

    /**
     * Fallback sync method (direct Firebase sync)
     */
    async syncViaFallback() {
        try {
            console.log('🔄 Using fallback sync method...');
            
            // Try to trigger sync via Firebase Cloud Function or webhook
            if (window.adminFirebase && window.adminFirebase.initialized) {
                // You could implement a Cloud Function trigger here
                // For now, we'll use the existing localStorage method as fallback
                await this.triggerAutoSync();
                return { 
                    success: true, 
                    method: 'fallback',
                    message: 'Fallback sync completed'
                };
            } else {
                throw new Error('Firebase not initialized');
            }
        } catch (error) {
            console.log('🔄 Fallback sync failed:', error.message);
            throw error;
        }
    }

    /**
     * Show sync notification to admin
     */
    showSyncNotification(message, type = 'info') {
        try {
            // Try to use admin notification system if available
            if (window.AdminUtils && typeof window.AdminUtils.showNotification === 'function') {
                window.AdminUtils.showNotification(message, type, 5000);
            } else {
                // Fallback to console and simple alert
                console.log(message);
                
                // Create a simple notification element
                const notification = document.createElement('div');
                notification.style.cssText = `
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px;
                    background: ${type === 'success' ? '#10B981' : type === 'warning' ? '#F59E0B' : '#3B82F6'};
                    color: white;
                    border-radius: 8px;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                    max-width: 300px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                `;
                notification.textContent = message;
                
                document.body.appendChild(notification);
                
                // Auto-remove after 5 seconds
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 5000);
            }
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }
}

// Initialize global instance
const productsDataUpdater = new ProductsDataUpdater();

// Export for use in other files
window.productsDataUpdater = productsDataUpdater; 