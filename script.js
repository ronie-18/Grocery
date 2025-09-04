// Global Variables
let currentSlide = 0
let cartItems = []
let cartCount = 0
let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null
let allProducts = []
let displayedProducts = []
let currentCategory = "all"
let currentSort = "default"
const productsPerPage = 10
let currentPage = 1
let isPageInitializing = true // Flag to prevent automatic scrolling during page load

// New Global Variables for Enhanced Features
let currentFilters = {
    priceRange: { min: 0, max: 1000 },
    categories: [],
    ratings: [],
    availability: []
}
let searchSuggestions = []
let quickViewProduct = null
let mobileNavOpen = false

// Authentication Variables
let currentStep = 1
let userDetails = {}
let otpTimer = null
let resendTimer = 30

// Make userDetails globally accessible for auth integration
window.userDetails = userDetails

// Debug function to check auth state
window.debugAuthState = function() {
    console.log('=== AUTH DEBUG INFO ===')
    console.log('currentUser:', window.currentUser)
    console.log('userDetails:', window.userDetails)
    console.log('localStorage currentUser:', JSON.parse(localStorage.getItem("nearNowCurrentUser") || "null"))
    console.log('Supabase auth user:', window.supabaseAuth?.getCurrentUser())
    console.log('Is authenticated:', window.supabaseAuth?.isAuthenticated())
    console.log('Account button HTML:', document.getElementById("accountBtn")?.innerHTML)
    console.log('User dropdown exists:', !!document.querySelector(".user-dropdown"))
    console.log('=======================')
}

// Test function to manually show dropdown
window.testDropdown = function() {
    console.log('🧪 Testing dropdown functionality')
    const dropdown = document.querySelector(".user-dropdown")
    const accountBtn = document.getElementById("accountBtn")
    
    console.log('Button HTML preview:', accountBtn?.innerHTML?.substring(0, 200) + '...')
    
    if (dropdown) {
        console.log('Dropdown found, testing show/hide')
        showUserDropdown()
        setTimeout(() => {
            console.log('Dropdown classes after show:', dropdown.className)
            console.log('Dropdown computed style display:', getComputedStyle(dropdown).display)
            console.log('Dropdown computed style visibility:', getComputedStyle(dropdown).visibility)
            console.log('Dropdown computed style opacity:', getComputedStyle(dropdown).opacity)
        }, 100)
    } else {
        console.log('❌ No dropdown found')
        console.log('Available elements with "user" class:', document.querySelectorAll('[class*="user"]'))
    }
}

// Function to force show dropdown for testing
window.forceShowDropdown = function() {
    const dropdown = document.querySelector(".user-dropdown")
    if (dropdown) {
        dropdown.style.cssText = `
            position: absolute !important;
            top: 100% !important;
            left: 50% !important;
            transform: translateX(-50%) scale(1) !important;
            margin-top: 8px !important;
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
            z-index: 9999 !important;
            background: white !important;
            border: 1px solid #ccc !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
            width: 192px !important;
        `
        console.log('✅ Forced dropdown to show with complete inline styles')
        
        // Also add a temporary click handler for logout if dropdown exists
        const logoutBtn = dropdown.querySelector('[data-action="logout"]')
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault()
                console.log('🚪 Emergency logout clicked')
                logoutUser()
            })
        }
    } else {
        console.log('❌ No dropdown found to force show')
    }
}

// Emergency logout function callable from console
window.emergencyLogout = function() {
    console.log('🚨 Emergency logout initiated')
    logoutUser()
}

// Debug function to test dropdown functionality
window.debugDropdown = function() {
    console.log('🐛 Debug dropdown function called')
    
    const userMenuTrigger = document.querySelector(".user-menu-trigger")
    const userDropdown = document.querySelector(".user-dropdown")
    const currentUser = localStorage.getItem('nearNowCurrentUser')
    
    console.log('🔍 Debug info:', {
        'User logged in': !!currentUser,
        'Trigger element exists': !!userMenuTrigger,
        'Dropdown element exists': !!userDropdown,
        'Current user data': currentUser ? JSON.parse(currentUser) : null,
        'showOrderHistory function exists': typeof showOrderHistory === 'function',
        'handleUserMenuAction function exists': typeof handleUserMenuAction === 'function'
    })
    
    if (userDropdown) {
        console.log('📋 Dropdown current classes:', userDropdown.className)
        console.log('📏 Dropdown computed style:', {
            opacity: window.getComputedStyle(userDropdown).opacity,
            visibility: window.getComputedStyle(userDropdown).visibility,
            display: window.getComputedStyle(userDropdown).display
        })
    }
    
    if (userMenuTrigger) {
        console.log('🎯 Triggering click on dropdown...')
        userMenuTrigger.click()
    } else {
        console.log('❌ No trigger found to click')
    }
}

// Test order history function directly
window.testOrderHistory = function() {
    console.log('📦 Testing order history function directly...')
    if (typeof showOrderHistory === 'function') {
        showOrderHistory()
    } else {
        console.error('❌ showOrderHistory function not found!')
    }
}

// Check authentication state
window.checkAuth = function() {
    console.log('🔐 Authentication Check:')
    console.log('currentUser exists:', !!currentUser)
    console.log('currentUser data:', currentUser)
    console.log('localStorage data:', localStorage.getItem('nearNowCurrentUser'))
    console.log('window.supabaseAuth exists:', !!window.supabaseAuth)
    if (window.supabaseAuth) {
        console.log('supabaseAuth.isAuthenticated():', window.supabaseAuth.isAuthenticated())
    }
    console.log('window.orderManager exists:', !!window.orderManager)
}

// Force re-initialize dropdown
window.reinitDropdown = function() {
    console.log('🔄 Forcing dropdown re-initialization...')
    updateUserDisplay()
}

// Ensure dropdown works on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM loaded - checking user display...')
    
    // Small delay to ensure other scripts have loaded
    setTimeout(() => {
        if (window.currentUser) {
            console.log('👤 User found on page load, updating display...')
            updateUserDisplay()
        } else {
            console.log('🚫 No user found on page load')
        }
    }, 100)
})

// Test function for the restored dropdown
window.testRestoredDropdown = function() {
    console.log('🧪 Testing restored dropdown functionality')
    
    const trigger = document.querySelector(".user-menu-trigger")
    const dropdown = document.querySelector(".user-dropdown")
    
    console.log('Trigger found:', !!trigger)
    console.log('Dropdown found:', !!dropdown)
    
    if (trigger && dropdown) {
        console.log('✅ Both elements found - dropdown should work now!')
        console.log('Dropdown position:', getComputedStyle(dropdown).position)
        console.log('Dropdown right positioning:', getComputedStyle(dropdown).right)
        
        // Test manual trigger
        trigger.click()
        console.log('Triggered dropdown click')
    } else {
        console.log('❌ Missing elements - need to login first')
    }
}

// Categories Data - Updated to match products-data.js
const categories = [
    {
        id: "staples",
        name: "Staples",
        description: "Rice, Dal & Atta",
        image: "https://img.freepik.com/free-photo/top-view-raw-rice-inside-plate-dark-desk_179666-27235.jpg?semt=ais_hybrid&w=740",
        color: "from-yellow-100 to-yellow-200",
    },
    {
        id: "spices",
        name: "Spices",
        description: "Fresh & Aromatic",
        image: "https://www.viralspices.com/wp-content/uploads/2024/11/Untitled-1-624x312.jpg",
        color: "from-red-100 to-red-200",
    },
    {
        id: "oils",
        name: "Oils",
        description: "Cooking & Essential Oils",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        color: "from-amber-100 to-yellow-200",
    },
    {
        id: "pasta-noodles-vermicelli",
        name: "Pasta, Noodles & Vermicelli",
        description: "Fresh & Instant Pasta, Noodles and Vermicelli",
        image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        color: "from-orange-100 to-red-200",
    },
    {
        id: "bakery",
        name: "Bakery",
        description: "Fresh Bread & Pastries",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        color: "from-brown-100 to-amber-200",
    },
    {
        id: "salt-sugar",
        name: "Salt and Sugar",
        description: "Essential Cooking Ingredients",
        image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
        color: "from-gray-100 to-white",
    },
    {
        id: "dairy",
        name: "Dairy Products",
        description: "Milk, Paneer & More",
        image: "https://media.istockphoto.com/id/544807136/photo/various-fresh-dairy-products.jpg?s=612x612&w=0&k=20&c=U5T70bi24itoTDive1CVonJbJ97ChyL2Pz1I2kOoSRo=",
        color: "from-blue-100 to-blue-200",
    },
    {
        id: "vegetables",
        name: "Vegetables",
        description: "Fresh & Organic",
        image: "https://i.pinimg.com/736x/ba/b9/67/bab967df39385b6360ef769fe35893bd.jpg",
        color: "from-green-100 to-green-200",
    },
    {
        id: "snacks",
        name: "Snacks",
        description: "Healthy & Tasty",
        image: "https://t4.ftcdn.net/jpg/01/73/41/63/360_F_173416361_2YCaYyXrVk6nhNoIkg21515HUWseyqyr.jpg",
        color: "from-pink-100 to-pink-200",
    },
    {
        id: "beverages",
        name: "Beverages",
        description: "Tea & Drinks",
        image: "https://www.indiabusinesstrade.in/wp-content/uploads/2024/03/beverage-2.jpg",
        color: "from-purple-100 to-purple-200",
    },
]

// Initialize the website
document.addEventListener("DOMContentLoaded", async () => {
    // TEMPORARILY COMMENTED OUT - Loading screen disabled
    // showLoadingScreen()
    // setTimeout(() => {
    //     hideLoadingScreen()
    //     initializeWebsite()
    // }, 3000) // 3 second loading screen

    // Wait a bit for all scripts to load, then initialize
    console.log('📄 DOM loaded, waiting for scripts...')
    setTimeout(async () => {
        await initializeWebsite()
    }, 500) // Small delay to ensure scripts load
})

// Error message function
function showErrorMessage(message) {
    // Create or update error banner
    let errorBanner = document.getElementById('error-banner')
    if (!errorBanner) {
        errorBanner = document.createElement('div')
        errorBanner.id = 'error-banner'
        errorBanner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-3 px-4 z-50'
        document.body.insertBefore(errorBanner, document.body.firstChild)
    }
    
    errorBanner.innerHTML = `
        <div class="container mx-auto flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.style.display='none'" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `
    errorBanner.style.display = 'block'
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (errorBanner) errorBanner.style.display = 'none'
    }, 10000)
}

// TEMPORARILY COMMENTED OUT - Loading screen functions disabled
/*
function showLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen")
    loadingScreen.style.display = "flex"
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById("loadingScreen")
    loadingScreen.classList.add("fade-out")
    setTimeout(() => {
        loadingScreen.style.display = "none"
    }, 500)
}
*/

async function initializeWebsite() {
    try {
        // Load products from Supabase
        console.log('🔄 Starting website initialization...')
        console.log('🔄 Checking if getAllProducts function exists:', typeof getAllProducts)
        
        if (typeof getAllProducts !== 'function') {
            throw new Error('getAllProducts function not available. Supabase client may not be loaded.')
        }
        
        console.log('🔄 Loading products from Supabase...')
        allProducts = await getAllProducts()
        displayedProducts = [...allProducts]
        
        console.log(`✅ Loaded ${allProducts.length} products`)
        
        // Debug: Log sample products to see their category values
        if (allProducts.length > 0) {
            console.log('🔍 Sample products and their categories:')
            allProducts.slice(0, 5).forEach((product, index) => {
                console.log(`${index + 1}. ${product.name} - category: "${product.category}"`)
            })
            
            // Get unique categories from products
            const productCategories = [...new Set(allProducts.map(p => p.category))]
            console.log('📋 Unique categories in products:', productCategories)
        }

        // Ensure category starts with "all" on every page load
        currentCategory = "all"

        // Populate dropdown after products are loaded
        populateHeaderCategoryDropdown()

        initializeSlider()
        initializeSearch()
        initializeCart()
        initializeAuth()
        initializeNavigation()
        await initializeCategories() // Make this async too
        initializeProducts()
        initializeModals()
        initializeScrollEffects()
        
        initializeNewsletter()
        initializeLoginSystem()

        // Initialize new enhanced features
        initializeQuickView()
        
        await initializeAdvancedFilters()
        // Enhanced search removed - using URL-based search
        initializeMobileNavigation()
        initializeProductReviews()
        
        // Update cart count after everything is initialized
        updateCartCount()

        console.log("✅ Near & Now website fully initialized!")
        
        // Allow scrolling after initialization is complete
        isPageInitializing = false
    } catch (error) {
        console.error('❌ Error initializing website:', error)
        // Fallback: show error message to user
        showErrorMessage('Failed to load products. Please refresh the page.')
    }
}

// Login System Functions
function initializeLoginSystem() {
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

// Generate random OTP for demo purposes
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a simple user ID
function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.floor(Math.random() * 1000)
}

// Handle mobile number and name submission
async function handleMobileSubmit(e) {
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

    // Store user details
    userDetails = {
        name: name,
        mobile: mobile,
        fullMobile: `+91${mobile}`
    }
    
    // Update global reference
    window.userDetails = userDetails

    // Show loading state
    const sendBtn = document.getElementById("sendOtpBtn")

    // **FIX: Clear any existing send OTP timeout**
    if (window.sendOtpTimeout) {
        clearTimeout(window.sendOtpTimeout)
    }

    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...'
    sendBtn.disabled = true

    try {
        // Use Supabase Auth to send real OTP
        if (window.supabaseAuth) {
            await window.supabaseAuth.sendPhoneOTP(mobile, name)
            
            console.log('✅ Real OTP sent via Supabase')

            // Update display mobile number
            document.getElementById("displayMobile").textContent = userDetails.fullMobile

            // Move to step 2
            showStep(2)

            // Start resend timer
            startResendTimer()

            // Reset button
            resetSendOtpButton()

            showNotification(`OTP sent to ${userDetails.fullMobile}. Please check your SMS.`, "success")
        } else {
            throw new Error('Supabase Auth not available')
        }
    } catch (error) {
        console.error('Error sending OTP:', error)
        
        // Reset button
        resetSendOtpButton()
        
        // Show error message
        let errorMessage = "Failed to send OTP. Please try again."
        if (error.message?.includes('Phone number not valid')) {
            errorMessage = "Please enter a valid phone number."
        } else if (error.message?.includes('rate')) {
            errorMessage = "Too many attempts. Please wait before trying again."
        }
        
        showNotification(errorMessage, "error")
    }
}

// Handle OTP verification
async function handleOtpSubmit(e) {
    e.preventDefault()

    const enteredOtp = getEnteredOtp()
    console.log('Entered OTP:', enteredOtp)

    if (!userDetails.mobile) {
        showNotification("OTP session expired. Please resend OTP.", "error")
        return
    }

    if (enteredOtp.length !== 6) {
        showNotification("Please enter complete 6-digit OTP", "error")
        return
    }

    // Show loading state
    const verifyBtn = document.getElementById("verifyOtpBtn")

    // **FIX: Clear any existing verification timeout first**
    if (window.verificationTimeout) {
        clearTimeout(window.verificationTimeout)
    }

    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...'
    verifyBtn.disabled = true

    try {
        // Use Supabase Auth to verify real OTP
        if (window.supabaseAuth) {
            console.log('🔐 Verifying OTP with name:', userDetails.name)
            const result = await window.supabaseAuth.verifyPhoneOTP(userDetails.mobile, enteredOtp, userDetails.name)
            
            if (result.success) {
                console.log('✅ OTP verified successfully via Supabase')

                // Immediately set the currentUser with the name from userDetails
                currentUser = {
                    id: result.user.id,
                    name: userDetails.name, // Use the name from the form
                    mobile: userDetails.mobile,
                    fullMobile: userDetails.fullMobile,
                    loginTime: new Date().toISOString(),
                    isVerified: true,
                    supabaseUser: result.user
                }
                
                console.log('👤 Immediately setting currentUser with name:', userDetails.name)
                
                // Store in localStorage
                localStorage.setItem("nearNowCurrentUser", JSON.stringify(currentUser))
                
                // Update UI immediately
                updateUserDisplay()

                showStep(3)

                // Restore user's cart after login using CartManager
                if (window.handleUserLogin) {
                    window.handleUserLogin();
                }

                showNotification("Mobile number verified successfully!", "success")

                // Auto close after 2 seconds
                setTimeout(() => {
                    hideLoginModal()
                    updateUserDisplay() // Update again to be sure
                    resetVerifyButton() // Reset button after successful login
                }, 2000)
            } else {
                throw new Error('Verification failed')
            }
        } else {
            throw new Error('Supabase Auth not available')
        }
    } catch (error) {
        console.error('Error verifying OTP:', error)

        // Reset button
        resetVerifyButton()

        // Show error message
        let errorMessage = "Invalid OTP. Please check and try again."
        if (error.message?.includes('expired')) {
            errorMessage = "OTP has expired. Please request a new one."
        } else if (error.message?.includes('invalid')) {
            errorMessage = "Invalid OTP. Please check the 6-digit code."
        }

        showNotification(errorMessage, "error")

        // Clear OTP inputs on error
        clearOtpInputs()
    }
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

    // **FIX: Remove existing event listeners first to prevent duplicates**
    otpInputs.forEach((input) => {
        // Clone the input to remove all event listeners
        const newInput = input.cloneNode(true)
        input.parentNode.replaceChild(newInput, input)
    })

    // Get the fresh inputs after cloning
    const freshOtpInputs = document.querySelectorAll(".otp-input")

    freshOtpInputs.forEach((input, index) => {
        input.addEventListener("input", function (e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, "")

            // Move to next input if current is filled
            if (this.value.length === 1 && index < freshOtpInputs.length - 1) {
                freshOtpInputs[index + 1].focus()
            }
        })

        input.addEventListener("keydown", function (e) {
            // Move to previous input on backspace
            if (e.key === "Backspace" && this.value === "" && index > 0) {
                freshOtpInputs[index - 1].focus()
            }
        })

        input.addEventListener("paste", (e) => {
            e.preventDefault()
            const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "")

            if (pastedData.length === 6) {
                freshOtpInputs.forEach((inp, i) => {
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
        // **FIX: Reinitialize OTP inputs properly for step 2**
        setTimeout(() => {
            initializeOtpInputs()
            document.querySelector(".otp-input").focus()
        }, 100)
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
async function resendOtp() {
    if (!userDetails.mobile) {
        showNotification("No active session. Please start over.", "error")
        return
    }

    try {
        // Use Supabase Auth to resend real OTP
        if (window.supabaseAuth) {
            await window.supabaseAuth.resendPhoneOTP(userDetails.mobile, userDetails.name)
            
            console.log('✅ OTP resent via Supabase')

            // Clear current OTP inputs
            clearOtpInputs()

            // Start timer again
            startResendTimer()

            showNotification(`New OTP sent to ${userDetails.fullMobile}. Please check your SMS.`, "success")
        } else {
            throw new Error('Supabase Auth not available')
        }
    } catch (error) {
        console.error('Error resending OTP:', error)
        
        let errorMessage = "Failed to resend OTP. Please try again."
        if (error.message?.includes('rate')) {
            errorMessage = "Too many attempts. Please wait before trying again."
        }
        
        showNotification(errorMessage, "error")
    }
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

    // Reset user details
    userDetails = {}

    // Go back to step 1
    showStep(1)
}

// Continue after successful login
function continueAfterLogin() {
    hideLoginModal()
    // Load user's cart after login using CartManager
    if (window.handleUserLogin) {
        window.handleUserLogin();
    }
    showNotification(`Welcome ${currentUser.name}! Happy shopping with Near & Now! 🛒`, "success")
}

// **FIX: NEW FUNCTION - Reset verify button state**
function resetVerifyButton() {
    const verifyBtn = document.getElementById("verifyOtpBtn")
    if (verifyBtn) {
        verifyBtn.innerHTML = "Verify & Continue"
        verifyBtn.disabled = false
    }
}

// **FIX: NEW FUNCTION - Reset send OTP button state**
function resetSendOtpButton() {
    const sendBtn = document.getElementById("sendOtpBtn")
    if (sendBtn) {
        sendBtn.innerHTML = "Send OTP"
        sendBtn.disabled = false
    }
}



// **CHANGE 5: NEW FUNCTION - Clear current cart (call this on logout)**
function clearCurrentCart() {
    cart = []
    updateCartDisplay()
    updateCartCounter()
}

// **CHANGE 6: MODIFY LOGOUT FUNCTION - Add this to your existing logout function**
async function logoutUser() {
    try {
        // Handle cart logout using CartManager
        if (window.handleUserLogout) {
            window.handleUserLogout();
        }

        // Use Supabase auth to sign out
        if (window.supabaseAuth) {
            await window.supabaseAuth.signOut()
            console.log('✅ Signed out via Supabase')
        }

        // Clear current user (will also be handled by Supabase auth state change)
        currentUser = null

        // Remove current user from localStorage
        localStorage.removeItem("nearNowCurrentUser")

        // **FIX: Reset login system state after logout**
        userDetails = {}
        currentStep = 1

        // Clear any existing timers
        if (otpTimer) {
            clearInterval(otpTimer)
            otpTimer = null
        }

        // **FIX: Clear any pending verification timeout**
        if (window.verificationTimeout) {
            clearTimeout(window.verificationTimeout)
            window.verificationTimeout = null
        }

        // **FIX: Reset all button states**
        resetVerifyButton()
        resetSendOtpButton()

        // Reset login form
        document.getElementById("userName").value = ""
        document.getElementById("userMobile").value = ""
        clearOtpInputs()

        // Show step 1 for next login
        showStep(1)

        // Update UI
        updateUserDisplay()

        showNotification("Logged out successfully!", "success")
    } catch (error) {
        console.error('Error during logout:', error)
        showNotification("Logout completed with some issues", "warning")
    }
}

// Slider Functionality
function initializeSlider() {
    // Check if slider elements exist before initializing
    const sliderContainer = document.getElementById("sliderContainer")
    const prevSlideBtn = document.getElementById("prevSlide")
    const nextSlideBtn = document.getElementById("nextSlide")
    const sliderDots = document.querySelectorAll(".slider-dot")
    
    if (!sliderContainer || !prevSlideBtn || !nextSlideBtn) {
        console.log("Slider elements not found - slider functionality disabled")
        return
    }

    setInterval(nextSlide, 6000)

    prevSlideBtn.addEventListener("click", prevSlide)
    nextSlideBtn.addEventListener("click", nextSlide)

    sliderDots.forEach((dot, index) => {
        dot.addEventListener("click", () => goToSlide(index))
    })

    // Hero button actions
    document.querySelectorAll(".shop-now-btn, .grab-deals-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!isPageInitializing) {
                document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
            }
        })
    })
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % 2
    updateSlider()
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + 2) % 2
    updateSlider()
}

function goToSlide(slideIndex) {
    currentSlide = slideIndex
    updateSlider()
}

function updateSlider() {
    const sliderContainer = document.getElementById("sliderContainer")
    if (!sliderContainer) {
        return // Exit if slider container doesn't exist
    }
    
    const translateX = -currentSlide * 100
    sliderContainer.style.transform = `translateX(${translateX}%)`

    document.querySelectorAll(".slider-dot").forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add("bg-opacity-100")
            dot.classList.remove("bg-opacity-50")
        } else {
            dot.classList.add("bg-opacity-50")
            dot.classList.remove("bg-opacity-100")
        }
    })
}

// Search Functionality - Dropdown suggestions + URL-based redirect
function initializeSearch() {
    const searchInput = document.getElementById("searchInput")
    const searchBtn = document.getElementById("searchBtn")
    const searchSuggestions = document.getElementById("searchSuggestions")

    // Handle search button click - always redirect to search page
    searchBtn.addEventListener("click", performURLSearch)
    
    // Handle enter key press - redirect to search page
    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            performURLSearch(e)
        }
    })

    // Show suggestions as user types
    searchInput.addEventListener("input", function () {
        const query = this.value.trim()
        if (query.length > 1) {
            showSearchSuggestions(query)
        } else {
            hideSearchSuggestions()
        }
    })

    // Hide suggestions when clicking outside
    document.addEventListener("click", (e) => {
        if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            hideSearchSuggestions()
        }
    })
}

// Search suggestions that redirect to search page
function showSearchSuggestions(query) {
    console.log(`🔍 SUGGESTIONS: Searching for "${query}" in ${allProducts.length} products`);
    
    if (allProducts.length === 0) {
        console.log('⚠️ No products loaded from Supabase yet');
        hideSearchSuggestions();
        return;
    }
    
    // Enhanced search: match name, category, description, brand
    const suggestions = allProducts
        .filter((product) => {
            const searchTerm = query.toLowerCase();
            const productName = (product.name || '').toLowerCase();
            const productCategory = (product.category || '').toLowerCase();
            const productDescription = (product.description || '').toLowerCase();
            const productBrand = (product.brand || '').toLowerCase();
            
            return productName.includes(searchTerm) || 
                   productCategory.includes(searchTerm) ||
                   productDescription.includes(searchTerm) ||
                   productBrand.includes(searchTerm);
        })
        .slice(0, 6) // Show max 6 suggestions like Blinkit

    console.log(`🔍 SUGGESTIONS: Found ${suggestions.length} matches for "${query}"`);
    
    const searchSuggestions = document.getElementById("searchSuggestions")

    if (suggestions.length > 0) {
        searchSuggestions.innerHTML = suggestions
            .map((product) => `
                <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" 
                     onclick="selectSearchSuggestion('${product.name.replace(/'/g, '\\\'')}')">
                    <div class="flex items-center space-x-3">
                        <img src="${product.image || 'https://via.placeholder.com/40'}" 
                             alt="${product.name}" 
                             class="w-10 h-10 rounded-lg object-cover flex-shrink-0">
                        <div class="flex-1 min-w-0">
                            <p class="font-semibold text-gray-800 truncate">${product.name}</p>
                            <div class="flex items-center justify-between mt-1">
                                <p class="text-sm text-gray-600">${product.price || 'Price on request'}</p>
                                <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${product.category || 'General'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `)
            .join("")
        searchSuggestions.classList.remove("hidden")
        console.log(`✅ SUGGESTIONS: Displayed ${suggestions.length} suggestions`);
    } else {
        hideSearchSuggestions()
        console.log(`❌ SUGGESTIONS: No matches found for "${query}"`);
    }
}

function hideSearchSuggestions() {
    document.getElementById("searchSuggestions").classList.add("hidden")
}

// When user clicks on a suggestion, redirect to search page with that product name
function selectSearchSuggestion(productName) {
    // Set the search input to the selected product
    document.getElementById("searchInput").value = productName
    // Hide suggestions
    hideSearchSuggestions()
    // Redirect to search page with the product name
    const searchURL = `search.html?q=${encodeURIComponent(productName)}`
    console.log(`🔍 SUGGESTION DEBUG: Redirecting to: ${searchURL}`)
    window.location.href = searchURL
}

// New URL-based search function like Blinkit/DealShare
function performURLSearch(event) {
    if (event) {
        event.preventDefault()
    }
    
    // Get both desktop and mobile input values with null-checking
    const desktop = document.getElementById("searchInput")?.value.trim()
    const mobile = document.getElementById("mobileSearchInput")?.value.trim()
    
    // Prefer desktop input, fallback to mobile if desktop is empty
    const query = desktop || mobile
    
    if (query) {
        // Create URL similar to Blinkit format: search.html?q=product
        const searchURL = `search.html?q=${encodeURIComponent(query)}`
        
        console.log(`🔍 SEARCH DEBUG: Redirecting to: ${searchURL}`)
        console.log(`🔍 SEARCH DEBUG: Current location: ${window.location.href}`)
        
        // Redirect to search page
        window.location.href = searchURL
    }
}

// Categories Functionality
async function initializeCategories() {
    renderCategories()

    // Header category filter dropdown functionality
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter) {
        // Set default value to "all" on page load
        categoryFilter.value = "all"

        // Add event listener for category changes
        categoryFilter.addEventListener("change", function (e) {
            const category = e.target.value
            console.log('🔄 Header dropdown changed to:', category)
            filterByCategory(category)
        })
    }

    // Category filter functionality (existing)
    document.querySelectorAll(".category-filter").forEach((filter) => {
        filter.addEventListener("click", function (e) {
            e.preventDefault()
            const category = this.dataset.category
            filterByCategory(category)

            // Update the header dropdown to match
            if (categoryFilter) {
                categoryFilter.value = category
            }
        })
    })
}

// Function to populate header category dropdown from local categories array
function populateHeaderCategoryDropdown() {
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter) {
        // Debug: Log all categories from local array
        console.log('📋 Categories from local script.js:', categories.map(cat => cat.name))

        // Store current selection before clearing
        const currentSelection = categoryFilter.value
        console.log(`💾 Preserving current selection: "${currentSelection}"`)

        // Clear existing options except "All Categories"
        const allCategoriesOption = categoryFilter.querySelector('option[value="all"]')
        categoryFilter.innerHTML = ''
        if (allCategoriesOption) {
            categoryFilter.appendChild(allCategoriesOption)
        } else {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>'
        }

        // Get categories that actually have products
        const productCategories = allProducts.length > 0 ? [...new Set(allProducts.map(p => p.category))] : []
        console.log('🔍 Available product categories:', productCategories)

        // Add dynamic category options with category IDs as values and names as display text
        // Only add categories that have products or are in our script.js list
        categories.forEach(category => {
            // Only add if category has products or is in our predefined list
            if (productCategories.includes(category.id) || allProducts.length === 0) {
                const option = document.createElement('option')
                option.value = category.id // Use category ID for filtering
                option.textContent = category.name // Use category name for display
                categoryFilter.appendChild(option)
                console.log(`📋 Added option: value="${category.id}", text="${category.name}"`)
            } else {
                console.log(`⚠️ Skipping category "${category.name}" (${category.id}) - no products found`)
            }
        })
        
        // Restore the previous selection if it was valid
        if (currentSelection && currentSelection !== 'all') {
            const categoryExists = categories.some(cat => cat.id === currentSelection)
            if (categoryExists) {
                categoryFilter.value = currentSelection
                console.log(`🔄 Restored selection to: "${currentSelection}"`)
            }
        }
        
        console.log('✅ Header dropdown populated with categories from local script.js')
        
        // Debug: Check for category mismatches
        if (allProducts.length > 0) {
            const scriptCategories = categories.map(cat => cat.id)
            
            console.log('🔍 Script.js category IDs:', scriptCategories)
            console.log('🔍 Product categories:', productCategories)
            
            const missingInProducts = scriptCategories.filter(cat => !productCategories.includes(cat))
            const missingInScript = productCategories.filter(cat => !scriptCategories.includes(cat))
            
            if (missingInProducts.length > 0) {
                console.log('⚠️ Categories in script.js but not in products:', missingInProducts)
            }
            if (missingInScript.length > 0) {
                console.log('⚠️ Categories in products but not in script.js:', missingInScript)
            }
        }
    }
}

// Function to format category names for display
function formatCategoryName(category) {
    // Use the categories array for consistent naming
    const categoryInfo = categories.find(cat => cat.id === category)
    return categoryInfo ? categoryInfo.name : category.charAt(0).toUpperCase() + category.slice(1)
}

function renderCategories() {
    const categoriesGrid = document.getElementById("categoriesGrid")
    categoriesGrid.innerHTML = categories
        .map(
            (category) => `
        <div class="category-item text-center group cursor-pointer" data-category="${category.id}">
            <div class="bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-lg transition duration-300 transform group-hover:scale-105" style="padding: 1.5rem 0; min-height: 140px;">
                <img src="${category.image}" alt="${category.name}" class="w-28 h-28 mx-auto rounded-2xl object-cover shadow-md" style="object-fit: cover;" loading="lazy">
            </div>
            <h3 class="font-semibold text-gray-800 text-lg mt-2">${category.name}</h3>
            <p class="text-sm text-gray-500 mt-1">${category.description}</p>
        </div>
    `,
        )
        .join("")

    // Add click handlers to category items
    document.querySelectorAll(".category-item").forEach((item) => {
        item.addEventListener("click", function () {
            const category = this.dataset.category
            filterByCategory(category)
        })
    })
}

function filterByCategory(category) {
    currentCategory = category
    console.log('🔍 filterByCategory called with:', category)
    
    if (category === "all") {
        displayedProducts = [...allProducts]
        console.log('📦 Showing all products:', displayedProducts.length)
    } else {
        console.log(`🔍 Filtering for category: "${category}"`)
        console.log(`🔍 Total products available: ${allProducts.length}`)
        
        // Log all unique categories in products for debugging
        const availableCategories = [...new Set(allProducts.map(p => p.category))]
        console.log(`🔍 Available categories in products:`, availableCategories)
        
        displayedProducts = allProducts.filter((product) => product.category === category)
        console.log(`📦 Filtered products for category "${category}":`, displayedProducts.length)
        
        if (displayedProducts.length > 0) {
            console.log('🔍 Sample filtered products:', displayedProducts.slice(0, 3).map(p => ({ name: p.name, category: p.category })))
        } else {
            console.log('❌ No products found for this category!')
        }
    }

    // Update the header category dropdown to match current selection
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter) {
        console.log(`🔄 Setting dropdown value to: "${category}"`)
        categoryFilter.value = category
        console.log(`✅ Dropdown value set to: "${categoryFilter.value}"`)
    }

    currentPage = 1
    renderProducts()
    if (!isPageInitializing) {
        document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
    }
}

// Products Functionality
function initializeProducts() {
    renderProducts()

    // Sort functionality
    document.getElementById("sortProducts").addEventListener("change", function () {
        currentSort = this.value
        sortProducts()
        renderProducts()
    })

    // Initialize infinite scroll (with fallback)
    setTimeout(() => {
        initializeInfiniteScroll()
    }, 100) // Small delay to ensure DOM is ready
}

function renderProducts() {
    console.log("🔄 renderProducts v2.0 called - currentPage:", currentPage, "displayedProducts:", displayedProducts.length)
    
    // Get products grid with null check
    const productsGrid = document.getElementById("productsGrid")
    if (!productsGrid) {
        console.error("❌ productsGrid element not found!")
        return
    }
    
    // Calculate products to show
    const startIndex = 0
    const endIndex = currentPage * productsPerPage
    const productsToShow = displayedProducts.slice(startIndex, endIndex)

    // Render products
    try {
        productsGrid.innerHTML = productsToShow.map((product) => createProductCard(product)).join("")
        console.log("✅ Products rendered successfully:", productsToShow.length)
    } catch (error) {
        console.error("❌ Error rendering products:", error)
        return
    }

    // Handle infinite scroll indicators safely
    handleInfiniteScrollIndicators(endIndex)

    // Add event listeners to product cards
    try {
        addProductEventListeners()
    } catch (error) {
        console.error("❌ Error adding product event listeners:", error)
    }
}

// Separate function to handle infinite scroll indicators
function handleInfiniteScrollIndicators(endIndex) {
    try {
        const infiniteScrollTrigger = document.getElementById("infiniteScrollTrigger")
        const endOfProductsIndicator = document.getElementById("endOfProductsIndicator")
        
        console.log("🔍 Checking infinite scroll elements:", {
            trigger: !!infiniteScrollTrigger,
            indicator: !!endOfProductsIndicator,
            endIndex,
            totalProducts: displayedProducts.length
        })
        
        // Only update indicators if both elements exist
        if (infiniteScrollTrigger && endOfProductsIndicator) {
            if (endIndex >= displayedProducts.length) {
                // All products are loaded
                infiniteScrollTrigger.classList.add("hidden")
                endOfProductsIndicator.classList.remove("hidden")
                console.log("✅ All products loaded - showing end indicator")
            } else {
                // More products available
                infiniteScrollTrigger.classList.remove("hidden")
                endOfProductsIndicator.classList.add("hidden")
                console.log("✅ More products available - showing trigger")
            }
        } else {
            console.warn("⚠️ Infinite scroll elements not found - creating fallback")
            createFallbackLoadMoreButton(endIndex)
        }
    } catch (error) {
        console.error("❌ Error handling infinite scroll indicators:", error)
        // Create fallback button as last resort
        try {
            createFallbackLoadMoreButton(endIndex)
        } catch (fallbackError) {
            console.error("❌ Even fallback failed:", fallbackError)
        }
    }
}

function createProductCard(product) {
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;
    
    // Check if product is in cart and get quantity
    const cartItem = cartItems.find(item => item.id === product.id);
    const quantityInCart = cartItem ? cartItem.quantity : 0;

    // Create the cart button area - either simple Add button or quantity controls
    const cartButtonArea = quantityInCart > 0 ? `
        <div class="quantity-controls flex items-center bg-primary rounded-full text-white">
            <button class="decrease-quantity-btn hover:bg-secondary px-2 py-1.5 rounded-l-full transition duration-300" data-product-id="${product.id}">
                <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="quantity-display px-3 py-1.5 text-sm font-semibold bg-primary">${quantityInCart}</span>
            <button class="increase-quantity-btn hover:bg-secondary px-2 py-1.5 rounded-r-full transition duration-300" data-product-id="${product.id}">
                <i class="fas fa-plus text-xs"></i>
            </button>
        </div>
    ` : `
        <button class="add-to-cart bg-primary text-white px-3 py-1.5 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-1" data-product-id="${product.id}">
            <i class="fas fa-plus text-xs"></i>
            <span class="text-sm">Add</span>
        </button>
    `;

    return `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-3 left-3"><span class="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">-${product.discount}%</span></div>` : ''}
                <div class="absolute top-3 right-3 flex flex-col space-y-2">
                    <button class="quick-view-btn bg-white bg-opacity-90 hover:bg-opacity-100 p-1.5 rounded-full shadow-md transition duration-300 transform scale-0 group-hover:scale-100" title="Quick View">
                        <i class="fas fa-eye text-gray-600 hover:text-primary text-sm"></i>
                    </button>
                </div>
            </div>
            <div class="p-4">
                <div class="flex items-center justify-between mb-1.5">
                    <div class="flex text-yellow-400 text-xs">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-xs">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-base mb-1 cursor-pointer hover:text-primary transition duration-300 product-name line-clamp-2">${product.name}</h3>
                ${product.size ? `<p class="text-xs text-gray-500 mb-2 flex items-center"><i class="fas fa-weight-hanging mr-1"></i>${product.size}</p>` : ''}
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-1.5">
                        <span class="text-primary font-bold text-base">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-xs">₹${originalPrice}</span>` : ''}
                    </div>
                    ${cartButtonArea}
                </div>
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    let stars = ""

    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>'
    }

    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>'
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>'
    }

    return stars
}

function addProductEventListeners() {
    // Add to cart buttons
    document.querySelectorAll(".add-to-cart").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productId = this.dataset.productId
            addToCart(productId)
        })
    })

    // Increase quantity buttons
    document.querySelectorAll(".increase-quantity-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productId = this.dataset.productId
            addToCart(productId)
        })
    })

    // Decrease quantity buttons
    document.querySelectorAll(".decrease-quantity-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productId = this.dataset.productId
            decreaseCartQuantity(productId)
        })
    })

    // Wishlist buttons
    document.querySelectorAll(".wishlist-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productCard = this.closest('.product-card')
            const productId = productCard.dataset.productId
            toggleWishlist(productId)
        })
    })

    // Product card click for quick view
    document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("dblclick", function () {
            const productId = this.dataset.productId
            showProductQuickView(productId)
        })
    })
}

function sortProducts() {
    switch (currentSort) {
        case "price-low":
            displayedProducts.sort((a, b) => parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)) - parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)))
            break
        case "price-high":
            displayedProducts.sort((a, b) => parseFloat((typeof b.price === 'string' ? b.price.replace(/^₹/, '') : b.price)) - parseFloat((typeof a.price === 'string' ? a.price.replace(/^₹/, '') : a.price)))
            break
        case "name":
            displayedProducts.sort((a, b) => a.name.localeCompare(b.name))
            break
        case "rating":
            displayedProducts.sort((a, b) => b.rating - a.rating)
            break
        default:
            displayedProducts = [...allProducts]
            if (currentCategory !== "all") {
                displayedProducts = displayedProducts.filter((product) => product.category === currentCategory)
            }
    }
}

// Infinite Scroll Functionality
function initializeInfiniteScroll() {
    const infiniteScrollTrigger = document.getElementById("infiniteScrollTrigger")
    
    if (!infiniteScrollTrigger) {
        console.warn("Infinite scroll trigger element not found - infinite scroll disabled")
        return
    }

    console.log("✅ Initializing infinite scroll functionality")

    // Create an intersection observer to detect when the trigger comes into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains("hidden")) {
                console.log("🔄 Infinite scroll triggered - loading more products")
                loadMoreProducts()
            }
        })
    }, {
        root: null, // Use the viewport as root
        rootMargin: '100px', // Trigger 100px before the element is visible
        threshold: 0.1 // Trigger when 10% of the element is visible
    })

    // Start observing the trigger element
    observer.observe(infiniteScrollTrigger)
    
    // Store observer reference for cleanup if needed
    window.infiniteScrollObserver = observer
}

function loadMoreProducts() {
    // Check if there are more products to load
    const endIndex = currentPage * productsPerPage
    if (endIndex >= displayedProducts.length) {
        return // No more products to load
    }

    // Add a small delay to show loading state
    setTimeout(() => {
        currentPage++
        renderProducts()
        
        // Products loaded silently for better UX
    }, 300) // 300ms delay to show loading spinner briefly
}

// Fallback function to create a load more button if infinite scroll elements are missing
function createFallbackLoadMoreButton(endIndex) {
    const productsSection = document.getElementById("productsSection")
    if (!productsSection) return
    
    // Remove any existing fallback button
    const existingFallback = document.getElementById("fallbackLoadMore")
    if (existingFallback) {
        existingFallback.remove()
    }
    
    // Only create button if there are more products to load
    if (endIndex < displayedProducts.length) {
        const fallbackButton = document.createElement("div")
        fallbackButton.id = "fallbackLoadMore"
        fallbackButton.className = "text-center mt-12"
        fallbackButton.innerHTML = `
            <button onclick="loadMoreProducts()" class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition duration-300">
                Load More Products
            </button>
        `
        
        const productsGrid = document.getElementById("productsGrid")
        if (productsGrid && productsGrid.parentNode) {
            productsGrid.parentNode.insertBefore(fallbackButton, productsGrid.nextSibling)
        }
    }
}

// Cart Functionality
function initializeCart() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem("nearNowCartItems")
    if (savedCart) {
        cartItems = JSON.parse(savedCart)
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    }

    // Update cart count and display immediately
    updateCartCount()
    updateCartDisplay()

    document.getElementById("cartBtn").addEventListener("click", toggleCartSidebar)
    document.getElementById("closeCart").addEventListener("click", closeCartSidebar)
    document.getElementById("checkoutBtn").addEventListener("click", proceedToCheckout)

    // Close cart when clicking overlay
    document.getElementById("modalOverlay").addEventListener("click", closeCartSidebar)
}

function addToCart(productId) {
    const product = allProducts.find((p) => p.id === productId)
    if (!product) return

    const existingItem = cartItems.find((item) => item.id === productId)

    if (existingItem) {
        existingItem.quantity += 1
    } else {
        cartItems.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString(),
        })
    }

    // Recalculate cart count
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

    // Save to localStorage
    saveCartToStorage()

    // Update the display
    updateCartCount()
    updateCartDisplay()

    // Update only the specific product card to avoid blinking
    updateSpecificProductCard(productId)
}

function removeFromCart(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId)
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    updateCartCount()
    updateCartDisplay()
    saveCartToStorage()
    
    // Update the specific product card to show "Add" button
    updateSpecificProductCard(productId)
}

function updateCartQuantity(productId, newQuantity) {
    const item = cartItems.find((item) => item.id === productId)
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId)
        } else {
            item.quantity = newQuantity
            cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
            updateCartCount()
            updateCartDisplay()
            saveCartToStorage()
            
            // Update the specific product card to reflect the new quantity
            updateSpecificProductCard(productId)
        }
    }
}

function decreaseCartQuantity(productId) {
    const existingItem = cartItems.find((item) => item.id === productId)
    if (!existingItem) return

    if (existingItem.quantity > 1) {
        existingItem.quantity -= 1
    } else {
        // Remove item completely if quantity becomes 0
        const index = cartItems.findIndex((item) => item.id === productId)
        cartItems.splice(index, 1)
    }

    // Recalculate cart count
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

    // Save to localStorage
    saveCartToStorage()

    // Update the display
    updateCartCount()
    updateCartDisplay()

    // Update only the specific product card to avoid blinking
    updateSpecificProductCard(productId)
}

function updateSpecificProductCard(productId) {
    // Find the specific product card and update only its cart controls
    const productCard = document.querySelector(`[data-product-id="${productId}"]`)
    if (!productCard) return

    const cartItem = cartItems.find(item => item.id === productId)
    const quantityInCart = cartItem ? cartItem.quantity : 0

    // Find the current button area (either Add button or quantity controls)
    const currentButton = productCard.querySelector('.add-to-cart')
    const currentControls = productCard.querySelector('.quantity-controls')
    const buttonContainer = currentButton ? currentButton.parentElement : (currentControls ? currentControls.parentElement : null)
    
    if (!buttonContainer) return

    // Remove the current element
    if (currentButton) {
        currentButton.remove()
    }
    if (currentControls) {
        currentControls.remove()
    }
    
    // Create and insert the new element
    if (quantityInCart > 0) {
        // Create quantity controls
        const quantityControls = document.createElement('div')
        quantityControls.className = 'quantity-controls flex items-center bg-primary rounded-full text-white'
        quantityControls.innerHTML = `
            <button class="decrease-quantity-btn hover:bg-secondary px-2 py-1.5 rounded-l-full transition duration-300" data-product-id="${productId}">
                <i class="fas fa-minus text-xs"></i>
            </button>
            <span class="quantity-display px-3 py-1.5 text-sm font-semibold bg-primary">${quantityInCart}</span>
            <button class="increase-quantity-btn hover:bg-secondary px-2 py-1.5 rounded-r-full transition duration-300" data-product-id="${productId}">
                <i class="fas fa-plus text-xs"></i>
            </button>
        `
        buttonContainer.appendChild(quantityControls)
        
        // Re-attach event listeners for the new buttons
        addEventListenersToSpecificCard(quantityControls)
    } else {
        // Create Add button
        const addButton = document.createElement('button')
        addButton.className = 'add-to-cart bg-primary text-white px-3 py-1.5 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-1'
        addButton.setAttribute('data-product-id', productId)
        addButton.innerHTML = `
            <i class="fas fa-plus text-xs"></i>
            <span class="text-sm">Add</span>
        `
        buttonContainer.appendChild(addButton)
        
        // Re-attach event listener for the new button
        addButton.addEventListener('click', function(e) {
            e.preventDefault()
            const productId = this.dataset.productId
            addToCart(productId)
        })
    }
}

function addEventListenersToSpecificCard(quantityControls) {
    // Add event listeners to the specific quantity controls
    const increaseButton = quantityControls.querySelector('.increase-quantity-btn')
    const decreaseButton = quantityControls.querySelector('.decrease-quantity-btn')

    if (increaseButton) {
        increaseButton.addEventListener('click', function(e) {
            e.preventDefault()
            const productId = this.dataset.productId
            addToCart(productId)
        })
    }

    if (decreaseButton) {
        decreaseButton.addEventListener('click', function(e) {
            e.preventDefault()
            const productId = this.dataset.productId
            decreaseCartQuantity(productId)
        })
    }
}

function updateCartCount() {
    // Update main cart count badge
    const cartCountElement = document.getElementById("cartCount")
    if (cartCountElement) {
        cartCountElement.textContent = cartCount

        // Add bounce animation
        cartCountElement.classList.add("animate-bounce")
        setTimeout(() => {
            cartCountElement.classList.remove("animate-bounce")
        }, 1000)
    }

    // Update mobile cart count if it exists
    const mobileCartCountElement = document.getElementById("mobileCartCount")
    if (mobileCartCountElement) {
        mobileCartCountElement.textContent = cartCount
    }

}

function updateCartDisplay() {

    const cartItemsContainer = document.getElementById("cartItems")
    const cartTotal = document.getElementById("cartTotal")

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
                <p class="text-xl text-gray-500">Your cart is empty</p>
                <p class="text-gray-400">Add some products to get started</p>
            </div>
        `
        cartTotal.textContent = "₹0"
        return
    }

    cartItemsContainer.innerHTML = cartItems
        .map(
            (item) => `
        <div class="flex items-center space-x-4 p-4 border-b border-gray-200">
            <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.name}</h4>
                <p class="text-sm text-gray-600">₹${typeof item.price === 'string' ? item.price.replace(/^₹/, '') : item.price} each</p>
                <div class="flex items-center space-x-2 mt-2">
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-semibold px-3">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary">₹${(typeof item.price === 'string' ? parseFloat(item.price.replace(/^₹/, '')) : item.price) * item.quantity}</p>
                <button class="text-red-500 hover:text-red-700 mt-2" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")

    const total = cartItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/^₹/, '')) : item.price
        return sum + (price * item.quantity)
    }, 0)
    cartTotal.textContent = `₹${total}`
}

function toggleCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar")
    const modalOverlay = document.getElementById("modalOverlay")

    cartSidebar.classList.toggle("open")
    modalOverlay.classList.toggle("hidden")
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById("cartSidebar")
    const modalOverlay = document.getElementById("modalOverlay")

    cartSidebar.classList.remove("open")
    modalOverlay.classList.add("hidden")
}

function proceedToCheckout() {
    if (cartItems.length === 0) {
        showNotification("Your cart is empty!", "error")
        return
    }

    if (!currentUser) {
        showNotification("Please login to proceed to checkout", "info")
        showLoginModal()
        return
    }

    const total = cartItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/^₹/, '')) : item.price
        return sum + (price * item.quantity)
    }, 0)
    showNotification(`Proceeding to checkout with ₹${total}`, "success")

    // In a real application, this would redirect to checkout page
    setTimeout(() => {
        cartItems = []
        cartCount = 0
        updateCartCount()
        updateCartDisplay()
        saveCartToStorage()
        closeCartSidebar()
        showNotification("Order placed successfully! 🎉", "success")
    }, 2000)
}

function saveCartToStorage() {
    localStorage.setItem("nearNowCartItems", JSON.stringify(cartItems))
}

// Wishlist Functionality
function initializeWishlist() {
    updateWishlistCount()

    document.getElementById("wishlistBtn").addEventListener("click", () => {
        if (wishlistItems.length === 0) {
            showNotification("Your wishlist is empty!", "info")
        } else {
            showNotification(`You have ${wishlistItems.length} items in your wishlist`, "info")
        }
    })
}

function toggleWishlist(productId) {
    const product = allProducts.find((p) => p.id === productId)
    if (!product) return

    const existingIndex = wishlistItems.findIndex((item) => item.id === productId)

    if (existingIndex > -1) {
        wishlistItems.splice(existingIndex, 1)
        showNotification(`${product.name} removed from wishlist`, "info")
    } else {
        wishlistItems.push(product)
        showNotification(`${product.name} added to wishlist!`, "success")
    }

    updateWishlistCount()
    saveWishlistToStorage()

    // Update heart icon
    const heartIcon = document.querySelector(`[data-product-id="${productId}"].wishlist-btn i`)
    if (heartIcon) {
        if (existingIndex > -1) {
            heartIcon.classList.remove("text-red-500")
            heartIcon.classList.add("text-gray-400")
        } else {
            heartIcon.classList.remove("text-gray-400")
            heartIcon.classList.add("text-red-500")
        }
    }
}

function updateWishlistCount() {
    wishlistCount = wishlistItems.length
    document.getElementById("wishlistCount").textContent = wishlistCount
}

function saveWishlistToStorage() {
    localStorage.setItem("nearNowWishlistItems", JSON.stringify(wishlistItems))
}

// Authentication Functionality
function initializeAuth() {
    document.getElementById("accountBtn").addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        console.log('👤 Account button clicked, currentUser exists:', !!currentUser)
        
        if (!currentUser) {
            // User is not logged in - show login modal
            showLoginModal()
        }
        // For logged in users, the user-menu-trigger will handle the dropdown
    })

    document.getElementById("closeLogin").addEventListener("click", hideLoginModal)

    // Setup Supabase authentication event listeners
    setupSupabaseAuthListeners()

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        const userDropdown = document.querySelector(".user-dropdown")
        const accountBtn = document.getElementById("accountBtn")
        
        if (userDropdown && accountBtn && 
            !accountBtn.contains(e.target) && 
            !userDropdown.contains(e.target)) {
            hideUserDropdown()
        }
    })

    // Always call updateUserDisplay to set the correct initial state
    updateUserDisplay()
}

// Setup Supabase authentication event listeners
function setupSupabaseAuthListeners() {
    // Listen for user login events from Supabase auth
    window.addEventListener('userLoggedIn', function(event) {
        console.log('🔐 User logged in event received:', event.detail.user)
        
        // Update currentUser for backward compatibility
        if (event.detail.user) {
            // Try to get name from various sources including stored userDetails
            // If currentUser already exists with a name, preserve it
            const userName = window.currentUser?.name ||  // Preserve existing name
                           event.detail.user.user_metadata?.name || 
                           event.detail.user.user_metadata?.full_name || 
                           event.detail.user.user_metadata?.display_name ||
                           window.userDetails?.name ||  // From form input
                           'User'
            
            currentUser = {
                id: event.detail.user.id,
                name: userName,
                mobile: event.detail.user.phone?.replace('+91', '') || '',
                fullMobile: event.detail.user.phone || '',
                loginTime: new Date().toISOString(),
                isVerified: !!event.detail.user.phone_confirmed_at,
                supabaseUser: event.detail.user
            }
            
            console.log('👤 Setting user name to:', userName)
            
            // Store in localStorage
            localStorage.setItem("nearNowCurrentUser", JSON.stringify(currentUser))
            
            // Update UI
            updateUserDisplay()
            
            // Restore user cart
            if (window.handleUserLogin) {
                window.handleUserLogin()
            }
            
            console.log('✅ User state synchronized with Supabase auth')
        }
    })

    // Listen for user logout events from Supabase auth
    window.addEventListener('userLoggedOut', function() {
        console.log('🚪 User logged out event received')
        
        // Clear currentUser
        currentUser = null
        localStorage.removeItem("nearNowCurrentUser")
        
        // Update UI
        updateUserDisplay()
        
        // Handle cart logout
        if (window.handleUserLogout) {
            window.handleUserLogout()
        }
        
        console.log('✅ User state cleared after Supabase logout')
    })
}

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

    // Reset session
    userDetails = {}
}

function updateUserDisplay() {
    console.log('🔄 updateUserDisplay called with currentUser:', currentUser)
    
    const accountBtn = document.getElementById("accountBtn")
    if (currentUser) {
        // Get user's first name for display
        const displayName = currentUser.name ? currentUser.name.split(' ')[0] : 'User'
        
        console.log('👤 Updating UI with display name:', displayName)
        
        // Updated login button classes for logged in users with animations
        accountBtn.className = "group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-500"
        
        accountBtn.innerHTML = `
            <div class="relative">
                <div class="text-center cursor-pointer user-menu-trigger">
                    <div class="relative mb-2">
                        <div class="relative w-12 h-12 bg-white rounded-xl shadow-md transition-all duration-500 flex items-center justify-center hover:shadow-lg">
                            <i class="fa-solid fa-user text-primary text-lg"></i>
                            <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                        </div>
                    </div>
                    <span class="text-xs font-semibold text-gray-700 group-hover:text-primary transition-all duration-300">${displayName}</span>
                </div>
                <div class="user-dropdown absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible scale-95 transition-all duration-200 z-50">
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
        setTimeout(() => {
            initializeUserDropdown()
            console.log('🎯 User dropdown initialized after display update')
        }, 100)
    } else {
        // Reset account button to login state when user is logged out with animations
        accountBtn.className = "group relative flex flex-col items-center justify-center cursor-pointer transition-all duration-500"
        
        accountBtn.innerHTML = `
            <div class="relative mb-2">
                <div class="relative w-12 h-12 bg-white rounded-xl shadow-md transition-all duration-500 flex items-center justify-center hover:shadow-lg">
                    <i class="fa-solid fa-user text-primary text-lg"></i>
                    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                </div>
            </div>
            <div class="text-center">
                <span class="text-xs font-semibold text-gray-700 group-hover:text-primary transition-all duration-300">Login</span>
            </div>
        `
    }
}

function initializeUserDropdown() {
    const userMenuTrigger = document.querySelector(".user-menu-trigger")
    const userDropdown = document.querySelector(".user-dropdown")
    const userMenuItems = document.querySelectorAll(".user-menu-item")

    console.log('🔄 initializeUserDropdown called')
    console.log('🔍 Elements found:', { 
        trigger: !!userMenuTrigger, 
        dropdown: !!userDropdown, 
        menuItems: userMenuItems.length 
    })

    if (!userMenuTrigger || !userDropdown) {
        console.log('❌ User dropdown or trigger not found - exiting initialization')
        return
    }

    console.log('✅ Initializing user dropdown with trigger and', userMenuItems.length, 'menu items')

    // Remove any existing event listeners to prevent duplicates
    const newTrigger = userMenuTrigger.cloneNode(true)
    userMenuTrigger.parentNode.replaceChild(newTrigger, userMenuTrigger)

    // Toggle dropdown on click
    newTrigger.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        console.log('🎯 User menu trigger clicked!')
        toggleUserDropdown()
    })

    console.log('🔗 Event listener attached to trigger')

    // Handle menu item clicks
    userMenuItems.forEach((item) => {
        item.addEventListener("click", function (e) {
            e.preventDefault()
            e.stopPropagation()

            const action = this.dataset.action
            console.log('🎯 Menu action clicked:', action)
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

function toggleUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    
    console.log('🔄 toggleUserDropdown called')
    console.log('📍 Dropdown element found:', !!userDropdown)
    
    if (!userDropdown) {
        console.log('❌ No dropdown element found!')
        return
    }

    const isVisible = !userDropdown.classList.contains("opacity-0")
    console.log('👁️ Is currently visible:', isVisible)

    if (isVisible) {
        console.log('➡️ Hiding dropdown')
        hideUserDropdown()
    } else {
        console.log('➡️ Showing dropdown')
        showUserDropdown()
    }
}

function showUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) {
        console.log('❌ showUserDropdown: No dropdown element found')
        return
    }

    console.log('📱 showUserDropdown called')
    console.log('🎨 Current dropdown classes:', userDropdown.className)
    
    userDropdown.classList.remove("opacity-0", "invisible", "scale-95")
    userDropdown.classList.add("opacity-100", "visible", "scale-100")
    
    console.log('🎨 New dropdown classes:', userDropdown.className)
    console.log('✅ Dropdown should now be visible')
}

function hideUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    console.log('🙈 Hiding dropdown')
    userDropdown.classList.remove("opacity-100", "visible", "scale-100")
    userDropdown.classList.add("opacity-0", "invisible", "scale-95")
}

function handleUserMenuAction(action) {
    console.log('🎯 handleUserMenuAction called with action:', action)
    
    switch (action) {
        case "profile":
            console.log('👤 Profile action selected')
            showNotification("View Profile feature coming soon!", "info")
            break
        case "orders":
            console.log('📦 Orders action selected - calling showOrderHistory()')
            showOrderHistory()
            break
        case "settings":
            console.log('⚙️ Settings action selected')
            showNotification("Settings feature coming soon!", "info")
            break
        case "logout":
            console.log('🚪 Logout action selected')
            logoutUser() // Use the updated Supabase logout function
            break
        default:
            console.log('❓ Unknown action:', action)
    }
}

// Remove the old showUserMenu function and replace it with this:
function showUserMenu() {
    // This function is no longer needed as we use dropdown
    toggleUserDropdown()
}

/**
 * Order History Functions
 */

// Show order history modal
async function showOrderHistory() {
    console.log('📋 Opening order history...');
    
    const modal = document.getElementById('orderHistoryModal');
    const loading = document.getElementById('orderHistoryLoading');
    const content = document.getElementById('orderHistoryContent');
    const empty = document.getElementById('orderHistoryEmpty');
    
    if (!modal) {
        console.error('Order history modal not found');
        return;
    }
    
    // Show modal with loading state
    modal.classList.remove('hidden');
    loading.classList.remove('hidden');
    content.classList.add('hidden');
    empty.classList.add('hidden');
    
    try {
        // Check if user is authenticated
        if (!currentUser) {
            console.log('❌ No current user found');
            showNotification('Please login to view your orders', 'error');
            closeOrderHistory();
            return;
        }
        
        console.log('✅ User authenticated:', currentUser.name);
        
        // Check if order manager is available
        if (!window.orderManager) {
            throw new Error('Order system not available');
        }
        
        console.log('📦 Fetching user orders...');
        
        // Get user orders
        const orders = await window.orderManager.getUserOrders(20); // Get last 20 orders
        
        console.log(`✅ Found ${orders.length} orders`);
        
        // Hide loading
        loading.classList.add('hidden');
        
        if (orders.length === 0) {
            // Show empty state
            empty.classList.remove('hidden');
        } else {
            // Show orders
            renderOrderHistory(orders);
            content.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('❌ Error loading orders:', error);
        loading.classList.add('hidden');
        showNotification('Failed to load orders. Please try again.', 'error');
        closeOrderHistory();
    }
}

// Close order history modal
function closeOrderHistory() {
    const modal = document.getElementById('orderHistoryModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Render order history
function renderOrderHistory(orders) {
    const content = document.getElementById('orderHistoryContent');
    if (!content) return;
    
    console.log('🎨 Rendering order history with', orders.length, 'orders');
    
    let html = '<div class="space-y-4">';
    
    orders.forEach(order => {
        const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusColor = getOrderStatusColor(order.order_status);
        const statusIcon = getOrderStatusIcon(order.order_status);
        
        html += `
            <div class="border rounded-xl p-6 hover:shadow-lg transition-shadow bg-white">
                <!-- Order Header -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="bg-primary bg-opacity-10 p-3 rounded-lg mr-4">
                            <i class="fas fa-shopping-bag text-primary text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-bold text-lg text-gray-800">Order #${order.order_number}</h3>
                            <p class="text-gray-600 text-sm">${orderDate}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                            <i class="${statusIcon} mr-1"></i>
                            ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </span>
                        <p class="text-lg font-bold text-primary mt-1">₹${order.order_total}</p>
                    </div>
                </div>
                
                <!-- Order Items Preview -->
                <div class="mb-4">
                    <p class="text-gray-600 text-sm mb-2">${order.items.length} item(s)</p>
                    <div class="flex flex-wrap gap-2">
                        ${order.items.slice(0, 3).map(item => `
                            <div class="flex items-center bg-gray-50 rounded-lg p-2 text-sm">
                                <img src="${item.image || 'https://via.placeholder.com/30'}" 
                                     alt="${item.name}" 
                                     class="w-6 h-6 object-cover rounded mr-2">
                                <span class="text-gray-700">${item.name}</span>
                                ${item.quantity > 1 ? `<span class="text-gray-500 ml-1">x${item.quantity}</span>` : ''}
                            </div>
                        `).join('')}
                        ${order.items.length > 3 ? `
                            <div class="flex items-center text-gray-500 text-sm">
                                +${order.items.length - 3} more items
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Order Actions -->
                <div class="flex items-center justify-between pt-4 border-t">
                    <div class="flex items-center text-sm text-gray-600">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        <span>${order.shipping_address.city}, ${order.shipping_address.state}</span>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="showOrderDetails('${order.id}')" 
                                class="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                            <i class="fas fa-eye mr-1"></i>
                            View Details
                        </button>
                        ${order.order_status === 'delivered' ? `
                            <button onclick="reorderItems('${order.id}')" 
                                    class="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                                <i class="fas fa-redo mr-1"></i>
                                Reorder
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    content.innerHTML = html;
}

// Get order status color
function getOrderStatusColor(status) {
    switch (status) {
        case 'placed': return 'bg-blue-100 text-blue-800';
        case 'confirmed': return 'bg-yellow-100 text-yellow-800';
        case 'preparing': return 'bg-orange-100 text-orange-800';
        case 'out_for_delivery': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

// Get order status icon
function getOrderStatusIcon(status) {
    switch (status) {
        case 'placed': return 'fas fa-clock';
        case 'confirmed': return 'fas fa-check';
        case 'preparing': return 'fas fa-utensils';
        case 'out_for_delivery': return 'fas fa-truck';
        case 'delivered': return 'fas fa-check-double';
        case 'cancelled': return 'fas fa-times';
        default: return 'fas fa-info';
    }
}

// Show order details modal
async function showOrderDetails(orderId) {
    console.log('📄 Opening order details for:', orderId);
    
    const modal = document.getElementById('orderDetailsModal');
    const content = document.getElementById('orderDetailsContent');
    
    if (!modal || !content) {
        console.error('Order details modal not found');
        return;
    }
    
    // Show modal with loading
    modal.classList.remove('hidden');
    content.innerHTML = `
        <div class="text-center py-12">
            <div class="relative mx-auto mb-4 w-16 h-16">
                <div class="absolute inset-0 border-4 border-blue-500 border-opacity-20 rounded-full"></div>
                <div class="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <i class="fas fa-receipt text-blue-500 text-lg absolute inset-0 flex items-center justify-center"></i>
            </div>
            <p class="text-gray-600 font-medium">Loading order details...</p>
        </div>
    `;
    
    try {
        // Get order details
        const order = await window.orderManager.getOrderById(orderId);
        
        if (!order) {
            throw new Error('Order not found');
        }
        
        console.log('✅ Order details loaded:', order.order_number);
        
        // Render order details
        renderOrderDetails(order);
        
    } catch (error) {
        console.error('❌ Error loading order details:', error);
        content.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">Failed to Load Order</h3>
                <p class="text-gray-600 mb-4">Unable to load order details. Please try again.</p>
                <button onclick="closeOrderDetails()" class="bg-red-500 text-white px-4 py-2 rounded-lg">
                    Close
                </button>
            </div>
        `;
    }
}

// Close order details modal
function closeOrderDetails() {
    const modal = document.getElementById('orderDetailsModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Render order details
function renderOrderDetails(order) {
    const content = document.getElementById('orderDetailsContent');
    if (!content) return;
    
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const estimatedDelivery = order.estimated_delivery_time ? 
        new Date(order.estimated_delivery_time).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) : calculateEstimatedDelivery(order.created_at, order.order_status);
    
    const statusColor = getOrderStatusColor(order.order_status);
    const statusIcon = getOrderStatusIcon(order.order_status);
    
    let html = `
        <!-- Order Header -->
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Order #${order.order_number}</h2>
                    <p class="text-gray-600">Placed on ${orderDate}</p>
                </div>
                <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${statusColor}">
                    <i class="${statusIcon} mr-2"></i>
                    ${order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                </span>
            </div>
            
            <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <span class="text-gray-500">Payment Method:</span>
                    <span class="font-medium ml-2">${order.payment_method.toUpperCase()}</span>
                </div>
                <div>
                    <span class="text-gray-500">Estimated Delivery:</span>
                    <span class="font-medium ml-2">${estimatedDelivery}</span>
                </div>
            </div>
        </div>
        
        <!-- Order Status Timeline -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-route mr-2 text-primary"></i>
                Order Progress
            </h3>
            ${renderOrderStatusTimeline(order)}
        </div>
        
        <!-- Order Items -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-shopping-bag mr-2 text-primary"></i>
                Items Ordered (${order.items.length})
            </h3>
            <div class="space-y-3">
    `;
    
    // Render each item
    order.items.forEach(item => {
        const itemPrice = parseFloat(item.price?.replace(/[₹,]/g, '')) || 0;
        const itemTotal = itemPrice * (item.quantity || 1);
        
        html += `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex items-center">
                    <img src="${item.image || 'https://via.placeholder.com/60'}" 
                         alt="${item.name}" 
                         class="w-12 h-12 object-cover rounded-lg mr-4">
                    <div>
                        <h4 class="font-medium text-gray-800">${item.name}</h4>
                        <p class="text-sm text-gray-600">Quantity: ${item.quantity || 1}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-800">₹${itemTotal.toFixed(2)}</p>
                    <p class="text-xs text-gray-500">₹${itemPrice}/each</p>
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
        
        <!-- Delivery Address -->
        <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-map-marker-alt mr-2 text-primary"></i>
                Delivery Address
            </h3>
            <div class="bg-gray-50 rounded-lg p-4">
                <p class="font-medium text-gray-800">${order.customer_name}</p>
                <p class="text-gray-600">${order.shipping_address.streetAddress}</p>
                ${order.shipping_address.aptSuite ? `<p class="text-gray-600">${order.shipping_address.aptSuite}</p>` : ''}
                ${order.shipping_address.landmark ? `<p class="text-gray-600">Near ${order.shipping_address.landmark}</p>` : ''}
                <p class="text-gray-600">${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.zipCode}</p>
                <p class="text-gray-600 mt-2">
                    <i class="fas fa-phone mr-1"></i>
                    ${order.customer_phone}
                </p>
            </div>
        </div>
        
        <!-- Order Summary -->
        <div class="bg-gray-50 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <i class="fas fa-calculator mr-2 text-primary"></i>
                Order Summary
            </h3>
            <div class="space-y-2">
                <div class="flex justify-between">
                    <span class="text-gray-600">Subtotal</span>
                    <span class="font-medium">₹${order.subtotal}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Delivery Fee</span>
                    <span class="font-medium">₹${order.delivery_fee}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">Handling Charge</span>
                    <span class="font-medium">₹${order.handling_charge}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-gray-600">GST (18%)</span>
                    <span class="font-medium">₹${order.gst_amount}</span>
                </div>
                <div class="border-t pt-2 mt-2">
                    <div class="flex justify-between text-lg font-bold">
                        <span class="text-gray-800">Total Amount</span>
                        <span class="text-primary">₹${order.order_total}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-4 mt-6">
            ${order.order_status === 'delivered' ? `
                <button onclick="reorderItems('${order.id}')" 
                        class="flex-1 bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors">
                    <i class="fas fa-redo mr-2"></i>
                    Reorder Items
                </button>
            ` : ''}
            <button onclick="closeOrderDetails()" 
                    class="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                Close
            </button>
        </div>
    `;
    
    content.innerHTML = html;
}

// Render order status timeline
function renderOrderStatusTimeline(order) {
    const statusSteps = [
        { key: 'placed', label: 'Order Placed', icon: 'fas fa-shopping-cart' },
        { key: 'confirmed', label: 'Confirmed', icon: 'fas fa-check-circle' },
        { key: 'preparing', label: 'Preparing', icon: 'fas fa-utensils' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: 'fas fa-truck' },
        { key: 'delivered', label: 'Delivered', icon: 'fas fa-check-double' }
    ];
    
    const currentStatusIndex = statusSteps.findIndex(step => step.key === order.order_status);
    const isDelivered = order.order_status === 'delivered';
    const isCancelled = order.order_status === 'cancelled';
    
    let html = '<div class="relative">';
    
    // Progress line
    html += '<div class="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>';
    if (currentStatusIndex >= 0) {
        const progressHeight = ((currentStatusIndex + 1) / statusSteps.length) * 100;
        html += `<div class="absolute left-6 top-12 w-0.5 bg-primary transition-all duration-1000" style="height: ${progressHeight}%"></div>`;
    }
    
    // Status steps
    statusSteps.forEach((step, index) => {
        const isCompleted = index <= currentStatusIndex && !isCancelled;
        const isCurrent = index === currentStatusIndex && !isCancelled;
        const stepTime = getStatusTimestamp(order, step.key);
        
        let stepClass = 'bg-gray-200 text-gray-400';
        let iconClass = 'text-gray-400';
        
        if (isCompleted) {
            stepClass = 'bg-primary text-white shadow-lg';
            iconClass = 'text-white';
        } else if (isCurrent) {
            stepClass = 'bg-primary text-white shadow-lg animate-pulse';
            iconClass = 'text-white';
        }
        
        html += `
            <div class="relative flex items-center mb-8">
                <div class="flex-shrink-0 w-12 h-12 rounded-full ${stepClass} flex items-center justify-center relative z-10 transition-all duration-300">
                    <i class="${step.icon} ${iconClass}"></i>
                </div>
                <div class="ml-4 flex-1">
                    <h4 class="font-semibold text-gray-800">${step.label}</h4>
                    ${stepTime ? `<p class="text-sm text-gray-500">${stepTime}</p>` : ''}
                    ${isCurrent && !isDelivered ? '<p class="text-xs text-primary font-medium">In Progress</p>' : ''}
                </div>
                ${isCompleted ? '<div class="ml-auto"><i class="fas fa-check text-primary"></i></div>' : ''}
            </div>
        `;
    });
    
    // Handle cancelled orders
    if (isCancelled) {
        html += `
            <div class="relative flex items-center mb-4">
                <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center relative z-10">
                    <i class="fas fa-times"></i>
                </div>
                <div class="ml-4 flex-1">
                    <h4 class="font-semibold text-red-600">Order Cancelled</h4>
                    <p class="text-sm text-gray-500">${getStatusTimestamp(order, 'cancelled') || 'Recently cancelled'}</p>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}

// Get timestamp for specific status
function getStatusTimestamp(order, status) {
    if (status === 'placed') {
        return new Date(order.created_at).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // For other statuses, we'll check if status history is available
    if (order.status_history && Array.isArray(order.status_history)) {
        const statusEntry = order.status_history.find(entry => entry.status === status);
        if (statusEntry) {
            return new Date(statusEntry.created_at).toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    return null;
}

/**
 * Order Status Management Functions
 */

// Update order status (admin function)
window.updateOrderStatus = async function(orderId, newStatus, notes = '') {
    console.log(`📋 Updating order ${orderId} to status: ${newStatus}`);
    
    try {
        if (!window.orderManager) {
            throw new Error('Order manager not available');
        }
        
        // Valid statuses
        const validStatuses = ['placed', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}. Valid statuses: ${validStatuses.join(', ')}`);
        }
        
        // Update order status
        const result = await window.orderManager.updateOrderStatus(orderId, newStatus);
        
        // Create status history entry
        await window.orderManager.createOrderStatusHistory(orderId, newStatus, notes);
        
        console.log('✅ Order status updated successfully');
        
        // Show notification
        showNotification(`Order status updated to ${newStatus}`, 'success');
        
        return result;
        
    } catch (error) {
        console.error('❌ Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
        throw error;
    }
}

// Calculate estimated delivery time based on status
function calculateEstimatedDelivery(orderDate, currentStatus) {
    const created = new Date(orderDate);
    const now = new Date();
    
    // Base delivery times in hours
    const deliveryTimes = {
        'placed': 48,      // 2 days
        'confirmed': 36,   // 1.5 days  
        'preparing': 24,   // 1 day
        'out_for_delivery': 4, // 4 hours
        'delivered': 0     // Already delivered
    };
    
    if (currentStatus === 'delivered') {
        return 'Delivered';
    }
    
    if (currentStatus === 'cancelled') {
        return 'Cancelled';
    }
    
    const hoursToAdd = deliveryTimes[currentStatus] || 48;
    const estimatedTime = new Date(now.getTime() + (hoursToAdd * 60 * 60 * 1000));
    
    return estimatedTime.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Quick status update functions for testing
window.markOrderConfirmed = (orderId) => updateOrderStatus(orderId, 'confirmed', 'Order confirmed by admin');
window.markOrderPreparing = (orderId) => updateOrderStatus(orderId, 'preparing', 'Order is being prepared');
window.markOrderOutForDelivery = (orderId) => updateOrderStatus(orderId, 'out_for_delivery', 'Order is out for delivery');
window.markOrderDelivered = (orderId) => updateOrderStatus(orderId, 'delivered', 'Order delivered successfully');
window.markOrderCancelled = (orderId) => updateOrderStatus(orderId, 'cancelled', 'Order cancelled');

// Get order status history
window.getOrderStatusHistory = async function(orderId) {
    console.log(`📋 Getting status history for order: ${orderId}`);
    
    try {
        if (!window.orderManager) {
            throw new Error('Order manager not available');
        }
        
        const history = await window.orderManager.getOrderStatusHistory(orderId);
        console.log('📊 Order status history:', history);
        return history;
        
    } catch (error) {
        console.error('❌ Error getting order status history:', error);
        throw error;
    }
}

// Reorder items from previous order
async function reorderItems(orderId) {
    console.log('🔄 Reordering items from order:', orderId);
    
    try {
        // Get order details
        const order = await window.orderManager.getOrderById(orderId);
        
        if (!order || !order.items) {
            throw new Error('Order items not found');
        }
        
        console.log('📦 Adding', order.items.length, 'items to cart');
        
        // Add each item to cart
        let addedCount = 0;
        order.items.forEach(item => {
            try {
                // Find the product in current products list
                const product = allProducts.find(p => p.id === item.id);
                
                if (product) {
                    // Add to cart using existing function
                    for (let i = 0; i < (item.quantity || 1); i++) {
                        addToCart(item.id);
                    }
                    addedCount++;
                }
            } catch (error) {
                console.warn('Could not add item to cart:', item.name, error);
            }
        });
        
        // Close modals
        closeOrderDetails();
        closeOrderHistory();
        
        // Show success message
        if (addedCount > 0) {
            showNotification(`Added ${addedCount} items to cart from your previous order!`, 'success');
            
            // Open cart sidebar to show added items
            setTimeout(() => {
                const cartSidebar = document.getElementById('cartSidebar');
                const modalOverlay = document.getElementById('modalOverlay');
                if (cartSidebar && modalOverlay) {
                    cartSidebar.classList.add('translate-x-0');
                    cartSidebar.classList.remove('translate-x-full');
                    modalOverlay.classList.remove('hidden');
                }
            }, 500);
        } else {
            showNotification('Some items from your previous order are no longer available', 'warning');
        }
        
    } catch (error) {
        console.error('❌ Error reordering items:', error);
        showNotification('Failed to reorder items. Please try again.', 'error');
    }
}

// Logout Functionality
function logout() {
    // Handle cart logout using CartManager
    if (window.handleUserLogout) {
        window.handleUserLogout();
    }

    localStorage.removeItem("nearNowCurrentUser")
    currentUser = null

    // Update display using updateUserDisplay instead of manually setting HTML
    updateUserDisplay()

    showNotification("Logged out successfully!", "success")
}

// Navigation Functionality
function initializeNavigation() {
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault()

            // Update active nav link
            document.querySelectorAll(".nav-link").forEach((l) => {
                l.classList.remove("text-primary", "font-semibold", "border-b-2", "border-primary")
                l.classList.add("text-gray-700")
            })

            this.classList.remove("text-gray-700")
            this.classList.add("text-primary", "font-semibold", "border-b-2", "border-primary")

            const section = this.dataset.section
            navigateToSection(section)
        })
    })
}

function navigateToSection(section) {
    switch (section) {
        case "home":
            window.scrollTo({ top: 0, behavior: "smooth" })
            break
        case "shop":
        case "categories":
            document.getElementById("categoriesSection").scrollIntoView({ behavior: "smooth" })
            break
        case "about":
            showNotification("About Us page coming soon!", "info")
            break
        case "contact":
            showNotification("Contact Us page coming soon!", "info")
            break
    }
}

// Modal Functionality
function initializeModals() {
    // Close modals when clicking overlay
    document.getElementById("modalOverlay").addEventListener("click", () => {
        hideLoginModal()
        closeCartSidebar()
    })

    // Close modals with Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            hideLoginModal()
            closeCartSidebar()
        }
    })
}

// Scroll Effects
function initializeScrollEffects() {
    // Back to top button
    const backToTopBtn = document.getElementById("backToTop")

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove("opacity-0", "invisible")
            backToTopBtn.classList.add("opacity-100", "visible")
        } else {
            backToTopBtn.classList.add("opacity-0", "invisible")
            backToTopBtn.classList.remove("opacity-100", "visible")
        }

        // Header shadow effect
        const header = document.querySelector("header")
        if (window.scrollY > 100) {
            header.classList.add("shadow-2xl")
        } else {
            header.classList.remove("shadow-2xl")
        }
    })

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" })
    })

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("fade-in")
            }
        })
    }, observerOptions)

    // Observe elements for animation
    document.querySelectorAll(".product-card, .category-item").forEach((el) => {
        observer.observe(el)
    })
}

// Newsletter Functionality
function initializeNewsletter() {
    document.getElementById("newsletterForm").addEventListener("submit", function (e) {
        e.preventDefault()

        const email = document.getElementById("newsletterEmail").value
        if (email) {
            showNotification("Thank you for subscribing to Near & Now newsletter!", "success")
            this.reset()
        }
    })
}

// Product Quick View
function showProductQuickView(productId) {
    const product = allProducts.find((p) => p.id === productId)
    if (!product) return

    const quickViewHTML = `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
                <div class="p-8">
                    <div class="flex justify-between items-start mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Quick View</h2>
                        <button id="closeQuickView" class="text-gray-500 hover:text-gray-700 text-2xl">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="grid md:grid-cols-2 gap-8">
                        <div>
                            <img src="${product.image}" alt="${product.name}" class="w-full rounded-lg">
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-gray-800 mb-2">${product.name}</h3>
                            <div class="flex items-center mb-4">
                                <div class="flex text-yellow-400 text-sm mr-2">
                                    ${generateStarRating(product.rating)}
                                </div>
                                <span class="text-gray-500 text-sm">(${product.reviews} reviews)</span>
                            </div>
                            <div class="flex items-center space-x-2 mb-6">
                                <span class="text-primary font-bold text-2xl">₹${product.price}</span>
                                ${product.originalPrice ? `<span class="text-gray-400 line-through text-lg">₹${product.originalPrice}</span>` : ""}
                            </div>
                            <div class="flex space-x-4">
                                <button class="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-secondary transition duration-300" onclick="addToCart(${product.id}); closeQuickView()">
                                    Add to Cart
                                </button>
                                <button class="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition duration-300" onclick="toggleWishlist(${product.id})">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `

    const quickViewElement = document.createElement("div")
    quickViewElement.innerHTML = quickViewHTML
    quickViewElement.id = "quickViewModal"
    document.body.appendChild(quickViewElement)

    document.getElementById("modalOverlay").classList.remove("hidden")

    document.getElementById("closeQuickView").addEventListener("click", closeQuickView)
}

function closeQuickView() {
    const quickViewModal = document.getElementById("quickViewModal")
    if (quickViewModal) {
        quickViewModal.remove()
    }
    document.getElementById("modalOverlay").classList.add("hidden")
}

// Notification System
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

// Special Offers Functionality
document.addEventListener("DOMContentLoaded", () => {
    // Weekend special button
    document.querySelectorAll(".weekend-special-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            filterByCategory("fruits")
            showNotification("Showing weekend special deals!", "success")
        })
    })

    // Free delivery button
    document.querySelectorAll(".free-delivery-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!isPageInitializing) {
                document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
            }
            showNotification("Shop for ₹999 or more to get free delivery!", "info")
        })
    })
})

// Additional saved data loading (wishlist and user)
document.addEventListener("DOMContentLoaded", () => {
    // Load saved wishlist and user data
    const savedWishlist = localStorage.getItem("nearNowWishlistItems")
    const savedUser = localStorage.getItem("nearNowCurrentUser")

    if (savedWishlist) {
        wishlistItems = JSON.parse(savedWishlist)
        wishlistCount = wishlistItems.length
    }

    if (savedUser) {
        currentUser = JSON.parse(savedUser)
    }
})

// Performance optimization - Lazy loading images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[src*="placeholder"]')

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target
                img.classList.add("fade-in")
                observer.unobserve(img)
            }
        })
    })

    images.forEach((img) => imageObserver.observe(img))
}

// Mobile responsiveness enhancements
function initializeMobileFeatures() {
    // Mobile-specific features
    if (window.innerWidth <= 768) {
        // Add touch gestures for mobile
        let startX = 0
        let startY = 0

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX
            startY = e.touches[0].clientY
        })

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return

            let endX = e.changedTouches[0].clientX
            let endY = e.changedTouches[0].clientY

            let diffX = startX - endX
            let diffY = startY - endY

            // Detect swipe gestures - only if slider exists
            const sliderContainer = document.getElementById("sliderContainer")
            if (sliderContainer && Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 50) {
                    // Swipe left - next slide
                    nextSlide()
                } else if (diffX < -50) {
                    // Swipe right - previous slide
                    prevSlide()
                }
            }

            startX = 0
            startY = 0
        })

        function handleSwipe() {
            // Handle swipe gestures for mobile
        }
    }
}

// Initialize mobile features
initializeMobileFeatures()
initializeLazyLoading()

// Console welcome message
console.log(`
🛒 Near & Now Website Loaded Successfully! v2.0 - Infinite Scroll Edition
🚀 Script loaded at: ${new Date().toISOString()}
`)

// ===== NEW ENHANCED FEATURES =====

// Quick View Functionality
function initializeQuickView() {
    // Event listeners for quick view buttons
    document.addEventListener('click', (e) => {
        if (e.target.closest('.quick-view-btn') || e.target.closest('.quick-view-btn-mobile') || e.target.closest('.product-name')) {
            const productCard = e.target.closest('.product-card')
            if (productCard && productCard.dataset.productId) {
                const productId = productCard.dataset.productId
                showQuickView(productId)
            }
        }
    })

    // Close quick view modal
    const closeBtn = document.getElementById('closeQuickView')
    if (closeBtn) {
        closeBtn.addEventListener('click', closeQuickView)
    }

    const modal = document.getElementById('quickViewModal')
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'quickViewModal') {
                closeQuickView()
            }
        })
    }

    // Quick view quantity controls
    const decreaseBtn = document.getElementById('decreaseQuantity')
    if (decreaseBtn) {
        decreaseBtn.addEventListener('click', () => {
            const quantitySpan = document.getElementById('quickViewQuantity')
            if (quantitySpan) {
                let quantity = parseInt(quantitySpan.textContent)
                if (quantity > 1) {
                    quantitySpan.textContent = quantity - 1
                }
            }
        })
    }

    const increaseBtn = document.getElementById('increaseQuantity')
    if (increaseBtn) {
        increaseBtn.addEventListener('click', () => {
            const quantitySpan = document.getElementById('quickViewQuantity')
            if (quantitySpan) {
                let quantity = parseInt(quantitySpan.textContent)
                quantitySpan.textContent = quantity + 1
            }
        })
    }

    // Quick view add to cart
    const addToCartBtn = document.getElementById('quickViewAddToCart')
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
            if (quickViewProduct) {
                const quantitySpan = document.getElementById('quickViewQuantity')
                const quantity = quantitySpan ? parseInt(quantitySpan.textContent) : 1
                // Add the product multiple times based on quantity since addToCart only accepts productId
                for (let i = 0; i < quantity; i++) {
                    addToCart(quickViewProduct.id)
                }
                closeQuickView()
                // Notification removed - visual feedback provided by quantity controls
            }
        })
    }
}

function showQuickView(productId) {
    const product = allProducts.find(p => p.id === productId)
    if (!product) return

    quickViewProduct = product
    const modal = document.getElementById('quickViewModal')
    if (!modal) return

    // Populate quick view content
    const imageEl = document.getElementById('quickViewImage')
    const nameEl = document.getElementById('quickViewName')

    if (imageEl) {
        imageEl.src = product.image
        imageEl.alt = product.name
    }
    if (nameEl) {
        nameEl.textContent = product.name
    }

    // Size information
    const sizeEl = document.getElementById('quickViewSize')
    if (sizeEl && product.size) {
        const sizeSpan = sizeEl.querySelector('span')
        if (sizeSpan) {
            sizeSpan.textContent = product.size
            sizeEl.classList.remove('hidden')
        }
    } else if (sizeEl) {
        sizeEl.classList.add('hidden')
    }

    // Price and discount
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null

    const priceEl = document.getElementById('quickViewPrice')
    const originalPriceEl = document.getElementById('quickViewOriginalPrice')
    const discountTextEl = document.getElementById('quickViewDiscountText')

    if (priceEl) {
        priceEl.textContent = `₹${price}`
    }

    if (originalPriceEl && discountTextEl) {
        if (originalPrice) {
            originalPriceEl.textContent = `₹${originalPrice}`
            originalPriceEl.classList.remove('hidden')
            discountTextEl.textContent = `Save ₹${originalPrice - price}`
            discountTextEl.classList.remove('hidden')
        } else {
            originalPriceEl.classList.add('hidden')
            discountTextEl.classList.add('hidden')
        }
    }

    // Discount badge
    const discountEl = document.getElementById('quickViewDiscount')
    if (discountEl) {
        if (product.discount > 0) {
            discountEl.textContent = `-${product.discount}%`
            discountEl.classList.remove('hidden')
        } else {
            discountEl.classList.add('hidden')
        }
    }

    // Rating and reviews
    const ratingEl = document.getElementById('quickViewRating')
    const ratingTextEl = document.getElementById('quickViewRatingText')
    const reviewsEl = document.getElementById('quickViewReviews')

    if (ratingEl) {
        ratingEl.innerHTML = generateStarRating(product.rating)
    }
    if (ratingTextEl) {
        ratingTextEl.textContent = product.rating
    }
    if (reviewsEl) {
        reviewsEl.textContent = `${product.reviews} reviews`
    }

    // Stock status
    const stockEl = document.getElementById('quickViewStock')
    if (stockEl) {
        stockEl.textContent = product.inStock ? 'In Stock' : 'Out of Stock'
        stockEl.className = product.inStock ? 'text-sm text-green-600 font-semibold' : 'text-sm text-red-600 font-semibold'
    }

    // Reset quantity
    const quantityEl = document.getElementById('quickViewQuantity')
    if (quantityEl) {
        quantityEl.textContent = '1'
    }

    // Load reviews
    loadQuickViewReviews(product)

    // Show modal
    modal.classList.remove('hidden')
    modal.classList.add('flex')

    const overlay = document.getElementById('modalOverlay')
    if (overlay) {
        overlay.classList.remove('hidden')
    }
}

function closeQuickView() {
    const modal = document.getElementById('quickViewModal')
    if (modal) {
        modal.classList.add('hidden')
        modal.classList.remove('flex')
    }

    const overlay = document.getElementById('modalOverlay')
    if (overlay) {
        overlay.classList.add('hidden')
    }

    quickViewProduct = null
}



function loadQuickViewReviews(product) {
    const reviewsContainer = document.getElementById('quickViewReviewsList')
    if (!reviewsContainer) return

    if (product.reviewsList && product.reviewsList.length > 0) {
        const reviewsHTML = product.reviewsList.slice(0, 3).map(review => `
            <div class="border-b border-gray-200 pb-3 last:border-b-0">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="font-semibold text-gray-800">${review.userName}</span>
                        ${review.verified ? '<span class="text-blue-500 text-xs"><i class="fas fa-check-circle"></i> Verified</span>' : ''}
                    </div>
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(review.rating)}
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${review.comment}</p>
                <span class="text-gray-400 text-xs">${new Date(review.date).toLocaleDateString()}</span>
            </div>
        `).join('')

        reviewsContainer.innerHTML = reviewsHTML
    } else {
        reviewsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first to review this product!</p>'
    }
}

// Advanced Filtering Functionality
async function initializeAdvancedFilters() {
    // Hide filters panel
    document.getElementById('hideFilters').addEventListener('click', () => {
        document.getElementById('filtersPanel').classList.add('hidden')
    })

    // Price range slider
    const priceRange = document.getElementById('priceRange')
    const priceRangeValue = document.getElementById('priceRangeValue')

    priceRange.addEventListener('input', (e) => {
        const value = e.target.value
        priceRangeValue.textContent = `₹${value}`
        currentFilters.priceRange.max = parseInt(value)
        document.getElementById('maxPriceFilter').value = value
    })

    // Price input fields
    document.getElementById('minPriceFilter').addEventListener('input', (e) => {
        currentFilters.priceRange.min = parseInt(e.target.value) || 0
    })

    document.getElementById('maxPriceFilter').addEventListener('input', (e) => {
        const value = parseInt(e.target.value) || 1000
        currentFilters.priceRange.max = value
        priceRange.value = value
        priceRangeValue.textContent = `₹${value}`
    })

    // Category filters
    await populateCategoryFilters()

    // Rating filters
    document.querySelectorAll('.rating-filter').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateRatingFilters()
        })
    })

    // Availability filters
    document.querySelectorAll('.availability-filter').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateAvailabilityFilters()
        })
    })

    // Apply filters
    document.getElementById('applyAllFilters').addEventListener('click', applyAllFilters)
    document.getElementById('clearAllFilters').addEventListener('click', clearAllFilters)
}

async function populateCategoryFilters() {
    try {
        const categories = await getAvailableCategories()
        const container = document.getElementById('categoryFilters')

        if (!container) {
            console.warn('Category filters container not found')
            return
        }

        const categoriesHTML = categories.map(category => `
            <label class="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" value="${category.name}" class="category-filter-checkbox">
                <span class="text-sm text-gray-600">${category.name.charAt(0).toUpperCase() + category.name.slice(1)}</span>
            </label>
        `).join('')

        container.innerHTML = categoriesHTML

        // Add event listeners
        document.querySelectorAll('.category-filter-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateCategoryFilters()
            })
        })
    } catch (error) {
        console.error('Error populating category filters:', error)
    }
}

function updateCategoryFilters() {
    currentFilters.categories = Array.from(document.querySelectorAll('.category-filter-checkbox:checked'))
        .map(checkbox => checkbox.value)
}

function updateRatingFilters() {
    currentFilters.ratings = Array.from(document.querySelectorAll('.rating-filter:checked'))
        .map(checkbox => parseInt(checkbox.value))
}

function updateAvailabilityFilters() {
    currentFilters.availability = Array.from(document.querySelectorAll('.availability-filter:checked'))
        .map(checkbox => checkbox.value)
}

function applyAllFilters() {
    let filtered = [...allProducts]

    // Apply price filter
    filtered = filtered.filter(product => {
        const price = parseInt(typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price)
        return price >= currentFilters.priceRange.min && price <= currentFilters.priceRange.max
    })

    // Apply category filter
    if (currentFilters.categories.length > 0) {
        filtered = filtered.filter(product => currentFilters.categories.includes(product.category))
    }

    // Apply rating filter
    if (currentFilters.ratings.length > 0) {
        filtered = filtered.filter(product =>
            currentFilters.ratings.some(rating => product.rating >= rating)
        )
    }

    // Apply availability filter
    if (currentFilters.availability.length > 0) {
        filtered = filtered.filter(product => {
            if (currentFilters.availability.includes('inStock')) {
                return product.inStock
            }
            if (currentFilters.availability.includes('discount')) {
                return product.discount > 0
            }
            if (currentFilters.availability.includes('new')) {
                return product.isNew || false
            }
            return true
        })
    }

    displayedProducts = filtered
    currentPage = 1
    renderProducts()

    // Hide filters panel on mobile
    if (window.innerWidth <= 768) {
        document.getElementById('filtersPanel').classList.add('hidden')
    }

    // Applied filters silently
}

function clearAllFilters() {
    // Reset all checkboxes
    document.querySelectorAll('.category-filter-checkbox, .rating-filter, .availability-filter').forEach(checkbox => {
        checkbox.checked = false
    })

    // Reset price range
    document.getElementById('priceRange').value = 1000
    document.getElementById('priceRangeValue').textContent = '₹1000'
    document.getElementById('minPriceFilter').value = ''
    document.getElementById('maxPriceFilter').value = ''

    // Reset filters
    currentFilters = {
        priceRange: { min: 0, max: 1000 },
        categories: [],
        ratings: [],
        availability: []
    }

    // Reset products
    displayedProducts = [...allProducts]
    currentPage = 1
    renderProducts()

    showNotification('All filters cleared', 'info')
}

// Enhanced Search Functionality removed - now using URL-based search

// Enhanced search functions removed - now using URL-based search

function applySearchFilters() {
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 1000
    const category = document.getElementById('searchCategory').value
    const rating = parseInt(document.getElementById('searchRating').value) || 0

    let filtered = displayedProducts.filter(product => {
        const price = parseInt(typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price)
        return price >= minPrice && price <= maxPrice
    })

    if (category) {
        filtered = filtered.filter(product => product.category === category)
    }

    if (rating > 0) {
        filtered = filtered.filter(product => product.rating >= rating)
    }

    displayedProducts = filtered
    currentPage = 1
    renderProducts()

    hideAdvancedSearchFilters()
    // Search filters applied silently
}

function clearSearchFilters() {
    document.getElementById('minPrice').value = ''
    document.getElementById('maxPrice').value = ''
    document.getElementById('searchCategory').value = ''
    document.getElementById('searchRating').value = ''
}

function hideAdvancedSearchFilters() {
    document.getElementById('advancedSearchFilters').classList.add('hidden')
}

// Mobile Navigation Functionality
function initializeMobileNavigation() {
    const mobileNavBtn = document.getElementById('mobileNavBtn')
    const mobileNavMenu = document.getElementById('mobileNavMenu')
    const mobileNavOverlay = document.getElementById('mobileNavOverlay')
    const closeMobileNav = document.getElementById('closeMobileNav')
    const mobileCategoriesBtn = document.getElementById('mobileCategoriesBtn')
    const mobileCategoriesDropdown = document.getElementById('mobileCategoriesDropdown')
    const mobileCategoriesIcon = document.getElementById('mobileCategoriesIcon')

    // Only initialize if mobile nav elements exist
    if (!mobileNavBtn || !mobileNavMenu) {
        console.log('📱 Mobile navigation elements not found, skipping mobile nav initialization')
        return
    }

    // Open mobile navigation
    mobileNavBtn.addEventListener('click', () => {
        openMobileNavigation()
    })

    // Close mobile navigation
    if (closeMobileNav) {
        closeMobileNav.addEventListener('click', () => {
            closeMobileNavigation()
        })
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', () => {
            closeMobileNavigation()
        })
    }

    // Mobile categories dropdown
    if (mobileCategoriesBtn && mobileCategoriesDropdown && mobileCategoriesIcon) {
        mobileCategoriesBtn.addEventListener('click', () => {
            const isOpen = mobileCategoriesDropdown.classList.contains('hidden')

            if (isOpen) {
                mobileCategoriesDropdown.classList.remove('hidden')
                mobileCategoriesIcon.style.transform = 'rotate(180deg)'
            } else {
                mobileCategoriesDropdown.classList.add('hidden')
                mobileCategoriesIcon.style.transform = 'rotate(0deg)'
            }
        })
    }

    // Mobile navigation links
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = e.currentTarget.dataset.section
            if (section) {
                navigateToSection(section)
                closeMobileNavigation()
            }
        })
    })

    // Mobile quick actions
    const mobileCartBtn = document.getElementById('mobileCartBtn')
    if (mobileCartBtn) {
        mobileCartBtn.addEventListener('click', () => {
            toggleCartSidebar()
            closeMobileNavigation()
        })
    }

    const mobileWishlistBtn = document.getElementById('mobileWishlistBtn')
    if (mobileWishlistBtn) {
        mobileWishlistBtn.addEventListener('click', () => {
            // Navigate to wishlist or show wishlist modal
            closeMobileNavigation()
        })
    }

    // Mobile login
    const mobileLoginBtn = document.getElementById('mobileLoginBtn')
    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener('click', () => {
            showLoginModal()
            closeMobileNavigation()
        })
    }

    // Mobile search
    const mobileSearchInput = document.getElementById('mobileSearchInput')
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = e.target.value.trim()
                if (query) {
                    performEnhancedSearch(query)
                    closeMobileNavigation()
                }
            }
        })
    }
}

function openMobileNavigation() {
    const mobileNavMenu = document.getElementById('mobileNavMenu')
    const mobileNavOverlay = document.getElementById('mobileNavOverlay')

    if (mobileNavMenu) {
        mobileNavMenu.classList.remove('-translate-x-full')
    }
    if (mobileNavOverlay) {
        mobileNavOverlay.classList.remove('hidden')
    }
    mobileNavOpen = true

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
}

function closeMobileNavigation() {
    const mobileNavMenu = document.getElementById('mobileNavMenu')
    const mobileNavOverlay = document.getElementById('mobileNavOverlay')

    if (mobileNavMenu) {
        mobileNavMenu.classList.add('-translate-x-full')
    }
    if (mobileNavOverlay) {
        mobileNavOverlay.classList.add('hidden')
    }
    mobileNavOpen = false

    // Restore body scroll
    document.body.style.overflow = ''
}

// Product Reviews System
function initializeProductReviews() {
    // This function initializes the product reviews system
    // Reviews are already loaded with products and displayed in quick view
    console.log('Product reviews system initialized')
}

// Enhanced event listeners for product cards (REMOVED DUPLICATE - using querySelectorAll version above to avoid double clicks)

// ===== END OF ENHANCED FEATURES =====

// New function to show quick view from search suggestions
function showQuickViewFromSearch(productId) {
    hideSearchSuggestions()
    showQuickView(productId)
}

// ===== GOOGLE MAPS INTEGRATION =====

// Google Maps Global Variables
let map = null
let userMarker = null
let radiusCircle = null
let shopMarkers = []
let infoWindow = null
let geocoder = null
let placesService = null

// Location and Shop Variables
let userLocation = null
let nearbyShops = []
let lastLocationCheck = null

// Mock shop data for demonstration (will be replaced with real data later)
const mockShops = [
    {
        id: 1,
        name: "Fresh Mart Grocery",
        address: "123 Main Street, Local Area",
        phone: "+91 9876543210",
        rating: 4.5,
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop",
        categories: ["Grocery", "Fresh Produce", "Dairy"],
        openingHours: "6:00 AM - 11:00 PM",
        deliveryTime: "30-45 mins",
        distance: 0.8,
        lat: null, // Will be set dynamically based on user location
        lng: null
    },
    {
        id: 2,
        name: "Organic Store",
        address: "456 Green Avenue, Eco District",
        phone: "+91 9876543211",
        rating: 4.2,
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
        categories: ["Organic", "Health Foods", "Supplements"],
        openingHours: "7:00 AM - 10:00 PM",
        deliveryTime: "45-60 mins",
        distance: 1.2,
        lat: null,
        lng: null
    },
    {
        id: 3,
        name: "QuickStop Convenience",
        address: "789 Busy Road, Commercial Zone",
        phone: "+91 9876543212",
        rating: 4.0,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop",
        categories: ["Convenience", "Snacks", "Beverages"],
        openingHours: "24 Hours",
        deliveryTime: "15-30 mins",
        distance: 0.5,
        lat: null,
        lng: null
    },
    {
        id: 4,
        name: "Metro Supermarket",
        address: "321 Shopping Complex, City Center",
        phone: "+91 9876543213",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop",
        categories: ["Supermarket", "Electronics", "Clothing"],
        openingHours: "9:00 AM - 10:00 PM",
        deliveryTime: "30-45 mins",
        distance: 1.8,
        lat: null,
        lng: null
    }
]

// Initialize Google Maps (callback function)
function initializeGoogleMaps() {
    console.log('Google Maps API loaded successfully')
    
    // Initialize geocoder and other services
    geocoder = new google.maps.Geocoder()
    
    // Check if this is the first visit and handle location
    handleLocationOnFirstVisit()
    
    // Initialize location services if not already done
    if (!window.locationSelectorInitialized) {
        console.log('🔧 Initializing location services from Google Maps callback...')
        initializeLocationSelector()
        updateLocationDisplay()
        loadSavedAddresses()
        window.locationSelectorInitialized = true
    }
    
    // Try to initialize autocomplete if dropdown is already open
    if (locationDropdownOpen && !locationAutocomplete) {
        console.log('🔄 Dropdown is open, initializing autocomplete...')
        initializeLocationAutocomplete()
    }
}

// Handle location capture on first visit
function handleLocationOnFirstVisit() {
    const hasLocationBeenCaptured = localStorage.getItem('nearNowLocationCaptured')
    const lastLocationTime = localStorage.getItem('nearNowLastLocationTime')
    
    // Only capture location if it's the first visit or location is older than 24 hours
    const shouldCaptureLocation = !hasLocationBeenCaptured || 
        (lastLocationTime && (Date.now() - parseInt(lastLocationTime)) > 24 * 60 * 60 * 1000)
    
    if (shouldCaptureLocation) {
        console.log('First visit or location data expired - capturing user location...')
        
        // Try to get user's current location first
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude
                    userLocation = { lat, lng }
                    
                    // Reverse geocode to get PIN code
                    reverseGeocodeToGetPIN(lat, lng)
                    
                    // Mark location as captured
                    localStorage.setItem('nearNowLocationCaptured', 'true')
                    localStorage.setItem('nearNowLastLocationTime', Date.now().toString())
                    localStorage.setItem('nearNowUserLocation', JSON.stringify(userLocation))
                    
                    console.log('Location captured:', userLocation)
                    
                    // Initialize map and update location selector
                    initializeMapWithLocation()
                    updateLocationDisplay()
                },
                (error) => {
                    console.log('Geolocation failed, prompting for PIN code:', error)
                    promptForPINCode()
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            )
        } else {
            console.log('Geolocation not supported, prompting for PIN code')
            promptForPINCode()
        }
    } else {
        // Load existing location data
        const savedLocation = localStorage.getItem('nearNowUserLocation')
        if (savedLocation) {
            userLocation = JSON.parse(savedLocation)
            console.log('Using saved location:', userLocation)
        }
    }
}



// Reverse geocode to get PIN code from coordinates
function reverseGeocodeToGetPIN(lat, lng) {
    if (!geocoder) return
    
    const latlng = { lat, lng }
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
            // Extract PIN code from address components
            let pinCode = null
            
            for (let component of results[0].address_components) {
                if (component.types.includes("postal_code")) {
                    pinCode = component.long_name
                    break
                }
            }
            
            if (pinCode) {
                localStorage.setItem('nearNowUserPIN', pinCode)
                console.log('PIN code extracted:', pinCode)
            }
        }
    })
}

// Prompt user for PIN code input
function promptForPINCode() {
    // Create and show PIN code input modal
    showPINCodeModal()
}

// Show PIN code input modal
function showPINCodeModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="pinCodeModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10">
                <div class="p-8">
                    <div class="text-center mb-6">
                        <div class="bg-primary bg-opacity-10 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                            <i class="fas fa-map-marker-alt text-2xl text-primary"></i>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 mb-2">Find Stores Near You</h2>
                        <p class="text-gray-600">Enter your PIN code to discover nearby grocery stores</p>
                    </div>
                    
                    <form id="pinCodeForm">
                        <div class="mb-6">
                            <label class="block text-gray-700 text-sm font-bold mb-2">PIN Code</label>
                            <input type="text" id="pinCodeInput" 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-lg text-center"
                                   placeholder="Enter 6-digit PIN code" 
                                   pattern="[0-9]{6}" 
                                   maxlength="6" 
                                   required>
                            <p class="text-xs text-gray-500 mt-2">We'll show you the best grocery stores in your area</p>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button type="button" id="skipLocationBtn" 
                                    class="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-300">
                                Skip for Now
                            </button>
                            <button type="submit" id="findStoresBtn"
                                    class="flex-1 bg-primary text-white px-4 py-3 rounded-lg font-bold hover:bg-secondary transition duration-300">
                                Find Stores
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML)
    
    // Add event listeners
    setupPINCodeModalListeners()
}

// Setup PIN code modal event listeners
function setupPINCodeModalListeners() {
    const modal = document.getElementById('pinCodeModal')
    const form = document.getElementById('pinCodeForm')
    const pinInput = document.getElementById('pinCodeInput')
    const skipBtn = document.getElementById('skipLocationBtn')
    const findBtn = document.getElementById('findStoresBtn')
    
    // Auto-focus on input
    pinInput.focus()
    
    // Only allow numbers
    pinInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '')
    })
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault()
        const pinCode = pinInput.value.trim()
        
        if (pinCode.length === 6) {
            findBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Finding Stores...'
            findBtn.disabled = true
            
            geocodePINCode(pinCode)
                .then(() => {
                    hidePINCodeModal()
                })
                .catch((error) => {
                    console.error('Geocoding failed:', error)
                    showError('Unable to find location for this PIN code. Please try again.')
                    findBtn.innerHTML = 'Find Stores'
                    findBtn.disabled = false
                })
        }
    })
    
    // Skip button
    skipBtn.addEventListener('click', () => {
        hidePINCodeModal()
        localStorage.setItem('nearNowLocationCaptured', 'true')
        localStorage.setItem('nearNowLastLocationTime', Date.now().toString())
    })
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hidePINCodeModal()
        }
    })
}

// Hide PIN code modal
function hidePINCodeModal() {
    const modal = document.getElementById('pinCodeModal')
    if (modal) {
        modal.remove()
    }
}

// Geocode PIN code to get coordinates
function geocodePINCode(pinCode) {
    return new Promise((resolve, reject) => {
        if (!geocoder) {
            reject(new Error('Geocoder not initialized'))
            return
        }
        
        // Format PIN code for India
        const address = `${pinCode}, India`
        
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === "OK" && results[0]) {
                const location = results[0].geometry.location
                userLocation = {
                    lat: location.lat(),
                    lng: location.lng()
                }
                
                // Save location data
                localStorage.setItem('nearNowUserLocation', JSON.stringify(userLocation))
                localStorage.setItem('nearNowUserPIN', pinCode)
                localStorage.setItem('nearNowLocationCaptured', 'true')
                localStorage.setItem('nearNowLastLocationTime', Date.now().toString())
                
                console.log('PIN code geocoded successfully:', userLocation)
                
                // Update location selector
                const shortAddress = formatAddressForHeader(results[0].formatted_address)
                updateSelectedLocation(shortAddress, results[0].formatted_address)
                
                // Initialize map and show nearby shops
                initializeMapWithLocation()
                
                resolve(userLocation)
            } else {
                reject(new Error(`Geocoding failed: ${status}`))
            }
        })
    })
}

// Initialize map with user location
function initializeMapWithLocation() {
    if (!userLocation) return
    
    // Create or show map container
    createMapContainer()
    
    // Initialize the map
    map = new google.maps.Map(document.getElementById('nearNowMap'), {
        center: userLocation,
        zoom: 14,
        styles: [
            {
                "featureType": "poi",
                "elementType": "labels",
                "stylers": [{"visibility": "off"}]
            }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    })
    
    // Add user location marker
    addUserLocationMarker()
    
    // Add radius circle
    addRadiusCircle()
    
    // Generate and display mock shops
    generateMockShops()
    
    // Initialize Places service for future use
    placesService = new google.maps.places.PlacesService(map)
    
    // Initialize info window
    infoWindow = new google.maps.InfoWindow()
}

// Create map container if it doesn't exist
function createMapContainer() {
    let mapContainer = document.getElementById('nearNowMapContainer')
    
    if (!mapContainer) {
        const mapHTML = `
            <section id="nearNowMapContainer" class="py-12 bg-white border-t border-gray-200">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-8">
                        <h2 class="text-3xl font-bold text-gray-800 mb-2">Stores Near You</h2>
                        <p class="text-lg text-gray-600">Discover nearby grocery stores within 2km radius</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-2xl p-6">
                        <div class="grid lg:grid-cols-3 gap-6">
                            <!-- Map -->
                            <div class="lg:col-span-2">
                                <div id="nearNowMap" class="w-full h-96 rounded-xl shadow-lg"></div>
                            </div>
                            
                            <!-- Shop List -->
                            <div class="lg:col-span-1">
                                <h3 class="text-xl font-bold text-gray-800 mb-4">Nearby Stores</h3>
                                <div id="nearbyShopsList" class="space-y-4 max-h-96 overflow-y-auto">
                                    <!-- Shops will be populated here -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `
        
        // Insert map container after the categories section
        const categoriesSection = document.getElementById('categoriesSection')
        if (categoriesSection) {
            categoriesSection.insertAdjacentHTML('afterend', mapHTML)
        }
    }
}

// Add user location marker
function addUserLocationMarker() {
    if (!map || !userLocation) return
    
    userMarker = new google.maps.Marker({
        position: userLocation,
        map: map,
        title: 'Your Location',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
                    <path fill="#059669" stroke="#047857" stroke-width="2" d="M15 2C8.373 2 3 7.373 3 14c0 8.5 12 22 12 22s12-13.5 12-22c0-6.627-5.373-12-12-12z"/>
                    <circle fill="white" cx="15" cy="14" r="6"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(30, 40),
            anchor: new google.maps.Point(15, 40)
        },
        animation: google.maps.Animation.DROP
    })
    
    // Add click listener for user marker
    userMarker.addListener('click', () => {
        infoWindow.setContent(`
            <div class="p-2">
                <h3 class="font-bold text-primary">Your Location</h3>
                <p class="text-sm text-gray-600">You are here</p>
            </div>
        `)
        infoWindow.open(map, userMarker)
    })
}

// Add radius circle
function addRadiusCircle() {
    if (!map || !userLocation) return
    
    radiusCircle = new google.maps.Circle({
        strokeColor: '#059669',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#059669',
        fillOpacity: 0.1,
        map: map,
        center: userLocation,
        radius: 2000 // 2km in meters
    })
}

// Generate mock shops around user location
function generateMockShops() {
    if (!userLocation) return
    
    // Clear existing shops
    nearbyShops = []
    clearShopMarkers()
    
    // Generate random positions around user location within 2km
    mockShops.forEach((shop, index) => {
        const angle = (index * 90) + Math.random() * 360 // Distribute shops around
        const distance = 0.5 + Math.random() * 1.5 // Random distance between 0.5km and 2km
        
        // Calculate shop coordinates
        const shopLocation = calculateDestination(userLocation, distance, angle)
        
        // Update shop data with coordinates
        const enhancedShop = {
            ...shop,
            lat: shopLocation.lat,
            lng: shopLocation.lng,
            distance: distance.toFixed(1)
        }
        
        nearbyShops.push(enhancedShop)
        
        // Add shop marker
        addShopMarker(enhancedShop)
    })
    
    // Update shops list in UI
    updateShopsList()
}

// Calculate destination coordinates given origin, distance (km), and bearing (degrees)
function calculateDestination(origin, distance, bearing) {
    const R = 6371 // Earth's radius in kilometers
    const lat1 = origin.lat * Math.PI / 180
    const lng1 = origin.lng * Math.PI / 180
    const bearingRad = bearing * Math.PI / 180
    
    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(bearingRad)
    )
    
    const lng2 = lng1 + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
    )
    
    return {
        lat: lat2 * 180 / Math.PI,
        lng: lng2 * 180 / Math.PI
    }
}

// Add shop marker to map
function addShopMarker(shop) {
    if (!map) return
    
    const marker = new google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        map: map,
        title: shop.name,
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
                    <path fill="#ff6b6b" stroke="#e55656" stroke-width="1" d="M12 1C6.48 1 2 5.48 2 11c0 6.5 10 19 10 19s10-12.5 10-19c0-5.52-4.48-10-10-10z"/>
                    <circle fill="white" cx="12" cy="11" r="4"/>
                </svg>
            `),
            scaledSize: new google.maps.Size(24, 32),
            anchor: new google.maps.Point(12, 32)
        }
    })
    
    // Add click listener for shop marker
    marker.addListener('click', () => {
        showShopInfoWindow(shop, marker)
    })
    
    shopMarkers.push(marker)
}

// Show shop info window
function showShopInfoWindow(shop, marker) {
    const infoContent = `
        <div class="p-3 max-w-xs">
            <img src="${shop.image}" alt="${shop.name}" class="w-full h-24 object-cover rounded-lg mb-3">
            <h3 class="font-bold text-lg text-gray-800 mb-1">${shop.name}</h3>
            <div class="flex items-center mb-2">
                <div class="flex text-yellow-400 text-sm mr-2">
                    ${generateStarRating(shop.rating)}
                </div>
                <span class="text-sm text-gray-600">${shop.rating}</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">
                <i class="fas fa-map-marker-alt mr-1"></i>
                ${shop.distance}km away
            </p>
            <p class="text-sm text-gray-600 mb-2">
                <i class="fas fa-clock mr-1"></i>
                ${shop.openingHours}
            </p>
            <p class="text-sm text-gray-600 mb-3">
                <i class="fas fa-shipping-fast mr-1"></i>
                Delivery: ${shop.deliveryTime}
            </p>
            <div class="flex space-x-2">
                <button onclick="callShop('${shop.phone}')" 
                        class="flex-1 bg-primary text-white px-3 py-1 rounded text-sm hover:bg-secondary transition">
                    <i class="fas fa-phone mr-1"></i> Call
                </button>
                <button onclick="getDirections(${shop.lat}, ${shop.lng})" 
                        class="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition">
                    <i class="fas fa-directions mr-1"></i> Directions
                </button>
            </div>
        </div>
    `
    
    infoWindow.setContent(infoContent)
    infoWindow.open(map, marker)
}

// Generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    let starsHTML = ''
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>'
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>'
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>'
    }
    
    return starsHTML
}

// Update shops list in UI
function updateShopsList() {
    const shopsList = document.getElementById('nearbyShopsList')
    if (!shopsList) return
    
    const shopsHTML = nearbyShops.map(shop => `
        <div class="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer" 
             onclick="focusOnShop(${shop.lat}, ${shop.lng})">
            <div class="flex space-x-3">
                <img src="${shop.image}" alt="${shop.name}" class="w-16 h-16 object-cover rounded-lg">
                <div class="flex-1">
                    <h4 class="font-bold text-gray-800 mb-1">${shop.name}</h4>
                    <div class="flex items-center mb-1">
                        <div class="flex text-yellow-400 text-xs mr-2">
                            ${generateStarRating(shop.rating)}
                        </div>
                        <span class="text-xs text-gray-600">${shop.rating}</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-1">
                        <i class="fas fa-map-marker-alt mr-1"></i>
                        ${shop.distance}km away
                    </p>
                    <p class="text-xs text-primary font-semibold">
                        <i class="fas fa-shipping-fast mr-1"></i>
                        ${shop.deliveryTime}
                    </p>
                </div>
            </div>
            <div class="mt-3 flex space-x-2">
                <button onclick="event.stopPropagation(); callShop('${shop.phone}')" 
                        class="flex-1 bg-primary text-white px-3 py-1 rounded text-xs hover:bg-secondary transition">
                    <i class="fas fa-phone mr-1"></i> Call
                </button>
                <button onclick="event.stopPropagation(); getDirections(${shop.lat}, ${shop.lng})" 
                        class="flex-1 bg-gray-600 text-white px-3 py-1 rounded text-xs hover:bg-gray-700 transition">
                    <i class="fas fa-directions mr-1"></i> Directions
                </button>
            </div>
        </div>
    `).join('')
    
    shopsList.innerHTML = shopsHTML
}

// Focus on shop on map
function focusOnShop(lat, lng) {
    if (!map) return
    
    map.setCenter({ lat, lng })
    map.setZoom(16)
    
    // Find and click the marker
    const shopMarker = shopMarkers.find(marker => {
        const position = marker.getPosition()
        return Math.abs(position.lat() - lat) < 0.0001 && Math.abs(position.lng() - lng) < 0.0001
    })
    
    if (shopMarker) {
        google.maps.event.trigger(shopMarker, 'click')
    }
}

// Clear shop markers
function clearShopMarkers() {
    shopMarkers.forEach(marker => {
        marker.setMap(null)
    })
    shopMarkers = []
}

// Call shop function
function callShop(phoneNumber) {
    window.open(`tel:${phoneNumber}`, '_self')
}

// Get directions function
function getDirections(lat, lng) {
    const destination = `${lat},${lng}`
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
    window.open(url, '_blank')
}

// Function to manually trigger PIN code entry (for testing)
window.triggerPINCodeEntry = function() {
    promptForPINCode()
}

// Function to reset location data (for testing)
window.resetLocationData = function() {
    localStorage.removeItem('nearNowLocationCaptured')
    localStorage.removeItem('nearNowLastLocationTime')
    localStorage.removeItem('nearNowUserLocation')
    localStorage.removeItem('nearNowUserPIN')
    console.log('Location data reset. Reload the page to trigger location capture again.')
}

// Function to search for real nearby shops using Places API (future enhancement)
function searchNearbyShopsWithPlacesAPI() {
    if (!placesService || !userLocation) return
    
    const request = {
        location: userLocation,
        radius: 2000, // 2km radius
        types: ['grocery_or_supermarket', 'food', 'store']
    }
    
    placesService.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            console.log('Found nearby places:', results)
            
            // Clear mock shops and replace with real data
            clearShopMarkers()
            nearbyShops = []
            
            results.slice(0, 10).forEach((place, index) => {
                const shop = {
                    id: `place_${index}`,
                    name: place.name,
                    address: place.vicinity,
                    phone: place.formatted_phone_number || 'N/A',
                    rating: place.rating || 4.0,
                    image: place.photos && place.photos[0] 
                        ? place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 })
                        : 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop',
                    categories: place.types || ['Store'],
                    openingHours: place.opening_hours?.weekday_text?.[0] || 'Hours not available',
                    deliveryTime: '30-60 mins',
                    distance: calculateDistance(userLocation, place.geometry.location),
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                }
                
                nearbyShops.push(shop)
                addShopMarker(shop)
            })
            
            updateShopsList()
        }
    })
}

// Calculate distance between two points
function calculateDistance(pos1, pos2) {
    const R = 6371 // Earth's radius in km
    const dLat = (pos2.lat() - pos1.lat) * Math.PI / 180
    const dLng = (pos2.lng() - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat() * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const distance = R * c
    return distance.toFixed(1)
}

// Show error message
function showError(message) {
    // Create a simple toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50'
    toast.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>${message}</span>
        </div>
    `
    
    document.body.appendChild(toast)
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.remove()
    }, 5000)
}

// Export functions for global access
window.nearNowMaps = {
    initializeGoogleMaps,
    triggerPINCodeEntry: window.triggerPINCodeEntry,
    resetLocationData: window.resetLocationData,
    searchNearbyShopsWithPlacesAPI
}

console.log('Google Maps integration module loaded')

// ===== END OF GOOGLE MAPS INTEGRATION =====

// ===== LOCATION SELECTOR FUNCTIONALITY =====

// Location selector global variables
let locationDropdownOpen = false
let savedAddresses = []
let locationAutocomplete = null

// Initialize location selector when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing location selector...')
    
    try {
        initializeLocationSelector()
        loadSavedAddresses()
        updateLocationDisplay()
        
        // Location services will be initialized when Google Maps loads
        
        window.locationSelectorInitialized = true
        console.log('✅ Location selector initialization complete')
    } catch (error) {
        console.error('❌ Error initializing location selector:', error)
    }
})

// Also initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('📄 DOM still loading, waiting for DOMContentLoaded...')
} else {
    console.log('📄 DOM already loaded, initializing immediately...')
    setTimeout(() => {
        try {
            initializeLocationSelector()
            loadSavedAddresses()
            updateLocationDisplay()
            // Location services will be initialized when Google Maps loads
            window.locationSelectorInitialized = true
            console.log('✅ Immediate location selector initialization complete')
        } catch (error) {
            console.error('❌ Error in immediate initialization:', error)
        }
    }, 100)
}

// Initialize location selector functionality
function initializeLocationSelector() {
    console.log('🔧 Initializing location selector functionality...')
    
    const locationSelector = document.getElementById('locationSelector')
    const locationDropdown = document.getElementById('locationDropdown')
    const locationChevron = document.getElementById('locationChevron')
    const locationSearchInput = document.getElementById('locationSearchInput')
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation')
    const closeLocationBtn = document.getElementById('closeLocationDropdown')
    const clearSearchBtn = document.getElementById('clearSearchBtn')


    console.log('🔍 Elements found:', {
        locationSelector: !!locationSelector,
        locationDropdown: !!locationDropdown,
        locationChevron: !!locationChevron,
        locationSearchInput: !!locationSearchInput,
        useCurrentLocationBtn: !!useCurrentLocationBtn,
        closeLocationBtn: !!closeLocationBtn,
        clearSearchBtn: !!clearSearchBtn
    })

    if (!locationSelector) {
        console.error('❌ Location selector element not found!')
        return
    }

    // Toggle dropdown on click
    console.log('🖱️ Adding click event listener to location selector...')
    locationSelector.addEventListener('click', (e) => {
        console.log('🎯 Location selector clicked!')
        e.stopPropagation()
        toggleLocationDropdown()
    })
    
    console.log('✅ Click event listener added successfully')

    // Close button
    if (closeLocationBtn) {
        closeLocationBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            closeLocationDropdown()
        })
    }

    // Use current location button
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            getCurrentLocationForHeader()
        })
    }

    // Location search input
    if (locationSearchInput) {
        locationSearchInput.addEventListener('input', (e) => {
            // Show/hide clear button
            if (clearSearchBtn) {
                if (e.target.value.length > 0) {
                    clearSearchBtn.classList.remove('hidden')
                } else {
                    clearSearchBtn.classList.add('hidden')
                }
            }
            
            // Don't trigger manual search if autocomplete is active
            if (!locationAutocomplete) {
                debounce(handleLocationSearch, 300)(e)
            }
        })
        
        // Clear search button
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                locationSearchInput.value = ''
                clearSearchBtn.classList.add('hidden')
                clearLocationSuggestions()
                loadLocationSuggestions()
            })
        }
        
        // Initialize Google Places Autocomplete when dropdown opens
        // This will be called from openLocationDropdown
    }



    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!locationDropdown?.contains(e.target) && !locationSelector?.contains(e.target)) {
            closeLocationDropdown()
        }
    })

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && locationDropdownOpen) {
            closeLocationDropdown()
        }
    })
}

// Toggle location dropdown
function toggleLocationDropdown() {
    console.log('🔄 Toggle location dropdown called. Current state:', locationDropdownOpen)
    if (locationDropdownOpen) {
        console.log('📤 Closing dropdown...')
        closeLocationDropdown()
    } else {
        console.log('📥 Opening dropdown...')
        openLocationDropdown()
    }
}

// Open location dropdown
function openLocationDropdown() {
    console.log('📥 Opening location dropdown...')
    const locationDropdown = document.getElementById('locationDropdown')
    const locationChevron = document.getElementById('locationChevron')
    const locationSearchInput = document.getElementById('locationSearchInput')

    if (!locationDropdown) {
        console.error('❌ Location dropdown element not found!')
        return
    }

    console.log('🎨 Removing hidden class and updating UI...')
    locationDropdown.classList.remove('hidden')
    locationChevron?.classList.add('rotate-180')
    locationDropdownOpen = true

    console.log('✅ Dropdown opened. New state:', locationDropdownOpen)

    // Initialize Google Places Autocomplete if not already done
    if (!locationAutocomplete && typeof google !== 'undefined' && google.maps && google.maps.places) {
        console.log('🗺️ Initializing Google Places Autocomplete...')
        initializeLocationAutocomplete()
    }

    // Focus on search input
    setTimeout(() => {
        locationSearchInput?.focus()
    }, 100)

    // Load recent searches or suggestions
    loadLocationSuggestions()
}

// Close location dropdown
function closeLocationDropdown() {
    const locationDropdown = document.getElementById('locationDropdown')
    const locationChevron = document.getElementById('locationChevron')

    if (!locationDropdown) return

    locationDropdown.classList.add('hidden')
    locationChevron?.classList.remove('rotate-180')
    locationDropdownOpen = false
}

// Get current location for header
function getCurrentLocationForHeader() {
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation')
    
    if (!navigator.geolocation) {
        showLocationError('Geolocation is not supported by this browser')
        return
    }

    // Update button to show loading state
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                    <div class="flex-shrink-0 mr-3">
                        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <i class="fas fa-spinner fa-spin text-blue-600 text-lg"></i>
                        </div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold text-blue-900">Getting location...</div>
                        <div class="text-xs text-blue-700">Please wait</div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-blue-600 text-xs animate-pulse"></i>
            </div>
        `
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude
            const lng = position.coords.longitude
            
            // Update global user location
            userLocation = { lat, lng }
            localStorage.setItem('nearNowUserLocation', JSON.stringify(userLocation))
            
            // Reverse geocode to get address
            reverseGeocodeForHeader(lat, lng)
            
            // Mark location as captured
            localStorage.setItem('nearNowLocationCaptured', 'true')
            localStorage.setItem('nearNowLastLocationTime', Date.now().toString())
        },
        (error) => {
            console.error('Geolocation error:', error)
            showLocationError('Unable to get your location. Please try manually searching.')
            resetCurrentLocationButton()
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }
    )
}

// Reset current location button
function resetCurrentLocationButton() {
    const useCurrentLocationBtn = document.getElementById('useCurrentLocation')
    if (useCurrentLocationBtn) {
        useCurrentLocationBtn.innerHTML = `
            <div class="flex items-center justify-between w-full">
                <div class="flex items-center">
                    <div class="flex-shrink-0 mr-3">
                        <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <i class="fas fa-crosshairs text-blue-600 text-lg"></i>
                        </div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold text-blue-900">Use current location</div>
                        <div class="text-xs text-blue-700">Using GPS</div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-blue-600 text-xs"></i>
            </div>
        `
    }
}

// Reverse geocode for header display
function reverseGeocodeForHeader(lat, lng) {
    if (!geocoder) {
        // If geocoder is not available, just use coordinates
        updateSelectedLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        return
    }

    const latlng = { lat, lng }
    
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK" && results[0]) {
            const address = results[0].formatted_address
            const shortAddress = formatAddressForHeader(address)
            
            updateSelectedLocation(shortAddress, address)
            
            // Save to localStorage and saved addresses
            saveLocationToAddresses({
                shortAddress,
                fullAddress: address,
                coordinates: { lat, lng },
                type: 'current',
                timestamp: Date.now()
            })
            
            closeLocationDropdown()
            resetCurrentLocationButton()
            
            // Trigger map update if map is already initialized
            if (map) {
                map.setCenter({ lat, lng })
                if (userMarker) {
                    userMarker.setPosition({ lat, lng })
                }
                if (radiusCircle) {
                    radiusCircle.setCenter({ lat, lng })
                }
                generateMockShops()
            } else {
                // Initialize map if not already done
                initializeMapWithLocation()
            }
        } else {
            console.error('Reverse geocoding failed:', status)
            updateSelectedLocation('Current Location')
            resetCurrentLocationButton()
        }
    })
}

// Format address for header display
function formatAddressForHeader(fullAddress) {
    // Now that we have word wrapping, return the full address
    // The CSS will handle the display and wrapping
    return fullAddress.trim()
}

// Update selected location display
function updateSelectedLocation(shortAddress, fullAddress = null) {
    const selectedLocationElement = document.getElementById('selectedLocation')
    
    if (selectedLocationElement) {
        // Use innerHTML to preserve styling and add word wrapping
        selectedLocationElement.innerHTML = shortAddress
        selectedLocationElement.title = fullAddress || shortAddress
        
        // Ensure the element has proper styling for word wrapping with ellipsis after 2 lines
        selectedLocationElement.style.setProperty('display', '-webkit-box', 'important')
        selectedLocationElement.style.setProperty('-webkit-line-clamp', '2', 'important')
        selectedLocationElement.style.setProperty('-webkit-box-orient', 'vertical', 'important')
        selectedLocationElement.style.setProperty('white-space', 'normal', 'important')
        selectedLocationElement.style.setProperty('word-wrap', 'break-word', 'important')
        selectedLocationElement.style.setProperty('overflow-wrap', 'break-word', 'important')
        selectedLocationElement.style.setProperty('word-break', 'break-word', 'important')
        selectedLocationElement.style.setProperty('line-height', '1.2', 'important')
        selectedLocationElement.style.setProperty('max-height', '2.4rem', 'important')
        selectedLocationElement.style.setProperty('overflow', 'hidden', 'important')
        selectedLocationElement.style.setProperty('text-overflow', 'ellipsis', 'important')
    }
    
    // Save to localStorage
    localStorage.setItem('nearNowSelectedLocation', JSON.stringify({
        short: shortAddress,
        full: fullAddress || shortAddress,
        timestamp: Date.now()
    }))
}

// Calculate estimated delivery time
function calculateDeliveryTime(address) {
    // This is a simplified calculation - in production, this would be based on
    // actual distance, traffic, store preparation time, etc.
    const baseTime = 10 // Base preparation time in minutes
    
    // Add time based on keywords in address
    let additionalTime = 0
    const lowerAddress = address.toLowerCase()
    
    if (lowerAddress.includes('highway') || lowerAddress.includes('expressway')) {
        additionalTime += 15
    } else if (lowerAddress.includes('sector') || lowerAddress.includes('phase')) {
        additionalTime += 10
    } else if (lowerAddress.includes('colony') || lowerAddress.includes('society')) {
        additionalTime += 5
    }
    
    // Random factor to make it more realistic
    const randomFactor = Math.floor(Math.random() * 5)
    
    const totalTime = baseTime + additionalTime + randomFactor
    
    // Format the time
    if (totalTime <= 15) {
        return `${totalTime} mins`
    } else if (totalTime <= 30) {
        return `${Math.round(totalTime / 5) * 5} mins`
    } else {
        return `${Math.round(totalTime / 10) * 10}-${Math.round(totalTime / 10) * 10 + 10} mins`
    }
}

// Initialize Google Places Autocomplete
function initializeLocationAutocomplete() {
    const locationSearchInput = document.getElementById('locationSearchInput')
    if (!locationSearchInput) {
        console.error('Location search input not found')
        return
    }

    // Check if already initialized
    if (locationAutocomplete) {
        console.log('Autocomplete already initialized')
        return
    }

    try {
        console.log('Creating Google Places Autocomplete for India...')
        
        // Create autocomplete instance
        locationAutocomplete = new google.maps.places.Autocomplete(locationSearchInput, {
            types: ['geocode', 'establishment'],
            componentRestrictions: { country: 'IN' }, // Restrict to India
            fields: ['formatted_address', 'geometry', 'address_components', 'name']
        })

        // Style the autocomplete dropdown
        const pacContainer = document.querySelector('.pac-container')
        if (pacContainer) {
            pacContainer.style.zIndex = '9999'
        }

        console.log('✅ Autocomplete created successfully')

        locationAutocomplete.addListener('place_changed', () => {
            const place = locationAutocomplete.getPlace()
            
            console.log('Place selected:', place)
            
            if (!place.geometry) {
                console.error('No geometry for selected place')
                return
            }

            const address = place.formatted_address || place.name
            const shortAddress = formatAddressForHeader(address)
            const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }

            console.log('Updating location to:', shortAddress, coordinates)

            // Update global user location
            userLocation = coordinates
            localStorage.setItem('nearNowUserLocation', JSON.stringify(userLocation))

            updateSelectedLocation(shortAddress, address)
            
            // Save to addresses
            saveLocationToAddresses({
                shortAddress,
                fullAddress: address,
                coordinates,
                type: 'search',
                timestamp: Date.now()
            })

            // Clear search input
            locationSearchInput.value = ''
            const clearSearchBtn = document.getElementById('clearSearchBtn')
            if (clearSearchBtn) {
                clearSearchBtn.classList.add('hidden')
            }

            closeLocationDropdown()

            // Update map if available
            if (map) {
                map.setCenter(coordinates)
                if (userMarker) {
                    userMarker.setPosition(coordinates)
                }
                if (radiusCircle) {
                    radiusCircle.setCenter(coordinates)
                }
                generateMockShops()
            } else {
                initializeMapWithLocation()
            }
        })

        // Listen for DOM changes to ensure autocomplete dropdown is visible
        const observer = new MutationObserver(() => {
            const pacContainer = document.querySelector('.pac-container')
            if (pacContainer && pacContainer.style.display !== 'none') {
                pacContainer.style.zIndex = '9999'
            }
        })
        observer.observe(document.body, { childList: true, subtree: true })
        
    } catch (error) {
        console.error('Failed to initialize Places Autocomplete:', error)
    }
}

// Handle location search (fallback for when Places API is not available)
function handleLocationSearch(event) {
    const query = event.target.value.trim()
    
    console.log('🔍 Manual search triggered for:', query)
    
    if (query.length < 3) {
        clearLocationSuggestions()
        return
    }

    // Show loading state
    const suggestionsContainer = document.getElementById('locationSuggestions')
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = `
            <div class="flex items-center px-3 py-4 text-gray-500">
                <i class="fas fa-spinner fa-spin mr-2"></i>
                <span class="text-sm">Searching for "${query}"...</span>
            </div>
        `
    }

    // If geocoder is available, use it for search
    if (geocoder) {
        console.log('🗺️ Using Google Geocoder for search...')
        geocoder.geocode({ 
            address: query + ', India',
            componentRestrictions: { country: 'IN' }
        }, (results, status) => {
            console.log('Geocoder results:', status, results)
            if (status === "OK" && results.length > 0) {
                displayLocationSuggestions(results.slice(0, 5))
            } else {
                showNoResults(query)
            }
        })
    } else {
        console.error('❌ Geocoder not available')
        showNoResults(query)
    }
}

// Show no results message
function showNoResults(query) {
    const suggestionsContainer = document.getElementById('locationSuggestions')
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = `
            <div class="px-3 py-4 text-center text-gray-500">
                <i class="fas fa-search text-gray-400 mb-2"></i>
                <div class="text-sm">No results found for "${query}"</div>
                <div class="text-xs">Try searching for a city, area, or PIN code</div>
            </div>
        `
    }
}

// Display location suggestions
function displayLocationSuggestions(suggestions) {
    const suggestionsContainer = document.getElementById('locationSuggestions')
    if (!suggestionsContainer) return

    const suggestionsHTML = suggestions.map(result => {
        const address = result.formatted_address
        const shortAddress = formatAddressForHeader(address)
        
        return `
            <button class="location-suggestion flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-300 group"
                    data-address="${address}"
                    data-short="${shortAddress}"
                    data-lat="${result.geometry.location.lat()}"
                    data-lng="${result.geometry.location.lng()}">
                <div class="flex-shrink-0 mr-3">
                    <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-all duration-300">
                        <i class="fas fa-map-marker-alt text-gray-400 text-sm"></i>
                    </div>
                </div>
                <div class="flex-1">
                    <div class="text-sm font-medium text-gray-800">${shortAddress}</div>
                    <div class="text-xs text-gray-500 truncate">${address}</div>
                </div>
            </button>
        `
    }).join('')

    suggestionsContainer.innerHTML = suggestionsHTML

    // Add click listeners to suggestions
    suggestionsContainer.querySelectorAll('.location-suggestion').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            const address = button.dataset.address
            const shortAddress = button.dataset.short
            const lat = parseFloat(button.dataset.lat)
            const lng = parseFloat(button.dataset.lng)

            selectLocation(shortAddress, address, { lat, lng })
        })
    })
}

// Clear location suggestions
function clearLocationSuggestions() {
    const suggestionsContainer = document.getElementById('locationSuggestions')
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = ''
    }
}

// Select a location
function selectLocation(shortAddress, fullAddress, coordinates) {
    // Update global user location
    userLocation = coordinates
    localStorage.setItem('nearNowUserLocation', JSON.stringify(userLocation))

    updateSelectedLocation(shortAddress, fullAddress)
    
    // Save to addresses
    saveLocationToAddresses({
        shortAddress,
        fullAddress,
        coordinates,
        type: 'selected',
        timestamp: Date.now()
    })

    closeLocationDropdown()

    // Update map if available
    if (map) {
        map.setCenter(coordinates)
        if (userMarker) {
            userMarker.setPosition(coordinates)
        }
        if (radiusCircle) {
            radiusCircle.setCenter(coordinates)
        }
        generateMockShops()
    } else {
        initializeMapWithLocation()
    }
}

// Load saved addresses
function loadSavedAddresses() {
    const saved = localStorage.getItem('nearNowSavedAddresses')
    if (saved) {
        try {
            savedAddresses = JSON.parse(saved)
            displaySavedAddresses()
        } catch (error) {
            console.error('Error loading saved addresses:', error)
            savedAddresses = []
        }
    }
}

// Save location to addresses
function saveLocationToAddresses(locationData) {
    // Remove any existing location with the same coordinates
    savedAddresses = savedAddresses.filter(addr => {
        const distance = calculateDistanceBetweenPoints(
            addr.coordinates,
            locationData.coordinates
        )
        return distance > 0.1 // Keep if more than 100m apart
    })

    // Add new location to the beginning
    savedAddresses.unshift(locationData)

    // Keep only the last 5 addresses
    savedAddresses = savedAddresses.slice(0, 5)

    // Save to localStorage
    localStorage.setItem('nearNowSavedAddresses', JSON.stringify(savedAddresses))
    displaySavedAddresses()
}

// Display saved addresses
function displaySavedAddresses() {
    const savedContainer = document.getElementById('savedAddresses')
    if (!savedContainer) return

    if (savedAddresses.length === 0) {
        savedContainer.innerHTML = ''
        return
    }

    // Separate named addresses from recent ones
    const namedAddresses = savedAddresses.filter(addr => addr.type === 'home' || addr.type === 'work')
    const recentAddresses = savedAddresses.filter(addr => addr.type !== 'home' && addr.type !== 'work')

    let savedHTML = ''

    // Show named addresses first
    if (namedAddresses.length > 0) {
        savedHTML += `
            <div class="mb-3">
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Saved Addresses</div>
                ${namedAddresses.map(addr => {
                    const icon = addr.type === 'home' ? 'fa-home' : 'fa-briefcase'
                    const bgColor = addr.type === 'home' ? 'bg-orange-50' : 'bg-purple-50'
                    const iconColor = addr.type === 'home' ? 'text-orange-600' : 'text-purple-600'
                    const label = addr.type === 'home' ? 'Home' : 'Work'
                    
                    return `
                        <button class="saved-address flex items-center justify-between w-full px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-300 group mb-1"
                                data-address="${addr.fullAddress}"
                                data-short="${addr.shortAddress}"
                                data-lat="${addr.coordinates.lat}"
                                data-lng="${addr.coordinates.lng}">
                            <div class="flex items-center">
                                <div class="flex-shrink-0 mr-3">
                                    <div class="w-10 h-10 ${bgColor} rounded-full flex items-center justify-center">
                                        <i class="fas ${icon} ${iconColor} text-sm"></i>
                                    </div>
                                </div>
                                <div class="flex-1">
                                    <div class="text-sm font-semibold text-gray-800">${label}</div>
                                    <div class="text-xs text-gray-500 line-clamp-1">${addr.shortAddress.replace(/^[🏠💼]\s*/, '')}</div>
                                </div>
                            </div>
                            <i class="fas fa-chevron-right text-gray-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        </button>
                    `
                }).join('')}
            </div>
        `
    }

    // Show recent addresses
    if (recentAddresses.length > 0) {
        savedHTML += `
            <div>
                <div class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent Locations</div>
                ${recentAddresses.map(addr => {
                    const timeAgo = getTimeAgo(addr.timestamp)
                    const icon = addr.type === 'current' ? 'fa-crosshairs' : 'fa-map-marker-alt'
                    
                    return `
                        <button class="saved-address flex items-center w-full px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-all duration-300 group"
                                data-address="${addr.fullAddress}"
                                data-short="${addr.shortAddress}"
                                data-lat="${addr.coordinates.lat}"
                                data-lng="${addr.coordinates.lng}">
                            <div class="flex-shrink-0 mr-3">
                                <div class="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center group-hover:bg-gray-100 transition-all duration-300">
                                    <i class="fas ${icon} text-gray-400 text-sm"></i>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="text-sm font-medium text-gray-800 line-clamp-1">${addr.shortAddress}</div>
                                <div class="text-xs text-gray-500">${timeAgo}</div>
                            </div>
                        </button>
                    `
                }).join('')}
            </div>
        `
    }

    savedContainer.innerHTML = savedHTML

    // Add click listeners to saved addresses
    savedContainer.querySelectorAll('.saved-address').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            const address = button.dataset.address
            const shortAddress = button.dataset.short
            const lat = parseFloat(button.dataset.lat)
            const lng = parseFloat(button.dataset.lng)

            selectLocation(shortAddress, address, { lat, lng })
        })
    })
}

// Load location suggestions (popular areas)
function loadLocationSuggestions() {
    // Don't show popular locations - only show saved addresses
    const suggestionsContainer = document.getElementById('locationSuggestions')
    if (suggestionsContainer) {
        suggestionsContainer.innerHTML = ''
    }
}

// Update location display on page load
function updateLocationDisplay() {
    const savedLocation = localStorage.getItem('nearNowSelectedLocation')
    if (savedLocation) {
        try {
            const locationData = JSON.parse(savedLocation)
            updateSelectedLocation(locationData.short, locationData.full)
        } catch (error) {
            console.error('Error parsing saved location:', error)
        }
    }
}

// Calculate distance between two points
function calculateDistanceBetweenPoints(pos1, pos2) {
    const R = 6371 // Earth's radius in km
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
}

// Get time ago string
function getTimeAgo(timestamp) {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
}



// Show location toast notification
function showLocationToast(message, type = 'info') {
    const toast = document.createElement('div')
    const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
    
    toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`
    toast.innerHTML = `
        <i class="fas ${icon} mr-2"></i>
        <span>${message}</span>
    `
    
    document.body.appendChild(toast)
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300')
        setTimeout(() => toast.remove(), 300)
    }, 3000)
}

// Show location error
function showLocationError(message) {
    showLocationToast(message, 'error')
}

// Debounce function
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Export location functions for global access
window.nearNowLocation = {
    openLocationDropdown,
    closeLocationDropdown,
    getCurrentLocationForHeader,
    selectLocation,
    updateSelectedLocation,
    toggleLocationDropdown
}

// Make key functions globally available for debugging
window.toggleLocationDropdown = toggleLocationDropdown
window.openLocationDropdown = openLocationDropdown
window.closeLocationDropdown = closeLocationDropdown
window.initializeLocationSelector = initializeLocationSelector

// Backup initialization on window load
window.addEventListener('load', function() {
    console.log('🌍 Window loaded - Running backup initialization...')
    setTimeout(() => {
        if (!window.locationSelectorInitialized) {
            console.log('🔄 Location selector not initialized yet, running backup...')
            try {
                initializeLocationSelector()
                loadSavedAddresses()
                updateLocationDisplay()
                // Location services will be initialized when Google Maps loads
                window.locationSelectorInitialized = true
                console.log('✅ Backup initialization successful')
            } catch (error) {
                console.error('❌ Backup initialization failed:', error)
            }
        } else {
            console.log('✅ Location selector already initialized')
        }
    }, 500)
})

// Manual initialization function for debugging
window.manualInitLocationSelector = function() {
    console.log('🛠️ Manual initialization triggered...')
    try {
        initializeLocationSelector()
        loadSavedAddresses()
        updateLocationDisplay()
        window.locationSelectorInitialized = true
        console.log('✅ Manual initialization complete')
    } catch (error) {
        console.error('❌ Manual initialization failed:', error)
    }
}

// Simple test function
window.testLocationButton = function() {
    console.log('🧪 Testing location button...')
    console.log('Available functions:', {
        toggleLocationDropdown: typeof window.toggleLocationDropdown,
        openLocationDropdown: typeof window.openLocationDropdown,
        closeLocationDropdown: typeof window.closeLocationDropdown
    })
    
    const btn = document.getElementById('locationSelector')
    console.log('Location button found:', !!btn)
    
    if (btn && typeof window.toggleLocationDropdown === 'function') {
        console.log('🎯 Triggering toggle...')
        window.toggleLocationDropdown()
    } else {
        console.log('❌ Cannot test - missing button or function')
        if (!window.locationSelectorInitialized) {
            console.log('🔄 Trying manual initialization...')
            window.manualInitLocationSelector()
        }
    }
}

console.log('Location selector module loaded')

// ===== END OF LOCATION SELECTOR FUNCTIONALITY =====
