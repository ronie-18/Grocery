/**
 * Loose Products Management
 * Handles variable quantity products with size selection and custom quantities
 */

class LooseProductsManager {
    constructor() {
        this.selectedSizes = new Map(); // productId -> selected size
        this.customQuantities = new Map(); // productId -> custom quantity
        this.init();
    }

    init() {
        console.log('🏷️ Initializing Loose Products Manager...');
        this.setupEventListeners();
        console.log('✅ Loose Products Manager initialized');
    }

    setupEventListeners() {
        // Listen for product card clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('size-option')) {
                this.handleSizeSelection(e);
            }
            if (e.target.classList.contains('custom-quantity-input')) {
                this.handleCustomQuantityChange(e);
            }
        });
    }

    handleSizeSelection(e) {
        const button = e.target;
        const productId = button.closest('.product-card').dataset.productId;
        const size = button.dataset.size;
        const price = button.dataset.price;

        // Update selected size
        this.selectedSizes.set(productId, { size, price });

        // Update UI
        this.updateSizeSelection(productId, button);
        this.updateProductPrice(productId, price);
    }

    handleCustomQuantityChange(e) {
        const input = e.target;
        const productId = input.closest('.product-card').dataset.productId;
        const quantity = parseFloat(input.value);
        const basePrice = parseFloat(input.dataset.basePrice);
        const baseUnit = input.dataset.baseUnit;

        if (quantity && basePrice && baseUnit) {
            const price = this.calculateCustomPrice(quantity, basePrice, baseUnit);
            this.customQuantities.set(productId, { quantity, price });
            this.updateCustomPrice(productId, price);
        }
    }

    updateSizeSelection(productId, selectedButton) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const sizeOptions = productCard.querySelectorAll('.size-option');
        
        // Remove active class from all options
        sizeOptions.forEach(option => {
            option.classList.remove('bg-blue-500', 'text-white');
            option.classList.add('bg-gray-100', 'text-gray-700');
        });

        // Add active class to selected option
        selectedButton.classList.remove('bg-gray-100', 'text-gray-700');
        selectedButton.classList.add('bg-blue-500', 'text-white');
    }

    updateProductPrice(productId, price) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const priceElement = productCard.querySelector('.product-price');
        if (priceElement) {
            priceElement.textContent = `₹${price}`;
        }
    }

    updateCustomPrice(productId, price) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const customPriceElement = productCard.querySelector('.custom-price');
        if (customPriceElement) {
            customPriceElement.textContent = `₹${price}`;
        }
    }

    calculateCustomPrice(quantity, basePrice, baseUnit) {
        // For now, simple calculation - can be enhanced based on unit conversion
        return (quantity * basePrice).toFixed(2);
    }

    getSelectedSize(productId) {
        return this.selectedSizes.get(productId);
    }

    getCustomQuantity(productId) {
        return this.customQuantities.get(productId);
    }

    // Create loose product card HTML
    createLooseProductCard(product) {
        const isLoose = product.name.toLowerCase().includes('loose') || product.is_loose;
        
        if (!isLoose) {
            return null; // Not a loose product
        }

        // Handle both string and array formats for common_sizes
        let commonSizes = ['500gm', '1kg', '2kg', '5kg']; // Default fallback
        if (product.common_sizes) {
            if (typeof product.common_sizes === 'string') {
                try {
                    commonSizes = JSON.parse(product.common_sizes);
                } catch (e) {
                    console.warn('Failed to parse common_sizes:', product.common_sizes);
                }
            } else if (Array.isArray(product.common_sizes)) {
                commonSizes = product.common_sizes;
            }
        }

        const basePrice = product.base_price || 50;
        const baseUnit = product.base_unit || 'kg';
        const minQuantity = product.min_quantity || 0.5;
        const maxQuantity = product.max_quantity || 10;
        const stepSize = product.step_size || 0.5;

        return `
            <div class="loose-product-config mb-3">
                <label class="text-sm font-medium text-gray-700 mb-2 block">Select Size:</label>
                
                <!-- Common Sizes -->
                <div class="grid grid-cols-2 gap-2 mb-3">
                    ${commonSizes.map(size => {
                        const price = this.calculateSizePrice(size, basePrice, baseUnit);
                        return `<button class="size-option bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors" 
                                data-size="${size}" data-price="${price}">
                            ${size} - ₹${price}
                        </button>`;
                    }).join('')}
                </div>
                
                <!-- Custom Quantity -->
                <div class="custom-quantity">
                    <label class="text-sm font-medium text-gray-700 mb-1 block">Or enter custom quantity:</label>
                    <div class="flex items-center space-x-2">
                        <input type="number" 
                               class="custom-quantity-input form-input flex-1" 
                               step="${stepSize}"
                               min="${minQuantity}"
                               max="${maxQuantity}"
                               placeholder="Enter quantity"
                               data-base-price="${basePrice}"
                               data-base-unit="${baseUnit}">
                        <span class="text-sm text-gray-500">${baseUnit}</span>
                    </div>
                    <div class="mt-1">
                        <span class="text-sm text-gray-600">Price: ₹<span class="custom-price">0</span></span>
                    </div>
                </div>
            </div>
        `;
    }

    calculateSizePrice(size, basePrice, baseUnit) {
        // Extract numeric value and unit from size string
        const numericValue = parseFloat(size.replace(/[^\d.]/g, ''));
        const unit = size.replace(/[\d.]/g, '').toLowerCase();
        
        // Convert to base unit
        let baseQuantity = numericValue;
        if (baseUnit === 'kg' && unit === 'gm') {
            baseQuantity = numericValue / 1000;
        } else if (baseUnit === 'liter' && unit === 'ml') {
            baseQuantity = numericValue / 1000;
        }
        
        return (baseQuantity * basePrice).toFixed(2);
    }
}

// Initialize loose products manager
window.looseProductsManager = new LooseProductsManager();

// Export for use in other files
window.LooseProductsManager = LooseProductsManager;
