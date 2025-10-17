/**
 * Loose Product Size Selection Modal
 * Handles the UI for selecting sizes and quantities for loose products
 */

class LooseProductModal {
    constructor() {
        this.currentProduct = null;
        this.selectedSize = null;
        this.customQuantity = null;
        this.init();
    }

    init() {
        this.createModal();
        this.setupEventListeners();
    }

    createModal() {
        // Create modal HTML
        const modalHTML = `
            <div id="looseProductModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
                <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                    <!-- Modal Header -->
                    <div class="flex items-center justify-between p-6 border-b">
                        <h3 class="text-xl font-bold text-gray-900">Select Size & Quantity</h3>
                        <button id="closeLooseModal" class="text-gray-400 hover:text-gray-600 transition duration-200">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>

                    <!-- Modal Body -->
                    <div class="p-6">
                        <!-- Product Info -->
                        <div id="modalProductInfo" class="mb-6">
                            <!-- Product info will be populated here -->
                        </div>

                        <!-- Size Selection -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">Choose Size:</label>
                            <div id="sizeOptions" class="grid grid-cols-2 gap-3">
                                <!-- Size options will be populated here -->
                            </div>
                        </div>

                        <!-- Custom Quantity -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">Or enter custom quantity:</label>
                            <div class="flex items-center space-x-2">
                                <input type="number" 
                                       id="customQuantityInput" 
                                       class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                       step="0.1"
                                       min="0.1"
                                       placeholder="Enter quantity">
                                <span id="baseUnitDisplay" class="text-sm text-gray-500 font-medium">kg</span>
                            </div>
                            <div class="mt-2">
                                <span class="text-sm text-gray-600">Price: ₹<span id="customPriceDisplay">0</span></span>
                            </div>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-3">Quantity:</label>
                            <div class="flex items-center justify-center space-x-4">
                                <button id="decreaseQuantity" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition duration-200">
                                    <i class="fas fa-minus text-gray-600"></i>
                                </button>
                                <span id="quantityDisplay" class="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">1</span>
                                <button id="increaseQuantity" class="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition duration-200">
                                    <i class="fas fa-plus text-gray-600"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Total Price -->
                        <div class="bg-gray-50 rounded-lg p-4 mb-6">
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-semibold text-gray-900">Total Price:</span>
                                <span id="totalPriceDisplay" class="text-2xl font-bold text-primary">₹0</span>
                            </div>
                        </div>
                    </div>

                    <!-- Modal Footer -->
                    <div class="flex space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                        <button id="cancelLooseModal" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200">
                            Cancel
                        </button>
                        <button id="addToCartLoose" class="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition duration-200 font-semibold">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    setupEventListeners() {
        // Close modal events
        document.getElementById('closeLooseModal').addEventListener('click', () => this.hide());
        document.getElementById('cancelLooseModal').addEventListener('click', () => this.hide());
        
        // Click outside to close
        document.getElementById('looseProductModal').addEventListener('click', (e) => {
            if (e.target.id === 'looseProductModal') {
                this.hide();
            }
        });

        // Quantity controls
        document.getElementById('decreaseQuantity').addEventListener('click', () => this.decreaseQuantity());
        document.getElementById('increaseQuantity').addEventListener('click', () => this.increaseQuantity());

        // Custom quantity input
        document.getElementById('customQuantityInput').addEventListener('input', (e) => this.handleCustomQuantity(e.target.value));

        // Add to cart
        document.getElementById('addToCartLoose').addEventListener('click', () => {
            console.log('🖱️ Add to Cart button clicked in modal');
            this.addToCart();
        });
    }

    show(product) {
        this.currentProduct = product;
        this.selectedSize = null;
        this.customQuantity = null;
        
        this.populateProductInfo();
        this.populateSizeOptions();
        this.updateQuantityDisplay();
        this.updateTotalPrice();
        
        const modal = document.getElementById('looseProductModal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    hide() {
        document.getElementById('looseProductModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.currentProduct = null;
        this.selectedSize = null;
        this.customQuantity = null;
    }

    populateProductInfo() {
        const productInfo = document.getElementById('modalProductInfo');
        
        // Use the card price as the base price (per 1kg/1L)
        const cardPrice = this.getCardPrice();
        const baseUnit = this.getBaseUnit();
        
        productInfo.innerHTML = `
            <div class="flex items-center space-x-4">
                <img src="${this.currentProduct.image}" alt="${this.currentProduct.name}" class="w-16 h-16 object-cover rounded-lg">
                <div>
                    <h4 class="font-semibold text-gray-900">${this.currentProduct.name}</h4>
                    <p class="text-sm text-gray-600">${this.currentProduct.description || 'Premium quality product'}</p>
                    <p class="text-sm text-primary font-semibold">Base Price: ₹${cardPrice}/${baseUnit}</p>
                </div>
            </div>
        `;
    }

    getCardPrice() {
        // Extract price from the product card price display
        // The card shows the price for 1kg/1L as the base price
        const price = typeof this.currentProduct.price === 'string' 
            ? parseFloat(this.currentProduct.price.replace(/^₹/, '')) 
            : this.currentProduct.price;
        return price || 50; // Fallback to 50 if no price found
    }

    getBaseUnit() {
        // Determine base unit based on product type (for calculations)
        if (this.currentProduct.product_type === 'liquid') {
            return 'L';
        } else {
            return 'kg';
        }
    }



    populateSizeOptions() {
        const sizeOptions = document.getElementById('sizeOptions');
        const baseUnitDisplay = document.getElementById('baseUnitDisplay');
        
        // Set base unit
        const baseUnit = this.getBaseUnit();
        baseUnitDisplay.textContent = baseUnit;
        
        // Get common sizes
        let commonSizes = ['500gm', '1kg', '2kg', '5kg']; // Default fallback
        if (this.currentProduct.common_sizes) {
            if (typeof this.currentProduct.common_sizes === 'string') {
                try {
                    commonSizes = JSON.parse(this.currentProduct.common_sizes);
                } catch (e) {
                    console.warn('Failed to parse common_sizes:', this.currentProduct.common_sizes);
                }
            } else if (Array.isArray(this.currentProduct.common_sizes)) {
                commonSizes = this.currentProduct.common_sizes;
            }
        }

        // Create size option buttons
        const cardPrice = this.getCardPrice();
        sizeOptions.innerHTML = commonSizes.map(size => {
            const price = this.calculatePrice(size, cardPrice, baseUnit);
            return `
                <button class="size-option-btn p-3 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary hover:text-white transition duration-200 text-center" 
                        data-size="${size}" 
                        data-price="${price}">
                    <div class="font-semibold">${size}</div>
                    <div class="text-sm">₹${price}</div>
                </button>
            `;
        }).join('');

        // Add click listeners to size options
        sizeOptions.querySelectorAll('.size-option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                sizeOptions.querySelectorAll('.size-option-btn').forEach(b => {
                    b.classList.remove('border-primary', 'bg-primary', 'text-white');
                    b.classList.add('border-gray-200');
                });
                
                // Add active class to clicked button
                e.target.closest('.size-option-btn').classList.add('border-primary', 'bg-primary', 'text-white');
                e.target.closest('.size-option-btn').classList.remove('border-gray-200');
                
                // Set selected size
                this.selectedSize = {
                    size: e.target.closest('.size-option-btn').dataset.size,
                    price: parseFloat(e.target.closest('.size-option-btn').dataset.price)
                };
                
                // Clear custom quantity
                this.customQuantity = null;
                document.getElementById('customQuantityInput').value = '';
                
                this.updateTotalPrice();
            });
        });
    }

    calculatePrice(size, basePrice, baseUnit) {
        // Extract numeric value and unit from size string
        const sizeValue = parseFloat(size.replace(/[^\d.]/g, ''));
        const unit = size.replace(/[\d.]/g, '').toLowerCase();
        
        // Convert to base unit for calculation
        let convertedSize = sizeValue;
        
        if (baseUnit === 'kg') {
            // For solid products (kg base unit)
            if (unit === 'gm') {
                convertedSize = sizeValue / 1000; // Convert gm to kg
            } else if (unit === 'kg') {
                convertedSize = sizeValue; // Already in kg
            }
        } else if (baseUnit === 'L') {
            // For liquid products (L base unit)
            if (unit === 'ml') {
                convertedSize = sizeValue / 1000; // Convert ml to L
            } else if (unit === 'l' || unit === 'liter') {
                convertedSize = sizeValue; // Already in L
            }
        }
        
        // Calculate price: convertedSize * basePrice
        const calculatedPrice = convertedSize * basePrice;
        return calculatedPrice.toFixed(2);
    }

    handleCustomQuantity(value) {
        if (value && parseFloat(value) > 0) {
            this.customQuantity = parseFloat(value);
            this.selectedSize = null; // Clear selected size
            
            // Remove active class from size options
            document.getElementById('sizeOptions').querySelectorAll('.size-option-btn').forEach(btn => {
                btn.classList.remove('border-primary', 'bg-primary', 'text-white');
                btn.classList.add('border-gray-200');
            });
            
            this.updateTotalPrice();
        } else {
            this.customQuantity = null;
            this.updateTotalPrice();
        }
    }

    decreaseQuantity() {
        const currentQuantity = parseInt(document.getElementById('quantityDisplay').textContent);
        if (currentQuantity > 1) {
            document.getElementById('quantityDisplay').textContent = currentQuantity - 1;
            this.updateTotalPrice();
        }
    }

    increaseQuantity() {
        const currentQuantity = parseInt(document.getElementById('quantityDisplay').textContent);
        document.getElementById('quantityDisplay').textContent = currentQuantity + 1;
        this.updateTotalPrice();
    }

    updateQuantityDisplay() {
        document.getElementById('quantityDisplay').textContent = '1';
    }

    updateTotalPrice() {
        const quantity = parseInt(document.getElementById('quantityDisplay').textContent);
        let unitPrice = 0;
        
        if (this.selectedSize) {
            unitPrice = this.selectedSize.price;
        } else if (this.customQuantity) {
            const cardPrice = this.getCardPrice();
            unitPrice = this.customQuantity * cardPrice;
        }
        
        const totalPrice = unitPrice * quantity;
        document.getElementById('totalPriceDisplay').textContent = `₹${totalPrice.toFixed(2)}`;
        
        // Update custom price display
        if (this.customQuantity) {
            const cardPrice = this.getCardPrice();
            const customPrice = this.customQuantity * cardPrice;
            document.getElementById('customPriceDisplay').textContent = customPrice.toFixed(2);
        }
    }

    addToCart() {
        console.log('🛒 addToCart called with:', {
            selectedSize: this.selectedSize,
            customQuantity: this.customQuantity
        });
        
        if (!this.selectedSize && !this.customQuantity) {
            alert('Please select a size or enter a custom quantity');
            return;
        }

        const quantity = parseInt(document.getElementById('quantityDisplay').textContent);
        
        // Create cart item
        const cardPrice = this.getCardPrice();
        const baseUnit = this.getBaseUnit();
        
        const cartItem = {
            id: this.currentProduct.id,
            name: this.currentProduct.name,
            price: Math.round(this.selectedSize ? this.selectedSize.price : (this.customQuantity * cardPrice)),
            quantity: quantity,
            image: this.currentProduct.image,
            size: this.selectedSize ? this.selectedSize.size : `${this.customQuantity}${baseUnit}`,
            isLoose: true,
            looseDetails: {
                selectedSize: this.selectedSize,
                customQuantity: this.customQuantity,
                basePrice: cardPrice,
                baseUnit: baseUnit
            }
        };

        // Add to cart using existing cart system
        console.log('🛒 Adding loose product to cart:', cartItem);
        console.log('🔍 Cart system check:', {
            cartItems: !!window.cartItems,
            cartCount: window.cartCount,
            saveCartToStorage: !!window.saveCartToStorage,
            updateCartCount: !!window.updateCartCount,
            updateCartDisplay: !!window.updateCartDisplay,
            setCartCount: !!window.setCartCount
        });
        
        // Debug: Check if cart system is properly initialized
        if (!window.cartItems) {
            console.error('❌ Cart system not initialized! cartItems is undefined');
            alert('Cart system not initialized. Please refresh the page.');
            return;
        }
        
        // Try to initialize cart system if not available
        if (!window.cartItems && typeof initializeCart === 'function') {
            console.log('🔄 Cart system not available, trying to initialize...');
            initializeCart();
        }
        
        // Add the cart item directly to the cart
        if (window.cartItems) {
            // Check if item already exists in cart (for loose products, check by id and size)
            const existingItem = window.cartItems.find(item => 
                item.id === cartItem.id && 
                item.size === cartItem.size &&
                item.isLoose === true
            );
            
            if (existingItem) {
                existingItem.quantity += cartItem.quantity;
                console.log('📈 Updated existing cart item quantity:', existingItem.quantity);
            } else {
                window.cartItems.push(cartItem);
                console.log('➕ Added new cart item:', cartItem);
            }
            
            // Update cart count - ensure it's a number
            const newCartCount = window.cartItems.reduce((total, item) => {
                const quantity = parseInt(item.quantity) || 0;
                return total + quantity;
            }, 0);
            
            // Update cart count using the proper setter function
            if (window.setCartCount) {
                window.setCartCount(newCartCount);
                console.log('🔢 Updated cart count using setter:', newCartCount);
            } else {
                window.cartCount = newCartCount;
                console.log('🔢 Updated cart count directly:', newCartCount);
            }
            
            // Save to localStorage and update display
            if (window.saveCartToStorage) {
                window.saveCartToStorage();
                console.log('💾 Saved cart to localStorage');
            }
            if (window.updateCartCount) {
                window.updateCartCount();
                console.log('🔄 Updated cart count display');
            }
            if (window.updateCartDisplay) {
                window.updateCartDisplay();
                console.log('🔄 Updated cart display');
            }
            
            console.log('✅ Loose product added to cart successfully');
            console.log('📋 Current cart items:', window.cartItems);
        } else {
            console.error('❌ Cart system not available - window.cartItems is undefined');
        }

        // Hide modal
        this.hide();
    }

}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.looseProductModal = new LooseProductModal();
});
