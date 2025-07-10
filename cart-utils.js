// Shared Cart Utility for Near & Now Grocery Store
// This file provides consistent cart management across all pages

class CartManager {
    constructor() {
        this.loadCartItems();
        this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        this.listeners = [];
    }

    // Load cart items based on current user
    loadCartItems() {
        const currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
        
        if (currentUser && currentUser.mobile) {
            // Load user-specific cart
            const userCartKey = `nearNowCartItems_${currentUser.mobile}`;
            this.cartItems = JSON.parse(localStorage.getItem(userCartKey)) || [];
            
            // Also update the generic cart key for backward compatibility
            localStorage.setItem("nearNowCartItems", JSON.stringify(this.cartItems));
        } else {
            // Load generic cart for non-logged-in users
            this.cartItems = JSON.parse(localStorage.getItem("nearNowCartItems")) || [];
        }
    }

    // Add item to cart
    addToCart(productId, quantity = 1) {
        // Find product from global allProducts array
        const product = allProducts?.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return false;
        }

        const existingItem = this.cartItems.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cartItems.push({
                id: productId,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }

        this.updateCartState();
        this.notifyListeners('add', product, quantity);
        return true;
    }

    // Remove item from cart
    removeFromCart(productId) {
        const itemIndex = this.cartItems.findIndex(item => item.id === productId);
        if (itemIndex === -1) return false;

        const removedItem = this.cartItems[itemIndex];
        this.cartItems.splice(itemIndex, 1);
        this.updateCartState();
        this.notifyListeners('remove', removedItem);
        return true;
    }

    // Update item quantity
    updateQuantity(productId, newQuantity) {
        const item = this.cartItems.find(item => item.id === productId);
        if (!item) return false;

        if (newQuantity <= 0) {
            return this.removeFromCart(productId);
        }

        item.quantity = newQuantity;
        this.updateCartState();
        this.notifyListeners('update', item);
        return true;
    }

    // Clear cart
    clearCart() {
        this.cartItems = [];
        this.updateCartState();
        this.notifyListeners('clear');
    }

    // Get cart total
    getTotal() {
        return this.cartItems.reduce((sum, item) => {
            const price = typeof item.price === 'string' ? 
                parseFloat(item.price.replace(/^₹/, '')) : item.price;
            return sum + (price * item.quantity);
        }, 0);
    }

    // Get cart count
    getCount() {
        return this.cartCount;
    }

    // Get cart items
    getItems() {
        return [...this.cartItems];
    }

    // Check if item is in cart
    isInCart(productId) {
        return this.cartItems.some(item => item.id === productId);
    }

    // Get item quantity
    getItemQuantity(productId) {
        const item = this.cartItems.find(item => item.id === productId);
        return item ? item.quantity : 0;
    }

    // Update cart state and save to localStorage
    updateCartState() {
        this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        
        const currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
        
        if (currentUser && currentUser.mobile) {
            // Save to user-specific cart
            const userCartKey = `nearNowCartItems_${currentUser.mobile}`;
            localStorage.setItem(userCartKey, JSON.stringify(this.cartItems));
        }
        
        // Always save to generic key for backward compatibility
        localStorage.setItem("nearNowCartItems", JSON.stringify(this.cartItems));
    }

    // Handle user login - reload cart from user-specific storage
    onUserLogin() {
        this.loadCartItems();
        this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        this.notifyListeners('userLogin', null, 0);
    }

    // Handle user logout - clear cart and save to user storage
    onUserLogout() {
        const currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
        
        if (currentUser && currentUser.mobile) {
            // Save current cart to user-specific storage before logout
            const userCartKey = `nearNowCartItems_${currentUser.mobile}`;
            localStorage.setItem(userCartKey, JSON.stringify(this.cartItems));
        }
        
        // Clear current cart
        this.cartItems = [];
        this.cartCount = 0;
        localStorage.setItem("nearNowCartItems", JSON.stringify(this.cartItems));
        this.notifyListeners('userLogout', null, 0);
    }

    // Add event listener
    addListener(listener) {
        this.listeners.push(listener);
    }

    // Remove event listener
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    // Notify all listeners
    notifyListeners(action, item = null, quantity = 0) {
        this.listeners.forEach(listener => {
            try {
                listener(action, item, quantity, this.cartItems, this.cartCount);
            } catch (error) {
                console.error('Error in cart listener:', error);
            }
        });
    }
}

// Create global cart manager instance
window.cartManager = new CartManager();

// Global cart functions for backward compatibility
window.addToCart = (productId, quantity = 1) => {
    return window.cartManager.addToCart(productId, quantity);
};

window.removeFromCart = (productId) => {
    return window.cartManager.removeFromCart(productId);
};

window.updateCartQuantity = (productId, quantity) => {
    return window.cartManager.updateQuantity(productId, quantity);
};

window.getCartTotal = () => {
    return window.cartManager.getTotal();
};

window.getCartCount = () => {
    return window.cartManager.getCount();
};

window.getCartItems = () => {
    return window.cartManager.getItems();
};

// Global functions to handle user login/logout
window.handleUserLogin = () => {
    if (window.cartManager) {
        window.cartManager.onUserLogin();
    }
};

window.handleUserLogout = () => {
    if (window.cartManager) {
        window.cartManager.onUserLogout();
    }
};

// Initialize cart state on page load
document.addEventListener('DOMContentLoaded', () => {
    if (window.cartManager) {
        // Update cart display on page load
        window.cartManager.addListener((action, item, quantity, cartItems, cartCount) => {
            // Update cart count display
            const cartCountElement = document.getElementById('cartCount');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
                // Add bounce animation
                if (action === 'add' || action === 'update') {
                    cartCountElement.classList.add("animate-bounce");
                    setTimeout(() => {
                        cartCountElement.classList.remove("animate-bounce");
                    }, 1000);
                }
            }

            // Update mobile cart count
            const mobileCartCountElement = document.getElementById("mobileCartCount");
            if (mobileCartCountElement) {
                mobileCartCountElement.textContent = cartCount;
            }

            // Update cart display if function exists
            if (typeof updateCartDisplay === 'function') {
                updateCartDisplay();
            }

            // Show notification if function exists
            if (typeof showNotification === 'function') {
                if (action === 'add') {
                    showNotification(`${item.name} added to cart!`, 'success');
                } else if (action === 'remove') {
                    showNotification(`${item.name} removed from cart`, 'info');
                } else if (action === 'update') {
                    showNotification('Cart updated', 'info');
                }
            }
        });
    }
});

console.log('Cart utility loaded successfully'); 