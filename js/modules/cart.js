/**
 * Cart Management Module
 * Handles shopping cart operations, storage, and display
 */

import { cartItems, cartCount, currentUser, allProducts, setCartItems, setCartCount } from './globals.js';
import { showNotification } from './ui.js';

/**
 * Initialize cart
 */
export function initializeCart() {
    // Load cart from storage
    loadCartFromStorage();

    // Setup cart button handlers
    const cartBtn = document.getElementById("cartBtn");
    const mobileCartBtn = document.getElementById("mobileCartBtn");
    const closeCartBtn = document.getElementById("closeCart");

    if (cartBtn) {
        cartBtn.addEventListener("click", toggleCartSidebar);
    }

    if (mobileCartBtn) {
        mobileCartBtn.addEventListener("click", toggleCartSidebar);
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener("click", closeCartSidebar);
    }

    // Initial cart update
    updateCartCount();
    updateCartDisplay();

    console.log('🛒 Cart initialized with', cartItems.length, 'items');
}

/**
 * Load cart from localStorage
 */
function loadCartFromStorage() {
    try {
        const stored = localStorage.getItem('nearNowCartItems');
        if (stored) {
            const items = JSON.parse(stored);
            setCartItems(Array.isArray(items) ? items : []);
            console.log('📦 Loaded', cartItems.length, 'items from storage');
        }
    } catch (error) {
        console.error('Error loading cart from storage:', error);
        setCartItems([]);
    }
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage() {
    try {
        localStorage.setItem('nearNowCartItems', JSON.stringify(cartItems));
        // Also save to backup key for compatibility
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        console.log('💾 Saved cart to storage:', cartItems.length, 'items');
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

/**
 * Add product to cart
 */
export function addToCart(productId) {
    console.log('➕ Adding product to cart:', productId);
    
    const product = allProducts.find((p) => p.id === productId);
    if (!product) {
        showNotification("Product not found", "error");
        return;
    }

    // Check if product already in cart
    const existingItem = cartItems.find((item) => item.id === productId && !item.isLoose);
    
    if (existingItem) {
        existingItem.quantity = (parseInt(existingItem.quantity) || 1) + 1;
        showNotification(`${product.name} quantity updated to ${existingItem.quantity}`, "success");
    } else {
        const cartItem = {
            id: product.id,
            name: product.name,
            price: typeof product.price === 'string' ? 
                   parseFloat(product.price.replace('₹', '')) : 
                   product.price,
            quantity: 1,
            image: product.image || product.image_url,
            size: product.size || product.weight || '',
        };
        
        cartItems.push(cartItem);
        showNotification(`${product.name} added to cart!`, "success");
    }

    saveCartToStorage();
    updateCartCount();
    updateCartDisplay();
    updateSpecificProductCard(productId);
}

/**
 * Remove product from cart
 */
export function removeFromCart(productId, size = null) {
    console.log('➖ Removing product from cart:', productId, size);
    
    const index = cartItems.findIndex((item) => {
        if (size) {
            return item.id === productId && item.size === size;
        }
        return item.id === productId;
    });

    if (index !== -1) {
        const removed = cartItems.splice(index, 1)[0];
        showNotification(`${removed.name} removed from cart`, "success");
        
        saveCartToStorage();
        updateCartCount();
        updateCartDisplay();
        updateSpecificProductCard(productId);
    }
}

/**
 * Update cart item quantity
 */
export function updateCartQuantity(productId, newQuantity, size = null) {
    const item = cartItems.find((item) => {
        if (size) {
            return item.id === productId && item.size === size;
        }
        return item.id === productId;
    });

    if (item) {
        const qty = parseInt(newQuantity);
        if (qty > 0) {
            item.quantity = qty;
            saveCartToStorage();
            updateCartCount();
            updateCartDisplay();
            updateSpecificProductCard(productId);
        } else {
            removeFromCart(productId, size);
        }
    }
}

/**
 * Decrease cart quantity
 */
export function decreaseCartQuantity(productId) {
    const item = cartItems.find((item) => item.id === productId);
    if (item) {
        const newQuantity = (parseInt(item.quantity) || 1) - 1;
        if (newQuantity > 0) {
            updateCartQuantity(productId, newQuantity);
        } else {
            removeFromCart(productId);
        }
    }
}

/**
 * Update specific product card display
 */
export function updateSpecificProductCard(productId) {
    const productCard = document.querySelector(`[data-product-id="${productId}"]`);
    if (!productCard) return;

    const cartItem = cartItems.find((item) => item.id === productId && !item.isLoose);
    const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
    const quantityControls = productCard.querySelector('.quantity-controls');

    if (!addToCartBtn || !quantityControls) return;

    if (cartItem) {
        // Product is in cart - show quantity controls
        addToCartBtn.classList.add('hidden');
        quantityControls.classList.remove('hidden');
        
        const quantityDisplay = quantityControls.querySelector('.quantity-display');
        if (quantityDisplay) {
            quantityDisplay.textContent = cartItem.quantity;
        }

        // Re-attach event listeners to quantity controls
        addEventListenersToSpecificCard(quantityControls);
    } else {
        // Product not in cart - show add to cart button
        addToCartBtn.classList.remove('hidden');
        quantityControls.classList.add('hidden');
    }
}

/**
 * Add event listeners to specific card
 */
function addEventListenersToSpecificCard(quantityControls) {
    const decreaseBtn = quantityControls.querySelector('.decrease-quantity-btn');
    const increaseBtn = quantityControls.querySelector('.increase-quantity-btn');
    
    if (decreaseBtn && increaseBtn) {
        const productCard = quantityControls.closest('[data-product-id]');
        const productId = productCard?.dataset.productId;
        
        if (productId) {
            // Remove existing listeners by cloning and replacing
            const newDecreaseBtn = decreaseBtn.cloneNode(true);
            const newIncreaseBtn = increaseBtn.cloneNode(true);
            
            decreaseBtn.parentNode.replaceChild(newDecreaseBtn, decreaseBtn);
            increaseBtn.parentNode.replaceChild(newIncreaseBtn, increaseBtn);
            
            newDecreaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                decreaseCartQuantity(productId);
            });
            
            newIncreaseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const cartItem = cartItems.find((item) => item.id === productId);
                if (cartItem) {
                    updateCartQuantity(productId, parseInt(cartItem.quantity) + 1);
                }
            });
        }
    }
}

/**
 * Update cart count display
 */
export function updateCartCount() {
    const count = cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 0), 0);
    setCartCount(count);
    
    const cartCountElements = document.querySelectorAll("#cartCount");
    cartCountElements.forEach((el) => {
        el.textContent = count;
    });
    
    console.log('🔢 Cart count updated:', count);
}

/**
 * Update cart display in sidebar
 */
export function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("cartItems");
    const cartTotalElement = document.getElementById("cartTotal");

    if (!cartItemsContainer || !cartTotalElement) {
        console.warn('Cart display elements not found');
        return;
    }

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
                <p class="text-gray-500 mb-4">Your cart is empty</p>
                <button onclick="window.location.href='index.html'" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-secondary transition duration-300">
                    Start Shopping
                </button>
            </div>
        `;
        cartTotalElement.textContent = "₹0";
        return;
    }

    let cartHTML = "";
    let total = 0;

    cartItems.forEach((item) => {
        const itemPrice = typeof item.price === 'string' ? 
                         parseFloat(item.price.replace('₹', '')) : 
                         item.price;
        const quantity = parseInt(item.quantity) || 1;
        const itemTotal = itemPrice * quantity;
        total += itemTotal;

        cartHTML += `
            <div class="cart-item flex items-center gap-4 p-4 bg-white rounded-lg mb-3 shadow-sm hover:shadow-md transition-shadow duration-200">
                <img src="${item.image || 'https://via.placeholder.com/80'}" alt="${item.name}" 
                     class="w-20 h-20 object-cover rounded-lg"
                     onerror="this.src='https://via.placeholder.com/80?text=No+Image'">
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-gray-800 mb-1 truncate">${item.name}</h4>
                    ${item.size ? `<p class="text-sm text-gray-600 mb-1">${item.size}</p>` : ''}
                    <p class="text-sm text-gray-600">₹${itemPrice} × ${quantity}</p>
                    <p class="text-primary font-bold mt-1">₹${itemTotal.toFixed(2)}</p>
                </div>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button onclick="window.cartModule.decreaseCartQuantity('${item.id}')" 
                                class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="w-8 text-center font-semibold">${quantity}</span>
                        <button onclick="window.cartModule.updateCartQuantity('${item.id}', ${quantity + 1})" 
                                class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-700 hover:bg-primary hover:text-white transition-colors duration-200">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <button onclick="window.cartModule.removeFromCart('${item.id}', ${item.size ? `'${item.size}'` : 'null'})" 
                            class="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200">
                        <i class="fas fa-trash mr-1"></i> Remove
                    </button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `₹${total.toFixed(2)}`;
}

/**
 * Toggle cart sidebar
 */
export function toggleCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar) {
        cartSidebar.classList.toggle("open");
    }
}

/**
 * Close cart sidebar
 */
export function closeCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar) {
        cartSidebar.classList.remove("open");
    }
}

/**
 * Proceed to checkout
 */
export function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification("Your cart is empty!", "warning");
        return;
    }

    if (!currentUser) {
        showNotification("Please login to proceed to checkout", "warning");
        // Show login modal
        if (window.authModule && window.authModule.showLoginModal) {
            window.authModule.showLoginModal();
        }
        return;
    }

    // Save cart and navigate to checkout
    saveCartToStorage();
    window.location.href = "checkout.html";
}

/**
 * Clear cart
 */
export function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        setCartItems([]);
        saveCartToStorage();
        updateCartCount();
        updateCartDisplay();
        showNotification("Cart cleared successfully", "success");
    }
}

// Export cart operations for global access
export const cartModule = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    decreaseCartQuantity,
    updateCartCount,
    updateCartDisplay,
    toggleCartSidebar,
    closeCartSidebar,
    proceedToCheckout,
    clearCart,
    saveCartToStorage
};

