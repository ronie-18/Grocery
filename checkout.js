// --- Checkout Logic ---

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
const addressKey = currentUser ? `nearNowAddress_${currentUser.mobile}` : null;

const addressForm = document.getElementById('addressForm');
const deliveryAddress = document.getElementById('deliveryAddress');
const useSavedAddress = document.getElementById('useSavedAddress');
const deliverOtherLocation = document.getElementById('deliverOtherLocation');
const paymentMethod = document.getElementById('paymentMethod');
const orderStatus = document.getElementById('orderStatus');
const orderSummary = document.getElementById('orderSummary');
const orderTotal = document.getElementById('orderTotal');

// Load saved address if available
function loadSavedAddress() {
    if (addressKey) {
        const savedAddress = localStorage.getItem(addressKey);
        if (savedAddress) {
            deliveryAddress.value = savedAddress;
            useSavedAddress.checked = true;
        }
    }
}

// Handle address checkboxes
if (useSavedAddress) {
    useSavedAddress.addEventListener('change', function() {
        if (this.checked && addressKey) {
            const savedAddress = localStorage.getItem(addressKey);
            if (savedAddress) {
                deliveryAddress.value = savedAddress;
                deliveryAddress.readOnly = true;
            }
        } else {
            deliveryAddress.readOnly = false;
        }
        if (deliverOtherLocation) {
            deliverOtherLocation.checked = !this.checked;
        }
    });
}

if (deliverOtherLocation) {
    deliverOtherLocation.addEventListener('change', function() {
        if (this.checked) {
            deliveryAddress.value = '';
            deliveryAddress.readOnly = false;
            if (useSavedAddress) {
                useSavedAddress.checked = false;
            }
        }
    });
}

// On page load, prefill address if user is logged in
window.addEventListener('DOMContentLoaded', () => {
    loadSavedAddress();
    // Add a small delay to ensure DOM is fully loaded
    setTimeout(() => {
        renderOrderSummary();
    }, 100);
});

// Also render on page load event
window.addEventListener('load', () => {
    renderOrderSummary();
});

if (addressForm) {
    addressForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Validate required fields
        const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'state', 'zipCode', 'orderEmail', 'orderPhone'];
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else if (field) {
                field.classList.remove('border-red-500');
            }
        });

        if (!isValid) {
            showError('Please fill in all required fields.');
            return;
        }

        // Store shipping information
        const shippingInfo = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            companyName: document.getElementById('companyName').value,
            streetAddress: document.getElementById('streetAddress').value,
            aptSuite: document.getElementById('aptSuite').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            email: document.getElementById('orderEmail').value,
            phone: document.getElementById('orderPhone').value,
            useAsBilling: document.getElementById('useAsBilling').checked,
            textAlerts: document.getElementById('textAlerts').checked,
            isGift: document.querySelector('input[type="checkbox"]').checked
        };

        localStorage.setItem('shippingInfo', JSON.stringify(shippingInfo));

        // Save address for user if not delivering to other location
        if (currentUser && (!deliverOtherLocation || !deliverOtherLocation.checked)) {
            const address = `${shippingInfo.streetAddress}, ${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}`;
            localStorage.setItem(addressKey, address);
        }

        // Handle payment method if available
        if (paymentMethod) {
            const payment = paymentMethod.value;
            if (payment === 'razorpay') {
                showStatus('Redirecting to RazorPay... (integration required)', 'green');
            } else if (payment === 'other') {
                showStatus('Other payment gateway integration required.', 'orange');
            } else {
                showStatus('Order placed successfully! (Cash on Delivery)', 'green');
                // Clear cart after successful order
                localStorage.removeItem('nearNowCartItems');
                localStorage.removeItem('cartItems');
                setTimeout(() => {
                    renderOrderSummary();
                }, 1000);
            }
        } else {
            showStatus('Shipping information saved! Proceeding to payment...', 'green');
        }
    });
}

function showStatus(msg, color) {
    if (orderStatus) {
        orderStatus.textContent = msg;
        orderStatus.classList.remove('hidden');
        orderStatus.classList.remove('text-green-600', 'text-orange-500', 'text-red-600');
        if (color === 'green') orderStatus.classList.add('text-green-600');
        else if (color === 'orange') orderStatus.classList.add('text-orange-500');
        else if (color === 'red') orderStatus.classList.add('text-red-600');
    }
}

function showError(msg) {
    showStatus(msg, 'red');
}

// --- Order Summary ---
function renderOrderSummary() {
    console.log('Rendering order summary...'); // Debug log

    if (!orderSummary || !orderTotal) {
        console.error('Order summary elements not found');
        return;
    }

    // Show loading state
    orderSummary.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-gray-500">Loading your cart...</p>
        </div>
    `;

    // Get cart items with better error handling
    let cartItems = [];

    try {
        // Try different localStorage keys
        const possibleKeys = ['nearNowCartItems', 'cartItems'];

        for (let key of possibleKeys) {
            const storedItems = localStorage.getItem(key);
            if (storedItems) {
                console.log(`Found items in ${key}:`, storedItems); // Debug log
                const parsedItems = JSON.parse(storedItems);
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                    cartItems = parsedItems;
                    break;
                }
            }
        }

        // If no items found in localStorage, try sessionStorage
        if (cartItems.length === 0) {
            const sessionCart = sessionStorage.getItem('cartItems');
            if (sessionCart) {
                console.log('Found items in sessionStorage:', sessionCart); // Debug log
                const parsedItems = JSON.parse(sessionCart);
                if (Array.isArray(parsedItems) && parsedItems.length > 0) {
                    cartItems = parsedItems;
                }
            }
        }

    } catch (error) {
        console.error('Error parsing cart items:', error);
        cartItems = [];
    }

    console.log('Final cart items:', cartItems); // Debug log

    // Display empty cart message if no items
    if (!cartItems || cartItems.length === 0) {
        orderSummary.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-shopping-cart text-gray-400 text-4xl mb-4"></i>
                <p class="text-gray-500 mb-2">Your cart is empty</p>
                <p class="text-sm text-gray-400 mb-4">Add some items to your cart to continue</p>
                <a href="index.html" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Continue Shopping
                </a>
            </div>
        `;
        orderTotal.textContent = '₹0';
        return;
    }

    let subtotal = 0;
    let summaryHTML = '';

    cartItems.forEach((item, index) => {
        try {
            // Handle different price formats with better validation
            let price = 0;

            if (item.price !== undefined && item.price !== null) {
                if (typeof item.price === 'string') {
                    // Remove currency symbols and parse
                    const cleanPrice = item.price.replace(/[₹$,\s]/g, '');
                    price = parseFloat(cleanPrice);
                } else if (typeof item.price === 'number') {
                    price = item.price;
                }
            }

            // Handle invalid prices
            if (isNaN(price) || price <= 0) {
                console.warn(`Invalid price for item ${index}:`, item);
                price = 0;
            }

            const quantity = parseInt(item.quantity) || 1;
            const itemTotal = price * quantity;
            subtotal += itemTotal;

            // Use item image if available, otherwise use placeholder
            const itemImage = item.image || item.img || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=60&h=60&fit=crop&crop=center`;
            const itemName = item.name || item.title || 'Unknown Item';

            summaryHTML += `
                <div class="flex items-center justify-between py-4 border-b border-gray-100">
                    <div class="flex items-center">
                        <img src="${itemImage}" alt="${itemName}" class="w-14 h-14 rounded-lg object-cover mr-3 shadow-sm" onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'">
                        <div>
                            <h4 class="font-semibold text-sm">${itemName}</h4>
                            <p class="text-xs text-gray-500">₹${price.toFixed(2)} each</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center bg-gray-50 rounded-lg">
                            <button onclick="updateItemQuantity(${index}, -1)" class="p-1 hover:bg-gray-200 rounded-l-lg transition-colors ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${quantity <= 1 ? 'disabled' : ''}>
                                <i class="fas fa-minus text-xs text-gray-600"></i>
                            </button>
                            <span class="px-3 py-1 text-sm font-medium">${quantity}</span>
                            <button onclick="updateItemQuantity(${index}, 1)" class="p-1 hover:bg-gray-200 rounded-r-lg transition-colors">
                                <i class="fas fa-plus text-xs text-gray-600"></i>
                            </button>
                        </div>
                        <div class="text-right">
                            <div class="font-semibold text-primary">₹${itemTotal.toFixed(2)}</div>
                            <button onclick="removeItem(${index})" class="text-xs text-red-500 hover:text-red-700 transition-colors">
                                <i class="fas fa-trash mr-1"></i>Remove
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error processing item ${index}:`, error, item);
        }
    });

    // Calculate delivery fee (free for orders above ₹500)
    const deliveryFee = subtotal >= 500 ? 0 : 30;
    // Add fixed handling charge
    const handlingCharge = 18;
    const total = subtotal + deliveryFee + handlingCharge;

    // Add subtotal, delivery fee, handling charge, and savings info
    summaryHTML += `
        <div class="py-4 space-y-3">
            <div class="flex justify-between text-sm">
                <span>Subtotal (${cartItems.length} items)</span>
                <span>₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span>Delivery Fee</span>
                <span class="${deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}">${deliveryFee === 0 ? 'FREE' : '₹' + deliveryFee}</span>
            </div>
            <div class="flex justify-between text-sm">
                <span>Handling Charges</span>
                <span>₹${handlingCharge.toFixed(2)}</span>
            </div>
            ${deliveryFee === 0 ? '<div class="flex items-center text-xs text-green-600"><i class="fas fa-check-circle mr-1"></i> Free delivery on orders above ₹500!</div>' : `<div class="text-xs text-gray-500">Add ₹${(500 - subtotal).toFixed(2)} more for free delivery</div>`}
            <div class="flex justify-between text-sm text-gray-500">
                <span>Estimated Tax</span>
                <span>Calculated at next step</span>
            </div>
        </div>
    `;

    orderSummary.innerHTML = summaryHTML;
    orderTotal.textContent = `₹${total.toFixed(2)}`;

    console.log('Order summary rendered successfully'); // Debug log
}

// Function to update item quantity
function updateItemQuantity(itemIndex, change) {
    console.log(`Updating item ${itemIndex} quantity by ${change}`);

    try {
        // Get current cart items
        let cartItems = [];
        const nearNowCart = localStorage.getItem('nearNowCartItems');
        if (nearNowCart) {
            cartItems = JSON.parse(nearNowCart);
        } else {
            const standardCart = localStorage.getItem('cartItems');
            if (standardCart) {
                cartItems = JSON.parse(standardCart);
            }
        }

        if (!cartItems || !Array.isArray(cartItems) || itemIndex >= cartItems.length) {
            console.error('Invalid cart items or index');
            return;
        }

        // Update quantity
        const currentQuantity = parseInt(cartItems[itemIndex].quantity) || 1;
        const newQuantity = Math.max(1, currentQuantity + change);

        cartItems[itemIndex].quantity = newQuantity;

        // Update localStorage
        localStorage.setItem('nearNowCartItems', JSON.stringify(cartItems));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Re-render order summary
        renderOrderSummary();

        // Show feedback
        showStatus(`Item quantity updated to ${newQuantity}`, 'green');
        setTimeout(() => {
            if (orderStatus) {
                orderStatus.classList.add('hidden');
            }
        }, 2000);

    } catch (error) {
        console.error('Error updating item quantity:', error);
        showError('Failed to update item quantity');
    }
}

// Function to remove item from cart
function removeItem(itemIndex) {
    console.log(`Removing item ${itemIndex} from cart`);

    try {
        // Get current cart items
        let cartItems = [];
        const nearNowCart = localStorage.getItem('nearNowCartItems');
        if (nearNowCart) {
            cartItems = JSON.parse(nearNowCart);
        } else {
            const standardCart = localStorage.getItem('cartItems');
            if (standardCart) {
                cartItems = JSON.parse(standardCart);
            }
        }

        if (!cartItems || !Array.isArray(cartItems) || itemIndex >= cartItems.length) {
            console.error('Invalid cart items or index');
            return;
        }

        // Remove item
        const removedItem = cartItems.splice(itemIndex, 1)[0];

        // Update localStorage
        localStorage.setItem('nearNowCartItems', JSON.stringify(cartItems));
        localStorage.setItem('cartItems', JSON.stringify(cartItems));

        // Re-render order summary
        renderOrderSummary();

        // Show feedback
        showStatus(`"${removedItem.name || 'Item'}" removed from cart`, 'green');
        setTimeout(() => {
            if (orderStatus) {
                orderStatus.classList.add('hidden');
            }
        }, 2000);

    } catch (error) {
        console.error('Error removing item:', error);
        showError('Failed to remove item');
    }
}

// Function to update cart (can be called from main page)
function updateCart(items) {
    console.log('Updating cart with items:', items); // Debug log
    if (Array.isArray(items)) {
        localStorage.setItem('nearNowCartItems', JSON.stringify(items));
        localStorage.setItem('cartItems', JSON.stringify(items)); // Keep both for compatibility
        renderOrderSummary();
    } else {
        console.error('Invalid items passed to updateCart:', items);
    }
}

// Function to clear cart
function clearCart() {
    localStorage.removeItem('nearNowCartItems');
    localStorage.removeItem('cartItems');
    sessionStorage.removeItem('cartItems');
    renderOrderSummary();
}

// Listen for storage changes to update cart in real-time
window.addEventListener('storage', function(e) {
    if (e.key === 'nearNowCartItems' || e.key === 'cartItems') {
        console.log('Storage changed, re-rendering order summary'); // Debug log
        renderOrderSummary();
    }
});

// Retry mechanism for cases where elements might not be ready
function initializeCheckout() {
    const maxRetries = 5;
    let retryCount = 0;

    function tryRender() {
        if (document.getElementById('orderSummary') && document.getElementById('orderTotal')) {
            renderOrderSummary();
        } else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Retrying to initialize checkout (${retryCount}/${maxRetries})`);
            setTimeout(tryRender, 200);
        } else {
            console.error('Failed to initialize checkout after maximum retries');
        }
    }

    tryRender();
}

// Initialize checkout when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    initializeCheckout();
}

// Expose functions globally for other scripts to use
window.updateCart = updateCart;
window.clearCart = clearCart;
window.renderOrderSummary = renderOrderSummary;
window.updateItemQuantity = updateItemQuantity;
window.removeItem = removeItem;