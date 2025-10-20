/**
 * UI Utilities Module
 * Handles notifications, modals, and other UI elements
 */

import { currentUser } from './globals.js';

/**
 * Show notification toast
 */
export function showNotification(message, type = "info") {
    // Remove existing notification if any
    const existingNotification = document.querySelector(".notification-toast");
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement("div");
    notification.className = "notification-toast";
    
    // Define color classes based on type
    const typeClasses = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };
    
    const bgClass = typeClasses[type] || typeClasses.info;
    
    notification.innerHTML = `
        <div class="fixed top-20 right-4 ${bgClass} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center space-x-3 animate-slide-in z-50 max-w-md">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'} text-xl"></i>
            <span class="font-medium">${message}</span>
            <button onclick="this.closest('.notification-toast').remove()" class="ml-4 hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification && notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Show error message banner
 */
export function showErrorMessage(message) {
    // Create or update error banner
    let errorBanner = document.getElementById('error-banner');
    if (!errorBanner) {
        errorBanner = document.createElement('div');
        errorBanner.id = 'error-banner';
        errorBanner.className = 'fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-3 px-4 z-50';
        document.body.insertBefore(errorBanner, document.body.firstChild);
    }
    
    errorBanner.innerHTML = `
        <div class="container mx-auto flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.style.display='none'" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    errorBanner.style.display = 'block';
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (errorBanner) errorBanner.style.display = 'none';
    }, 10000);
}

/**
 * Show error message
 */
export function showError(message) {
    showNotification(message, 'error');
}

/**
 * Show location error
 */
export function showLocationError(message) {
    showNotification(message, 'error');
}

/**
 * Show location toast
 */
export function showLocationToast(message, type = 'info') {
    showNotification(message, type);
}

/**
 * Initialize modals
 */
export function initializeModals() {
    const modalOverlay = document.getElementById("modalOverlay");
    const closeButtons = document.querySelectorAll(".modal-close, #closeLogin, #closeQuickView, #closeCart");

    closeButtons.forEach((btn) => {
        btn.addEventListener("click", closeAllModals);
    });

    if (modalOverlay) {
        modalOverlay.addEventListener("click", closeAllModals);
    }
}

/**
 * Close all modals
 */
function closeAllModals() {
    document.getElementById("modalOverlay")?.classList.add("hidden");
    document.getElementById("loginModal")?.classList.add("hidden");
    document.getElementById("quickViewModal")?.classList.add("hidden");
}

/**
 * Initialize scroll effects
 */
export function initializeScrollEffects() {
    const backToTopBtn = document.getElementById("backToTop");
    
    if (!backToTopBtn) {
        console.warn("Back to top button not found");
        return;
    }

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.remove("opacity-0", "invisible");
            backToTopBtn.classList.add("opacity-100", "visible");
        } else {
            backToTopBtn.classList.remove("opacity-100", "visible");
            backToTopBtn.classList.add("opacity-0", "invisible");
        }
    });

    backToTopBtn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    });
}

/**
 * Initialize newsletter
 */
export function initializeNewsletter() {
    const newsletterForm = document.getElementById("newsletterForm");
    
    if (!newsletterForm) return;

    newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("newsletterEmail").value;
        showNotification(`Thank you for subscribing with ${email}! Stay tuned for exclusive deals.`, "success");
        newsletterForm.reset();
    });
}

/**
 * Initialize navigation
 */
export function initializeNavigation() {
    const navLinks = document.querySelectorAll(".nav-item, .mobile-nav-link");

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const section = link.getAttribute("data-section");
            if (section) {
                e.preventDefault();
                navigateToSection(section);
            }
        });
    });
}

/**
 * Navigate to section
 */
function navigateToSection(section) {
    const sectionMap = {
        home: "heroSlider",
        shop: "productsSection",
        about: "about-section",
        contact: "contact-section",
    };

    const targetSection = document.getElementById(sectionMap[section] || section);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: "smooth" });
    }
}

/**
 * Initialize lazy loading
 */
export function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

/**
 * Initialize mobile features
 */
export function initializeMobileFeatures() {
    // Detect mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        // Add mobile-specific classes
        document.body.classList.add('mobile-device');
        
        // Prevent zoom on input focus (iOS)
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.style.fontSize = '16px';
            });
        });
    }
}

/**
 * Call shop phone number
 */
export function callShop(phoneNumber) {
    window.location.href = `tel:${phoneNumber}`;
}

/**
 * Get directions to location
 */
export function getDirections(lat, lng) {
    const userLocation = JSON.parse(localStorage.getItem('userLocation'));
    if (userLocation) {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${lat},${lng}`;
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`, '_blank');
    } else {
        showNotification('Please enable location services first', 'warning');
    }
}

