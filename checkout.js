// Enhanced Checkout Logic - checkout.js

// Configuration
const CONFIG = {
    FREE_DELIVERY_THRESHOLD: 500,
    DELIVERY_FEE: 30,
    HANDLING_CHARGE: 18,
    GST_RATE: 0.18,
    AUTO_HIDE_STATUS_DELAY: 5000,
    FORM_AUTO_SAVE_KEY: 'checkoutFormData'
};

// State management
let isSubmitting = false;
let cartUpdateTimeout = null;

// Get current user from storage
const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

const currentUser = getCurrentUser();
const addressKey = currentUser ? `nearNowAddress_${currentUser.mobile}` : null;

// DOM elements
const getElements = () => ({
    addressForm: document.getElementById('addressForm'),
    orderStatus: document.getElementById('orderStatus'),
    orderSummary: document.getElementById('orderSummary'),
    orderTotal: document.getElementById('orderTotal'),
    submitButton: document.getElementById('submitButton'),
    submitButtonText: document.getElementById('submitButtonText'),
    submitSpinner: document.getElementById('submitSpinner'),
    deliveryProgressBar: document.getElementById('deliveryProgressBar'),
    deliveryMessage: document.getElementById('deliveryMessage')
});

// Utility functions
const formatCurrency = (amount) => `₹${parseFloat(amount).toFixed(2)}`;

const parsePrice = (price) => {
    if (price === undefined || price === null) return 0;
    if (typeof price === 'number') return price;
    if (typeof price === 'string') {
        const cleanPrice = price.replace(/[₹$,\s]/g, '');
        return parseFloat(cleanPrice) || 0;
    }
    return 0;
};

const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Enhanced validation functions
const ValidationRules = {
    required: (value) => ({
        isValid: value.trim().length > 0,
        message: 'This field is required'
    }),

    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
            return { isValid: false, message: 'Email is required' };
        }
        return {
            isValid: emailRegex.test(value),
            message: 'Please enter a valid email address'
        };
    },

    phone: (value) => {
        const phoneRegex = /^[0-9]{10}$/;
        if (!value.trim()) {
            return { isValid: false, message: 'Phone number is required' };
        }
        return {
            isValid: phoneRegex.test(value.replace(/\s/g, '')),
            message: 'Please enter a valid 10-digit phone number'
        };
    },

    zipcode: (value) => {
        const zipRegex = /^[0-9]{6}$/;
        if (!value.trim()) {
            return { isValid: false, message: 'PIN code is required' };
        }
        return {
            isValid: zipRegex.test(value),
            message: 'Please enter a valid 6-digit PIN code'
        };
    },

    name: (value) => {
        if (!value.trim()) {
            return { isValid: false, message: 'Name is required' };
        }
        if (value.trim().length < 2) {
            return { isValid: false, message: 'Name must be at least 2 characters long' };
        }
        return { isValid: true, message: '' };
    }
};

// Form validation
const validateField = (fieldId, validationType = 'required') => {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}-error`);

    if (!field) return true;

    const value = field.value.trim();
    const validator = ValidationRules[validationType];

    if (!validator) {
        console.warn(`Validation type "${validationType}" not found`);
        return true;
    }

    const { isValid, message } = validator(value);

    // Update UI
    field.classList.toggle('input-error', !isValid);

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = isValid ? 'none' : 'block';
    }

    return isValid;
};

const validateAllFields = () => {
    const validationRules = {
        'firstName': 'name',
        'lastName': 'name',
        'streetAddress': 'required',
        'city': 'required',
        'state': 'required',
        'zipCode': 'zipcode',
        'orderEmail': 'email',
        'orderPhone': 'phone'
    };

    let isFormValid = true;
    const firstInvalidField = Object.entries(validationRules).find(([fieldId, rule]) => {
        const isValid = validateField(fieldId, rule);
        if (!isValid && isFormValid) {
            isFormValid = false;
            return true;
        }
        return false;
    });

    // Focus on first invalid field
    if (firstInvalidField) {
        const fieldElement = document.getElementById(firstInvalidField[0]);
        if (fieldElement) {
            fieldElement.focus();
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return isFormValid;
};

// Status and error handling
const showStatus = (msg, type = 'info', autoHide = true) => {
    const { orderStatus } = getElements();
    if (!orderStatus) return;

    const typeClasses = {
        success: 'text-green-600 bg-green-50 border-green-200',
        error: 'text-red-600 bg-red-50 border-red-200',
        warning: 'text-orange-600 bg-orange-50 border-orange-200',
        info: 'text-blue-600 bg-blue-50 border-blue-200'
    };

    // Clear existing classes
    Object.values(typeClasses).forEach(classes => {
        classes.split(' ').forEach(cls => orderStatus.classList.remove(cls));
    });

    // Add new classes
    orderStatus.className = `w-full text-center py-3 px-4 font-semibold border transition-all duration-300 ${typeClasses[type] || typeClasses.info}`;
    orderStatus.textContent = msg;
    orderStatus.classList.remove('hidden');

    if (autoHide && type !== 'error') {
        setTimeout(() => {
            orderStatus.classList.add('hidden');
        }, CONFIG.AUTO_HIDE_STATUS_DELAY);
    }

    // Scroll to show status for errors
    if (type === 'error') {
        orderStatus.scrollIntoView({ behavior: 'smooth' });
    }
};

const showError = (msg) => showStatus(msg, 'error', false);
const showSuccess = (msg) => showStatus(msg, 'success');
const showWarning = (msg) => showStatus(msg, 'warning');

// Cart management
const getCartItems = () => {
    try {
        const keys = ['nearNowCartItems', 'cartItems'];
        for (const key of keys) {
            const stored = localStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    return parsed;
                }
            }
        }

        // Check sessionStorage as fallback
        const sessionCart = sessionStorage.getItem('cartItems');
        if (sessionCart) {
            const parsed = JSON.parse(sessionCart);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }

        return [];
    } catch (error) {
        console.error('Error getting cart items:', error);
        return [];
    }
};

const saveCartItems = (items) => {
    try {
        const itemsJson = JSON.stringify(items);
        localStorage.setItem('nearNowCartItems', itemsJson);
        localStorage.setItem('cartItems', itemsJson);

        // Dispatch custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: items }));
    } catch (error) {
        console.error('Error saving cart items:', error);
    }
};

const calculateOrderTotal = (cartItems) => {
    let subtotal = 0;

    cartItems.forEach(item => {
        const price = parsePrice(item.price);
        const quantity = parseInt(item.quantity) || 1;
        subtotal += price * quantity;
    });

    const deliveryFee = subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD ? 0 : CONFIG.DELIVERY_FEE;
    const handlingCharge = CONFIG.HANDLING_CHARGE;
    const gstAmount = subtotal * CONFIG.GST_RATE;
    const total = subtotal + deliveryFee + handlingCharge + gstAmount;

    return {
        subtotal,
        deliveryFee,
        handlingCharge,
        gstAmount,
        total,
        itemCount: cartItems.length
    };
};

// Delivery progress
const updateDeliveryProgress = (subtotal) => {
    const { deliveryProgressBar, deliveryMessage } = getElements();

    if (deliveryProgressBar && deliveryMessage) {
        const progress = Math.min((subtotal / CONFIG.FREE_DELIVERY_THRESHOLD) * 100, 100);
        deliveryProgressBar.style.width = `${progress}%`;

        if (subtotal >= CONFIG.FREE_DELIVERY_THRESHOLD) {
            deliveryMessage.innerHTML = '<i class="fas fa-check-circle mr-1"></i>🎉 You qualify for free delivery!';
            deliveryMessage.className = 'text-xs text-green-600 mt-1 font-semibold';
        } else {
            const remaining = CONFIG.FREE_DELIVERY_THRESHOLD - subtotal;
            deliveryMessage.innerHTML = `<i class="fas fa-info-circle mr-1"></i>Add ${formatCurrency(remaining)} more for free delivery`;
            deliveryMessage.className = 'text-xs text-orange-600 mt-1';
        }
    }
};

// Order summary rendering
const renderOrderSummary = () => {
    console.log('Rendering order summary...');

    const { orderSummary, orderTotal } = getElements();
    if (!orderSummary || !orderTotal) {
        console.error('Order summary elements not found');
        return;
    }

    // Show loading state
    orderSummary.innerHTML = `
        <div class="text-center py-8">
            <div class="animate-pulse rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-gray-500">Loading your cart...</p>
        </div>
    `;

    const cartItems = getCartItems();

    // Handle empty cart
    if (cartItems.length === 0) {
        orderSummary.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-gray-400 text-2xl"></i>
                </div>
                <p class="text-gray-500 mb-2 font-semibold">Your cart is empty</p>
                <p class="text-sm text-gray-400 mb-4">Add some items to your cart to continue</p>
                <a href="index.html" class="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-secondary transition-colors font-semibold shadow-lg">
                    <i class="fas fa-plus mr-2"></i>Start Shopping
                </a>
            </div>
        `;
        orderTotal.textContent = formatCurrency(0);
        updateDeliveryProgress(0);
        return;
    }

    // Render cart items
    let summaryHTML = '';
    cartItems.forEach((item, index) => {
        try {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 1;
            const itemTotal = price * quantity;

            const itemImage = item.image || item.img || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=64&h=64&fit=crop&crop=center`;
            const itemName = item.name || item.title || 'Unknown Item';

            summaryHTML += `
                <div class="cart-item flex items-center justify-between py-4 border-b border-gray-100 rounded-lg px-2 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                            <img src="${itemImage}" alt="${itemName}"
                                 class="w-16 h-16 rounded-lg object-cover shadow-sm border border-gray-200"
                                 onerror="this.src='https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+Image'">
                            <div class="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg">
                                ${quantity}
                            </div>
                        </div>
                        <div class="ml-3 flex-1 min-w-0">
                            <h4 class="font-semibold text-sm text-gray-800 truncate" title="${itemName}">${itemName}</h4>
                            <p class="text-xs text-gray-500">${formatCurrency(price)} each</p>
                            <div class="flex items-center mt-2">
                                <div class="flex items-center bg-gray-50 rounded-lg border shadow-sm">
                                    <button onclick="updateItemQuantity(${index}, -1)"
                                            class="quantity-btn p-2 hover:bg-primary hover:text-white rounded-l-lg transition-colors text-xs ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                                            ${quantity <= 1 ? 'disabled' : ''}
                                            title="Decrease quantity">
                                        <i class="fas fa-minus"></i>
                                    </button>
                                    <span class="px-3 py-1 text-sm font-medium min-w-[2.5rem] text-center bg-white">${quantity}</span>
                                    <button onclick="updateItemQuantity(${index}, 1)"
                                            class="quantity-btn p-2 hover:bg-primary hover:text-white rounded-r-lg transition-colors text-xs"
                                            title="Increase quantity">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="text-right ml-3 flex-shrink-0">
                        <div class="font-bold text-primary text-lg">${formatCurrency(itemTotal)}</div>
                        <button onclick="removeItem(${index})"
                                class="text-xs text-red-500 hover:text-red-700 transition-colors mt-1 hover:bg-red-50 px-2 py-1 rounded-lg"
                                title="Remove item">
                            <i class="fas fa-trash mr-1"></i>Remove
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error processing item ${index}:`, error, item);
        }
    });

    // Calculate totals
    const totals = calculateOrderTotal(cartItems);

    // Update delivery progress
    updateDeliveryProgress(totals.subtotal);

    // Add order breakdown
    summaryHTML += `
        <div class="py-4 space-y-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 mt-4 border border-gray-200">
            <h3 class="font-semibold text-gray-800 mb-3 flex items-center">
                <i class="fas fa-calculator text-primary mr-2"></i>Order Breakdown
            </h3>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? 'item' : 'items'})</span>
                    <span class="font-semibold">${formatCurrency(totals.subtotal)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600 flex items-center">
                        Delivery Fee
                        ${totals.deliveryFee === 0 ? '<i class="fas fa-gift text-green-500 ml-1" title="Free delivery!"></i>' : ''}
                    </span>
                    <span class="${totals.deliveryFee === 0 ? 'text-green-600 font-bold' : 'font-semibold'}">
                        ${totals.deliveryFee === 0 ? 'FREE' : formatCurrency(totals.deliveryFee)}
                    </span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Handling Charges</span>
                    <span class="font-semibold">${formatCurrency(totals.handlingCharge)}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">GST (18%)</span>
                    <span class="font-semibold">${formatCurrency(totals.gstAmount)}</span>
                </div>
                ${totals.deliveryFee > 0 ? `
                <div class="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg flex items-center border border-orange-200">
                    <i class="fas fa-truck mr-2"></i>
                    <span>Add ${formatCurrency(CONFIG.FREE_DELIVERY_THRESHOLD - totals.subtotal)} more for free delivery!</span>
                </div>
                ` : `
                <div class="text-xs text-green-600 bg-green-50 p-3 rounded-lg flex items-center border border-green-200">
                    <i class="fas fa-check-circle mr-2"></i>
                    <span>🎉 You saved ${formatCurrency(CONFIG.DELIVERY_FEE)} on delivery!</span>
                </div>
                `}
            </div>
        </div>
        <div class="flex justify-between items-center text-lg font-bold pt-4 border-t-2 border-primary mt-4 bg-primary bg-opacity-5 p-3 rounded-lg">
            <span class="text-gray-800">Grand Total</span>
            <span class="text-primary text-xl">${formatCurrency(totals.total)}</span>
        </div>
    `;

    orderSummary.innerHTML = summaryHTML;
    orderTotal.textContent = formatCurrency(totals.total);

    console.log('Order summary rendered successfully');
};

// Cart item management
const updateItemQuantity = (itemIndex, change) => {
    try {
        const cartItems = getCartItems();
        if (!cartItems || itemIndex >= cartItems.length || itemIndex < 0) {
            showError('Invalid item selected');
            return;
        }

        const currentQuantity = parseInt(cartItems[itemIndex].quantity) || 1;
        const newQuantity = Math.max(1, Math.min(99, currentQuantity + change)); // Limit to 99

        if (newQuantity === currentQuantity) {
            if (newQuantity === 1 && change < 0) {
                showWarning('Minimum quantity is 1');
            } else if (newQuantity === 99 && change > 0) {
                showWarning('Maximum quantity is 99');
            }
            return;
        }

        cartItems[itemIndex].quantity = newQuantity;
        saveCartItems(cartItems);

        // Debounced re-render to prevent excessive updates
        clearTimeout(cartUpdateTimeout);
        cartUpdateTimeout = setTimeout(() => {
            renderOrderSummary();
        }, 100);

        showSuccess(`Quantity updated to ${newQuantity}`);
    } catch (error) {
        console.error('Error updating quantity:', error);
        showError('Failed to update quantity. Please try again.');
    }
};

const removeItem = (itemIndex) => {
    try {
        const cartItems = getCartItems();
        if (!cartItems || itemIndex >= cartItems.length || itemIndex < 0) {
            showError('Invalid item selected');
            return;
        }

        // Show confirmation for expensive items
        const item = cartItems[itemIndex];
        const itemPrice = parsePrice(item.price) * (parseInt(item.quantity) || 1);

        if (itemPrice > 500) {
            if (!confirm(`Are you sure you want to remove "${item.name || 'this item'}" (${formatCurrency(itemPrice)}) from your cart?`)) {
                return;
            }
        }

        const removedItem = cartItems.splice(itemIndex, 1)[0];
        saveCartItems(cartItems);
        renderOrderSummary();

        showSuccess(`"${removedItem.name || 'Item'}" removed from cart`);
    } catch (error) {
        console.error('Error removing item:', error);
        showError('Failed to remove item. Please try again.');
    }
};

const clearCart = () => {
    const cartItems = getCartItems();
    if (cartItems.length === 0) {
        showWarning('Your cart is already empty');
        return;
    }

    if (confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
        try {
            localStorage.removeItem('nearNowCartItems');
            localStorage.removeItem('cartItems');
            sessionStorage.removeItem('cartItems');
            renderOrderSummary();
            showSuccess('Cart cleared successfully');
        } catch (error) {
            console.error('Error clearing cart:', error);
            showError('Failed to clear cart. Please try again.');
        }
    }
};

// Form data persistence
const saveFormData = debounce(() => {
    const { addressForm } = getElements();
    if (!addressForm) return;

    try {
        const formData = {};
        const inputs = addressForm.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                formData[input.id || input.name] = input.checked;
            } else {
                formData[input.id || input.name] = input.value;
            }
        });

        localStorage.setItem(CONFIG.FORM_AUTO_SAVE_KEY, JSON.stringify(formData));
    } catch (error) {
        console.error('Error saving form data:', error);
    }
}, 500);

const loadFormData = () => {
    try {
        const savedData = localStorage.getItem(CONFIG.FORM_AUTO_SAVE_KEY);
        if (!savedData) return;

        const formData = JSON.parse(savedData);
        Object.entries(formData).forEach(([key, value]) => {
            const input = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = Boolean(value);
                } else {
                    input.value = value || '';
                }
            }
        });
    } catch (error) {
        console.error('Error loading form data:', error);
    }
};

// Form submission
const resetSubmitButton = () => {
    const { submitButton, submitButtonText, submitSpinner } = getElements();
    if (submitButton) {
        submitButton.disabled = false;
        isSubmitting = false;
    }
    if (submitButtonText) {
        submitButtonText.textContent = 'Place Order';
    }
    if (submitSpinner) {
        submitSpinner.classList.add('hidden');
    }
};

const setSubmitLoading = (message = 'Processing...') => {
    const { submitButton, submitButtonText, submitSpinner } = getElements();
    if (submitButton) {
        submitButton.disabled = true;
        isSubmitting = true;
    }
    if (submitButtonText) {
        submitButtonText.textContent = message;
    }
    if (submitSpinner) {
        submitSpinner.classList.remove('hidden');
    }
};

const processOrder = async (orderData) => {
    try {
        setSubmitLoading('Processing your order...');

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        const paymentMethod = orderData.paymentMethod;

        switch (paymentMethod) {
            case 'razorpay':
                showStatus('Redirecting to payment gateway...', 'info');
                setSubmitLoading('Redirecting...');
                // Integrate with actual payment gateway here
                setTimeout(() => {
                    showSuccess('Payment gateway integration needed');
                    resetSubmitButton();
                }, 1500);
                break;

            case 'other':
                showStatus('Redirecting to payment options...', 'info');
                setSubmitLoading('Redirecting...');
                setTimeout(() => {
                    showSuccess('Alternative payment integration needed');
                    resetSubmitButton();
                }, 1500);
                break;

            default: // Cash on Delivery
                showSuccess('🎉 Order placed successfully! You will receive a confirmation email shortly.');

                // Clear form data and cart
                localStorage.removeItem(CONFIG.FORM_AUTO_SAVE_KEY);
                setTimeout(() => {
                    clearCart();
                    // Could redirect to order confirmation page
                    // window.location.href = 'order-confirmation.html';
                }, 2000);
                break;
        }
    } catch (error) {
        console.error('Order processing error:', error);
        showError('An error occurred while processing your order. Please try again.');
    } finally {
        if (orderData.paymentMethod === 'cod') {
            resetSubmitButton();
        }
    }
};

// Event listeners setup
const setupEventListeners = () => {
    const { addressForm } = getElements();

    if (addressForm) {
        // Form submission
        addressForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (isSubmitting) return;

            // Validate form
            if (!validateAllFields()) {
                showError('Please correct the errors above and try again.');
                return;
            }

            // Check if cart is empty
            const cartItems = getCartItems();
            if (cartItems.length === 0) {
                showError('Your cart is empty. Please add items before placing an order.');
                return;
            }

            // Collect order data
            const orderData = {
                // Personal details
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                landmark: document.getElementById('landmark').value.trim(),

                // Address
                streetAddress: document.getElementById('streetAddress').value.trim(),
                aptSuite: document.getElementById('aptSuite').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value.trim(),

                // Contact
                email: document.getElementById('orderEmail').value.trim(),
                phone: document.getElementById('orderPhone').value.trim(),

                // Preferences
                useAsBilling: document.getElementById('useAsBilling').checked,
                textAlerts: document.getElementById('textAlerts').checked,
                isGift: document.getElementById('giftOrder').checked,
                paymentMethod: document.querySelector('input[name="paymentMethod"]:checked').value,

                // Order details
                items: cartItems,
                totals: calculateOrderTotal(cartItems),
                timestamp: new Date().toISOString()
            };

            await processOrder(orderData);
        });

        // Real-time validation
        const validationRules = {
            'firstName': 'name',
            'lastName': 'name',
            'streetAddress': 'required',
            'city': 'required',
            'state': 'required',
            'zipCode': 'zipcode',
            'orderEmail': 'email',
            'orderPhone': 'phone'
        };

        Object.entries(validationRules).forEach(([fieldId, rule]) => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => validateField(fieldId, rule));
                field.addEventListener('input', () => {
                    if (field.classList.contains('input-error')) {
                        validateField(fieldId, rule);
                    }
                });
            }
        });

        // Auto-save form data
        addressForm.addEventListener('input', saveFormData);
        addressForm.addEventListener('change', saveFormData);
    }

    // Storage change listener
    window.addEventListener('storage', (e) => {
        if (e.key === 'nearNowCartItems' || e.key === 'cartItems') {
            console.log('Storage changed, re-rendering order summary');
            renderOrderSummary();
        }
    });

    // Custom cart update event listener
    window.addEventListener('cartUpdated', () => {
        renderOrderSummary();
    });

    // Prevent form submission on Enter key in input fields (except submit button)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
            e.preventDefault();
            const form = e.target.closest('form');
            if (form) {
                const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus();
                }
            }
        }
    });
};

// Public API
const updateCart = (items) => {
    if (Array.isArray(items)) {
        saveCartItems(items);
        renderOrderSummary();
    } else {
        console.error('Invalid items passed to updateCart:', items);
    }
};

// Initialization
const initializeCheckout = () => {
    console.log('Initializing checkout...');

    // Load saved form data
    loadFormData();

    // Render order summary
    renderOrderSummary();

    // Setup event listeners
    setupEventListeners();

    console.log('Checkout initialized successfully');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    initializeCheckout();
}

// Expose public functions
window.updateCart = updateCart;
window.clearCart = clearCart;
window.renderOrderSummary = renderOrderSummary;
window.updateItemQuantity = updateItemQuantity;
window.removeItem = removeItem;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateCart,
        clearCart,
        renderOrderSummary,
        updateItemQuantity,
        removeItem,
        initializeCheckout
    };
}