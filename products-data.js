// Products organized by categories for better management
const productsByCategory = {
  staples: [{
      "id": "basmati-rice-1",
      "name": "Basmati Rice",
      "image": "https://img.freepik.com/free-photo/top-view-raw-rice-inside-plate-dark-desk_179666-27235.jpg?semt=ais_hybrid&w=740",
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
      "id": "chana-dal-1",
      "name": "Chana Dal",
      "image": "https://t3.ftcdn.net/jpg/08/70/25/74/360_F_870257492_9Sn0NTaLMyURnHmhknUN0KQ3DYG6lw5t.jpg",
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
    },

    {
      "id": "bharja-masur-staples-bc10d016",
      "name": "Bharja Masur",
      "image": "https://5.imimg.com/data5/RA/TB/MD/SELLER-76220488/masoor-seed-43-per-kg-500x500.jpeg",
      "price": "₹100",
      "originalPrice": "₹114",
      "rating": 4.4,
      "reviews": 95,
      "inStock": true,
      "discount": 12,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "tarka-dal-staples-69f37e44",
      "name": "Tarka dal",
      "image": "https://www.bongmela.com/product_image/21685811509.jpg",
      "price": "₹140",
      "originalPrice": "₹170",
      "rating": 4.1,
      "reviews": 99,
      "inStock": true,
      "discount": 18,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "kaccha-chana-staples-ac839edc",
      "name": "Kaccha chana",
      "image": "https://5.imimg.com/data5/SELLER/Default/2020/12/BK/PC/DZ/93517610/black-chana-500x500-500x500.jpg",
      "price": "₹100",
      "originalPrice": "₹119",
      "rating": 4.9,
      "reviews": 78,
      "inStock": true,
      "discount": 16,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "matar-staples-bf82558d",
      "name": "Matar",
      "image": "https://gonefarmers.com/cdn/shop/products/image_729746fe-9172-43ff-b465-47fbc34249fc_2048x.heic?v=1679245692",
      "price": "₹90",
      "originalPrice": "₹111",
      "rating": 3.9,
      "reviews": 79,
      "inStock": true,
      "discount": 19,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "kabli-chana-staples-e14865a3",
      "name": "Kabli chana",
      "image": "https://connect.healthkart.com/wp-content/uploads/2023/05/%E0%A4%95%E0%A4%BE%E0%A4%AC%E0%A5%81%E0%A4%B2%E0%A5%80-%E0%A4%9A%E0%A4%A8%E0%A4%BE_900.jpg",
      "price": "₹160",
      "originalPrice": "₹187",
      "rating": 4.8,
      "reviews": 57,
      "inStock": true,
      "discount": 14,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "sona-moong-staples-48a84e9f",
      "name": "Sona Moong",
      "image": "https://cdn.shopify.com/s/files/1/0679/8340/9435/files/sona-moog-dal.png?v=1704544716",
      "price": "₹180",
      "originalPrice": "₹208",
      "rating": 3.8,
      "reviews": 82,
      "inStock": true,
      "discount": 13,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "masur-staples-4e9588c6",
      "name": "Masur",
      "image": "https://5.imimg.com/data5/US/KS/JY/SELLER-88763814/masur-daal.jpg",
      "price": "₹120",
      "originalPrice": "₹139",
      "rating": 4.2,
      "reviews": 51,
      "inStock": true,
      "discount": 14,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "moong-staples-0f8b78f4",
      "name": "Moong",
      "image": "https://c.ndtvimg.com/2023-07/2k660c8g_green-moong_625x300_12_July_23.jpg?im=FeatureCrop,algorithm=dnn,width=620,height=350?im=FaceCrop,algorithm=dnn,width=1200,height=886",
      "price": "₹150",
      "originalPrice": "₹184",
      "rating": 4.8,
      "reviews": 153,
      "inStock": true,
      "discount": 18,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "arhar-staples-dfb44be1",
      "name": "Arhar",
      "image": "https://www.greendna.in/cdn/shop/files/toor-dal2.jpg?v=1747065927",
      "price": "₹190",
      "originalPrice": "₹210",
      "rating": 4.3,
      "reviews": 48,
      "inStock": true,
      "discount": 10,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "urad-staples-777d493b",
      "name": "Urad",
      "image": "https://c.ndtvimg.com/2023-09/a9ubmmd8_urad-dal_625x300_06_September_23.jpg?im=FaceCrop,algorithm=dnn,width=1200,height=886",
      "price": "₹150",
      "originalPrice": "₹186",
      "rating": 4.0,
      "reviews": 227,
      "inStock": true,
      "discount": 19,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "banskati-staples-db6bd63c",
      "name": "Banskati",
      "image": "https://www.amoliinternational.com/images/basmati/1121-steem-basmati-rice.jpeg",
      "price": "₹68",
      "originalPrice": "₹77",
      "rating": 4.0,
      "reviews": 200,
      "inStock": true,
      "discount": 12,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "dubheswar-staples-b4a637f0",
      "name": "Doodhweshwar",
      "image": "https://5.imimg.com/data5/SELLER/Default/2023/12/366952291/EN/TY/KW/53803992/dudheshwar-rice-500x500.png",
      "price": "₹60",
      "originalPrice": "₹73",
      "rating": 4.9,
      "reviews": 203,
      "inStock": true,
      "discount": 18,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "ratna-staples-f8536760",
      "name": "Ratna",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ6lm2hDy17W65AxIyJMV8kXboeLQWmmrAUw&s",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4.4,
      "reviews": 15,
      "inStock": true,
      "discount": 13,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "basmati-staples-835849cd",
      "name": "Basmati",
      "image": "https://www.amoliinternational.com/images/basmati/1121-steem-basmati-rice.jpeg",
      "price": "₹125",
      "originalPrice": "₹151",
      "rating": 3.8,
      "reviews": 92,
      "inStock": true,
      "discount": 17,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "atop-staples-8f078f71",
      "name": "Atop",
      "image": "https://i.chaldn.com/_mpimage/katari-atop-rice-50-gm-5-kg?src=https%3A%2F%2Feggyolk.chaldal.com%2Fapi%2FPicture%2FRaw%3FpictureId%3D74589&q=best&v=1",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4.0,
      "reviews": 23,
      "inStock": true,
      "discount": 13,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "mouuri-staples-270602fe",
      "name": "Mouri (Sounf)",
      "image": "https://d3kgrlupo77sg7.cloudfront.net/media/chococoorgspice.com/images/products/fennel-seeds-250gm-sounf-sompu-coorg-spices.20220909012739.webp",
      "price": "₹30",
      "originalPrice": "₹37",
      "rating": 4.1,
      "reviews": 145,
      "inStock": true,
      "discount": 19,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "gobindo-bhog-staples-ff657a1a",
      "name": "Gobindo Bhog",
      "image": "https://www.goodfoodbar.com/cdn/shop/files/Pachai-Arisi-1-KG.jpg?v=1694577637",
      "price": "₹120",
      "originalPrice": "₹139",
      "rating": 3.9,
      "reviews": 18,
      "inStock": true,
      "discount": 14,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "miniket-staples-c5d360ac",
      "name": "Miniket",
      "image": "https://cdn.shopify.com/s/files/1/0679/8340/9435/products/IMGS8244edited_59854350-c59b-4d11-a136-bb9d31bed8dd.jpg?v=1670670844",
      "price": "₹58",
      "originalPrice": "₹70",
      "rating": 4.0,
      "reviews": 106,
      "inStock": true,
      "discount": 17,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "aashirvaad-5kg-staples-8fb17578",
      "name": "Aashirvaad (5kg)",
      "image": "https://desigros.com/cdn/shop/files/00a6e42c-b48a-4eaa-af1b-e810f7d1fb97.webp?v=1746884619",
      "price": "₹258",
      "originalPrice": "₹286",
      "rating": 4.0,
      "reviews": 209,
      "inStock": true,
      "discount": 10,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "aata-loose-staples-8dbb58b3",
      "name": "Aata loose",
      "image": "",
      "price": "₹38",
      "originalPrice": "₹45",
      "rating": 4.0,
      "reviews": 96,
      "inStock": true,
      "discount": 16,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "maida-1kg-ganesh-staples-dab8754d",
      "name": "Maida (1kg - Ganesh)",
      "image": "https://static.toiimg.com/photo/102473580.cms",
      "price": "₹55",
      "originalPrice": "₹66",
      "rating": 4.7,
      "reviews": 174,
      "inStock": true,
      "discount": 17,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "loose-maida-staples-e2dce8f9",
      "name": "Loose maida",
      "image": "https://static.toiimg.com/photo/102473580.cms",
      "price": "₹38",
      "originalPrice": "₹42",
      "rating": 3.8,
      "reviews": 191,
      "inStock": true,
      "discount": 10,
      "category": "staples",
      "reviewsList": []
    },

    {
      "id": "loose-1kg-staples-62dd1fbc",
      "name": "Loose (1kg)",
      "image": "",
      "price": "₹52",
      "originalPrice": "₹60",
      "rating": 4.2,
      "reviews": 155,
      "inStock": true,
      "discount": 13,
      "category": "staples",
      "reviewsList": []
    }
  ],

  spices: [{
      "id": "turmeric-powder-1",
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
      "id": "garam-masala-1",
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
      "id": "red-chili-powder-1",
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
      "id": "cardamom-1",
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
      "id": "fried-rice-masala-spices-26c284c8",
      "name": "Fried rice masala",
      "image": "https://www.chingssecret.com/public/uploads/products/1582188157_1_pfi_7.png",
      "price": "₹10",
      "originalPrice": "₹12",
      "rating": 4.7,
      "reviews": 247,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chili-paneer-spices-eb5fb44f",
      "name": "Chili paneer",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTrwIxJ3QrwvsCFNYf986-kp1QG0ZdSxZI2A&s",
      "price": "₹10",
      "originalPrice": "₹12",
      "rating": 4.5,
      "reviews": 89,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chili-chicken-spices-7cc4edad",
      "name": "Chili chicken",
      "image": "https://www.bbassets.com/media/uploads/p/xxl/20006012_4-chings-secret-miracal-masala-chilli-chicken.jpg",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.2,
      "reviews": 27,
      "inStock": true,
      "discount": 9,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "haldi-sunrise-50g-spices-2a8a8923",
      "name": "Haldi (Sunrise 50g)",
      "image": "https://img.thecdn.in/59411/1629348680251_SKU-0280_0.jpg?width=600&format=webp",
      "price": "₹17",
      "originalPrice": "₹20",
      "rating": 4.3,
      "reviews": 77,
      "inStock": true,
      "discount": 15,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "haldi-cookme-50g-spices-123ec592",
      "name": "Haldi (Cookme 50g)",
      "image": "https://rukminim2.flixcart.com/image/300/300/k1jlyfk0/spice-masala/p/v/j/200-turmeric-powder-200g-pouch-cookme-powder-original-imafh366x4sxk79f.jpeg",
      "price": "₹17",
      "originalPrice": "₹19",
      "rating": 4.0,
      "reviews": 54,
      "inStock": true,
      "discount": 11,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "jeera-sunrise-50g-spices-b8bdf33f",
      "name": "Jeera (Sunrise 50g)",
      "image": "https://www.jiomart.com/images/product/original/492491553/sunrise-pure-jeera-cumin-50-g-product-images-o492491553-p590961040-0-202408070949.jpg?im=Resize=(420,420)",
      "price": "₹45",
      "originalPrice": "₹51",
      "rating": 3.8,
      "reviews": 219,
      "inStock": true,
      "discount": 12,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "jeera-cookme-50g-spices-9fe9ed23",
      "name": "Jeera (Cookme 50g)",
      "image": "https://shop.cookme.in/assets/uploads/media-uploader/jeera-powder1647942225.webp",
      "price": "₹42",
      "originalPrice": "₹47",
      "rating": 4.0,
      "reviews": 181,
      "inStock": true,
      "discount": 11,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "dhania-sunrise-50g-spices-cd4b0c7e",
      "name": "Dhania (Sunrise 50g)",
      "image": "https://www.jiomart.com/images/product/original/491468510/sunrise-pure-coriander-powder-500-g-product-images-o491468510-p590961030-0-202408070030.jpg?im=Resize=(420,420)",
      "price": "₹18",
      "originalPrice": "₹19",
      "rating": 4.8,
      "reviews": 222,
      "inStock": true,
      "discount": 5,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "dhania-cookme-50g-spices-79dbd20f",
      "name": "Dhania (Cookme 50g)",
      "image": "https://shop.cookme.in/assets/uploads/media-uploader/dhania-powder1647866842.webp",
      "price": "₹18",
      "originalPrice": "₹20",
      "rating": 4.5,
      "reviews": 205,
      "inStock": true,
      "discount": 10,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "lanka-sunrise-50g-spices-ee5efbcc",
      "name": "Lanka (Sunrise 50g)",
      "image": "https://pushanta.com/public/uploads/product_11664085907.jpg",
      "price": "₹27",
      "originalPrice": "₹30",
      "rating": 4.7,
      "reviews": 39,
      "inStock": true,
      "discount": 10,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "lanka-cookme-50g-spices-609b8401",
      "name": "Lanka (Cookme 50g)",
      "image": "https://www.bbassets.com/media/uploads/p/l/40053319_2-cookme-powder-red-chilli.jpg",
      "price": "₹25",
      "originalPrice": "₹30",
      "rating": 4.9,
      "reviews": 84,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "alodum-masala-spices-cc932984",
      "name": "Alodum masala",
      "image": "https://sunrisespices.in/content/dam/sunrise/product-detail/aloo_dum_1-removebg-preview.png/jcr:content/renditions/web-small.webp",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.0,
      "reviews": 225,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "macher-jhol-masala-spices-bc6f57ac",
      "name": "Macher jhol masala",
      "image": "https://m.media-amazon.com/images/I/51+SQl5VrhL._AC_.jpg",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.6,
      "reviews": 115,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "anda-curry-masala-spices-7dc78c91",
      "name": "Anda curry masala",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/assets/products/sliding_images/jpeg/80562891-892c-4253-9233-ddf1d569c93c.jpg?ts=1708588721",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.4,
      "reviews": 137,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chicken-masala-spices-e2348ab8",
      "name": "Chicken masala",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/assets/products/sliding_images/jpeg/c9e06f4d-e354-41ca-ac1f-d4e725d46365.jpg?ts=1707312308",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.9,
      "reviews": 120,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "soyabean-spices-2940cfd2",
      "name": "Soyabean",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/da/cms-assets/cms/product/24fe3cfc-c023-4b72-b3f2-334f07336164.jpg?ts=1730134485",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.2,
      "reviews": 189,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "pavbhaji-spices-fa118bfb",
      "name": "Pavbhaji",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/images/products/sliding_image/15459a.jpg?ts=1690817567",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.1,
      "reviews": 239,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "sabji-spices-1918ee0a",
      "name": "Sabji",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/app/images/products/sliding_image/18855a.jpg?ts=1690814450",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.1,
      "reviews": 173,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chowmean-spices-37780a74",
      "name": "Chowmean",
      "image": "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=450/da/cms-assets/cms/product/91e5ac12-97b1-4362-a080-8ddadc1c6f06.jpg?ts=1750159446",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 4.3,
      "reviews": 128,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "shukto-spices-1f735c49",
      "name": "Shukto",
      "image": "https://m.media-amazon.com/images/I/71GaLeeQDLL.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.5,
      "reviews": 142,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "maggi-magic-masala-spices-be031986",
      "name": "Maggi magic masala",
      "image": "https://m.media-amazon.com/images/I/81P-io7a03L.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.0,
      "reviews": 101,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chat-masala-spices-7b14a46c",
      "name": "Chat masala",
      "image": "https://www.bbassets.com/media/uploads/p/l/268937_3-everest-chaat-masala.jpg",
      "price": "₹5",
      "originalPrice": "₹5",
      "rating": 3.9,
      "reviews": 174,
      "inStock": true,
      "discount": 0,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "biryani-masala-spices-e85af606",
      "name": "Biryani masala",
      "image": "https://www.loccalshop.com/cdn/shop/files/images--_2024-09-21T223659.536.jpg?v=1726938479",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.2,
      "reviews": 209,
      "inStock": true,
      "discount": 9,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "tarka-spices-5b236ccd",
      "name": "Tarka",
      "image": "",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 106,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "meat-spices-17318b09",
      "name": "Meat",
      "image": "https://m.media-amazon.com/images/I/81aN-UDQL2L.jpg",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 128,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "chat-masala-black-paper-spices-8648f4ad",
      "name": "Chat masala (black paper)",
      "image": "https://assets.hyperpure.com/data/images/products/f21bad09b3afcd502f75a0fd4d503cba.png",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.5,
      "reviews": 249,
      "inStock": true,
      "discount": 9,
      "category": "spices",
      "reviewsList": []
    },

    {
      "id": "pasta-spices-54df89c4",
      "name": "Pasta",
      "image": "",
      "price": "₹5",
      "originalPrice": "₹6",
      "rating": 4.6,
      "reviews": 52,
      "inStock": true,
      "discount": 17,
      "category": "spices",
      "reviewsList": []
    }
  ],

  dairy: [{
      "id": "fresh-paneer-1",
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
      "id": "cow-ghee-1",
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
      "id": "coconut-oil-1",
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
      "id": "sorso-1kg-dairy-ca165c5a",
      "name": "Sorso (1kg)",
      "image": "https://rukminim2.flixcart.com/image/750/900/kmf7ki80/spice-masala/1/q/g/1-black-mustard-seeds-kali-sarso-1kg-pouch-producer-whole-original-imagfbw7zmycjpzc.jpeg?q=20&crop=false",
      "price": "₹0",
      "originalPrice": "₹0",
      "rating": 4.0,
      "reviews": 161,
      "inStock": true,
      "discount": 0,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "sorso-200g-dairy-f1c203ea",
      "name": "Sorso (200g)",
      "image": "https://rukminim2.flixcart.com/image/750/900/kmf7ki80/spice-masala/1/q/g/1-black-mustard-seeds-kali-sarso-1kg-pouch-producer-whole-original-imagfbw7zmycjpzc.jpeg?q=20&crop=false",
      "price": "₹47",
      "originalPrice": "₹57",
      "rating": 4.0,
      "reviews": 204,
      "inStock": true,
      "discount": 18,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "emami-dairy-0288e823",
      "name": "Emami",
      "image": "https://www.bbassets.com/media/uploads/p/l/40051736_8-emami-healthy-tasty-soyabean-oil.jpg",
      "price": "₹170",
      "originalPrice": "₹193",
      "rating": 4.6,
      "reviews": 72,
      "inStock": true,
      "discount": 12,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "fortune-dairy-43860356",
      "name": "Fortune",
      "image": "https://www.gorevizon.com/wp-content/uploads/2020/07/1-70.jpg",
      "price": "₹170",
      "originalPrice": "₹209",
      "rating": 4.2,
      "reviews": 232,
      "inStock": true,
      "discount": 19,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "dalda-dairy-91c899e6",
      "name": "Dalda",
      "image": "https://5.imimg.com/data5/SELLER/Default/2022/1/ZV/SV/YS/63605712/dalda-vanaspati-oil.jpg",
      "price": "₹160",
      "originalPrice": "₹185",
      "rating": 4.1,
      "reviews": 86,
      "inStock": true,
      "discount": 14,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "masal-dairy-bf5e3a6a",
      "name": "Masal",
      "image": "https://www.jiomart.com/images/product/original/490052736/mashal-kachi-ghani-mustard-oil-1-l-product-images-o490052736-p490052736-0-202205172236.jpg?im=Resize=(1000,1000)",
      "price": "₹95",
      "originalPrice": "₹115",
      "rating": 4.8,
      "reviews": 48,
      "inStock": true,
      "discount": 17,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "refine-200g-dairy-882ed833",
      "name": "Refine (200g)",
      "image": "https://5.imimg.com/data5/SELLER/Default/2020/12/LK/PA/LY/7045867/200-ml-refined-soyabean-oil-500x500.jpg",
      "price": "₹40",
      "originalPrice": "₹47",
      "rating": 4.4,
      "reviews": 156,
      "inStock": true,
      "discount": 15,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "best-choice-1kg-dairy-f2e7c5c9",
      "name": "Best choice (1kg)",
      "image": "https://cdn.dotpe.in/longtail/store-items/8864536/ghaZCO4e.webp",
      "price": "₹130",
      "originalPrice": "₹158",
      "rating": 4.4,
      "reviews": 59,
      "inStock": true,
      "discount": 18,
      "category": "dairy",
      "reviewsList": []
    },

    {
      "id": "best-choice-500g-dairy-295530a0",
      "name": "Best choice (500g)",
      "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzMVmW7dAN6x7pL5DTsdHVvJ9lV-F0QDqNFg&s",
      "price": "₹75",
      "originalPrice": "₹87",
      "rating": 4.9,
      "reviews": 85,
      "inStock": true,
      "discount": 14,
      "category": "dairy",
      "reviewsList": []
    }
  ],

  vegetables: [
    {
      "id": "onions-1",
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
      "id": "potatoes-1",
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
    },
    {
      "id": "tomatoes-1",
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
    }
  ],

  snacks: [
    {
      "id": "masala-papad-1",
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
    },
    {
      "id": "namkeen-mix-1",
      "name": "Namkeen Mix",
      "image": "https://images.jdmagicbox.com/rep/b2b/shahi-namkeen-mix/shahi-namkeen-mix-7.jpg",
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
      "id": "tata-gold-100g-beverages-a1b2c3d4",
      "name": "Tata Gold (100g)",
      "image": "https://m.media-amazon.com/images/I/41m+fYXcoEL._AC_.jpg",
      "price": "₹50",
      "originalPrice": "₹57",
      "rating": 4.6,
      "reviews": 143,
      "inStock": true,
      "discount": 12,
      "category": "beverages",
      "reviewsList": []
    },

    {
      "id": "tata-premium-100g-beverages-b2c3d4e5",
      "name": "Tata Premium (100g)",
      "image": "",
      "price": "₹60",
      "originalPrice": "₹69",
      "rating": 4.4,
      "reviews": 98,
      "inStock": true,
      "discount": 13,
      "category": "beverages",
      "reviewsList": []
    },

    {
      "id": "taza-packet-beverages-c3d4e5f6",
      "name": "Taza (packet)",
      "image": "",
      "price": "₹25",
      "originalPrice": "₹30",
      "rating": 4.2,
      "reviews": 67,
      "inStock": true,
      "discount": 17,
      "category": "beverages",
      "reviewsList": []
    },

    {
      "id": "taza-150g-beverages-d4e5f6g7",
      "name": "Taza (150g)",
      "image": "",
      "price": "₹45",
      "originalPrice": "₹52",
      "rating": 4.3,
      "reviews": 89,
      "inStock": true,
      "discount": 13,
      "category": "beverages",
      "reviewsList": []
    }
  ],
  household: [
    {
      "id": "mrp-household-14bd121e",
      "name": "MRP",
      "image": "",
      "price": "₹10",
      "originalPrice": "₹11",
      "rating": 4.8,
      "reviews": 227,
      "inStock": true,
      "discount": 9,
      "category": "household",
      "reviewsList": []
    },

    {
      "id": "mrp-household-4acdeb29",
      "name": "MRP",
      "image": "",
      "price": "₹32",
      "originalPrice": "₹39",
      "rating": 4.7,
      "reviews": 204,
      "inStock": true,
      "discount": 18,
      "category": "household",
      "reviewsList": []
    }
  ],
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