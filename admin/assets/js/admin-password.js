/**
 * Admin Password Management
 * Near & Now Grocery App
 * Handles password change and reset functionality
 */

class AdminPasswordManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordValidation();
    }

    setupEventListeners() {
        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.showPasswordChangeModal();
            });
        }

        // Password change modal
        const passwordModal = document.getElementById('passwordChangeModal');
        const closePasswordModal = document.getElementById('closePasswordModal');
        const closePasswordModalBtn = document.getElementById('closePasswordModalBtn');
        
        if (closePasswordModal) {
            closePasswordModal.addEventListener('click', () => this.hidePasswordChangeModal());
        }
        
        if (closePasswordModalBtn) {
            closePasswordModalBtn.addEventListener('click', () => this.hidePasswordChangeModal());
        }

        // Password change form
        const passwordChangeForm = document.getElementById('passwordChangeForm');
        if (passwordChangeForm) {
            passwordChangeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Forgot password link
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showForgotPasswordModal();
            });
        }

        // Forgot password modal
        const forgotPasswordModal = document.getElementById('forgotPasswordModal');
        const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
        
        if (closeForgotPasswordModal) {
            closeForgotPasswordModal.addEventListener('click', () => this.hideForgotPasswordModal());
        }

        // Forgot password form
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');
        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendResetCode();
            });
        }

        // Reset code form
        const resetCodeForm = document.getElementById('resetCodeForm');
        if (resetCodeForm) {
            resetCodeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.resetPassword();
            });
        }
    }

    setupPasswordValidation() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                this.validatePassword();
                this.checkPasswordMatch();
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.checkPasswordMatch();
            });
        }
    }

    showPasswordChangeModal() {
        const modal = document.getElementById('passwordChangeModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Clear form
            this.clearPasswordForm();
        }
    }

    hidePasswordChangeModal() {
        const modal = document.getElementById('passwordChangeModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Reset to step 1
            document.getElementById('forgotPasswordStep1').style.display = 'block';
            document.getElementById('forgotPasswordStep2').style.display = 'none';
        }
    }

    hideForgotPasswordModal() {
        const modal = document.getElementById('forgotPasswordModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    clearPasswordForm() {
        const form = document.getElementById('passwordChangeForm');
        if (form) {
            form.reset();
            this.updatePasswordRequirements([]);
            this.updatePasswordMatch(false);
            this.updateSaveButton(false);
        }
    }

    validatePassword() {
        const password = document.getElementById('newPassword').value;
        const requirements = this.checkPasswordRequirements(password);
        
        this.updatePasswordRequirements(requirements);
        this.updatePasswordStrength(password);
        
        const isValid = requirements.every(req => req.valid);
        this.updateSaveButton(isValid && this.checkPasswordMatch());
        
        return isValid;
    }

    checkPasswordRequirements(password) {
        return [
            {
                id: 'req-length',
                valid: password.length >= 8,
                text: 'At least 8 characters'
            },
            {
                id: 'req-uppercase',
                valid: /[A-Z]/.test(password),
                text: 'One uppercase letter'
            },
            {
                id: 'req-lowercase',
                valid: /[a-z]/.test(password),
                text: 'One lowercase letter'
            },
            {
                id: 'req-number',
                valid: /\d/.test(password),
                text: 'One number'
            },
            {
                id: 'req-special',
                valid: /[!@#$%^&*(),.?":{}|<>]/.test(password),
                text: 'One special character'
            }
        ];
    }

    updatePasswordRequirements(requirements) {
        requirements.forEach(req => {
            const element = document.getElementById(req.id);
            if (element) {
                element.textContent = req.text;
                element.classList.toggle('valid', req.valid);
            }
        });
    }

    updatePasswordStrength(password) {
        const strengthElement = document.getElementById('passwordStrength');
        if (!strengthElement) return;

        const score = this.calculatePasswordStrength(password);
        
        strengthElement.textContent = `Password strength: ${score.text}`;
        strengthElement.className = `password-strength ${score.class}`;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        if (score < 3) {
            return { text: 'Weak', class: 'weak' };
        } else if (score < 5) {
            return { text: 'Medium', class: 'medium' };
        } else {
            return { text: 'Strong', class: 'strong' };
        }
    }

    checkPasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        const isMatch = newPassword === confirmPassword && newPassword.length > 0;
        this.updatePasswordMatch(isMatch);
        
        return isMatch;
    }

    updatePasswordMatch(isMatch) {
        const matchElement = document.getElementById('passwordMatch');
        const confirmInput = document.getElementById('confirmPassword');
        
        if (matchElement) {
            if (confirmInput.value.length > 0) {
                matchElement.textContent = isMatch ? 'Passwords match ✓' : 'Passwords do not match ✗';
                matchElement.className = `password-match ${isMatch ? 'match' : 'no-match'}`;
            } else {
                matchElement.textContent = '';
                matchElement.className = 'password-match';
            }
        }
        
        if (confirmInput) {
            confirmInput.classList.toggle('error', !isMatch && confirmInput.value.length > 0);
            confirmInput.classList.toggle('success', isMatch && confirmInput.value.length > 0);
        }
    }

    updateSaveButton(enabled) {
        const saveBtn = document.getElementById('savePasswordBtn');
        if (saveBtn) {
            saveBtn.disabled = !enabled;
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate inputs
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('New passwords do not match');
            return;
        }
        
        if (!this.validatePassword()) {
            this.showError('New password does not meet requirements');
            return;
        }
        
        // Show loading state
        const saveBtn = document.getElementById('savePasswordBtn');
        const originalText = saveBtn.textContent;
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        
        try {
            // For demo purposes, we'll use simple validation
            // In production, this would verify against the database
            
            const currentUser = localStorage.getItem('admin_username');
            if (currentUser === 'admin' && currentPassword === 'admin123') {
                // Simulate password change
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Store new password (in production, this would be hashed and stored in database)
                localStorage.setItem('admin_password', btoa(newPassword + 'nearandnow_salt'));
                
                this.showSuccess('Password changed successfully!');
                this.hidePasswordChangeModal();
                
                // Log activity
                console.log('Password changed for admin:', currentUser);
                
            } else {
                throw new Error('Current password is incorrect');
            }
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            // Reset button state
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    }

    async sendResetCode() {
        const username = document.getElementById('resetUsername').value;
        
        if (!username) {
            this.showError('Please enter your username');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('#forgotPasswordForm button');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Simulate sending reset code
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // For demo, we'll use a simple code
            const resetCode = '123456';
            localStorage.setItem('admin_reset_code', resetCode);
            localStorage.setItem('admin_reset_username', username);
            
            // Move to step 2
            document.getElementById('forgotPasswordStep1').style.display = 'none';
            document.getElementById('forgotPasswordStep2').style.display = 'block';
            
            this.showSuccess(`Reset code sent! Use code: ${resetCode} (Demo only)`);
            
        } catch (error) {
            this.showError('Failed to send reset code. Please try again.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async resetPassword() {
        const resetCode = document.getElementById('resetCode').value;
        const newPassword = document.getElementById('newPasswordReset').value;
        const confirmPassword = document.getElementById('confirmPasswordReset').value;
        
        // Validate inputs
        if (!resetCode || !newPassword || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 8) {
            this.showError('Password must be at least 8 characters long');
            return;
        }
        
        // Show loading state
        const submitBtn = document.querySelector('#resetCodeForm button');
        const originalText = submitBtn.textContent;
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        try {
            // Verify reset code
            const storedCode = localStorage.getItem('admin_reset_code');
            const storedUsername = localStorage.getItem('admin_reset_username');
            
            if (resetCode !== storedCode) {
                throw new Error('Invalid reset code');
            }
            
            // Simulate password reset
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Store new password
            localStorage.setItem('admin_password', btoa(newPassword + 'nearandnow_salt'));
            
            // Clear reset data
            localStorage.removeItem('admin_reset_code');
            localStorage.removeItem('admin_reset_username');
            
            this.showSuccess('Password reset successfully! You can now login with your new password.');
            this.hideForgotPasswordModal();
            
            // Redirect to login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } catch (error) {
            this.showError(error.message);
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showError(message) {
        // Check if we're on simple login page
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="error">' + message + '</div>';
            return;
        }
        
        // Create or update error message for other pages
        let errorDiv = document.getElementById('passwordError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'passwordError';
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showSuccess(message) {
        // Check if we're on simple login page
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.innerHTML = '<div class="success">' + message + '</div>';
            return;
        }
        
        // Create or update success message for other pages
        let successDiv = document.getElementById('passwordSuccess');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.id = 'passwordSuccess';
            successDiv.className = 'success-message';
            successDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(successDiv);
        }
        
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

// Initialize password manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminPasswordManager = new AdminPasswordManager();
});

// Export for use in other files
window.AdminPasswordManager = AdminPasswordManager;
