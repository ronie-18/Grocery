/**
 * Authentication Module
 * Handles user login, OTP verification, and session management
 */

import { 
    currentUser, currentStep, userDetails, otpTimer, resendTimer,
    setCurrentUser, setCurrentStep, setUserDetails, setOtpTimer, setResendTimer
} from './globals.js';
import { showNotification } from './ui.js';

/**
 * Initialize login system
 */
export function initializeLoginSystem() {
    // Form event listeners
    document.getElementById("mobileForm")?.addEventListener("submit", handleMobileSubmit);
    document.getElementById("otpForm")?.addEventListener("submit", handleOtpSubmit);

    // Button event listeners
    document.getElementById("resendOtpBtn")?.addEventListener("click", resendOtp);
    document.getElementById("changeNumberBtn")?.addEventListener("click", changeNumber);
    document.getElementById("continueShoppingBtn")?.addEventListener("click", continueAfterLogin);

    // OTP input handling
    initializeOtpInputs();
}

/**
 * Handle mobile number and name submission
 */
async function handleMobileSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("userName").value.trim();
    const mobile = document.getElementById("userMobile").value.trim();

    // Validation
    if (!name || name.length < 2) {
        showNotification("Please enter a valid name", "error");
        return;
    }

    if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
        showNotification("Please enter a valid 10-digit mobile number", "error");
        return;
    }

    // Store user details
    const details = {
        name: name,
        mobile: mobile,
        fullMobile: `+91${mobile}`
    };
    
    setUserDetails(details);

    // Show loading state
    const sendBtn = document.getElementById("sendOtpBtn");

    // Clear any existing send OTP timeout
    if (window.sendOtpTimeout) {
        clearTimeout(window.sendOtpTimeout);
    }

    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending OTP...';
    sendBtn.disabled = true;

    try {
        // Use Supabase Auth to send real OTP
        if (window.supabaseAuth) {
            await window.supabaseAuth.sendPhoneOTP(mobile, name);
            
            console.log('✅ Real OTP sent via Supabase');

            // Update display mobile number
            document.getElementById("displayMobile").textContent = details.fullMobile;

            // Move to step 2
            showStep(2);

            // Start resend timer
            startResendTimer();

            // Reset button
            resetSendOtpButton();

            showNotification(`OTP sent to ${details.fullMobile}. Please check your SMS.`, "success");
        } else {
            throw new Error('Supabase Auth not available');
        }
    } catch (error) {
        console.error('Error sending OTP:', error);
        
        // Reset button
        resetSendOtpButton();
        
        // Show error message
        let errorMessage = "Failed to send OTP. Please try again.";
        if (error.message?.includes('Phone number not valid')) {
            errorMessage = "Please enter a valid phone number.";
        } else if (error.message?.includes('rate')) {
            errorMessage = "Too many attempts. Please wait before trying again.";
        }
        
        showNotification(errorMessage, "error");
    }
}

/**
 * Handle OTP verification
 */
async function handleOtpSubmit(e) {
    e.preventDefault();

    const enteredOtp = getEnteredOtp();
    console.log('Entered OTP:', enteredOtp);

    if (!userDetails.mobile) {
        showNotification("OTP session expired. Please resend OTP.", "error");
        return;
    }

    if (enteredOtp.length !== 6) {
        showNotification("Please enter complete 6-digit OTP", "error");
        return;
    }

    // Show loading state
    const verifyBtn = document.getElementById("verifyOtpBtn");

    // Clear any existing verification timeout first
    if (window.verificationTimeout) {
        clearTimeout(window.verificationTimeout);
    }

    verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';
    verifyBtn.disabled = true;

    try {
        // Use Supabase Auth to verify real OTP
        if (window.supabaseAuth) {
            console.log('🔐 Verifying OTP with name:', userDetails.name);
            const result = await window.supabaseAuth.verifyPhoneOTP(userDetails.mobile, enteredOtp, userDetails.name);
            
            if (result.success) {
                console.log('✅ OTP verified successfully via Supabase');

                // Immediately set the currentUser with the name from userDetails
                const user = {
                    id: result.user.id,
                    name: userDetails.name, // Use the name from the form
                    mobile: userDetails.mobile,
                    fullMobile: userDetails.fullMobile,
                    loginTime: new Date().toISOString(),
                    isVerified: true,
                    supabaseUser: result.user
                };
                
                setCurrentUser(user);
                console.log('👤 Immediately setting currentUser with name:', userDetails.name);
                
                // Store in localStorage
                localStorage.setItem("nearNowCurrentUser", JSON.stringify(user));
                
                // Update UI immediately
                if (window.updateUserDisplay) {
                    window.updateUserDisplay();
                }

                showStep(3);

                // Restore user's cart after login using CartManager
                if (window.handleUserLogin) {
                    window.handleUserLogin();
                }

                showNotification("Mobile number verified successfully!", "success");

                // Auto close after 2 seconds
                setTimeout(() => {
                    hideLoginModal();
                    if (window.updateUserDisplay) {
                        window.updateUserDisplay(); // Update again to be sure
                    }
                    resetVerifyButton(); // Reset button after successful login
                }, 2000);
            } else {
                throw new Error('Verification failed');
            }
        } else {
            throw new Error('Supabase Auth not available');
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);

        // Reset button
        resetVerifyButton();

        // Show error message
        let errorMessage = "Invalid OTP. Please check and try again.";
        if (error.message?.includes('expired')) {
            errorMessage = "OTP has expired. Please request a new one.";
        } else if (error.message?.includes('invalid')) {
            errorMessage = "Invalid OTP. Please check the 6-digit code.";
        }

        showNotification(errorMessage, "error");

        // Clear OTP inputs on error
        clearOtpInputs();
    }
}

/**
 * Get entered OTP from inputs
 */
function getEnteredOtp() {
    const otpInputs = document.querySelectorAll(".otp-input");
    let otp = "";
    otpInputs.forEach((input) => {
        otp += input.value;
    });
    return otp;
}

/**
 * Clear OTP inputs
 */
function clearOtpInputs() {
    const otpInputs = document.querySelectorAll(".otp-input");
    otpInputs.forEach((input) => {
        input.value = "";
    });
    otpInputs[0]?.focus();
}

/**
 * Initialize OTP input behavior
 */
function initializeOtpInputs() {
    const otpInputs = document.querySelectorAll(".otp-input");

    // Remove existing event listeners first to prevent duplicates
    otpInputs.forEach((input) => {
        // Clone the input to remove all event listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
    });

    // Get the fresh inputs after cloning
    const freshOtpInputs = document.querySelectorAll(".otp-input");

    freshOtpInputs.forEach((input, index) => {
        input.addEventListener("input", function (e) {
            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, "");

            // Move to next input if current is filled
            if (this.value.length === 1 && index < freshOtpInputs.length - 1) {
                freshOtpInputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", function (e) {
            // Move to previous input on backspace
            if (e.key === "Backspace" && this.value === "" && index > 0) {
                freshOtpInputs[index - 1].focus();
            }
        });

        input.addEventListener("paste", (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");

            if (pastedData.length === 6) {
                freshOtpInputs.forEach((inp, i) => {
                    inp.value = pastedData[i] || "";
                });
            }
        });
    });
}

/**
 * Show specific step
 */
function showStep(step) {
    // Hide all steps
    document.querySelectorAll(".login-step").forEach((stepEl) => {
        stepEl.classList.add("hidden");
    });

    // Show current step
    document.getElementById(`step${step}`)?.classList.remove("hidden");
    setCurrentStep(step);

    // Focus on first input of current step
    if (step === 1) {
        document.getElementById("userName")?.focus();
    } else if (step === 2) {
        // Reinitialize OTP inputs properly for step 2
        setTimeout(() => {
            initializeOtpInputs();
            document.querySelector(".otp-input")?.focus();
        }, 100);
    }
}

/**
 * Start resend timer
 */
function startResendTimer() {
    setResendTimer(30);
    const resendBtn = document.getElementById("resendOtpBtn");
    const timerSpan = document.getElementById("resendTimer");

    if (resendBtn) resendBtn.disabled = true;

    const timer = setInterval(() => {
        setResendTimer(resendTimer - 1);
        if (timerSpan) timerSpan.textContent = resendTimer;

        if (resendTimer <= 0) {
            clearInterval(timer);
            if (resendBtn) {
                resendBtn.disabled = false;
                resendBtn.innerHTML = "Resend OTP";
            }
        }
    }, 1000);

    setOtpTimer(timer);
}

/**
 * Resend OTP
 */
async function resendOtp() {
    if (!userDetails.mobile) {
        showNotification("No active session. Please start over.", "error");
        return;
    }

    try {
        // Use Supabase Auth to resend real OTP
        if (window.supabaseAuth) {
            await window.supabaseAuth.resendPhoneOTP(userDetails.mobile, userDetails.name);
            
            console.log('✅ OTP resent via Supabase');

            // Clear current OTP inputs
            clearOtpInputs();

            // Start timer again
            startResendTimer();

            showNotification(`New OTP sent to ${userDetails.fullMobile}. Please check your SMS.`, "success");
        } else {
            throw new Error('Supabase Auth not available');
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        
        let errorMessage = "Failed to resend OTP. Please try again.";
        if (error.message?.includes('rate')) {
            errorMessage = "Too many attempts. Please wait before trying again.";
        }
        
        showNotification(errorMessage, "error");
    }
}

/**
 * Change mobile number
 */
function changeNumber() {
    // Clear form
    document.getElementById("userName").value = "";
    document.getElementById("userMobile").value = "";
    clearOtpInputs();

    // Clear timer
    if (otpTimer) {
        clearInterval(otpTimer);
    }

    // Reset user details
    setUserDetails({});

    // Go back to step 1
    showStep(1);
}

/**
 * Continue after successful login
 */
function continueAfterLogin() {
    hideLoginModal();
    // Load user's cart after login using CartManager
    if (window.handleUserLogin) {
        window.handleUserLogin();
    }
    showNotification(`Welcome ${currentUser.name}! Happy shopping with Near & Now! 🛒`, "success");
}

/**
 * Reset verify button state
 */
function resetVerifyButton() {
    const verifyBtn = document.getElementById("verifyOtpBtn");
    if (verifyBtn) {
        verifyBtn.innerHTML = "Verify & Continue";
        verifyBtn.disabled = false;
    }
}

/**
 * Reset send OTP button state
 */
function resetSendOtpButton() {
    const sendBtn = document.getElementById("sendOtpBtn");
    if (sendBtn) {
        sendBtn.innerHTML = "Send OTP";
        sendBtn.disabled = false;
    }
}

/**
 * Show login modal
 */
export function showLoginModal() {
    const loginModal = document.getElementById("loginModal");
    const modalOverlay = document.getElementById("modalOverlay");

    if (loginModal && modalOverlay) {
        loginModal.classList.remove("hidden");
        loginModal.classList.add("flex");
        modalOverlay.classList.remove("hidden");
    }
}

/**
 * Hide login modal
 */
export function hideLoginModal() {
    const loginModal = document.getElementById("loginModal");
    const modalOverlay = document.getElementById("modalOverlay");

    if (loginModal && modalOverlay) {
        loginModal.classList.add("hidden");
        loginModal.classList.remove("flex");
        modalOverlay.classList.add("hidden");
    }

    // Reset to step 1 for next time
    showStep(1);
}

/**
 * Logout user
 */
export async function logoutUser() {
    try {
        // Handle cart logout using CartManager
        if (window.handleUserLogout) {
            window.handleUserLogout();
        }

        // Use Supabase auth to sign out
        if (window.supabaseAuth) {
            await window.supabaseAuth.signOut();
            console.log('✅ Signed out via Supabase');
        }

        // Clear current user (will also be handled by Supabase auth state change)
        setCurrentUser(null);

        // Remove current user from localStorage
        localStorage.removeItem("nearNowCurrentUser");

        // Reset login system state after logout
        setUserDetails({});
        setCurrentStep(1);

        // Clear any existing timers
        if (otpTimer) {
            clearInterval(otpTimer);
            setOtpTimer(null);
        }

        // Clear any pending verification timeout
        if (window.verificationTimeout) {
            clearTimeout(window.verificationTimeout);
            window.verificationTimeout = null;
        }

        // Reset all button states
        resetVerifyButton();
        resetSendOtpButton();

        // Reset login form
        document.getElementById("userName").value = "";
        document.getElementById("userMobile").value = "";
        clearOtpInputs();

        // Show step 1 for next login
        showStep(1);

        // Update UI
        if (window.updateUserDisplay) {
            window.updateUserDisplay();
        }

        showNotification("Logged out successfully!", "success");
    } catch (error) {
        console.error('Error during logout:', error);
        showNotification("Logout completed with some issues", "warning");
    }
}

/**
 * Initialize authentication
 */
export function initializeAuth() {
    // Setup login button handlers
    const accountBtn = document.getElementById("accountBtn");
    const mobileLoginBtn = document.getElementById("mobileLoginBtn");

    if (accountBtn) {
        accountBtn.addEventListener("click", () => {
            if (!currentUser) {
                showLoginModal();
            }
        });
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener("click", () => {
            showLoginModal();
        });
    }

    // Initialize Supabase auth listeners if available
    if (window.supabaseAuth) {
        setupSupabaseAuthListeners();
    }
}

/**
 * Setup Supabase auth listeners
 */
function setupSupabaseAuthListeners() {
    // Listen for auth state changes
    window.addEventListener('userLoggedIn', (event) => {
        console.log('🔐 User logged in event received');
        const user = event.detail.user;
        
        if (user) {
            setCurrentUser({
                id: user.id,
                name: user.user_metadata?.name || userDetails.name || 'User',
                mobile: user.phone?.replace('+91', '') || '',
                fullMobile: user.phone || '',
                loginTime: new Date().toISOString(),
                isVerified: !!user.phone_confirmed_at,
                supabaseUser: user
            });
            
            // Update UI
            if (window.updateUserDisplay) {
                window.updateUserDisplay();
            }
        }
    });

    window.addEventListener('userLoggedOut', () => {
        console.log('🔐 User logged out event received');
        setCurrentUser(null);
        
        // Update UI
        if (window.updateUserDisplay) {
            window.updateUserDisplay();
        }
    });
}

