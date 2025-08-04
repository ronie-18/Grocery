# 🛒 Near & Now - Simple Online Grocery Store

A clean, simple e-commerce website for online grocery shopping with basic cart functionality.

## 🚀 **Quick Start**

```bash
# Start a simple web server
python3 -m http.server 8000

# Or use any other web server
# If you have VS Code Live Server extension, just right-click index.html and "Open with Live Server"
```

Open your browser to: `http://localhost:8000`

## ✨ **Features**

- 🛍️ **Product Catalog** with search and filtering
- 🛒 **Shopping Cart** with localStorage persistence
- 📱 **Mobile Responsive** design
- ⚡ **Fast and Lightweight** - no complex dependencies
- 🎨 **Beautiful UI** with Tailwind CSS

## 📁 **Project Structure**

```
Grocery/
├── index.html              # Main website
├── script.js               # All functionality
├── products-data.js        # Product database
├── all-products.html       # Full product catalog
├── checkout.html           # Checkout page
└── README.md              # This file
```

## 🛠️ **How It Works**

### **Products**
Products are stored in `products-data.js` as a simple JavaScript array. To add new products, edit this file directly.

### **Shopping Cart**
- Simple localStorage-based cart system
- Add/remove products with click
- Persistent across browser sessions
- No server required

### **Styling**
- Uses Tailwind CSS from CDN
- Font Awesome icons
- Custom CSS for enhanced features

## 🔧 **Customization**

### **Adding Products**
Edit `products-data.js` and add new product objects:

```javascript
{
    id: "new-product-1",
    name: "Product Name",
    category: "category",
    size: "1kg",
    price: "₹299",
    originalPrice: "₹399",
    image: "image-url",
    rating: 4.5,
    reviews: 45,
    discount: 25,
    inStock: true
}
```

### **Categories**
Categories are defined in `script.js` in the `categories` array.

### **Colors and Styling**
Main colors are defined in Tailwind config in `index.html`:
- Primary: `#059669`
- Secondary: `#047857`
- Accent: `#10b981`

## 🌐 **Deployment**

This is a static website that can be deployed anywhere:

- **GitHub Pages**: Just push to a repository and enable GitHub Pages
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect your repository
- **Any Web Host**: Upload all files to your hosting directory

## 📱 **Browser Support**

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## 🔧 **No Build Process Required**

This is a vanilla HTML/CSS/JavaScript project with no build process, bundlers, or complex setup. Just open in a browser and it works!

---

**🎉 Ready to go! Your simple grocery store is up and running! 🛒**