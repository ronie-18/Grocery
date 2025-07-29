// Predefined sizes/weights available for products
const predefinedSizes = [
  {
    "value": "50g",
    "label": "50g"
  },
  {
    "value": "100g",
    "label": "100g"
  },
  {
    "value": "200g",
    "label": "200g"
  },
  {
    "value": "250g",
    "label": "250g"
  },
  {
    "value": "500g",
    "label": "500g"
  },
  {
    "value": "1kg",
    "label": "1kg"
  },
  {
    "value": "2kg",
    "label": "2kg"
  },
  {
    "value": "5kg",
    "label": "5kg"
  },
  {
    "value": "50ml",
    "label": "50ml"
  },
  {
    "value": "100ml",
    "label": "100ml"
  },
  {
    "value": "250ml",
    "label": "250ml"
  },
  {
    "value": "500ml",
    "label": "500ml"
  },
  {
    "value": "1L",
    "label": "1L"
  },
  {
    "value": "2L",
    "label": "2L"
  },
  {
    "value": "1pc",
    "label": "1 piece"
  },
  {
    "value": "2pc",
    "label": "2 pieces"
  },
  {
    "value": "5pc",
    "label": "5 pieces"
  },
  {
    "value": "10pc",
    "label": "10 pieces"
  },
  {
    "value": "1dozen",
    "label": "1 dozen"
  },
  {
    "value": "custom",
    "label": "Custom Size"
  }
];

// Helper function to get predefined sizes
function getPredefinedSizes() {
  return predefinedSizes;
}

// Products organized by categories for better management
// Last updated: 2025-07-20T20:07:58.461Z
const productsByCategory = {
  beverages: [{
      "id": "CJotHBBiRsC2OUCJRZaf",
      "name": "Taza (packet)",
      "image": "",
      "price": "₹25",
      "originalPrice": "₹30",
      "rating": 4.2,
      "reviews": 67,
      "inStock": true,
      "discount": 17,
      "category": "beverages"
    },
{
      "id": "KR5FoWJmYMuQSJcNSONo",
      "name": "Assam Tea Powder",
      "image": "https://cupoftea-oregon.com/wp-content/uploads/2024/09/cup_of_tea_oregon_golden_monkey_loose_tea-1500x1125.webp",
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
    },
{
      "id": "O0icz1m0f9ZsTljVDOXR",
      "name": "Tata Gold (100g)",
      "image": "https://m.media-amazon.com/images/I/41m+fYXcoEL._AC_.jpg",
      "price": "₹50",
      "originalPrice": "₹57",
      "rating": 4.6,
      "reviews": 143,
      "inStock": true,
      "discount": 12,
      "category": "beverages"
    },
{
      "id": "VuAwHh3P0GxG4sw3ogQ5",
      "name": "Taza (150g)",
      "image": "",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4.3,
      "reviews": 89,
      "inStock": true,
      "discount": 13,
      "category": "beverages"
    },
{
      "id": "pJKC0nsgpJDBG5dJFbJw",
      "name": "Tata Premium (100g)",
      "image": "",
      "price": "₹60",
      "originalPrice": "₹69",
      "rating": 4.4,
      "reviews": 98,
      "inStock": true,
      "discount": 13,
      "category": "beverages"
    }
  ],
  dairy: [{
      "id": "3So2iRkXNxevYwLK7Rwg",
      "name": "Fresh Paneer",
      "image": "https://img.freepik.com/premium-photo/paneer-isolated-white-background-generative-ai_21085-38553.jpg?semt=ais_hybrid&w=740",
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
      "id": "4JKBUpFK0d8Xdzn2N3T1",
      "name": "Emami",
      "image": "https://www.bbassets.com/media/uploads/p/l/40051736_8-emami-healthy-tasty-soyabean-oil.jpg",
      "price": "₹170",
      "originalPrice": "₹193",
      "rating": 4.6,
      "reviews": 72,
      "inStock": true,
      "discount": 12,
      "category": "dairy"
    },
{
      "id": "90nqVJegvjaNb7N9um09",
      "name": "Fortune",
      "image": "https://www.gorevizon.com/wp-content/uploads/2020/07/1-70.jpg",
      "price": "₹170",
      "originalPrice": "₹209",
      "rating": 4.2,
      "reviews": 232,
      "inStock": true,
      "discount": 19,
      "category": "dairy"
    },
{
      "id": "AxngnUfkwacjhIeUWpzM",
      "name": "Dalda",
      "image": "https://5.imimg.com/data5/SELLER/Default/2022/1/ZV/SV/YS/63605712/dalda-vanaspati-oil.jpg",
      "price": "₹160",
      "originalPrice": "₹185",
      "rating": 4.1,
      "reviews": 86,
      "inStock": true,
      "discount": 14,
      "category": "dairy"
    },
{
      "id": "F9wJ8dtuT2QxUz6ar3Il",
      "name": "Best choice (500g)",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzMVmW7dAN6x7pL5DTsdHVvJ9lV-F0QDqNFg&s",
      "price": "₹75",
      "originalPrice": "₹87",
      "rating": 4.9,
      "reviews": 85,
      "inStock": true,
      "discount": 14,
      "category": "dairy"
    },
{
      "id": "ImlepYCxFX02HpUHYzvn",
      "name": "Pure Cow Ghee",
      "image": "https://5.imimg.com/data5/SELLER/Default/2024/3/399027791/HJ/LK/FV/15095982/pure-cow-ghee-500x500.jpg",
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
      "id": "p3ApbpU6SHPgaqr2atgH",
      "name": "Refine (200g)",
      "image": "https://5.imimg.com/data5/SELLER/Default/2020/12/LK/PA/LY/7045867/200-ml-refined-soyabean-oil-500x500.jpg",
      "price": "₹40",
      "originalPrice": "₹47",
      "rating": 4.4,
      "reviews": 156,
      "inStock": true,
      "discount": 15,
      "category": "dairy"
    },
{
      "id": "r5P7DB5veaV7RuJGFR9F",
      "name": "Best choice (1kg)",
      "image": "https://cdn.dotpe.in/longtail/store-items/8864536/ghaZCO4e.webp",
      "price": "₹130",
      "originalPrice": "₹158",
      "rating": 4.4,
      "reviews": 59,
      "inStock": true,
      "discount": 18,
      "category": "dairy"
    },
{
      "id": "tpG8ynTjS0Be3ozRjOYu",
      "name": "Sorso (1kg)",
      "image": "https://rukminim2.flixcart.com/image/750/900/kmf7ki80/spice-masala/1/q/g/1-black-mustard-seeds-kali-sarso-1kg-pouch-producer-whole-original-imagfbw7zmycjpzc.jpeg?q=20&crop=false",
      "price": "₹0",
      "originalPrice": "₹0",
      "rating": 4,
      "reviews": 161,
      "inStock": true,
      "discount": 0,
      "category": "dairy"
    },
{
      "id": "uPLGOUWwcHKh0G7mTdky",
      "name": "Sorso (200g)",
      "image": "https://rukminim2.flixcart.com/image/750/900/kmf7ki80/spice-masala/1/q/g/1-black-mustard-seeds-kali-sarso-1kg-pouch-producer-whole-original-imagfbw7zmycjpzc.jpeg?q=20&crop=false",
      "price": "₹47",
      "originalPrice": "₹57",
      "rating": 4,
      "reviews": 204,
      "inStock": true,
      "discount": 18,
      "category": "dairy"
    },
{
      "id": "uYPKGsxn56iiA8q9XfAj",
      "name": "Coconut Oil",
      "image": "https://t3.ftcdn.net/jpg/06/38/49/08/360_F_638490855_Xc9sCWftHHJ5mYpjqKne7W4IxlWDUOqd.jpg",
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
    },
{
      "id": "xoWc5TRAX2zZ8jHm7r2S",
      "name": "Masal",
      "image": "https://www.jiomart.com/images/product/original/490052736/mashal-kachi-ghani-mustard-oil-1-l-product-images-o490052736-p490052736-0-202205172236.jpg?im=Resize=(1000,1000)",
      "price": "₹95",
      "originalPrice": "₹115",
      "rating": 4.8,
      "reviews": 48,
      "inStock": true,
      "discount": 17,
      "category": "dairy"
    }
  ],
  household: [{
      "id": "HLkl3DUycaWxrzGjD4Mb",
      "name": "MRP",
      "image": "",
      "price": "₹32",
      "originalPrice": "₹39",
      "rating": 4.7,
      "reviews": 204,
      "inStock": true,
      "discount": 18,
      "category": "household"
    }
  ],
  snacks: [{
      "id": "r32cigPJZFNyHjBR6hlh",
      "name": "Namkeen Mix",
      "image": "https://images.jdmagicbox.com/rep/b2b/shahi-namkeen-mix/shahi-namkeen-mix-7.jpg",
      "price": "₹95",
      "originalPrice": "₹110",
      "rating": 4,
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
    },
{
      "id": "xu2SA3tpMAsS4KvstmWF",
      "name": "Masala Papad",
      "image": "https://media.istockphoto.com/id/666595984/photo/indian-snacks-deep-fried-crackers-or-papad-mung-dal-and-urad-dal-papad-an-indian-fried-dish.jpg?s=612x612&w=0&k=20&c=WNBWP2z6sXYhPSFbfxmVJe1oVkWtQHY-lc7RbWeM84o=",
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
    }
  ],
  spices: [{
      "id": "4k4mOpGS5PdxcGd4uNEa",
      "name": "Shukto",
      "image": "https://m.media-amazon.com/images/I/71GaLeeQDLL.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.5,
      "reviews": 142,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "5dzpmpUhv2LgxqIWF3iH",
      "name": "Lanka (Sunrise 50g)",
      "image": "https://pushanta.com/public/uploads/product_11664085907.jpg",
      "price": "₹27",
      "originalPrice": "₹30",
      "rating": 4.7,
      "reviews": 39,
      "inStock": true,
      "discount": 10,
      "category": "spices"
    },
{
      "id": "A36dljfe1ELoMElaiaES",
      "name": "Pasta",
      "image": "",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 52,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "BLPwLRoKfCMQ3kSD5t2g",
      "name": "Garam Masala",
      "image": "https://www.natureloc.com/image/cache/catalog/New%202022/khada-garam-masala-600x600.png",
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
      "id": "CIBjEom8YUTOKXzrGRvz",
      "name": "Jeera (Cookme 50g)",
      "image": "https://shop.cookme.in/assets/uploads/media-uploader/jeera-powder1647942225.webp",
      "price": "₹42",
      "originalPrice": "₹47",
      "rating": 4,
      "reviews": 181,
      "inStock": true,
      "discount": 11,
      "category": "spices"
    },
{
      "id": "CO437QQ0IsiFgOAzUtCh",
      "name": "Dhania (Cookme 50g)",
      "image": "https://shop.cookme.in/assets/uploads/media-uploader/dhania-powder1647866842.webp",
      "price": "₹18",
      "originalPrice": "₹20",
      "rating": 4.5,
      "reviews": 205,
      "inStock": true,
      "discount": 10,
      "category": "spices"
    },
{
      "id": "J0zNDIA3SZl5yP4cHBle",
      "name": "Haldi (Sunrise 50g)",
      "image": "https://img.thecdn.in/59411/1629348680251_SKU-0280_0.jpg?width=600&format=webp",
      "price": "₹17",
      "originalPrice": "₹20",
      "rating": 4.3,
      "reviews": 77,
      "inStock": true,
      "discount": 15,
      "category": "spices"
    },
{
      "id": "NndpZUvgmLeZnhFfNWDL",
      "name": "Cardamom",
      "image": "https://www.pngplay.com/wp-content/uploads/7/Cardamom-PNG-Photos.png",
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
    },
{
      "id": "PGyY2M6rOHj0RmbWz30F",
      "name": "Anda curry masala",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/assets/products/sliding_images/jpeg/80562891-892c-4253-9233-ddf1d569c93c.jpg?ts=1708588721",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.4,
      "reviews": 137,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "QtWMyG8uFchapUOg80BS",
      "name": "Chili chicken",
      "image": "https://www.bbassets.com/media/uploads/p/xxl/20006012_4-chings-secret-miracal-masala-chilli-chicken.jpg",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.2,
      "reviews": 27,
      "inStock": true,
      "discount": 9,
      "category": "spices"
    },
{
      "id": "S4XzR2RzGub31HP7pf3S",
      "name": "Chicken masala",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/assets/products/sliding_images/jpeg/c9e06f4d-e354-41ca-ac1f-d4e725d46365.jpg?ts=1707312308",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.9,
      "reviews": 120,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "SgZHWc0q2q1ySVFpcqmO",
      "name": "Lanka (Cookme 50g)",
      "image": "https://www.bbassets.com/media/uploads/p/l/40053319_2-cookme-powder-red-chilli.jpg",
      "price": "₹25",
      "originalPrice": "₹30",
      "rating": 4.9,
      "reviews": 84,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "TU3i6nPN743xWAaB73LO",
      "name": "Pavbhaji",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/images/products/sliding_image/15459a.jpg?ts=1690817567",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.1,
      "reviews": 239,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "UizfhPuwtWs1nWXymsoR",
      "name": "Maggi magic masala",
      "image": "https://m.media-amazon.com/images/I/81P-io7a03L.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4,
      "reviews": 101,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "WPVoONe7jRFK3LulueWw",
      "name": "Meat",
      "image": "https://m.media-amazon.com/images/I/81aN-UDQL2L.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 128,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "Wa1ty4eZWMDBGpyZJUMe",
      "name": "Chili paneer",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTrwIxJ3QrwvsCFNYf986-kp1QG0ZdSxZI2A&s",
      "price": "₹10",
      "originalPrice": "₹12",
      "rating": 4.5,
      "reviews": 89,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "XE0rmndJ43Q9kcegr8tI",
      "name": "Turmeric Powder",
      "image": "https://www.viralspices.com/wp-content/uploads/2024/11/Untitled-1-624x312.jpg",
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
      "id": "ZJXRWL4Vxjk1o3fyhHUL",
      "name": "Alodum masala",
      "image": "https://sunrisespices.in/content/dam/sunrise/product-detail/aloo_dum_1-removebg-preview.png/jcr:content/renditions/web-small.webp",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4,
      "reviews": 225,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "bUn9Mcguh4vOAri27eQB",
      "name": "Chat masala",
      "image": "https://www.bbassets.com/media/uploads/p/l/268937_3-everest-chaat-masala.jpg",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 3.9,
      "reviews": 174,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "e6aE7AuN1LIJlWMxxPBP",
      "name": "Chowmean",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=450/da/cms-assets/cms/product/91e5ac12-97b1-4362-a080-8ddadc1c6f06.jpg?ts=1750159446",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.3,
      "reviews": 128,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "gH9EhFnpBikF4U5a8otK",
      "name": "Jeera (Sunrise 50g)",
      "image": "https://www.jiomart.com/images/product/original/492491553/sunrise-pure-jeera-cumin-50-g-product-images-o492491553-p590961040-0-202408070949.jpg?im=Resize=(420,420)",
      "price": "₹45",
      "originalPrice": "₹51",
      "rating": 3.8,
      "reviews": 219,
      "inStock": true,
      "discount": 12,
      "category": "spices"
    },
{
      "id": "iGx3LiEVIf25K1BANxGi",
      "name": "Fried rice masala",
      "image": "https://www.chingssecret.com/public/uploads/products/1582188157_1_pfi_7.png",
      "price": "₹10",
      "originalPrice": "₹12",
      "rating": 4.7,
      "reviews": 247,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "lFMQkVMXIOhDyzffhGTj",
      "name": "Macher jhol masala",
      "image": "https://m.media-amazon.com/images/I/51+SQl5VrhL._AC_.jpg",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.6,
      "reviews": 115,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "lJyTimNTWiMXyHtBBsgy",
      "name": "Biryani masala",
      "image": "https://www.loccalshop.com/cdn/shop/files/images--_2024-09-21T223659.536.jpg?v=1726938479",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.2,
      "reviews": 209,
      "inStock": true,
      "discount": 9,
      "category": "spices"
    },
{
      "id": "mgGQHBDjrWBBzStUed7T",
      "name": "Dhania (Sunrise 50g)",
      "image": "https://www.jiomart.com/images/product/original/491468510/sunrise-pure-coriander-powder-500-g-product-images-o491468510-p590961030-0-202408070030.jpg?im=Resize=(420,420)",
      "price": "₹18",
      "originalPrice": "₹19",
      "rating": 4.8,
      "reviews": 222,
      "inStock": true,
      "discount": 5,
      "category": "spices"
    },
{
      "id": "nV4H9hSjrUOdabDh88c6",
      "name": "Soyabean",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/da/cms-assets/cms/product/24fe3cfc-c023-4b72-b3f2-334f07336164.jpg?ts=1730134485",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.2,
      "reviews": 189,
      "inStock": true,
      "discount": 0,
      "category": "spices"
    },
{
      "id": "ofjIeKl58bQ3It5JZZMO",
      "name": "Haldi (Cookme 50g)",
      "image": "https://rukminim2.flixcart.com/image/300/300/k1jlyfk0/spice-masala/p/v/j/200-turmeric-powder-200g-pouch-cookme-powder-original-imafh366x4sxk79f.jpeg",
      "price": "₹17",
      "originalPrice": "₹19",
      "rating": 4,
      "reviews": 54,
      "inStock": true,
      "discount": 11,
      "category": "spices"
    },
{
      "id": "v2GVDUnW6cwWQp7l9ylN",
      "name": "Sabji",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/images/products/sliding_image/18855a.jpg?ts=1690814450",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.1,
      "reviews": 173,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    },
{
      "id": "w3GqF1GO9KQEvekEhYGJ",
      "name": "Red Chili Powder",
      "image": "https://t4.ftcdn.net/jpg/06/68/59/49/360_F_668594985_30FQV0Mhp8TDVpFQWHYG0QuGM99zChDp.jpg",
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
      "id": "w591MGjLzogx5qOxI0Oc",
      "name": "Chat masala (black paper)",
      "image": "https://assets.hyperpure.com/data/images/products/f21bad09b3afcd502f75a0fd4d503cba.png",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.5,
      "reviews": 249,
      "inStock": true,
      "discount": 9,
      "category": "spices"
    },
{
      "id": "xOmtDHAqFkLT5YJINVkj",
      "name": "Tarka",
      "image": "",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 106,
      "inStock": true,
      "discount": 17,
      "category": "spices"
    }
  ],
  staples: [{
      "id": "0rWnJJxmdYyJl0HlK90F",
      "name": "Moong",
      "image": "https://c.ndtvimg.com/2023-07/2k660c8g_green-moong_625x300_12_July_23.jpg?im=FeatureCrop,algorithm=dnn,width=620,height=350?im=FaceCrop,algorithm=dnn,width=1200,height=886",
      "price": "₹150",
      "originalPrice": "₹184",
      "rating": 4.8,
      "reviews": 153,
      "inStock": true,
      "discount": 18,
      "category": "staples"
    },
{
      "id": "FYMPrqtv9GwaCX4pIqCj",
      "name": "Masur",
      "image": "https://5.imimg.com/data5/US/KS/JY/SELLER-88763814/masur-daal.jpg",
      "price": "₹120",
      "originalPrice": "₹139",
      "rating": 4.2,
      "reviews": 51,
      "inStock": true,
      "discount": 14,
      "category": "staples"
    },
{
      "id": "G2Ex0Rfm3FvWzm9PcRWL",
      "name": "Kabli chana",
      "image": "https://connect.healthkart.com/wp-content/uploads/2023/05/%E0%A4%95%E0%A4%BE%E0%A4%AC%E0%A5%81%E0%A4%B2%E0%A5%80-%E0%A4%9A%E0%A4%A8%E0%A4%BE_900.jpg",
      "price": "₹160",
      "originalPrice": "₹187",
      "rating": 4.8,
      "reviews": 57,
      "inStock": true,
      "discount": 14,
      "category": "staples"
    },
{
      "id": "Gnbh4rpfIemnSCKG8SyC",
      "name": "Maida (1kg - Ganesh)",
      "image": "https://static.toiimg.com/photo/102473580.cms",
      "price": "₹55",
      "originalPrice": "₹66",
      "rating": 4.7,
      "reviews": 174,
      "inStock": true,
      "discount": 17,
      "category": "staples"
    },
{
      "id": "HEKBFRVSTZ3vxkgDO5Gu",
      "name": "Miniket",
      "image": "https://cdn.shopify.com/s/files/1/0679/8340/9435/products/IMGS8244edited_59854350-c59b-4d11-a136-bb9d31bed8dd.jpg?v=1670670844",
      "price": "₹58",
      "originalPrice": "₹70",
      "rating": 4,
      "reviews": 106,
      "inStock": true,
      "discount": 17,
      "category": "staples"
    },
{
      "id": "HcgGR8kPJOrud2imyOVL",
      "name": "Whole Wheat Atta",
      "image": "https://healthybuddha.in/image/cache/catalog/Atta-500x515.jpg",
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
      "id": "HeTkiGB9P7thbhe6XFWr",
      "name": "Sona Moong",
      "image": "https://cdn.shopify.com/s/files/1/0679/8340/9435/files/sona-moog-dal.png?v=1704544716",
      "price": "₹180",
      "originalPrice": "₹208",
      "rating": 3.8,
      "reviews": 82,
      "inStock": true,
      "discount": 13,
      "category": "staples"
    },
{
      "id": "KWeYUgzxlOm0qfB6Ec8d",
      "name": "Tarka dal",
      "image": "https://www.bongmela.com/product_image/21685811509.jpg",
      "price": "₹140",
      "originalPrice": "₹170",
      "rating": 4.1,
      "reviews": 99,
      "inStock": true,
      "discount": 18,
      "category": "staples"
    },
{
      "id": "OjdPpcTXYU8f2GLsiYkT",
      "name": "Gobindo Bhog",
      "image": "https://www.goodfoodbar.com/cdn/shop/files/Pachai-Arisi-1-KG.jpg?v=1694577637",
      "price": "₹120",
      "originalPrice": "₹139",
      "rating": 3.9,
      "reviews": 18,
      "inStock": true,
      "discount": 14,
      "category": "staples"
    },
{
      "id": "PXnLAb7uZ03xKXFiOWLC",
      "name": "Atop",
      "image": "https://i.chaldn.com/_mpimage/katari-atop-rice-50-gm-5-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D74589&q=best&v=1",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4,
      "reviews": 23,
      "inStock": true,
      "discount": 13,
      "category": "staples"
    },
{
      "id": "RKJku4F7LyypTvTkaRdt",
      "name": "Banskati",
      "image": "https://www.amoliinternational.com/images/basmati/1121-steem-basmati-rice.jpeg",
      "price": "₹68",
      "originalPrice": "₹77",
      "rating": 4,
      "reviews": 200,
      "inStock": true,
      "discount": 12,
      "category": "staples"
    },
{
      "id": "RRjZWUlZ4ZihzxPPAMIB",
      "name": "Arhar",
      "image": "https://www.greendna.in/cdn/shop/files/toor-dal2.jpg?v=1747065927",
      "price": "₹190",
      "originalPrice": "₹210",
      "rating": 4.3,
      "reviews": 48,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "SKILjRUOZz2jLYU15rrW",
      "name": "Loose maida",
      "image": "https://static.toiimg.com/photo/102473580.cms",
      "price": "₹38",
      "originalPrice": "₹42",
      "rating": 3.8,
      "reviews": 191,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "TVVLlcIC4s5UnJUhqdk6",
      "name": "Bharja Masur",
      "image": "https://5.imimg.com/data5/RA/TB/MD/SELLER-76220488/masoor-seed-43-per-kg-500x500.jpeg",
      "price": "₹100",
      "originalPrice": "₹114",
      "rating": 4.4,
      "reviews": 95,
      "inStock": true,
      "discount": 12,
      "category": "staples"
    },
{
      "id": "W4Hr8OVFgjmBkoBTokGx",
      "name": "Urad",
      "image": "https://c.ndtvimg.com/2023-09/a9ubmmd8_urad-dal_625x300_06_September_23.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886",
      "price": "₹150",
      "originalPrice": "₹186",
      "rating": 4,
      "reviews": 227,
      "inStock": true,
      "discount": 19,
      "category": "staples"
    },
{
      "id": "XYpHCA6DJMHIwAlOjlh2",
      "name": "Doodhweshwar",
      "image": "https://5.imimg.com/data5/SELLER/Default/2023/12/366952291/EN/TY/KW/53803992/dudheshwar-rice-500x500.png",
      "price": "₹60",
      "originalPrice": "₹73",
      "rating": 4.9,
      "reviews": 203,
      "inStock": true,
      "discount": 18,
      "category": "staples"
    },
{
      "id": "Y8CCCsgaHzOvkVb9nLzF",
      "name": "Aata loose",
      "image": "",
      "price": "₹38",
      "originalPrice": "₹45",
      "rating": 4,
      "reviews": 96,
      "inStock": true,
      "discount": 16,
      "category": "staples"
    },
{
      "id": "YvufoIoJrm1r6VctzpqH",
      "name": "Basmati",
      "image": "https://www.amoliinternational.com/images/basmati/1121-steem-basmati-rice.jpeg",
      "price": "₹125",
      "originalPrice": "₹151",
      "rating": 3.8,
      "reviews": 92,
      "inStock": true,
      "discount": 17,
      "category": "staples"
    },
{
      "id": "ZCwnJUFtDqAN8vecaES8",
      "name": "Loose (1kg)",
      "image": "",
      "price": "₹52",
      "originalPrice": "₹60",
      "rating": 4.2,
      "reviews": 155,
      "inStock": true,
      "discount": 13,
      "category": "staples"
    },
{
      "id": "aWV351j1dRm3u7T07d8D",
      "name": "Toor Dal",
      "image": "https://familyemart.com/wp-content/uploads/2024/08/toor-dal-dry.png",
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
      "id": "basmati-rice-9nbera2r",
      "name": "Basmati Rice",
      "image": "https://img.freepik.com/free-photo/top-view-raw-rice-inside-plate-dark-desk_179666-27235.jpg?semt=ais_hybrid&w=740",
      "price": "₹450",
      "originalPrice": "₹500",
      "size": "1kg",
      "rating": 4.5,
      "reviews": 128,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "chana-dal-qlmtkzld",
      "name": "Chana Dal",
      "image": "https://t3.ftcdn.net/jpg/08/70/25/74/360_F_870257492_9Sn0NTaLMyURnHmhknUN0KQ3DYG6lw5t.jpg",
      "price": "₹130",
      "originalPrice": "₹150",
      "size": "1kg",
      "rating": 4.3,
      "reviews": 112,
      "inStock": true,
      "discount": 13,
      "category": "staples"
    },
{
      "id": "d8WvHhfly5MCTS1HRVWu",
      "name": "Ratna",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ6lm2hDy17W65AxIyJMV8kXboeLQWmmrAUw&s",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4.4,
      "reviews": 15,
      "inStock": true,
      "discount": 13,
      "category": "staples"
    },
{
      "id": "everest-shahi-garam-masala-6utivuz4",
      "name": "Everest Shahi Garam Masala",
      "image": "data:image/jpeg;base64,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",
      "price": "₹35",
      "originalPrice": "₹60",
      "size": "250g",
      "rating": 4,
      "reviews": 0,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "oXTXJ6CVBh10PdlEFG4R",
      "name": "Mouri (Sounf)",
      "image": "https://d3kgrlupo77sg7.cloudfront.net/media/chococoorgspice.com/images/products/fennel-seeds-250gm-sounf-sompu-coorg-spices.20220909012739.webp",
      "price": "₹30",
      "originalPrice": "₹37",
      "rating": 4.1,
      "reviews": 145,
      "inStock": true,
      "discount": 19,
      "category": "staples"
    },
{
      "id": "sunrise-chow-mix-masala-3mn0dvma",
      "name": "Sunrise Chow Mix Masala",
      "image": "data:image/jpeg;base64,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",
      "price": "₹100",
      "originalPrice": "₹150",
      "size": "250g",
      "rating": 4.6,
      "reviews": 0,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "sunrise-chow-mix-masala-9pow678z",
      "name": "Sunrise Chow Mix Masala",
      "image": "data:image/jpeg;base64,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",
      "price": "₹100",
      "originalPrice": "₹150",
      "size": "250g",
      "rating": 4,
      "reviews": 0,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "sunrise-chow-mix-masala-ej3dukle",
      "name": "Sunrise Chow Mix Masala",
      "image": "data:image/jpeg;base64,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",
      "price": "₹100",
      "originalPrice": "₹150",
      "size": "500g",
      "rating": 4,
      "reviews": 0,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "tE4owTCIxQP41JdN86DS",
      "name": "Kaccha chana",
      "image": "https://5.imimg.com/data5/SELLER/Default/2020/12/BK/PC/DZ/93517610/black-chana-500x500-500x500.jpg",
      "price": "₹100",
      "originalPrice": "₹119",
      "rating": 4.9,
      "reviews": 78,
      "inStock": true,
      "discount": 16,
      "category": "staples"
    },
{
      "id": "tSp7H0gyeYwc8xF0KAWo",
      "name": "Aashirvaad (5kg)",
      "image": "https://desigros.com/cdn/shop/files/00a6e42c-b48a-4eaa-af1b-e810f7d1fb97.webp?v=1746884619",
      "price": "₹258",
      "originalPrice": "₹286",
      "rating": 4,
      "reviews": 209,
      "inStock": true,
      "discount": 10,
      "category": "staples"
    },
{
      "id": "zf7eZoK48rPsfNj3ae4G",
      "name": "Matar",
      "image": "https://gonefarmers.com/cdn/shop/products/image_729746fe-9172-43ff-b465-47fbc34249fc_2048x.heic?v=1679245692",
      "price": "₹90",
      "originalPrice": "₹111",
      "rating": 3.9,
      "reviews": 79,
      "inStock": true,
      "discount": 19,
      "category": "staples"
    }
  ],
  vegetables: [{
      "id": "9QphWmLzlKHtl5o6HmfJ",
      "name": "Tomatoes",
      "image": "https://media.istockphoto.com/id/847335116/photo/tomatoes-on-the-vine.jpg?s=612x612&w=0&k=20&c=XspM2ySvUfqjnt7HL5qKyn0tyRb5qLsf1GAP6-3xQsw=",
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
    },
{
      "id": "QpKkKqWJzSuBdb1a0J25",
      "name": "Onions",
      "image": "https://plantix.net/en/library/assets/custom/crop-images/onion.jpeg",
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
      "id": "bZMBorINDyTrbHZ6hAIG",
      "name": "Potatoes",
      "image": "https://images.ctfassets.net/0dkgxhks0leg/RKiZ605RAV8kjDQnxFCWP/b03b8729817c90b29b88d536bfd37ac5/9-Unusual-Uses-For-Potatoes.jpg",
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
    }
  ]
};

// Helper function to get all products in a flat array
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
