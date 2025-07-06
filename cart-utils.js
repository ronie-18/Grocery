// Shared Cart Utility for Near & Now Grocery Store
// This file provides consistent cart management across all pages

class CartManager {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem("nearNowCartItems")) || [];
        this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
        this.listeners = [];
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
        localStorage.setItem("nearNowCartItems", JSON.stringify(this.cartItems));
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