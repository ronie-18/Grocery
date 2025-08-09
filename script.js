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
        initializeEnhancedSearch()
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
    setInterval(nextSlide, 6000)

    document.getElementById("prevSlide").addEventListener("click", prevSlide)
    document.getElementById("nextSlide").addEventListener("click", nextSlide)

    document.querySelectorAll(".slider-dot").forEach((dot, index) => {
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

// Search Functionality
function initializeSearch() {
    const searchInput = document.getElementById("searchInput")
    const searchBtn = document.getElementById("searchBtn")
    const searchSuggestions = document.getElementById("searchSuggestions")

    searchBtn.addEventListener("click", performSearch)
    searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            performSearch()
        }
    })

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim()
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

function showSearchSuggestions(query) {
    const suggestions = allProducts
        .filter((product) => product.name.toLowerCase().includes(query) || product.category.toLowerCase().includes(query))
        .slice(0, 5)

    const searchSuggestions = document.getElementById("searchSuggestions")

    if (suggestions.length > 0) {
        searchSuggestions.innerHTML = suggestions
            .map(
                (product) => `
            <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" onclick="showQuickViewFromSearch('${product.id}')">
                <div class="flex items-center space-x-3">
                    <img src="${product.image}" alt="${product.name}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-gray-800">${product.name}</p>
                        <p class="text-sm text-gray-600">${product.price}</p>
                    </div>
                </div>
            </div>
        `,
            )
            .join("")
        searchSuggestions.classList.remove("hidden")
    } else {
        hideSearchSuggestions()
    }
}

function hideSearchSuggestions() {
    document.getElementById("searchSuggestions").classList.add("hidden")
}

function selectSearchSuggestion(productName) {
    document.getElementById("searchInput").value = productName
    hideSearchSuggestions()
    performSearch()
}

function performSearch() {
    const query = document.getElementById("searchInput").value.toLowerCase().trim()
    if (query) {
        const filteredProducts = allProducts.filter(
            (product) =>
                product.name.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query),
        )

        displayedProducts = filteredProducts
        currentPage = 1
        renderProducts()

        if (!isPageInitializing) {
            document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
        }
    }
    hideSearchSuggestions()
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
        
        // Ensure the button has the correct classes including relative positioning for dropdown
        accountBtn.className = "group flex flex-col items-center justify-center cursor-pointer p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-primary hover:shadow-xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 min-h-[120px] w-[80px] relative"
        
        accountBtn.innerHTML = `
            <div class="relative">
                <div class="text-center cursor-pointer user-menu-trigger">
                    <div class="relative mb-2">
                        <div
                            class="absolute -inset-3 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow">
                        </div>
                        <div
                            class="relative bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-primary group-hover:to-secondary p-4 rounded-full transition-all duration-500 shadow-lg group-hover:shadow-xl">
                            <i
                                class="fas fa-user text-2xl text-gray-600 group-hover:text-white transition-all duration-500 transform group-hover:scale-110"></i>
                        </div>
                    </div>
                    <span class="text-sm font-semibold text-gray-700 group-hover:text-primary transition-all duration-300 group-hover:scale-105 block">${displayName}</span>
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
        // Reset account button to login state when user is logged out
        // Ensure the button has the correct classes
        accountBtn.className = "group flex flex-col items-center justify-center cursor-pointer p-4 rounded-2xl bg-white border-2 border-gray-100 hover:border-primary hover:shadow-xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 min-h-[120px] w-[80px]"
        
        accountBtn.innerHTML = `
            <div class="relative mb-2">
                <div
                    class="absolute -inset-3 bg-gradient-to-r from-primary via-secondary to-primary rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-spin-slow">
                </div>
                <div
                    class="relative bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-primary group-hover:to-secondary p-4 rounded-full transition-all duration-500 shadow-lg group-hover:shadow-xl">
                    <i
                        class="fas fa-user text-2xl text-gray-600 group-hover:text-white transition-all duration-500 transform group-hover:scale-110"></i>
                </div>
            </div>
            <div class="text-center">
                <span
                    class="text-sm font-semibold text-gray-700 group-hover:text-primary transition-all duration-300 group-hover:scale-105 block">Login</span>
            </div>
        `
    }
}

function initializeUserDropdown() {
    const userMenuTrigger = document.querySelector(".user-menu-trigger")
    const userDropdown = document.querySelector(".user-dropdown")
    const userMenuItems = document.querySelectorAll(".user-menu-item")

    if (!userMenuTrigger || !userDropdown) {
        console.log('🔍 User dropdown or trigger not found')
        return
    }

    console.log('🔄 Initializing user dropdown with trigger and', userMenuItems.length, 'menu items')

    // Toggle dropdown on click
    userMenuTrigger.addEventListener("click", (e) => {
        e.stopPropagation()
        console.log('🎯 User menu trigger clicked')
        toggleUserDropdown()
    })

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
    if (!userDropdown) return

    console.log('📱 showUserDropdown called')
    userDropdown.classList.remove("opacity-0", "invisible", "scale-95")
    userDropdown.classList.add("opacity-100", "visible", "scale-100")
}

function hideUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    console.log('🙈 Hiding dropdown')
    userDropdown.classList.remove("opacity-100", "visible", "scale-100")
    userDropdown.classList.add("opacity-0", "invisible", "scale-95")
}

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
            logoutUser() // Use the updated Supabase logout function
            break
    }
}

// Remove the old showUserMenu function and replace it with this:
function showUserMenu() {
    // This function is no longer needed as we use dropdown
    toggleUserDropdown()
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

            // Detect swipe gestures
            if (Math.abs(diffX) > Math.abs(diffY)) {
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

// Enhanced Search Functionality
function initializeEnhancedSearch() {
    const searchInput = document.getElementById('searchInput')
    const mobileSearchInput = document.getElementById('mobileSearchInput')

    // Debounced search function
    let searchTimeout
    const debouncedSearch = (query) => {
        clearTimeout(searchTimeout)
        searchTimeout = setTimeout(() => {
            performEnhancedSearch(query)
        }, 300)
    }

    // Desktop search
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim()
        if (query.length > 0) {
            debouncedSearch(query)
            showSearchSuggestions(query)
        } else {
            hideSearchSuggestions()
            hideAdvancedSearchFilters()
        }
    })

    // Mobile search
    if (mobileSearchInput) {
        mobileSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim()
            if (query.length > 0) {
                debouncedSearch(query)
            }
        })
    }

    // Advanced search filters
    document.getElementById('applyFilters').addEventListener('click', () => {
        applySearchFilters()
    })

    document.getElementById('clearFilters').addEventListener('click', () => {
        clearSearchFilters()
    })

    // Search suggestions - now handled by inline onclick handlers for quick view
}

function performEnhancedSearch(query) {
    if (!query) {
        displayedProducts = [...allProducts]
        renderProducts()
        return
    }

    const searchTerm = query.toLowerCase()
    const filtered = allProducts.filter(product => {
        return product.name.toLowerCase().includes(searchTerm) ||
               product.description.toLowerCase().includes(searchTerm) ||
               product.category.toLowerCase().includes(searchTerm)
    })

    displayedProducts = filtered
    currentPage = 1
    renderProducts()

    // Update search suggestions
    updateSearchSuggestions(query)
}

function updateSearchSuggestions(query) {
    const searchTerm = query.toLowerCase()
    const suggestions = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm)
    ).slice(0, 5)

    const suggestionsContainer = document.getElementById('searchSuggestions')

    if (suggestions.length > 0) {
        const suggestionsHTML = suggestions.map(product => `
            <div class="search-suggestion-item flex items-center p-3 hover:bg-gray-100 cursor-pointer" data-product-id="${product.id}" onclick="showQuickViewFromSearch('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="w-10 h-10 object-cover rounded mr-3">
                <div>
                    <div class="font-medium text-gray-800">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.price}</div>
                </div>
            </div>
        `).join('')

        suggestionsContainer.innerHTML = suggestionsHTML
        suggestionsContainer.classList.remove('hidden')
    } else {
        suggestionsContainer.innerHTML = '<div class="p-3 text-gray-500">No products found</div>'
        suggestionsContainer.classList.remove('hidden')
    }
}

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
