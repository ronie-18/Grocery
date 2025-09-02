// Enhanced Checkout Logic - checkout.js (Updated for Near & Now)

// Configuration matching Near & Now branding
const CONFIG = {
    DELIVERY_FEE: 50, // Fixed delivery fee for all orders
    HANDLING_CHARGE: 20,
    GST_RATE: 0.18,
    AUTO_HIDE_STATUS_DELAY: 5000,
    FORM_AUTO_SAVE_KEY: 'nearNowCheckoutFormData',
    MIN_ORDER_AMOUNT: 0, // No minimum order requirement
    CURRENCY_SYMBOL: '₹'
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
    submitSpinner: document.getElementById('submitSpinner')
});

// Utility functions
const formatCurrency = (amount) => `${CONFIG.CURRENCY_SYMBOL}${parseFloat(amount).toFixed(0)}`;

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

    // Update UI with Near & Now styling
    field.classList.toggle('input-error', !isValid);
    if (!isValid) {
        field.classList.add('border-red-500', 'bg-red-50');
    } else {
        field.classList.remove('border-red-500', 'bg-red-50');
    }

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

// Status and error handling with Near & Now styling
const showStatus = (msg, type = 'info', autoHide = true) => {
    const { orderStatus } = getElements();
    if (!orderStatus) return;

    const typeClasses = {
        success: 'text-green-700 bg-gradient-to-r from-green-50 to-emerald-100 border-green-300 shadow-lg',
        error: 'text-red-700 bg-gradient-to-r from-red-50 to-pink-100 border-red-300 shadow-lg',
        warning: 'text-orange-700 bg-gradient-to-r from-orange-50 to-yellow-100 border-orange-300 shadow-lg',
        info: 'text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-300 shadow-lg'
    };

    // Clear existing classes
    Object.values(typeClasses).forEach(classes => {
        classes.split(' ').forEach(cls => orderStatus.classList.remove(cls));
    });

    // Add new classes with enhanced styling
    orderStatus.className = `w-full text-center py-4 px-6 font-semibold border-2 transition-all duration-300 rounded-xl ${typeClasses[type] || typeClasses.info}`;
    orderStatus.innerHTML = `
        <div class="flex items-center justify-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation-circle' : 'info-circle'} mr-3 text-xl"></i>
            <span>${msg}</span>
        </div>
    `;
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

    // Fixed charges - no free delivery
    const deliveryFee = CONFIG.DELIVERY_FEE; // Always apply delivery fee
    const handlingCharge = CONFIG.HANDLING_CHARGE;
    const gstAmount = subtotal * CONFIG.GST_RATE;
    const total = subtotal + deliveryFee + handlingCharge + gstAmount;

    return {
        subtotal,
        deliveryFee,
        handlingCharge,
        gstAmount,
        total,
        itemCount: cartItems.reduce((count, item) => count + (parseInt(item.quantity) || 1), 0)
    };
};

// Enhanced order summary rendering with compact, shuttle design
const renderOrderSummary = () => {
    console.log('Rendering compact order summary for Near & Now...');

    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    const orderBreakdown = document.getElementById('orderBreakdown');

    if (!orderSummary || !orderTotal) {
        console.error('Order summary elements not found');
        return;
    }

    // Show loading state with Near & Now branding
    orderSummary.innerHTML = `
        <div class="text-center py-6">
            <div class="relative mx-auto mb-4 w-12 h-12">
                <div class="absolute inset-0 border-3 border-primary border-opacity-20 rounded-full"></div>
                <div class="absolute inset-0 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <i class="fas fa-shopping-basket text-primary text-lg absolute inset-0 flex items-center justify-center"></i>
            </div>
            <p class="text-gray-600 font-medium">Loading cart...</p>
        </div>
    `;

    const cartItems = getCartItems();

    // Handle empty cart with compact design
    if (cartItems.length === 0) {
        orderSummary.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center">
                    <i class="fas fa-shopping-cart text-primary text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Cart is empty</h3>
                <p class="text-sm text-gray-600 mb-4">Add fresh groceries to continue</p>
                <a href="index.html" class="inline-block bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    <i class="fas fa-leaf mr-2"></i>Shop Now
                </a>
            </div>
        `;
        if (orderBreakdown) orderBreakdown.innerHTML = '';
        orderTotal.textContent = formatCurrency(0);
        return;
    }

    // Render cart items in compact, shuttle format
    let summaryHTML = '';
    cartItems.forEach((item, index) => {
        try {
            const price = parsePrice(item.price);
            const quantity = parseInt(item.quantity) || 1;
            const itemTotal = price * quantity;

            const itemImage = item.image || item.img || `https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=48&h=48&fit=crop&crop=center`;
            const itemName = item.name || item.title || 'Unknown Item';

            summaryHTML += `
                <div class="cart-item flex items-center justify-between py-3 px-3 mb-2 bg-white rounded-lg border border-gray-200 hover:border-primary/50 transition-all duration-200 group">
                    <div class="flex items-center flex-1 min-w-0">
                        <div class="relative flex-shrink-0">
                            <img src="${itemImage}" alt="${itemName}"
                                 class="w-12 h-12 rounded-lg object-cover border border-gray-200 group-hover:border-primary transition-colors duration-200"
                                 onerror="this.src='https://via.placeholder.com/48x48/059669/ffffff?text=N&N'">
                            <div class="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">
                                ${quantity}
                            </div>
                        </div>
                        <div class="ml-3 flex-1 min-w-0">
                            <h4 class="font-semibold text-sm text-gray-800 truncate group-hover:text-primary transition-colors duration-200" title="${itemName}">${itemName}</h4>
                            <p class="text-xs text-gray-500">${formatCurrency(price)} × ${quantity}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        <div class="text-right">
                            <div class="font-bold text-primary text-sm">${formatCurrency(itemTotal)}</div>
                        </div>
                        <div class="flex flex-col space-y-1">
                            <button onclick="updateItemQuantity(${index}, 1)"
                                    class="w-6 h-6 bg-primary/10 hover:bg-primary hover:text-white rounded-full transition-all duration-200 flex items-center justify-center text-xs border border-primary/20"
                                    title="Increase quantity">
                                <i class="fas fa-plus"></i>
                            </button>
                            <button onclick="updateItemQuantity(${index}, -1)"
                                    class="w-6 h-6 bg-red-50 hover:bg-red-500 hover:text-white rounded-full transition-all duration-200 flex items-center justify-center text-xs border border-red-200 ${quantity <= 1 ? 'opacity-50 cursor-not-allowed' : ''}"
                                    ${quantity <= 1 ? 'disabled' : ''}
                                    title="Decrease quantity">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error(`Error processing item ${index}:`, error, item);
        }
    });

    orderSummary.innerHTML = summaryHTML;

    // Calculate totals and render breakdown
    const totals = calculateOrderTotal(cartItems);

    if (orderBreakdown) {
        orderBreakdown.innerHTML = `
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal (${totals.itemCount} items)</span>
                    <span class="font-semibold">${formatCurrency(totals.subtotal)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600 flex items-center">
                        Delivery Fee
                        <i class="fas fa-truck ml-1 text-orange-500 text-xs"></i>
                    </span>
                    <span class="font-semibold text-orange-600">${formatCurrency(totals.deliveryFee)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Handling Charges</span>
                    <span class="font-semibold">${formatCurrency(totals.handlingCharge)}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">GST (18%)</span>
                    <span class="font-semibold">${formatCurrency(totals.gstAmount)}</span>
                </div>
                <div class="border-t border-gray-300 pt-2 mt-3">
                    <div class="bg-orange-50 p-2 rounded-lg border border-orange-200">
                        <div class="flex items-center text-xs text-orange-800">
                            <i class="fas fa-info-circle mr-2"></i>
                            <span class="font-medium">₹${CONFIG.DELIVERY_FEE} delivery fee applies to all orders</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    orderTotal.textContent = formatCurrency(totals.total);

    console.log('Compact order summary rendered successfully');
};

// Enhanced cart item management
const updateItemQuantity = (itemIndex, change) => {
    try {
        const cartItems = getCartItems();
        if (!cartItems || itemIndex >= cartItems.length || itemIndex < 0) {
            showError('Invalid item selected');
            return;
        }

        const currentQuantity = parseInt(cartItems[itemIndex].quantity) || 1;
        const newQuantity = Math.max(1, Math.min(99, currentQuantity + change));

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

        const item = cartItems[itemIndex];
        const itemPrice = parsePrice(item.price) * (parseInt(item.quantity) || 1);

        // Show confirmation for expensive items
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

// Enhanced form submission with Near & Now branding
const resetSubmitButton = () => {
    const { submitButton, submitButtonText, submitSpinner } = getElements();
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('opacity-75', 'cursor-not-allowed');
        isSubmitting = false;
    }
    if (submitButtonText) {
        submitButtonText.textContent = 'Place Order Now';
    }
    if (submitSpinner) {
        submitSpinner.classList.add('hidden');
    }
};

const setSubmitLoading = (message = 'Processing...') => {
    const { submitButton, submitButtonText, submitSpinner } = getElements();
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.classList.add('opacity-75', 'cursor-not-allowed');
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
                showStatus('Redirecting to secure payment gateway...', 'info');
                setSubmitLoading('Redirecting to payment...');
                // Integrate with actual payment gateway here
                setTimeout(() => {
                    showSuccess('Payment gateway integration will be implemented here');
                    resetSubmitButton();
                }, 1500);
                break;

            case 'other':
                showStatus('Redirecting to payment options...', 'info');
                setSubmitLoading('Loading payment options...');
                setTimeout(() => {
                    showSuccess('Alternative payment methods will be implemented here');
                    resetSubmitButton();
                }, 1500);
                break;

            default: // Cash on Delivery
                showSuccess('🎉 Order placed successfully! Your fresh groceries will be delivered within 30-60 minutes.');

                // Update progress bar to show completion
                const progressCircles = document.querySelectorAll('.progress-circle');
                const progressLabels = document.querySelectorAll('.progress-label');
                const progressLines = document.querySelectorAll('.progress-line');

                if (progressCircles.length >= 3 && progressLabels.length >= 3) {
                    // Complete first two steps
                    progressCircles[0].classList.add('completed');
                    progressCircles[0].classList.remove('active');
                    progressLabels[0].classList.add('completed');
                    progressLabels[0].classList.remove('active');

                    progressCircles[1].classList.add('completed');
                    progressLabels[1].classList.add('completed');

                    progressCircles[2].classList.add('completed');
                    progressLabels[2].classList.add('completed');
                    progressLabels[2].textContent = 'Order Confirmed!';

                    // Complete progress lines
                    progressLines.forEach(line => line.classList.add('completed'));

                    // Update icons
                    progressCircles[0].innerHTML = '<i class="fas fa-check"></i>';
                    progressCircles[1].innerHTML = '<i class="fas fa-check"></i>';
                    progressCircles[2].innerHTML = '<i class="fas fa-check-double"></i>';
                }

                // Clear form data and cart
                localStorage.removeItem(CONFIG.FORM_AUTO_SAVE_KEY);
                setTimeout(() => {
                    clearCart();
                    // Could redirect to order confirmation page
                    // window.location.href = 'order-confirmation.html';
                }, 3000);
                break;
        }
    } catch (error) {
        console.error('Order processing error:', error);
        showError('An error occurred while processing your order. Please try again.');
    } finally {
        if (orderData.paymentMethod === 'cod') {
            setTimeout(() => {
                resetSubmitButton();
            }, 3000);
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

            // Get selected payment method
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked');
            if (!selectedPayment) {
                showError('Please select a payment method.');
                return;
            }

            // Collect order data
            const orderData = {
                // Personal details
                firstName: document.getElementById('firstName').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),

                // Address
                streetAddress: document.getElementById('streetAddress').value.trim(),
                aptSuite: document.getElementById('aptSuite').value.trim(),
                landmark: document.getElementById('landmark').value.trim(),
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value.trim(),

                // Contact
                email: document.getElementById('orderEmail').value.trim(),
                phone: document.getElementById('orderPhone').value.trim(),

                // Preferences
                useAsBilling: document.getElementById('useAsBilling').checked,
                isGift: document.getElementById('giftOrder').checked,
                paymentMethod: selectedPayment.value,

                // Order details
                items: cartItems,
                totals: calculateOrderTotal(cartItems),
                timestamp: new Date().toISOString(),

                // Near & Now specific
                source: 'Near & Now Checkout',
                deliveryNote: 'Digital Dukan, Local Dil Se'
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
                    // Auto-save as user types
                    saveFormData();
                });
            }
        });

        // Auto-save form data on change
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

    // Enhanced keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'submit') {
            e.preventDefault();
            const form = e.target.closest('form');
            if (form) {
                const inputs = Array.from(form.querySelectorAll('input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), select, textarea'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];
                if (nextInput) {
                    nextInput.focus();
                } else {
                    // If it's the last field, focus on submit button
                    const submitBtn = form.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.focus();
                    }
                }
            }
        }
    });

    // Phone number formatting
    const phoneInput = document.getElementById('orderPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Remove non-numeric characters
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 10 digits
            if (value.length > 10) {
                value = value.slice(0, 10);
            }
            e.target.value = value;
        });
    }

    // PIN code formatting
    const zipInput = document.getElementById('zipCode');
    if (zipInput) {
        zipInput.addEventListener('input', (e) => {
            // Remove non-numeric characters
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 6 digits
            if (value.length > 6) {
                value = value.slice(0, 6);
            }
            e.target.value = value;
        });
    }
};

// Public API
const updateCart = (items) => {
    if (Array.isArray(items)) {
        saveCartItems(items);
        renderOrderSummary();
        showSuccess('Cart updated successfully');
    } else {
        console.error('Invalid items passed to updateCart:', items);
        showError('Failed to update cart');
    }
};

// Enhanced initialization
const initializeCheckout = () => {
    console.log('Initializing Near & Now checkout...');

    // Load saved form data
    loadFormData();

    // Render order summary
    renderOrderSummary();

    // Setup event listeners
    setupEventListeners();

    // Pre-fill user data if available
    const currentUser = getCurrentUser();
    if (currentUser) {
        const firstNameField = document.getElementById('firstName');
        const phoneField = document.getElementById('orderPhone');

        if (firstNameField && !firstNameField.value && currentUser.name) {
            const nameParts = currentUser.name.split(' ');
            firstNameField.value = nameParts[0] || '';

            const lastNameField = document.getElementById('lastName');
            if (lastNameField && nameParts.length > 1) {
                lastNameField.value = nameParts.slice(1).join(' ');
            }
        }

        if (phoneField && !phoneField.value && currentUser.mobile) {
            phoneField.value = currentUser.mobile;
        }
    }

    // Show welcome message for logged-in users
    if (currentUser) {
        setTimeout(() => {
            showSuccess(`Welcome back, ${currentUser.name}! Complete your order below.`);
        }, 500);
    }

    console.log('Near & Now checkout initialized successfully');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCheckout);
} else {
    initializeCheckout();
}

// Expose public functions to global scope
window.updateCart = updateCart;
window.clearCart = clearCart;
window.renderOrderSummary = renderOrderSummary;
window.updateItemQuantity = updateItemQuantity;
window.removeItem = removeItem;

// Near & Now specific utility functions
window.NearNowCheckout = {
    formatCurrency,
    calculateOrderTotal,
    getCurrentUser,
    validateAllFields,
    showSuccess,
    showError,
    showWarning
};