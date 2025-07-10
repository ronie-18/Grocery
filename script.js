// Global Variables
let currentSlide = 0
let cartItems = []
let cartCount = 0
let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null
let allProducts = []
let displayedProducts = []
let currentCategory = "all"
let currentSort = "default"
const productsPerPage = 8
let currentPage = 1

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
        id: "dairy",
        name: "Dairy Products",
        description: "Milk, Paneer & More",
        image: "https://pngimg.com/d/milk_PNG12717.png",
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
        image: "https://pngimg.com/d/chips_PNG10125.png",
        color: "from-pink-100 to-pink-200",
    },
    {
        id: "beverages",
        name: "Beverages",
        description: "Tea & Drinks",
        image: "https://pngimg.com/d/orange_juice_PNG35.png",
        color: "from-purple-100 to-purple-200",
    },
]

// Initialize the website
document.addEventListener("DOMContentLoaded", () => {
    // TEMPORARILY COMMENTED OUT - Loading screen disabled
    // showLoadingScreen()
    // setTimeout(() => {
    //     hideLoadingScreen()
    //     initializeWebsite()
    // }, 3000) // 3 second loading screen

    // Initialize website immediately without loading screen
    initializeWebsite()
})

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

function initializeWebsite() {
    allProducts = [...products]
    displayedProducts = [...allProducts]

    // Ensure category starts with "all" on every page load
    currentCategory = "all"

    initializeSlider()
    initializeSearch()
    initializeCart()
    initializeAuth()
    initializeNavigation()
    initializeCategories()
    initializeProducts()
    initializeModals()
    initializeScrollEffects()
    initializeNewsletter()
    initializeLoginSystem()

    // Initialize new enhanced features
    initializeQuickView()
    initializeAdvancedFilters()
    initializeEnhancedSearch()
    initializeMobileNavigation()
    initializeProductReviews()

    // Update cart count after everything is initialized
    updateCartCount()

    console.log("Near & Now website fully initialized!")
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

    // Store user details
    userDetails = {
        name: name,
        mobile: mobile,
        fullMobile: `+91${mobile}`,
        otp: generateOTP() // Generate OTP for demo
    }
    window._lastOtp = userDetails.otp; // For debugging

    // Show loading state
    const sendBtn = document.getElementById("sendOtpBtn")

    // **FIX: Clear any existing send OTP timeout**
    if (window.sendOtpTimeout) {
        clearTimeout(window.sendOtpTimeout)
    }

    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...'
    sendBtn.disabled = true

    // Simulate OTP sending delay with stored timeout ID
    window.sendOtpTimeout = setTimeout(() => {
        console.log('Demo OTP generated:', userDetails.otp)

        // Update display mobile number
        document.getElementById("displayMobile").textContent = userDetails.fullMobile

        // Move to step 2
        showStep(2)

        // Start resend timer
        startResendTimer()

        // Reset button
        resetSendOtpButton()

        showNotification(`Demo OTP sent to ${userDetails.fullMobile}. Demo OTP: ${userDetails.otp}`, "success")

        // Clear timeout reference
        window.sendOtpTimeout = null
    }, 1500)
}

// Handle OTP verification
function handleOtpSubmit(e) {
    e.preventDefault()

    const enteredOtp = getEnteredOtp()
    console.log('Entered OTP:', enteredOtp, 'Expected OTP:', userDetails.otp)

    if (!userDetails.otp) {
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

    // Simulate verification delay with stored timeout ID
    window.verificationTimeout = setTimeout(() => {
        // Verify OTP with generated one
        if (enteredOtp === userDetails.otp) {
            // OTP is correct
            console.log('OTP verified successfully')

            showStep(3)

            // Store user in localStorage
            const userData = {
                id: generateUserId(),
                name: userDetails.name,
                mobile: userDetails.mobile,
                fullMobile: userDetails.fullMobile,
                loginTime: new Date().toISOString(),
                isVerified: true
            }

            currentUser = userData
            localStorage.setItem("nearNowCurrentUser", JSON.stringify(userData))

                    // Restore user's cart after login using CartManager
        if (window.handleUserLogin) {
            window.handleUserLogin();
        }

        showNotification("Mobile number verified successfully!", "success")

            // Auto close after 2 seconds
            setTimeout(() => {
                hideLoginModal()
                updateUserDisplay()
                resetVerifyButton() // Reset button after successful login
            }, 2000)
        } else {
            // OTP is incorrect
            console.error('Invalid OTP entered')

            // Reset button
            resetVerifyButton()

            showNotification("Invalid OTP. Please check and try again.", "error")

            // Clear OTP inputs on error
            clearOtpInputs()
        }

        // Clear the timeout reference
        window.verificationTimeout = null
    }, 1000)
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
function resendOtp() {
    if (!userDetails.mobile) {
        showNotification("No active session. Please start over.", "error")
        return
    }

    // Generate new OTP
    userDetails.otp = generateOTP()
    console.log('New demo OTP generated:', userDetails.otp)

    // Clear current OTP inputs
    clearOtpInputs()

    // Start timer again
    startResendTimer()

    showNotification(`New demo OTP sent to ${userDetails.fullMobile}. Demo OTP: ${userDetails.otp}`, "success")
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
function logoutUser() {
    // Handle cart logout using CartManager
    if (window.handleUserLogout) {
        window.handleUserLogout();
    }

    // Clear current user
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
    populateHeaderCategoryDropdown()

    // Header category filter dropdown functionality
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter) {
        // Set default value to "all" on page load
        categoryFilter.value = "all"

        // Add event listener for category changes
        categoryFilter.addEventListener("change", function (e) {
            const category = e.target.value
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

// Function to populate header category dropdown from products-data.js
function populateHeaderCategoryDropdown() {
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter && typeof getAvailableCategories === 'function') {
        const categories = getAvailableCategories()

        // Clear existing options except "All Categories"
        const allCategoriesOption = categoryFilter.querySelector('option[value="all"]')
        categoryFilter.innerHTML = ''
        if (allCategoriesOption) {
            categoryFilter.appendChild(allCategoriesOption)
        } else {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>'
        }

        // Add dynamic category options with proper formatting
        categories.forEach(category => {
            const option = document.createElement('option')
            option.value = category
            option.textContent = formatCategoryName(category)
            categoryFilter.appendChild(option)
        })
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

    // Update the header category dropdown to match current selection
    const categoryFilter = document.getElementById("categoryFilter")
    if (categoryFilter) {
        categoryFilter.value = category
    }

    currentPage = 1
    renderProducts()
    document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })

    // Use proper category name for notification
    const categoryName = category === "all" ? "All Products" : formatCategoryName(category)
    showNotification(`Showing ${categoryName} (${displayedProducts.length} products)`, "info")
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
    const price = typeof product.price === 'string' ? product.price.replace(/^₹/, '') : product.price;
    const originalPrice = product.originalPrice ? (typeof product.originalPrice === 'string' ? product.originalPrice.replace(/^₹/, '') : product.originalPrice) : null;

    return `
        <div class="product-card bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group" data-product-id="${product.id}">
            <div class="relative overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-64 object-cover group-hover:scale-110 transition duration-500">
                ${product.discount > 0 ? `<div class="absolute top-4 left-4"><span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">-${product.discount}%</span></div>` : ''}
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                    <button class="quick-view-btn bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full shadow-md transition duration-300 transform scale-0 group-hover:scale-100" title="Quick View">
                        <i class="fas fa-eye text-gray-600 hover:text-primary"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex text-yellow-400 text-sm">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-gray-500 text-sm">(${product.rating})</span>
                </div>
                <h3 class="font-bold text-gray-800 text-lg mb-2 cursor-pointer hover:text-primary transition duration-300 product-name">${product.name}</h3>
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <span class="text-primary font-bold text-lg">₹${price}</span>
                        ${originalPrice ? `<span class="text-gray-400 line-through text-sm">₹${originalPrice}</span>` : ''}
                    </div>
                    <button class="add-to-cart-btn bg-primary text-white px-4 py-2 rounded-full hover:bg-secondary transition duration-300 flex items-center space-x-2">
                        <i class="fas fa-plus"></i>
                        <span>Add</span>
                    </button>
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
    // Add to cart buttons - Updated to use correct selectors
    document.querySelectorAll(".add-to-cart-btn, .add-to-cart-btn-mobile").forEach((button) => {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const productCard = this.closest('.product-card')
            const productId = productCard.dataset.productId
            addToCart(productId)
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

function loadMoreProducts() {
    currentPage++
    renderProducts()
    showNotification("More products loaded!", "success")
}

// Cart Functionality
function initializeCart() {
    // Sync with CartManager if available
    if (window.cartManager) {
        cartItems = window.cartManager.getItems();
        cartCount = window.cartManager.getCount();
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
    // Use CartManager if available, otherwise fallback to local logic
    if (window.cartManager) {
        const success = window.cartManager.addToCart(productId, 1);
        if (success) {
            // Update local variables for UI consistency
            cartItems = window.cartManager.getItems();
            cartCount = window.cartManager.getCount();
            
            // Update UI
            updateCartCount();
            updateCartDisplay();
        }
        
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
        return success;
    }

    // Fallback logic for when CartManager is not available
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

    // Always recalculate cart count from the items array
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

    // Save to localStorage first
    saveCartToStorage()

    // Then update the display
    updateCartCount()
    updateCartDisplay()

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
}

function removeFromCart(productId) {
    // Use CartManager if available, otherwise fallback to local logic
    if (window.cartManager) {
        const success = window.cartManager.removeFromCart(productId);
        if (success) {
            // Update local variables for UI consistency
            cartItems = window.cartManager.getItems();
            cartCount = window.cartManager.getCount();
            
            // Update UI
            updateCartCount();
            updateCartDisplay();
        }
        return success;
    }

    // Fallback logic
    cartItems = cartItems.filter((item) => item.id !== productId)
    cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
    updateCartCount()
    updateCartDisplay()
    saveCartToStorage()
    showNotification("Item removed from cart", "info")
}

function updateCartQuantity(productId, newQuantity) {
    // Use CartManager if available, otherwise fallback to local logic
    if (window.cartManager) {
        const success = window.cartManager.updateQuantity(productId, newQuantity);
        if (success) {
            // Update local variables for UI consistency
            cartItems = window.cartManager.getItems();
            cartCount = window.cartManager.getCount();
            
            // Update UI
            updateCartCount();
            updateCartDisplay();
        }
        return success;
    }

    // Fallback logic
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
    // Sync with CartManager if available
    if (window.cartManager) {
        cartItems = window.cartManager.getItems();
    }

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
    document.getElementById("accountBtn").addEventListener("click", () => {
        if (currentUser) {
            showUserMenu()
        } else {
            showLoginModal()
        }
    })

    document.getElementById("closeLogin").addEventListener("click", hideLoginModal)

    // Always call updateUserDisplay to set the correct initial state
    updateUserDisplay()
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
    } else {
        // Reset account button to login state when user is logged out
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
            document.getElementById("productsSection").scrollIntoView({ behavior: "smooth" })
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
🛒 Near & Now Website Loaded Successfully!
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
                showNotification(`${quickViewProduct.name} added to cart!`, 'success')
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
function initializeAdvancedFilters() {
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
    populateCategoryFilters()

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

function populateCategoryFilters() {
    const categories = getAvailableCategories()
    const container = document.getElementById('categoryFilters')

    const categoriesHTML = categories.map(category => `
        <label class="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" value="${category}" class="category-filter-checkbox">
            <span class="text-sm text-gray-600">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
        </label>
    `).join('')

    container.innerHTML = categoriesHTML

    // Add event listeners
    document.querySelectorAll('.category-filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateCategoryFilters()
        })
    })
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

    showNotification(`Found ${filtered.length} products matching your filters`, 'info')
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

    // Search suggestions
    document.getElementById('searchSuggestions').addEventListener('click', (e) => {
        if (e.target.classList.contains('search-suggestion-item')) {
            const productName = e.target.dataset.productName
            searchInput.value = productName
            performEnhancedSearch(productName)
            hideSearchSuggestions()
        }
    })
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
            <div class="search-suggestion-item flex items-center p-3 hover:bg-gray-100 cursor-pointer" data-product-name="${product.name}">
                <img src="${product.image}" alt="${product.name}" class="w-10 h-10 object-cover rounded mr-3">
                <div>
                    <div class="font-medium text-gray-800">${product.name}</div>
                    <div class="text-sm text-gray-500">${product.category}</div>
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
    showNotification(`Found ${filtered.length} products`, 'info')
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

    // Open mobile navigation
    mobileNavBtn.addEventListener('click', () => {
        openMobileNavigation()
    })

    // Close mobile navigation
    closeMobileNav.addEventListener('click', () => {
        closeMobileNavigation()
    })

    mobileNavOverlay.addEventListener('click', () => {
        closeMobileNavigation()
    })

    // Mobile categories dropdown
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
    document.getElementById('mobileCartBtn').addEventListener('click', () => {
        toggleCartSidebar()
        closeMobileNavigation()
    })

    document.getElementById('mobileWishlistBtn').addEventListener('click', () => {
        // Navigate to wishlist or show wishlist modal
        closeMobileNavigation()
    })

    // Mobile login
    document.getElementById('mobileLoginBtn').addEventListener('click', () => {
        showLoginModal()
        closeMobileNavigation()
    })

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

    mobileNavMenu.classList.remove('-translate-x-full')
    mobileNavOverlay.classList.remove('hidden')
    mobileNavOpen = true

    // Prevent body scroll
    document.body.style.overflow = 'hidden'
}

function closeMobileNavigation() {
    const mobileNavMenu = document.getElementById('mobileNavMenu')
    const mobileNavOverlay = document.getElementById('mobileNavOverlay')

    mobileNavMenu.classList.add('-translate-x-full')
    mobileNavOverlay.classList.add('hidden')
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
