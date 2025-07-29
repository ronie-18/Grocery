#!/usr/bin/env node

/**
 * Products Data Sync Script
 * Automatically syncs products from Firestore to products-data.js file
 * Run this script periodically or trigger it from admin panel
 */

const fs = require('fs');
const path = require('path');

// Firebase Admin SDK setup
const admin = require('firebase-admin');

// Initialize Firebase Admin (you'll need to add your service account key)
const serviceAccount = require('./firebase-service-account.json'); // You'll need to add this file

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://near-and-now-default-rtdb.firebaseio.com" // Replace with your Firebase database URL
});

const db = admin.firestore();

// Predefined sizes (keep in sync with products-data.js)
const predefinedSizes = [
  { value: "50g", label: "50g" },
  { value: "100g", label: "100g" },
  { value: "200g", label: "200g" },
  { value: "250g", label: "250g" },
  { value: "500g", label: "500g" },
  { value: "1kg", label: "1kg" },
  { value: "2kg", label: "2kg" },
  { value: "5kg", label: "5kg" },
  { value: "50ml", label: "50ml" },
  { value: "100ml", label: "100ml" },
  { value: "250ml", label: "250ml" },
  { value: "500ml", label: "500ml" },
  { value: "1L", label: "1L" },
  { value: "2L", label: "2L" },
  { value: "1pc", label: "1 piece" },
  { value: "2pc", label: "2 pieces" },
  { value: "5pc", label: "5 pieces" },
  { value: "10pc", label: "10 pieces" },
  { value: "1dozen", label: "1 dozen" },
  { value: "custom", label: "Custom Size" }
];

async function syncProductsFromFirestore() {
  try {
    console.log('🔄 Starting products sync from Firestore...');
    
    // Fetch all products from Firestore
    console.log('📡 Fetching products from Firestore...');
    const snapshot = await db.collection('products').get();

    if (snapshot.empty) {
      console.log('⚠️ No products found in Firestore');
      return;
    }

    console.log(`📦 Found ${snapshot.size} total products in Firestore`);

    const products = [];
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      // Only include non-deleted products
      if (!data.deleted) {
        products.push({
          id: doc.id,
          ...data
        });
      }
    });

    console.log(`✅ Filtered to ${products.length} active products`);

    console.log(`📦 Found ${products.length} products in Firestore`);

    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
      const category = product.category || 'miscellaneous';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push(product);
    });

    // Generate the updated products-data.js content
    const fileContent = generateProductsFileContent(productsByCategory);
    
    // Write to products-data.js file
    const outputPath = path.join(__dirname, '..', 'products-data.js');
    
    // Create backup of existing file
    const backupPath = path.join(__dirname, '..', `products-data.js.backup.${Date.now()}`);
    if (fs.existsSync(outputPath)) {
      fs.copyFileSync(outputPath, backupPath);
      console.log(`📋 Created backup: ${path.basename(backupPath)}`);
    }
    
    // Write new file
    fs.writeFileSync(outputPath, fileContent, 'utf8');
    console.log(`✅ Successfully updated products-data.js with ${products.length} products`);
    
    // Log summary by category
    console.log('\n📊 Products by category:');
    Object.keys(productsByCategory).forEach(category => {
      console.log(`  ${category}: ${productsByCategory[category].length} products`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing products:', error);
    process.exit(1);
  }
}

function generateProductsFileContent(productsByCategory) {
  let content = `// Predefined sizes/weights available for products\n`;
  content += `const predefinedSizes = ${JSON.stringify(predefinedSizes, null, 2)};\n\n`;
  
  content += `// Helper function to get predefined sizes\n`;
  content += `function getPredefinedSizes() {\n`;
  content += `  return predefinedSizes;\n`;
  content += `}\n\n`;
  
  content += `// Products organized by categories for better management\n`;
  content += `// Last updated: ${new Date().toISOString()}\n`;
  content += `const productsByCategory = {\n`;
  
  const categories = Object.keys(productsByCategory).sort();
  
  categories.forEach((category, categoryIndex) => {
    content += `  ${category}: [`;
    
    const categoryProducts = productsByCategory[category];
    categoryProducts.forEach((product, productIndex) => {
      content += `{\n`;
      content += `      "id": "${product.id}",\n`;
      content += `      "name": "${escapeCString(product.name)}",\n`;
      content += `      "image": "${product.image || ''}",\n`;
      content += `      "price": "${product.price}",\n`;
      
      if (product.originalPrice) {
        content += `      "originalPrice": "${product.originalPrice}",\n`;
      }
      if (product.size) {
        content += `      "size": "${product.size}",\n`;
      }
      
      content += `      "rating": ${product.rating || 4.0},\n`;
      content += `      "reviews": ${product.reviews || 0},\n`;
      content += `      "inStock": ${product.inStock !== false},\n`;
      content += `      "discount": ${product.discount || 0},\n`;
      content += `      "category": "${category}"`;
      
      // Add reviews list if available
      if (product.reviewsList && Array.isArray(product.reviewsList) && product.reviewsList.length > 0) {
        content += `,\n      "reviewsList": ${JSON.stringify(product.reviewsList, null, 8)}`;
      }
      
      content += `\n    }`;
      
      if (productIndex < categoryProducts.length - 1) {
        content += `,`;
      }
      content += `\n`;
    });
    
    content += `  ]`;
    if (categoryIndex < categories.length - 1) {
      content += `,`;
    }
    content += `\n`;
  });
  
  content += `};\n\n`;
  
  // Add helper functions
  content += `// Helper function to get all products in a flat array\n`;
  content += `function getAllProducts() {\n`;
  content += `  const allProducts = [];\n`;
  content += `  for (const [categoryName, products] of Object.entries(productsByCategory)) {\n`;
  content += `    // Add category information back to each product when flattening\n`;
  content += `    const productsWithCategory = products.map(product => ({\n`;
  content += `      ...product,\n`;
  content += `      category: categoryName\n`;
  content += `    }));\n`;
  content += `    allProducts.push(...productsWithCategory);\n`;
  content += `  }\n`;
  content += `  return allProducts;\n`;
  content += `}\n\n`;
  
  content += `// Helper function to get products by specific category\n`;
  content += `function getProductsByCategory(categoryName) {\n`;
  content += `  const categoryProducts = productsByCategory[categoryName] || [];\n`;
  content += `  // Add category information back to each product\n`;
  content += `  return categoryProducts.map(product => ({\n`;
  content += `    ...product,\n`;
  content += `    category: categoryName\n`;
  content += `  }));\n`;
  content += `}\n\n`;
  
  content += `// Helper function to get all available categories\n`;
  content += `function getAvailableCategories() {\n`;
  content += `  return Object.keys(productsByCategory);\n`;
  content += `}\n\n`;
  
  content += `// Main products array for backward compatibility\n`;
  content += `const products = getAllProducts();\n`;
  
  return content;
}

function escapeCString(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

// Main execution
if (require.main === module) {
  syncProductsFromFirestore()
    .then(() => {
      console.log('🎉 Sync completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Sync failed:', error);
      process.exit(1);
    });
}

module.exports = { syncProductsFromFirestore }; 