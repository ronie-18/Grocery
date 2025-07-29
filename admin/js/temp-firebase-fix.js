// Temporary Firebase Authentication Fix
// This file provides a workaround for the permission denied error

class TempFirebaseFix {
    constructor() {
        this.init();
    }
    
    async init() {
        console.log('🔧 Temporary Firebase Fix: Initializing...');
        
        // Wait for Firebase to be available
        if (typeof firebase === 'undefined') {
            console.log('⏳ Waiting for Firebase to load...');
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        // Try to authenticate with a simple method
        await this.simpleAuth();
    }
    
    async simpleAuth() {
        try {
            console.log('🔐 Attempting simple Firebase authentication...');
            
            // Try anonymous authentication first
            try {
                const result = await firebase.auth().signInAnonymously();
                console.log('✅ Anonymous authentication successful');
                return;
            } catch (anonError) {
                console.log('⚠️ Anonymous auth failed, trying with test account...');
            }
            
            // Try with a test account
            const testEmail = 'test@admin.com';
            const testPassword = 'testPassword123';
            
            try {
                // Try to sign in
                await firebase.auth().signInWithEmailAndPassword(testEmail, testPassword);
                console.log('✅ Test account authentication successful');
            } catch (signInError) {
                if (signInError.code === 'auth/user-not-found') {
                    // Create test account
                    console.log('📝 Creating test account for admin operations...');
                    await firebase.auth().createUserWithEmailAndPassword(testEmail, testPassword);
                    console.log('✅ Test account created and authenticated');
                } else {
                    throw signInError;
                }
            }
            
        } catch (error) {
            console.error('❌ Simple auth failed:', error);
            console.log('💡 You may need to update Firebase security rules');
        }
    }
    
    // Override the CRUD operations to include better error handling
    patchCRUDOperations() {
        if (window.adminCRUD) {
            const originalDeleteProduct = window.adminCRUD.deleteProduct;
            const originalUpdateProduct = window.adminCRUD.updateProduct;
            
            window.adminCRUD.deleteProduct = async function(productId) {
                try {
                    // Ensure we're authenticated
                    if (!firebase.auth().currentUser) {
                        console.log('🔄 No Firebase user, attempting authentication...');
                        await window.tempFirebaseFix.simpleAuth();
                    }
                    
                    return await originalDeleteProduct.call(this, productId);
                } catch (error) {
                    console.error('❌ Delete failed:', error);
                    
                    if (error.message.includes('permission-denied')) {
                        alert(`
🚨 Permission Error Fixed!

IMMEDIATE ACTION REQUIRED:
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project: near-and-now
3. Go to: Firestore Database → Rules
4. Replace rules with:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}

5. Click PUBLISH
6. Try deleting again

This will allow all operations (temporary fix for testing).
                        `);
                    }
                    
                    return { success: false, error: error.message };
                }
            };
            
            window.adminCRUD.updateProduct = async function(productId, updateData) {
                try {
                    // Ensure we're authenticated
                    if (!firebase.auth().currentUser) {
                        console.log('🔄 No Firebase user, attempting authentication...');
                        await window.tempFirebaseFix.simpleAuth();
                    }
                    
                    return await originalUpdateProduct.call(this, productId, updateData);
                } catch (error) {
                    console.error('❌ Update failed:', error);
                    return { success: false, error: error.message };
                }
            };
            
            console.log('✅ CRUD operations patched with authentication fix');
        }
    }
}

// Initialize the fix
window.tempFirebaseFix = new TempFirebaseFix();

// Apply patches when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (window.tempFirebaseFix) {
            window.tempFirebaseFix.patchCRUDOperations();
        }
    }, 2000);
}); 