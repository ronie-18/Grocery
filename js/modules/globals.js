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

// Categories Data - Updated to match products-data.js
export const categories = [
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
];

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

