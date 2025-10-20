# Testing Guide - Modular Refactoring
**Near & Now Grocery App**

## 🧪 Quick Test Procedure

### 1. **Initial Load Test**
```bash
# Open the website in a browser
open index.html
# or
python3 -m http.server 8000
# Then navigate to http://localhost:8000
```

**✅ Expected Results:**
- Page loads without errors
- Console shows: "🚀 Starting Near & Now website initialization..."
- Console shows: "✅ Loaded X products"
- Console shows: "✅ Near & Now website fully initialized!"
- Products display in grid
- Categories show in carousel
- No JavaScript errors in console

**❌ Common Issues:**
- If you see CORS errors, you need to run a local server (use `python3 -m http.server`)
- If modules don't load, check browser console for specific error

---

### 2. **Product Display Test**
**Steps:**
1. Scroll down to products section
2. Verify products are displayed
3. Check product images load
4. Verify prices are shown
5. Check "Add to Cart" buttons are visible

**✅ Expected:** All products display with correct data

---

### 3. **Category Filtering Test**
**Steps:**
1. Click on a category (e.g., "Staples", "Spices")
2. Verify products filter correctly
3. Check notification shows "Showing X products"
4. Verify page scrolls to products section

**✅ Expected:** Only products from selected category shown

---

### 4. **Search Test**
**Steps:**
1. Click search bar
2. Type "rice" (or any product name)
3. Verify search suggestions appear
4. Click a suggestion
5. Verify it navigates to search page

**✅ Expected:** 
- Suggestions appear as you type
- Clicking suggestion takes you to search.html
- Search results show matching products

---

### 5. **Cart Test**
**Steps:**
1. Click "Add to Cart" on any product
2. Verify notification: "X added to cart!"
3. Check cart count badge updates (top right)
4. Verify quantity controls appear on product card
5. Click cart icon to open cart sidebar
6. Verify product appears in cart
7. Try increasing/decreasing quantity
8. Try removing item
9. Verify cart total updates

**✅ Expected:** 
- Cart count updates correctly
- Cart sidebar shows items
- Quantity controls work
- Total calculates correctly
- Items persist after page refresh

---

### 6. **Login/Logout Test**
**Steps:**
1. Click "Account" or "Login" button
2. Verify login modal opens
3. Enter name and mobile number
4. Click "Send OTP"
5. Enter OTP (check SMS or use test OTP from Supabase)
6. Verify successful login
7. Check user name displays in header
8. Click user dropdown
9. Click "Logout"
10. Verify logout successful

**✅ Expected:**
- Login modal works smoothly
- OTP sent and verified
- User name displays after login
- Cart persists after login
- Logout clears user session

---

### 7. **Mobile Navigation Test**
**Steps:**
1. Resize browser to mobile size (or use mobile device)
2. Click hamburger menu icon
3. Verify mobile menu opens
4. Try navigating to different sections
5. Verify menu closes after selection

**✅ Expected:** Mobile menu works on small screens

---

### 8. **Checkout Flow Test**
**Steps:**
1. Add items to cart
2. Click "Proceed to Checkout"
3. If not logged in, verify login prompt
4. After login, verify redirect to checkout.html
5. Verify cart items display on checkout page
6. Fill in delivery details
7. Verify order placement works

**✅ Expected:** Complete checkout flow works end-to-end

---

### 9. **Browser Console Test**
**Steps:**
1. Open browser DevTools (F12)
2. Check Console tab
3. Look for any errors (red text)
4. Verify no "undefined" or "null" errors
5. Check Network tab for failed requests

**✅ Expected:**
- No console errors
- All JavaScript files load successfully
- No 404 errors in Network tab

---

### 10. **Cross-Browser Test**
Test in multiple browsers:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if on Mac)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**✅ Expected:** Works in all modern browsers

---

## 🐛 Common Issues & Fixes

### Issue: "Module not found" error
**Fix:** Make sure you're running a local server, not opening file:// directly

### Issue: Products don't load
**Fix:** Check Supabase connection in console, verify `supabase-client.js` loads first

### Issue: Cart doesn't persist
**Fix:** Check localStorage isn't disabled, verify `saveCartToStorage()` is called

### Issue: Login doesn't work
**Fix:** Verify Supabase Auth is configured correctly, check phone number format

### Issue: Styles look broken
**Fix:** Verify Tailwind CSS CDN loads, check network tab

---

## 🔍 Debug Mode

Add this to browser console for verbose logging:
```javascript
localStorage.setItem('debug', 'true');
location.reload();
```

Disable debug:
```javascript
localStorage.removeItem('debug');
location.reload();
```

---

## ✅ Sign-off Checklist

Before marking as complete, verify:

- [ ] All pages load without errors
- [ ] Products display correctly
- [ ] Categories filter products
- [ ] Search works and shows suggestions
- [ ] Cart add/remove/update works
- [ ] Cart count badge updates
- [ ] Cart persists after refresh
- [ ] Login/logout flow works
- [ ] Mobile navigation works
- [ ] Checkout flow completes
- [ ] No console errors
- [ ] Works in Chrome, Firefox, Safari
- [ ] Works on mobile devices
- [ ] Performance is acceptable
- [ ] No broken images
- [ ] All buttons/links work

---

## 📊 Performance Check

Run Lighthouse audit in Chrome DevTools:
1. Open DevTools (F12)
2. Go to "Lighthouse" tab
3. Click "Generate report"

**Target Scores:**
- Performance: > 80
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

---

## 🚨 Rollback Plan

If critical issues are found:

```bash
# Restore original script.js
mv script.js.backup script.js

# Update index.html back to original
# Change line 1885 back to:
# <script src="script.js?v=4.0"></script>
```

---

## 📞 Support

If you encounter issues:
1. Check browser console for specific errors
2. Review `REFACTORING_SUMMARY.md` for module details
3. Check `script.js.backup` for original implementation
4. Test in different browser to isolate issue

---

## ✨ Success Criteria

The refactoring is successful if:
- ✅ All functionality works as before
- ✅ No new bugs introduced
- ✅ Code is more maintainable
- ✅ Performance is same or better
- ✅ Team can work more efficiently

