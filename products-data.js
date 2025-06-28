// Products organized by categories for better management
const productsByCategory = {
  staples: [
    {
      "id": "basmati-rice-1",
      "name": "Basmati Rice",
      "image": "https://img.freepik.com/free-photo/top-view-raw-rice-inside-plate-dark-desk_179666-27235.jpg?semt=ais_hybrid&w=740",
      "description": "Premium long-grain basmati rice, 5kg pack. Perfect for biryanis and pulao.",
      "price": "₹450",
      "originalPrice": "₹500",
      "rating": 4.5,
      "reviews": 128,
      "inStock": true,
      "discount": 10,
      "category": "staples",
      "reviewsList": [
        {
          "id": "review-1",
          "userName": "Priya Sharma",
          "rating": 5,
          "comment": "Excellent quality basmati rice! The grains are long and aromatic. Perfect for biryani.",
          "date": "2024-01-15",
          "verified": true
        },
        {
          "id": "review-2",
          "userName": "Rajesh Kumar",
          "rating": 4,
          "comment": "Good quality rice, cooks well. Slightly expensive but worth it for special occasions.",
          "date": "2024-01-10",
          "verified": true
        },
        {
          "id": "review-3",
          "userName": "Anita Patel",
          "rating": 5,
          "comment": "Best basmati rice I've ever used. The aroma is amazing and grains are perfectly separated.",
          "date": "2024-01-08",
          "verified": true
        }
      ]
    },
    {
      "id": "toor-dal-1",
      "name": "Toor Dal",
      "image": "https://familyemart.com/wp-content/uploads/2024/08/toor-dal-dry.png",
      "description": "Yellow split pigeon peas, 1kg pack. Rich in protein and essential nutrients.",
      "price": "₹160",
      "originalPrice": "₹180",
      "rating": 4.3,
      "reviews": 95,
      "inStock": true,
      "discount": 11,
      "category": "staples",
      "reviewsList": [
        {
          "id": "review-4",
          "userName": "Meera Singh",
          "rating": 4,
          "comment": "Good quality dal, cooks quickly and tastes great. Good value for money.",
          "date": "2024-01-12",
          "verified": true
        },
        {
          "id": "review-5",
          "userName": "Vikram Malhotra",
          "rating": 5,
          "comment": "Excellent dal quality. Clean and fresh. Highly recommended!",
          "date": "2024-01-05",
          "verified": true
        }
      ]
    },
    {
      "id": "wheat-atta-1",
      "name": "Whole Wheat Atta",
      "image": "https://w7.pngwing.com/pngs/521/890/png-transparent-atta-flour-maida-flour-bakery-bread-flour-food-bread-superfood-thumbnail.png",
      "description": "Whole wheat flour, 5kg pack. Stone ground for better nutrition.",
      "price": "₹250",
      "originalPrice": "₹280",
      "rating": 4.2,
      "reviews": 167,
      "inStock": true,
      "discount": 11,
      "category": "staples",
      "reviewsList": [
        {
          "id": "review-6",
          "userName": "Sunita Verma",
          "rating": 4,
          "comment": "Good quality atta. Makes soft rotis. Fresh and clean packaging.",
          "date": "2024-01-14",
          "verified": true
        },
        {
          "id": "review-7",
          "userName": "Amit Gupta",
          "rating": 4,
          "comment": "Stone ground atta is definitely better. Good for health conscious people.",
          "date": "2024-01-09",
          "verified": true
        }
      ]
    },
    {
      "id": "chana-dal-1",
      "name": "Chana Dal",
      "image": "https://t3.ftcdn.net/jpg/08/70/25/74/360_F_870257492_9Sn0NTaLMyURnHmhknUN0KQ3DYG6lw5t.jpg",
      "description": "Split Bengal gram, 1kg pack. High protein content and great taste.",
      "price": "₹130",
      "originalPrice": "₹150",
      "rating": 4.3,
      "reviews": 112,
      "inStock": true,
      "discount": 13,
      "category": "staples",
      "reviewsList": [
        {
          "id": "review-8",
          "userName": "Kavita Reddy",
          "rating": 5,
          "comment": "Excellent chana dal. Clean, fresh and cooks perfectly. Great for protein intake.",
          "date": "2024-01-11",
          "verified": true
        },
        {
          "id": "review-9",
          "userName": "Suresh Iyer",
          "rating": 4,
          "comment": "Good quality dal. Reasonable price and good quantity.",
          "date": "2024-01-07",
          "verified": true
        }
      ]
    }
  ],

  spices: [
    {
      "id": "turmeric-powder-1",
      "name": "Turmeric Powder",
      "image": "https://www.viralspices.com/wp-content/uploads/2024/11/Untitled-1-624x312.jpg",
      "description": "Pure organic turmeric powder, 100g pack. Natural anti-inflammatory properties.",
      "price": "₹45",
      "originalPrice": "₹55",
      "rating": 4.7,
      "reviews": 203,
      "inStock": true,
      "discount": 18,
      "category": "spices",
      "reviewsList": [
        {
          "id": "review-10",
          "userName": "Dr. Neha Kapoor",
          "rating": 5,
          "comment": "Pure organic turmeric. Great for health benefits. Bright color and strong aroma.",
          "date": "2024-01-13",
          "verified": true
        },
        {
          "id": "review-11",
          "userName": "Ramesh Patel",
          "rating": 4,
          "comment": "Good quality turmeric powder. Organic and pure. Good for cooking and health.",
          "date": "2024-01-06",
          "verified": true
        }
      ]
    },
    {
      "id": "garam-masala-1",
      "name": "Garam Masala",
      "image": "https://img.favpng.com/18/10/21/indian-cuisine-spice-mix-garam-masala-food-png-favpng-XQkNqYG2guqW8XfQze5n9Q2yw.jpg",
      "description": "Authentic blend of ground spices, 100g pack. Perfect for Indian curries.",
      "price": "₹85",
      "originalPrice": "₹95",
      "rating": 4.6,
      "reviews": 156,
      "inStock": true,
      "discount": 11,
      "category": "spices",
      "reviewsList": [
        {
          "id": "review-12",
          "userName": "Chef Arjun Singh",
          "rating": 5,
          "comment": "Excellent garam masala blend. Perfect balance of spices. Makes curries taste authentic.",
          "date": "2024-01-12",
          "verified": true
        },
        {
          "id": "review-13",
          "userName": "Lakshmi Devi",
          "rating": 4,
          "comment": "Good quality masala. Aromatic and flavorful. Good for traditional Indian cooking.",
          "date": "2024-01-08",
          "verified": true
        }
      ]
    },
    {
      "id": "red-chili-powder-1",
      "name": "Red Chili Powder",
      "image": "https://t4.ftcdn.net/jpg/06/68/59/49/360_F_668594985_30FQV0Mhp8TDVpFQWHYG0QuGM99zChDp.jpg",
      "description": "Premium quality red chili powder, 200g pack. Adds perfect heat to dishes.",
      "price": "₹75",
      "originalPrice": "₹85",
      "rating": 4.4,
      "reviews": 89,
      "inStock": true,
      "discount": 12,
      "category": "spices",
      "reviewsList": [
        {
          "id": "review-14",
          "userName": "Spice Lover",
          "rating": 4,
          "comment": "Good quality chili powder. Perfect heat level for Indian cooking.",
          "date": "2024-01-10",
          "verified": true
        }
      ]
    },
    {
      "id": "cardamom-1",
      "name": "Cardamom",
      "image": "https://www.pngplay.com/wp-content/uploads/7/Cardamom-PNG-Photos.png",
      "description": "Premium green cardamom, 50g pack. Aromatic spice for desserts.",
      "price": "₹320",
      "originalPrice": "₹350",
      "rating": 4.8,
      "reviews": 145,
      "inStock": true,
      "discount": 9,
      "category": "spices",
      "reviewsList": [
        {
          "id": "review-15",
          "userName": "Sweet Tooth",
          "rating": 5,
          "comment": "Premium quality cardamom. Amazing aroma and perfect for desserts and tea.",
          "date": "2024-01-11",
          "verified": true
        }
      ]
    }
  ],

  dairy: [
    {
      "id": "fresh-paneer-1",
      "name": "Fresh Paneer",
      "image": "https://img.freepik.com/premium-photo/paneer-isolated-white-background-generative-ai_21085-38553.jpg?semt=ais_hybrid&w=740",
      "description": "Fresh cottage cheese, 200g pack. Made daily with pure milk.",
      "price": "₹80",
      "originalPrice": "₹90",
      "rating": 4.4,
      "reviews": 87,
      "inStock": true,
      "discount": 11,
      "category": "dairy",
      "reviewsList": [
        {
          "id": "review-16",
          "userName": "Paneer Lover",
          "rating": 4,
          "comment": "Fresh and soft paneer. Perfect for curries and snacks.",
          "date": "2024-01-13",
          "verified": true
        }
      ]
    },
    {
      "id": "cow-ghee-1",
      "name": "Pure Cow Ghee",
      "image": "https://5.imimg.com/data5/SELLER/Default/2024/3/399027791/HJ/LK/FV/15095982/pure-cow-ghee-500x500.jpg",
      "description": "Pure cow ghee, 500ml jar. Traditional churned for authentic taste.",
      "price": "₹450",
      "originalPrice": "₹520",
      "rating": 4.8,
      "reviews": 234,
      "inStock": true,
      "discount": 13,
      "category": "dairy",
      "reviewsList": [
        {
          "id": "review-17",
          "userName": "Ghee Enthusiast",
          "rating": 5,
          "comment": "Pure and authentic cow ghee. Amazing taste and aroma. Worth every penny.",
          "date": "2024-01-14",
          "verified": true
        },
        {
          "id": "review-18",
          "userName": "Traditional Cook",
          "rating": 5,
          "comment": "Best ghee I've ever used. Traditional taste and perfect for all cooking needs.",
          "date": "2024-01-09",
          "verified": true
        }
      ]
    },
    {
      "id": "coconut-oil-1",
      "name": "Coconut Oil",
      "image": "https://t3.ftcdn.net/jpg/06/38/49/08/360_F_638490855_Xc9sCWftHHJ5mYpjqKne7W4IxlWDUOqd.jpg",
      "description": "Pure coconut oil, 500ml bottle. Cold-pressed for maximum nutrition.",
      "price": "₹180",
      "originalPrice": "₹200",
      "rating": 4.6,
      "reviews": 156,
      "inStock": true,
      "discount": 10,
      "category": "dairy",
      "reviewsList": [
        {
          "id": "review-19",
          "userName": "Health Conscious",
          "rating": 4,
          "comment": "Pure cold-pressed coconut oil. Great for cooking and hair care.",
          "date": "2024-01-12",
          "verified": true
        }
      ]
    }
  ],

  vegetables: [
    {
      "id": "onions-1",
      "name": "Onions",
      "image": "https://i.pinimg.com/736x/df/b2/8b/dfb28b96f1dc9cf2dce282cda2b57701.jpg",
      "description": "Fresh red onions, 1kg pack. Essential for Indian cooking.",
      "price": "₹40",
      "originalPrice": "₹50",
      "rating": 4.2,
      "reviews": 234,
      "inStock": true,
      "discount": 20,
      "category": "vegetables",
      "reviewsList": [
        {
          "id": "review-20",
          "userName": "Home Chef",
          "rating": 4,
          "comment": "Fresh and good quality onions. Perfect size for cooking.",
          "date": "2024-01-15",
          "verified": true
        }
      ]
    },
    {
      "id": "potatoes-1",
      "name": "Potatoes",
      "image": "https://w7.pngwing.com/pngs/186/818/png-transparent-brown-potatoes-illustration-potato-potato-food-smoothie-gym.png",
      "description": "Fresh potatoes, 2kg pack. Versatile vegetable for various dishes.",
      "price": "₹60",
      "originalPrice": "₹70",
      "rating": 4.1,
      "reviews": 189,
      "inStock": true,
      "discount": 14,
      "category": "vegetables",
      "reviewsList": [
        {
          "id": "review-21",
          "userName": "Potato Fan",
          "rating": 4,
          "comment": "Good quality potatoes. Fresh and clean. Good for all types of cooking.",
          "date": "2024-01-13",
          "verified": true
        }
      ]
    },
    {
      "id": "tomatoes-1",
      "name": "Tomatoes",
      "image": "https://freepngimg.com/download/tomato/159306-fresh-photos-tomatoes-bunch-free-photo.png",
      "description": "Fresh ripe tomatoes, 1kg pack. Perfect for curries and salads.",
      "price": "₹35",
      "originalPrice": "₹45",
      "rating": 4.3,
      "reviews": 167,
      "inStock": true,
      "discount": 22,
      "category": "vegetables",
      "reviewsList": [
        {
          "id": "review-22",
          "userName": "Tomato Lover",
          "rating": 4,
          "comment": "Fresh and ripe tomatoes. Perfect for cooking and salads.",
          "date": "2024-01-14",
          "verified": true
        }
      ]
    }
  ],

  snacks: [
    {
      "id": "masala-papad-1",
      "name": "Masala Papad",
      "image": "https://5.imimg.com/data5/SELLER/Default/2025/3/494508142/NP/WE/CR/16142548/urad-masala-papad.png",
      "description": "Spicy lentil wafers, 200g pack. Crispy and flavorful snack.",
      "price": "₹60",
      "originalPrice": "₹70",
      "rating": 4.1,
      "reviews": 76,
      "inStock": true,
      "discount": 14,
      "category": "snacks",
      "reviewsList": [
        {
          "id": "review-23",
          "userName": "Snack Lover",
          "rating": 4,
          "comment": "Crispy and tasty papad. Perfect with meals or as a snack.",
          "date": "2024-01-11",
          "verified": true
        }
      ]
    },
    {
      "id": "namkeen-mix-1",
      "name": "Namkeen Mix",
      "image": "https://png.pngtree.com/png-vector/20240812/ourlarge/pngtree-explore-the-flavors-of-indian-crunchy-mix-namkeen-png-image_13452116.png",
      "description": "Assorted namkeen mix, 250g pack. Perfect tea-time snack.",
      "price": "₹95",
      "originalPrice": "₹110",
      "rating": 4.0,
      "reviews": 78,
      "inStock": true,
      "discount": 14,
      "category": "snacks",
      "reviewsList": [
        {
          "id": "review-24",
          "userName": "Tea Time",
          "rating": 4,
          "comment": "Good variety of namkeen. Perfect for tea time. Fresh and crispy.",
          "date": "2024-01-10",
          "verified": true
        }
      ]
    }
  ],

  beverages: [
    {
      "id": "assam-tea-1",
      "name": "Assam Tea Powder",
      "image": "https://img.favpng.com/10/5/0/assam-tea-tea-leaf-grading-green-tea-black-tea-png-favpng-PnS4rCcZ8HWXN43QWhHEjQHWf.jpg",
      "description": "Premium Assam tea leaves, 250g pack. Strong and aromatic blend.",
      "price": "₹120",
      "originalPrice": "₹140",
      "rating": 4.5,
      "reviews": 98,
      "inStock": true,
      "discount": 14,
      "category": "beverages",
      "reviewsList": [
        {
          "id": "review-25",
          "userName": "Tea Connoisseur",
          "rating": 5,
          "comment": "Excellent Assam tea. Strong and aromatic. Perfect for morning tea.",
          "date": "2024-01-12",
          "verified": true
        },
        {
          "id": "review-26",
          "userName": "Morning Person",
          "rating": 4,
          "comment": "Good quality tea powder. Strong flavor and good aroma.",
          "date": "2024-01-08",
          "verified": true
        }
      ]
    }
  ]
};

// Helper function to get all products as a flat array (for backward compatibility)
function getAllProducts() {
  const allProducts = [];
  for (const [categoryName, products] of Object.entries(productsByCategory)) {
    // Add category information back to each product when flattening
    const productsWithCategory = products.map(product => ({
      ...product,
      category: categoryName
    }));
    allProducts.push(...productsWithCategory);
  }
  return allProducts;
}

// Helper function to get products by specific category
function getProductsByCategory(categoryName) {
  const categoryProducts = productsByCategory[categoryName] || [];
  // Add category information back to each product
  return categoryProducts.map(product => ({
    ...product,
    category: categoryName
  }));
}

// Helper function to get all available categories
function getAvailableCategories() {
  return Object.keys(productsByCategory);
}

// Main products array for backward compatibility
const products = getAllProducts();