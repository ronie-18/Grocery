// Global Variables
let currentSlide = 0
let cartCount = 0
let wishlistCount = 0
let cartItems = JSON.parse(localStorage.getItem("nearNowCartItems")) || []
let wishlistItems = JSON.parse(localStorage.getItem("nearNowWishlistItems")) || []
let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null
let allProducts = []
let displayedProducts = []
let currentCategory = "all"
let currentSort = "default"
const productsPerPage = 8
let currentPage = 1

// Firebase Authentication Variables
let currentStep = 1
let userDetails = {}
let otpTimer = null
let resendTimer = 30
let confirmationResult = null
let recaptchaVerifier = null

// Categories Data
const categories = [
    {
        id: "fruits",
        name: "Fruits & Vegetables",
        description: "Fresh & Organic",
        image: "https://i.pinimg.com/736x/ba/b9/67/bab967df39385b6360ef769fe35893bd.jpg",
        color: "from-green-100 to-green-200",
    },
    {
        id: "dairy",
        name: "Dairy Products",
        description: "Milk, Cheese & More",
        image: "https://pngimg.com/d/milk_PNG12717.png",
        color: "from-blue-100 to-blue-200",
    },
    {
        id: "meat",
        name: "Meat & Seafood",
        description: "Fresh & Premium",
        image: "https://pngimg.com/d/fish_PNG25189.png",
        color: "from-red-100 to-red-200",
    },
    {
        id: "bakery",
        name: "Bakery Items",
        description: "Fresh Baked Daily",
        image: "https://pngimg.com/d/bread_PNG2289.png",
        color: "from-yellow-100 to-yellow-200",
    },
    {
        id: "beverages",
        name: "Beverages",
        description: "Juices & Drinks",
        image: "https://pngimg.com/d/orange_juice_PNG35.png",
        color: "from-purple-100 to-purple-200",
    },
    {
        id: "snacks",
        name: "Snacks",
        description: "Healthy & Tasty",
        image: "https://pngimg.com/d/chips_PNG10125.png",
        color: "from-pink-100 to-pink-200",
    },
]

// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
    showLoadingScreen()
    setTimeout(() => {
        hideLoadingScreen()
        initializeWebsite()
    }, 3000) // 3 second loading screen
})

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

function initializeWebsite() {
    allProducts = [...products]
    displayedProducts = [...allProducts]

    initializeSlider()
    initializeSearch()
    initializeCart()
    initializeWishlist()
    initializeAuth()
    initializeNavigation()
    initializeCategories()
    initializeProducts()
    initializeModals()
    initializeScrollEffects()
    initializeNewsletter()
    initializeLoginSystem()

    updateCartCount()
    updateWishlistCount()

    console.log("Near & Now website fully initialized!")
}

// Login System Functions
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
            document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
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
            <div class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0" onclick="selectSearchSuggestion('${product.name}')">
                <div class="flex items-center space-x-3">
                    <img src="${product.image}" alt="${product.name}" class="w-10 h-10 rounded-full object-cover">
                    <div>
                        <p class="font-semibold text-gray-800">${product.name}</p>
                        <p class="text-sm text-gray-600">₹${product.price}</p>
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

        document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
        showNotification(`Found ${filteredProducts.length} products for "${query}"`, "info")
    }
    hideSearchSuggestions()
}

// Categories Functionality
function initializeCategories() {
    renderCategories()

    // Category filter functionality
    document.querySelectorAll(".category-filter").forEach((filter) => {
        filter.addEventListener("click", function (e) {
            e.preventDefault()
            const category = this.dataset.category
            filterByCategory(category)
        })
    })
}

function renderCategories() {
    const categoriesGrid = document.getElementById("categoriesGrid")
    categoriesGrid.innerHTML = categories
        .map(
            (category) => `
        <div class="category-item text-center group cursor-pointer" data-category="${category.id}">
            <div class="bg-gradient-to-br ${category.color} rounded-full p-8 mb-4 group-hover:shadow-lg transition duration-300 transform group-hover:scale-105">
                <img src="${category.image}" alt="${category.name}" class="w-20 h-20 mx-auto rounded-full">
            </div>
            <h3 class="font-semibold text-gray-800 text-lg">${category.name}</h3>
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
    if (category === "all") {
        displayedProducts = [...allProducts]
    } else {
        displayedProducts = allProducts.filter((product) => product.category === category)
    }

    currentPage = 1
    renderProducts()
    document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })

    const categoryName = categories.find((cat) => cat.id === category)?.name || "All Products"
    showNotification(`Showing ${categoryName}`, "info")
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

    // Load more functionality
    document.getElementById("loadMoreBtn").addEventListener("click", loadMoreProducts)
}

function renderProducts() {
    const productsGrid = document.getElementById("productsGrid")
    const startIndex = 0
    const endIndex = currentPage * productsPerPage
    const productsToShow = displayedProducts.slice(startIndex, endIndex)

    productsGrid.innerHTML = productsToShow.map((product) => createProductCard(product)).join("")

    // Update load more button visibility
    const loadMoreBtn = document.getElementById("loadMoreBtn")
    if (endIndex >= displayedProducts.length) {
        loadMoreBtn.style.display = "none"
    } else {
        loadMoreBtn.style.display = "block"
    }

    // Add event listeners to product cards
    addProductEventListeners()
}

function createProductCard(product) {
    const isInWishlist = wishlistItems.some((item) => item.id === product.id)
    const isInCart = cartItems.some((item) => item.id === product.id)

    // Remove any leading ₹ from price and originalPrice
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;

    return `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0
            ? `<div class="absolute top-4 left-4">
                    <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">-${product.discount}%</span>
                </div>`
            : ""
        }
                ${product.organic
            ? `<div class="absolute top-4 ${product.discount > 0 ? "left-20" : "left-4"}">
                    <span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Organic</span>
                </div>`
            : ""
        }
                ${product.isNew
            ? `<div class="absolute top-4 left-4">
                    <span class="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">New</span>
                </div>`
            : ""
        }
                <button class="wishlist-btn absolute top-4 right-4 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300" data-product-id="${product.id}">
                    <i class="fas fa-heart ${isInWishlist ? "text-red-500" : "text-gray-400"}"></i>
                </button>
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition duration-300"></div>
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
                        ${originalPrice ? `<span class="text-gray-400 line-through text-sm">₹${originalPrice}</span>` : ""}
                    </div>
                    <button class="add-to-cart ${isInCart ? "bg-green-500" : "bg-primary"} text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-2" data-product-id="${product.id}">
                        <i class="fas ${isInCart ? "fa-check" : "fa-plus"}"></i>
                        <span>${isInCart ? "Added" : "Add"}</span>
                    </button>
                </div>
            </div>
        </div>
    `
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
            const productId = Number.parseInt(this.dataset.productId)
            addToCart(productId)
        })
    })

    // Wishlist buttons
    document.querySelectorAll(".wishlist-btn").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productId = Number.parseInt(this.dataset.productId)
            toggleWishlist(productId)
        })
    })

    // Product card click for quick view
    document.querySelectorAll(".product-card").forEach((card) => {
        card.addEventListener("dblclick", function () {
            const productId = Number.parseInt(this.dataset.productId)
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

function loadMoreProducts() {
    currentPage++
    renderProducts()
    showNotification("More products loaded!", "success")
}

// Cart Functionality
function initializeCart() {
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

    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    updateCartCount()
    updateCartDisplay()
    saveCartToStorage()

    // Update button state
    const button = document.querySelector(`[data-product-id="${productId}"].add-to-cart`)
    if (button) {
        button.innerHTML = '<i class="fas fa-check"></i> <span>Added</span>'
        button.classList.remove("bg-primary")
        button.classList.add("bg-green-500")

        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-plus"></i> <span>Add</span>'
            button.classList.remove("bg-green-500")
            button.classList.add("bg-primary")
        }, 2000)
    }

    showNotification(`${product.name} added to cart!`, "success")
}

function removeFromCart(productId) {
    cartItems = cartItems.filter((item) => item.id !== productId)
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    updateCartCount()
    updateCartDisplay()
    saveCartToStorage()
    showNotification("Item removed from cart", "info")
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
        }
    }
}

function updateCartCount() {
    document.getElementById("cartCount").textContent = cartCount

    // Add bounce animation
    const cartCountElement = document.getElementById("cartCount")
    cartCountElement.classList.add("animate-bounce")
    setTimeout(() => {
        cartCountElement.classList.remove("animate-bounce")
    }, 1000)
}

function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("cartItems")
    const cartTotal = document.getElementById("cartTotal")

    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
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
                <p class="text-sm text-gray-600">₹${item.price} each</p>
                <div class="flex items-center space-x-2 mt-2">
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">
                        <i class="fas fa-minus text-xs"></i>
                    </button>
                    <span class="font-semibold px-3">${item.quantity}</span>
                    <button class="quantity-btn bg-gray-200 text-gray-700 w-8 h-8 rounded-full hover:bg-gray-300" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">
                        <i class="fas fa-plus text-xs"></i>
                    </button>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold text-primary">₹${item.price * item.quantity}</p>
                <button class="text-red-500 hover:text-red-700 mt-2" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash text-sm"></i>
                </button>
            </div>
        </div>
    `,
        )
        .join("")

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
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

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
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
    document.getElementById("accountBtn").addEventListener("click", () => {
        if (currentUser) {
            showUserMenu()
        } else {
            showLoginModal()
        }
    })

    document.getElementById("closeLogin").addEventListener("click", hideLoginModal)

    if (currentUser) {
        updateUserDisplay()
    }
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

    // Clean up Firebase resources
    if (recaptchaVerifier) {
        recaptchaVerifier.clear()
        recaptchaVerifier.render()
    }
    
    // Reset Firebase session
    confirmationResult = null
    userDetails = {}
}

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

function showUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

    userDropdown.classList.remove("opacity-0", "invisible", "scale-95")
    userDropdown.classList.add("opacity-100", "visible", "scale-100")
}

function hideUserDropdown() {
    const userDropdown = document.querySelector(".user-dropdown")
    if (!userDropdown) return

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
            logout()
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
    localStorage.removeItem("nearNowCurrentUser")
    currentUser = null

    // Reset account button
    document.getElementById("accountBtn").innerHTML = `
        <i class="fas fa-user-circle text-2xl"></i>
        <span class="ml-2">Account</span>
    `

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
                            <p class="text-gray-600 mb-4">${product.description}</p>
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
            document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
            showNotification("Shop for ₹999 or more to get free delivery!", "info")
        })
    })
})

// Initialize cart and wishlist from localStorage on page load
document.addEventListener("DOMContentLoaded", () => {
    // Load saved data
    const savedCart = localStorage.getItem("nearNowCartItems")
    const savedWishlist = localStorage.getItem("nearNowWishlistItems")
    const savedUser = localStorage.getItem("nearNowCurrentUser")

    if (savedCart) {
        cartItems = JSON.parse(savedCart)
        cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    }

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
    // Touch gestures for slider
    let startX = 0
    let endX = 0

    const slider = document.getElementById("heroSlider")

    slider.addEventListener("touchstart", (e) => {
        startX = e.touches[0].clientX
    })

    slider.addEventListener("touchend", (e) => {
        endX = e.changedTouches[0].clientX
        handleSwipe()
    })

    function handleSwipe() {
        const threshold = 50
        const diff = startX - endX

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide()
            } else {
                prevSlide()
            }
        }
    }
}

// Initialize mobile features
initializeMobileFeatures()
initializeLazyLoading()

// Console welcome message
console.log(`
🛒 Near & Now Website Loaded Successfully!
`)
