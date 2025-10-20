# Module Architecture
**Near & Now Grocery App - Modular Structure**

## 📊 Module Dependency Graph

```
┌─────────────────────────────────────────────────────────┐
│                      index.html                          │
│                                                          │
│  Loads: supabase-client.js, app-config.js, Tailwind    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │ type="module"
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│                      js/main.js                          │
│                  (Orchestrator/Entry Point)              │
│                                                          │
│  - Initializes all modules in order                     │
│  - Loads products from Supabase                         │
│  - Exports for backward compatibility                   │
│  - Error handling & recovery                            │
└──┬───┬───┬───┬───┬───┬───┬────────────────────────────┘
   │   │   │   │   │   │   │
   │   │   │   │   │   │   └─────────────────┐
   │   │   │   │   │   │                     │
   ▼   ▼   ▼   ▼   ▼   ▼   ▼                 ▼
┌──────────────────────────────┐   ┌──────────────────────┐
│   js/modules/globals.js       │   │  js/modules/utils.js │
│                               │   │                      │
│  - Global state variables     │   │  - Helper functions  │
│  - Categories data            │   │  - Calculations      │
│  - State setter functions     │   │  - Formatters        │
│                               │   │  - debounce()        │
│  Exports:                     │   │                      │
│  • currentUser                │   │  Exports:            │
│  • cartItems                  │   │  • debounce()        │
│  • allProducts                │   │  • generateStarRating│
│  • displayedProducts          │   │  • calculateDistance │
│  • currentCategory            │   │  • formatCategoryName│
│  • categories[]               │   │  • getTimeAgo()      │
│  • setters for all state      │   │                      │
└───────────┬──────────────────┘   └────────┬─────────────┘
            │                               │
            │ import                        │ import
            │                               │
   ┌────────┴────────┬─────────────────────┴─────────┐
   │                 │                               │
   ▼                 ▼                               ▼
┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐
│  auth.js     │ │  cart.js     │ │     ui.js           │
│              │ │              │ │                     │
│ Login/Logout │ │ Cart Mgmt    │ │ UI Utilities        │
│ OTP System   │ │ Add/Remove   │ │ Notifications       │
│ User Session │ │ Quantity     │ │ Modals              │
│              │ │ Storage      │ │ Scroll Effects      │
│ Dependencies:│ │              │ │                     │
│ • globals.js │ │ Dependencies:│ │ Dependencies:       │
│ • ui.js      │ │ • globals.js │ │ • globals.js        │
│              │ │ • ui.js      │ │                     │
└──────────────┘ └──────────────┘ └─────────────────────┘
                        │
                        │ import
                        │
   ┌────────────────────┴──────────────────────┐
   │                                           │
   ▼                                           ▼
┌──────────────────┐                  ┌────────────────────┐
│  products.js     │                  │  categories.js     │
│                  │                  │                    │
│ Display Products │◄─────import──────┤ Category Display   │
│ Filtering        │                  │ Category Filtering │
│ Sorting          │                  │ Dropdown Menu      │
│ Infinite Scroll  │                  │                    │
│ Product Cards    │                  │ Dependencies:      │
│                  │                  │ • globals.js       │
│ Dependencies:    │                  │ • products.js      │
│ • globals.js     │                  │ • utils.js         │
│ • utils.js       │                  │                    │
│ • cart.js        │                  │                    │
│ • ui.js          │                  │                    │
└──────────────────┘                  └────────────────────┘
         ▲
         │ import
         │
┌────────┴──────────┐
│   search.js       │
│                   │
│ Search Input      │
│ Suggestions       │
│ URL Navigation    │
│                   │
│ Dependencies:     │
│ • globals.js      │
│                   │
└───────────────────┘
```

## 🔄 Data Flow

### 1. **Application Startup**
```
Browser → index.html → main.js → Initialize Modules
                                       ↓
                              Load Products from Supabase
                                       ↓
                              Populate globals.allProducts
                                       ↓
                              Render Categories & Products
```

### 2. **User Adds Product to Cart**
```
Product Card → Add to Cart Button Click
                     ↓
              cart.addToCart(productId)
                     ↓
         Find product in globals.allProducts
                     ↓
         Add to globals.cartItems
                     ↓
         cart.saveCartToStorage()
                     ↓
         cart.updateCartCount()
         cart.updateCartDisplay()
                     ↓
         ui.showNotification("Added to cart!")
```

### 3. **User Filters by Category**
```
Category Card Click → categoriesModule.filterByCategory(categoryId)
                                   ↓
                      products.filterByCategory(categoryId)
                                   ↓
                      Filter globals.allProducts
                                   ↓
                      Set globals.displayedProducts
                                   ↓
                      products.renderProducts()
                                   ↓
                      Update product grid display
```

### 4. **User Searches for Product**
```
Search Input → Type Query
                   ↓
        search.showSearchSuggestions(query)
                   ↓
        Filter globals.allProducts by query
                   ↓
        Display matching products
                   ↓
        User clicks suggestion
                   ↓
        Navigate to search.html?q=product
```

### 5. **User Login Flow**
```
Login Button → auth.showLoginModal()
                   ↓
        Display step 1 (phone/name input)
                   ↓
        User submits → auth.handleMobileSubmit()
                   ↓
        Call Supabase Auth API
                   ↓
        Display step 2 (OTP input)
                   ↓
        User enters OTP → auth.handleOtpSubmit()
                   ↓
        Verify with Supabase
                   ↓
        Set globals.currentUser
                   ↓
        Update UI → auth.updateUserDisplay()
                   ↓
        Restore cart from server
```

## 📦 Module Responsibilities

| Module | Responsibility | Size | Complexity |
|--------|---------------|------|------------|
| **main.js** | Orchestration, initialization | Small | Low |
| **globals.js** | State management, constants | Small | Low |
| **utils.js** | Pure helper functions | Small | Low |
| **ui.js** | UI components, notifications | Medium | Low |
| **auth.js** | Authentication, session mgmt | Large | Medium |
| **cart.js** | Cart operations, persistence | Large | Medium |
| **search.js** | Search logic, suggestions | Medium | Low |
| **products.js** | Product display, filtering | Large | Medium |
| **categories.js** | Category display, navigation | Small | Low |

## 🔌 External Dependencies

```
┌─────────────────────────────────────────┐
│         External Scripts                 │
├─────────────────────────────────────────┤
│                                          │
│  1. supabase-client.js                   │
│     - Provides: window.supabaseClient    │
│     - Provides: window.supabaseAuth      │
│     - Provides: window.orderManager      │
│     - Provides: getAllProducts()         │
│                                          │
│  2. app-config.js                        │
│     - Provides: window.APP_CONFIG        │
│     - Contains: API keys, config         │
│                                          │
│  3. Tailwind CSS (CDN)                   │
│     - Provides: Utility classes          │
│                                          │
│  4. Font Awesome (CDN)                   │
│     - Provides: Icons                    │
│                                          │
└─────────────────────────────────────────┘
```

## 🎯 Module Import Rules

### ✅ Good Practices
```javascript
// Import only what you need
import { currentUser, setCurrentUser } from './globals.js';

// Import related functions together
import { showNotification, showErrorMessage } from './ui.js';

// Use named exports
export function addToCart(productId) { ... }
export const cartModule = { addToCart, removeFromCart };
```

### ❌ Bad Practices
```javascript
// Don't import everything
import * as globals from './globals.js'; // Avoid

// Don't create circular dependencies
// auth.js importing cart.js AND cart.js importing auth.js

// Don't use default exports for multiple functions
export default { func1, func2, func3 }; // Avoid
```

## 🔐 State Management Pattern

```javascript
// globals.js - Single source of truth
export let currentUser = null;
export function setCurrentUser(value) {
    currentUser = value;
}

// auth.js - Modify state through setters
import { setCurrentUser } from './globals.js';
function login(user) {
    setCurrentUser(user); // ✅ Controlled update
}

// products.js - Read state
import { currentUser } from './globals.js';
function checkUserAccess() {
    if (currentUser) { // ✅ Read-only access
        // ...
    }
}
```

## 🚀 Future Enhancements

### Potential New Modules
1. **orders.js** - Order management (currently in script.js.backup)
2. **wishlist.js** - Wishlist functionality
3. **location.js** - Google Maps integration
4. **slider.js** - Hero slider
5. **reviews.js** - Product reviews
6. **filters.js** - Advanced filtering
7. **mobile-nav.js** - Mobile navigation

### Build Optimization
```bash
# When ready for production
npm install webpack webpack-cli
# Bundle modules into optimized build
# Add minification and tree-shaking
```

### Testing Framework
```bash
# Add unit tests per module
npm install jest
# Test each module in isolation
```

## 📚 Documentation Standards

Each module should have:
```javascript
/**
 * Module Name
 * Brief description of responsibility
 */

// Import section with comments
import { dependency } from './module.js';

// Constants section

// Main functions with JSDoc

// Export section

/**
 * Function description
 * @param {string} param - Parameter description
 * @returns {boolean} - Return value description
 */
export function myFunction(param) {
    // Implementation
}
```

## ✨ Benefits of This Architecture

1. **Separation of Concerns** - Each module has one job
2. **Testability** - Test modules independently
3. **Reusability** - Import utilities anywhere
4. **Maintainability** - Easy to find and fix code
5. **Scalability** - Add new modules without touching existing ones
6. **Collaboration** - Multiple devs work on different modules
7. **Performance** - Browser caches individual modules
8. **Debugging** - Clear stack traces point to specific module

## 🎓 Learning Path

For new developers:
1. Start with **globals.js** - understand state
2. Read **utils.js** - learn helper functions
3. Study **ui.js** - see UI patterns
4. Deep dive into **products.js** - main functionality
5. Explore **auth.js** - complex flow example
6. Understand **main.js** - initialization order

---

**This modular architecture transforms a 5,871-line monolith into manageable, maintainable modules! 🎉**

