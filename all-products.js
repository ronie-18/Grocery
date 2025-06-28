// --- Product Data ---
// products, getAllProducts, getAvailableCategories are loaded from products-data.js

let allProducts = products;
let displayedProducts = [...allProducts];
let currentCategory = 'all';
let currentSort = 'default';
let currentPage = 1;
const productsPerPage = 12;

// Firebase Authentication Variables
let currentStep = 1;
let userDetails = {};
let otpTimer = null;
let resendTimer = 30;
let confirmationResult = null;
let recaptchaVerifier = null;
let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
let cartItems = JSON.parse(localStorage.getItem("nearNowCartItems")) || [];
let wishlistItems = JSON.parse(localStorage.getItem("nearNowWishlistItems")) || [];
let cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
let wishlistCount = wishlistItems.length;

// --- DOM Elements ---
const productsGrid = document.getElementById('productsGrid');
const categoryFilter = document.getElementById('categoryFilter');
const sortProducts = document.getElementById('sortProducts');
const searchInput = document.getElementById('searchInput');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const footerCategories = document.getElementById('footerCategories');

// --- Render Functions ---
function renderCategoryOptions() {
    const categories = getAvailableCategories();
    categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
        categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join('');
}

function renderFooterCategories() {
    const categories = getAvailableCategories();
    footerCategories.innerHTML = categories.map(cat => `<li><a href="#" class="text-gray-400 hover:text-white transition duration-300">${cat.charAt(0).toUpperCase() + cat.slice(1)}</a></li>`).join('');
}

function renderProducts() {
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    const productsToShow = displayedProducts.slice(startIndex, endIndex);
    productsGrid.innerHTML = productsToShow.map(createProductCard).join('');
    loadMoreBtn.style.display = endIndex >= displayedProducts.length ? 'none' : 'block';
}

function createProductCard(product) {
    // Remove any leading ₹ from price and originalPrice
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;
    return `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-4 left-4"><span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">-${product.discount}%</span></div>` : ''}
            </div>
            <div class="p-6">
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-sm ml-2">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-lg mb-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-primary font-bold text-xl">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-sm">₹${originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    for (let i = 0; i < fullStars; i++) stars += '<i class="fas fa-star"></i>';
    if (hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) stars += '<i class="far fa-star"></i>';
    return stars;
}

// --- Filter, Sort, Search ---
function filterAndSortProducts() {
    let filtered = [...allProducts];
    // Filter by category
    if (currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }
    // Search
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    }
    // Sort
    switch (currentSort) {
        case 'price-low':
            filtered.sort((a, b) => parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)) - parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)));
            break;
        case 'price-high':
            filtered.sort((a, b) => parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)) - parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)));
            break;
        case 'name':
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
    }
    displayedProducts = filtered;
    currentPage = 1;
    renderProducts();
}

// --- Event Listeners ---
categoryFilter.addEventListener('change', function () {
    currentCategory = this.value;
    filterAndSortProducts();
});
sortProducts.addEventListener('change', function () {
    currentSort = this.value;
    filterAndSortProducts();
});
searchInput.addEventListener('input', function () {
    filterAndSortProducts();
});
loadMoreBtn.addEventListener('click', function () {
    currentPage++;
    renderProducts();
});

// --- Init ---
renderCategoryOptions();
renderFooterCategories();
filterAndSortProducts();

// --- Firebase Authentication Functions ---

// Initialize reCAPTCHA verifier
function initializeRecaptcha() {
    try {
        // Check if Firebase auth is available
        if (!window.firebaseAuth) {
            console.error('Firebase auth not available')
            showNotification("Authentication service not ready. Please refresh the page.", "error")
            return
        }

        // Check if RecaptchaVerifier is available
        if (!window.RecaptchaVerifier) {
            console.error('RecaptchaVerifier not available')
            showNotification("Verification service not ready. Please refresh the page.", "error")
            return
        }

        console.log('Initializing reCAPTCHA...')
        
        recaptchaVerifier = new window.RecaptchaVerifier(window.firebaseAuth, 'recaptcha-container', {
            'size': 'normal',
            'callback': (response) => {
                console.log('reCAPTCHA solved:', response)
            },
            'expired-callback': () => {
                console.log('reCAPTCHA expired')
                showNotification("reCAPTCHA expired. Please try again.", "error")
            },
            'error-callback': (error) => {
                console.error('reCAPTCHA error:', error)
                showNotification("reCAPTCHA error. Please refresh the page.", "error")
            }
        })
        
        console.log('Rendering reCAPTCHA...')
        recaptchaVerifier.render().then((widgetId) => {
            console.log('reCAPTCHA rendered successfully with widget ID:', widgetId)
        }).catch((error) => {
            console.error('Error rendering reCAPTCHA:', error)
            showNotification("Error loading verification. Please refresh the page.", "error")
        })
        
    } catch (error) {
        console.error('Error initializing reCAPTCHA:', error)
        showNotification("Error initializing verification. Please refresh the page.", "error")
    }
}

// Handle mobile number and name submission
function handleMobileSubmit(e) {
    e.preventDefault()

    const name = document.getElementById("userName").value.trim()
    const mobile = document.getElementById("userMobile").value.trim()

    // Validation
    if (!name || name.length < 2) {
        showNotification("Please enter a valid name", "error")
        return
    }

    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        showNotification("Please enter a valid 10-digit mobile number", "error")
        return
    }

    // Check if Firebase is properly initialized
    if (!window.firebaseAuth || !window.signInWithPhoneNumber) {
        console.error('Firebase not properly initialized')
        showNotification("Authentication service not available. Please refresh the page.", "error")
        return
    }

    // Check if reCAPTCHA is initialized
    if (!recaptchaVerifier) {
        console.error('reCAPTCHA not initialized')
        showNotification("Verification not ready. Please refresh the page.", "error")
        return
    }

    // Store user details
    userDetails = {
        name: name,
        mobile: mobile,
        fullMobile: `+91${mobile}`,
    }

    // Show loading state
    const sendBtn = document.getElementById("sendOtpBtn")
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...'
    sendBtn.disabled = true

    // Send OTP using Firebase
    const phoneNumber = userDetails.fullMobile
    const appVerifier = recaptchaVerifier

    console.log('Attempting to send OTP to:', phoneNumber)
    console.log('reCAPTCHA verifier:', appVerifier)

    window.signInWithPhoneNumber(window.firebaseAuth, phoneNumber, appVerifier)
        .then((confirmation) => {
            confirmationResult = confirmation
            console.log('OTP sent successfully')
            
            // Update display mobile number
            document.getElementById("displayMobile").textContent = userDetails.fullMobile

            // Move to step 2
            showStep(2)

            // Start resend timer
            startResendTimer()

            // Reset button
            sendBtn.innerHTML = "Send OTP"
            sendBtn.disabled = false

            showNotification(`OTP sent to ${userDetails.fullMobile}`, "success")
        })
        .catch((error) => {
            console.error('Error sending OTP:', error)
            console.error('Error code:', error.code)
            console.error('Error message:', error.message)
            
            // Reset button
            sendBtn.innerHTML = "Send OTP"
            sendBtn.disabled = false

            // Handle specific error cases
            if (error.code === 'auth/invalid-phone-number') {
                showNotification("Invalid phone number format", "error")
            } else if (error.code === 'auth/too-many-requests') {
                showNotification("Too many attempts. Please try again later.", "error")
            } else if (error.code === 'auth/quota-exceeded') {
                showNotification("SMS quota exceeded. Please try again later.", "error")
            } else if (error.code === 'auth/invalid-recaptcha-token') {
                showNotification("reCAPTCHA verification failed. Please try again.", "error")
            } else if (error.code === 'auth/missing-recaptcha-token') {
                showNotification("Please complete the reCAPTCHA verification.", "error")
            } else if (error.code === 'auth/operation-not-allowed') {
                showNotification("Phone authentication is not enabled for this app.", "error")
            } else if (error.code === 'auth/network-request-failed') {
                showNotification("Network error. Please check your internet connection.", "error")
            } else {
                showNotification(`Failed to send OTP: ${error.message}`, "error")
            }

            // Reset reCAPTCHA
            if (recaptchaVerifier) {
                recaptchaVerifier.clear()
                recaptchaVerifier.render()
            }
        })
}

// Handle OTP verification
function handleOtpSubmit(e) {
    e.preventDefault()

    const enteredOtp = getEnteredOtp()

    if (enteredOtp.length !== 6) {
        showNotification("Please enter complete 6-digit OTP", "error")
        return
    }

    // Show loading state
    const verifyBtn = document.getElementById("verifyOtpBtn")
    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...'
    verifyBtn.disabled = true

    // Verify OTP using Firebase
    confirmationResult.confirm(enteredOtp)
        .then((result) => {
            // OTP is correct
            const user = result.user
            console.log('OTP verified successfully:', user)
            
            showStep(3)

            // Store user in localStorage
            const userData = {
                id: user.uid,
                name: userDetails.name,
                mobile: userDetails.mobile,
                fullMobile: userDetails.fullMobile,
                loginTime: new Date().toISOString(),
                isVerified: true,
                firebaseUid: user.uid
            }

            currentUser = userData
            localStorage.setItem("nearNowCurrentUser", JSON.stringify(userData))

            showNotification("Mobile number verified successfully!", "success")

            // Auto close after 2 seconds
            setTimeout(() => {
                hideLoginModal()
                updateUserDisplay()
            }, 2000)
        })
        .catch((error) => {
            console.error('Error verifying OTP:', error)
            
            // Reset button
            verifyBtn.innerHTML = "Verify & Continue"
            verifyBtn.disabled = false

            // Handle specific error cases
            if (error.code === 'auth/invalid-verification-code') {
                showNotification("Invalid OTP. Please try again.", "error")
            } else if (error.code === 'auth/code-expired') {
                showNotification("OTP has expired. Please request a new one.", "error")
            } else {
                showNotification("Failed to verify OTP. Please try again.", "error")
            }
            
            clearOtpInputs()
        })
}

// Get entered OTP from inputs
function getEnteredOtp() {
    const otpInputs = document.querySelectorAll(".otp-input")
    let otp = ""
    otpInputs.forEach((input) => {
        otp += input.value
    })
    return otp
}

// Clear OTP inputs
function clearOtpInputs() {
    const otpInputs = document.querySelectorAll(".otp-input")
    otpInputs.forEach((input) => {
        input.value = ""
    })
    otpInputs[0].focus()
}

// Initialize OTP input behavior
function initializeOtpInputs() {
    const otpInputs = document.querySelectorAll(".otp-input")

    otpInputs.forEach((input, index) => {
        input.addEventListener("input", function (e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, "")

            // Move to next input if current is filled
            if (this.value.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus()
            }
        })

        input.addEventListener("keydown", function (e) {
            // Move to previous input on backspace
            if (e.key === "Backspace" && this.value === "" && index > 0) {
                otpInputs[index - 1].focus()
            }
        })

        input.addEventListener("paste", (e) => {
            e.preventDefault()
            const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "")

            if (pastedData.length === 6) {
                otpInputs.forEach((inp, i) => {
                    inp.value = pastedData[i] || ""
                })
            }
        })
    })
}

// Show specific step
function showStep(step) {
    // Hide all steps
    document.querySelectorAll(".login-step").forEach((stepEl) => {
        stepEl.classList.add("hidden")
    })

    // Show current step
    document.getElementById(`step${step}`).classList.remove("hidden")
    currentStep = step

    // Focus on first input of current step
    if (step === 1) {
        document.getElementById("userName").focus()
    } else if (step === 2) {
        document.querySelector(".otp-input").focus()
    }
}

// Start resend timer
function startResendTimer() {
    resendTimer = 30
    const resendBtn = document.getElementById("resendOtpBtn")
    const timerSpan = document.getElementById("resendTimer")

    resendBtn.disabled = true

    otpTimer = setInterval(() => {
        resendTimer--
        timerSpan.textContent = resendTimer

        if (resendTimer <= 0) {
            clearInterval(otpTimer)
            resendBtn.disabled = false
            resendBtn.innerHTML = "Resend OTP"
        }
    }, 1000)
}

// Resend OTP
function resendOtp() {
    if (!confirmationResult) {
        showNotification("No active session. Please start over.", "error")
        return
    }

    // Clear current OTP inputs
    clearOtpInputs()

    // Start timer again
    startResendTimer()

    showNotification(`New OTP sent to ${userDetails.fullMobile}`, "success")
}

// Change mobile number
function changeNumber() {
    // Clear form
    document.getElementById("userName").value = ""
    document.getElementById("userMobile").value = ""
    clearOtpInputs()

    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer)
    }

    // Reset user details and Firebase session
    userDetails = {}
    confirmationResult = null

    // Reset reCAPTCHA
    if (recaptchaVerifier) {
        recaptchaVerifier.clear()
        recaptchaVerifier.render()
    }

    // Go back to step 1
    showStep(1)
}

// Continue after successful login
function continueAfterLogin() {
    hideLoginModal()
    showNotification(`Welcome ${currentUser.name}! Happy shopping with Near & Now! 🛒`, "success")
}

// Show login modal
function showLoginModal() {
    const loginModal = document.getElementById("loginModal")
    const modalOverlay = document.getElementById("modalOverlay")

    // Reset to step 1
    showStep(1)

    loginModal.classList.remove("hidden")
    loginModal.classList.add("flex")
    modalOverlay.classList.remove("hidden")

    // Ensure reCAPTCHA is initialized
    setTimeout(() => {
        if (!recaptchaVerifier) {
            initializeRecaptcha()
        } else {
            recaptchaVerifier.render()
        }
    }, 100)
}

// Hide login modal
function hideLoginModal() {
    const loginModal = document.getElementById("loginModal")
    const modalOverlay = document.getElementById("modalOverlay")

    loginModal.classList.add("hidden")
    loginModal.classList.remove("flex")
    modalOverlay.classList.add("hidden")

    // Clear any timers
    if (otpTimer) {
        clearInterval(otpTimer)
    }

    // Reset form
    document.getElementById("mobileForm").reset()
    clearOtpInputs()
    currentStep = 1

    // Clean up Firebase resources
    if (recaptchaVerifier) {
        recaptchaVerifier.clear()
        recaptchaVerifier.render()
    }
    
    // Reset Firebase session
    confirmationResult = null
    userDetails = {}
}

// Update user display
function updateUserDisplay() {
    const accountBtn = document.getElementById("accountBtn")
    if (currentUser) {
        accountBtn.innerHTML = `
            <div class="relative">
                <div class="text-center cursor-pointer user-menu-trigger">
                    <i class="fas fa-user-circle text-2xl"></i>
                    <p class="text-sm mt-1">${currentUser.name}</p>
                </div>
                <div class="user-dropdown absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible transform scale-95 transition-all duration-200 z-50">
                    <div class="py-2">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="font-semibold text-gray-800">${currentUser.name}</p>
                            <p class="text-sm text-gray-500">${currentUser.fullMobile}</p>
                        </div>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="profile">
                            <i class="fas fa-user mr-3 text-primary"></i>View Profile
                        </a>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="orders">
                            <i class="fas fa-shopping-bag mr-3 text-primary"></i>Order History
                        </a>
                        <a href="#" class="user-menu-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition duration-200" data-action="settings">
                            <i class="fas fa-cog mr-3 text-primary"></i>Settings
                        </a>
                        <div class="border-t border-gray-100 mt-1 pt-1">
                            <a href="#" class="user-menu-item block px-4 py-2 text-red-600 hover:bg-red-50 transition duration-200" data-action="logout">
                                <i class="fas fa-sign-out-alt mr-3"></i>Logout
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `

        // Add event listeners for the dropdown
        initializeUserDropdown()
    }
}

// Initialize user dropdown
function initializeUserDropdown() {
    const userMenuTrigger = document.querySelector(".user-menu-trigger")
    const userDropdown = document.querySelector(".user-dropdown")
    const userMenuItems = document.querySelectorAll(".user-menu-item")

    if (!userMenuTrigger || !userDropdown) return

    // Toggle dropdown on click
    userMenuTrigger.addEventListener("click", (e) => {
        e.stopPropagation()
        toggleUserDropdown()
    })

    // Handle menu item clicks
    userMenuItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()

            const action = this.dataset.action
            handleUserMenuAction(action)
            hideUserDropdown()
        })
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!userMenuTrigger.contains(e.target) && !userDropdown.contains(e.target)) {
            hideUserDropdown()
        }
    })
}

// Toggle user dropdown
function toggleUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    const isVisible = !userDropdown.classList.contains("opacity-0")

    if (isVisible) {
        hideUserDropdown()
    } else {
        showUserDropdown()
    }
}

// Show user dropdown
function showUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    userDropdown.classList.remove("opacity-0", "invisible", "scale-95")
    userDropdown.classList.add("opacity-100", "visible", "scale-100")
}

// Hide user dropdown
function hideUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    userDropdown.classList.remove("opacity-100", "visible", "scale-100")
    userDropdown.classList.add("opacity-0", "invisible", "scale-95")
}

// Handle user menu action
function handleUserMenuAction(action) {
    switch (action) {
        case "profile":
            showNotification("View Profile feature coming soon!", "info")
            break
        case "orders":
            showNotification("Order History feature coming soon!", "info")
            break
        case "settings":
            showNotification("Settings feature coming soon!", "info")
            break
        case "logout":
            logout()
            break
    }
}

// Logout function
function logout() {
    localStorage.removeItem("nearNowCurrentUser")
    currentUser = null

    // Reset account button
    document.getElementById("accountBtn").innerHTML = `
        <i class="fas fa-user text-2xl"></i>
        <span class="ml-2">Account</span>
    `

    showNotification("Logged out successfully!", "success")
}

// Show notification
function showNotification(message, type = "info") {
    const notification = document.createElement("div")
    notification.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg text-white transform translate-x-full transition-all duration-300 max-w-sm`

    switch (type) {
        case "success":
            notification.classList.add("bg-green-500")
            notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`
            break
        case "error":
            notification.classList.add("bg-red-500")
            notification.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i>${message}`
            break
        case "info":
        default:
            notification.classList.add("bg-blue-500")
            notification.innerHTML = `<i class="fas fa-info-circle mr-2"></i>${message}`
            break
    }

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.classList.remove("translate-x-full")
    }, 100)

    setTimeout(() => {
        notification.classList.add("translate-x-full")
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification)
            }
        }, 300)
    }, 4000)
}

// Initialize authentication
function initializeAuth() {
    document.getElementById("accountBtn").addEventListener("click", () => {
        if (currentUser) {
            toggleUserDropdown()
        } else {
            showLoginModal()
        }
    })

    document.getElementById("closeLogin").addEventListener("click", hideLoginModal)

    if (currentUser) {
        updateUserDisplay()
    }
}

// Initialize login system
function initializeLoginSystem() {
    // Initialize reCAPTCHA verifier
    initializeRecaptcha()
    
    // Form event listeners
    document.getElementById("mobileForm").addEventListener("submit", handleMobileSubmit)
    document.getElementById("otpForm").addEventListener("submit", handleOtpSubmit)

    // Button event listeners
    document.getElementById("resendOtpBtn").addEventListener("click", resendOtp)
    document.getElementById("changeNumberBtn").addEventListener("click", changeNumber)
    document.getElementById("continueShoppingBtn").addEventListener("click", continueAfterLogin)

    // OTP input handling
    initializeOtpInputs()
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize authentication
    initializeAuth()
    initializeLoginSystem()
    
    // Update cart and wishlist counts
    document.getElementById("cartCount").textContent = cartCount
    document.getElementById("wishlistCount").textContent = wishlistCount
});