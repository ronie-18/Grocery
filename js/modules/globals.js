/**
 * Global Variables and Constants
 * Near & Now Grocery App
 */

// Global State Variables
export let currentSlide = 0;
export let cartItems = [];
export let cartCount = 0;
export let currentUser = JSON.parse(localStorage.getItem("nearNowCurrentUser")) || null;
export let allProducts = [];
export let displayedProducts = [];
export let currentCategory = "all";
export let currentSort = "default";
export const productsPerPage = 10;
export let currentPage = 1;
export let isPageInitializing = true; // Flag to prevent automatic scrolling during page load

// Enhanced Features Variables
export let currentFilters = {
    priceRange: { min: 0, max: 1000 },
    categories: [],
    ratings: [],
    availability: []
};
export let searchSuggestions = [];
export let quickViewProduct = null;
export let mobileNavOpen = false;

// Authentication Variables
export let currentStep = 1;
export let userDetails = {};
export let otpTimer = null;
export let resendTimer = 30;

// Categories Data - Loaded dynamically from Supabase
export let categories = [];

// Function to set categories (will be called after loading from Supabase)
export function setCategories(value) { 
    categories = value;
    console.log('✅ Categories updated:', categories.length);
}

// Setter functions for state updates
export function setCurrentSlide(value) { currentSlide = value; }
export function setCartItems(value) { cartItems = value; }
export function setCartCount(value) { cartCount = value; }
export function setCurrentUser(value) { currentUser = value; }
export function setAllProducts(value) { allProducts = value; }
export function setDisplayedProducts(value) { displayedProducts = value; }
export function setCurrentCategory(value) { currentCategory = value; }
export function setCurrentSort(value) { currentSort = value; }
export function setCurrentPage(value) { currentPage = value; }
export function setIsPageInitializing(value) { isPageInitializing = value; }
export function setCurrentFilters(value) { currentFilters = value; }
export function setSearchSuggestions(value) { searchSuggestions = value; }
export function setQuickViewProduct(value) { quickViewProduct = value; }
export function setMobileNavOpen(value) { mobileNavOpen = value; }
export function setCurrentStep(value) { currentStep = value; }
export function setUserDetails(value) { 
    userDetails = value;
    window.userDetails = value; // Keep global reference for compatibility
}
export function setOtpTimer(value) { otpTimer = value; }
export function setResendTimer(value) { resendTimer = value; }

