-- =====================================================
-- FIX FOREIGN KEY CONSTRAINTS
-- Near & Now Grocery App - Fix for existing table types
-- =====================================================

-- This script fixes the foreign key constraint issues
-- by ensuring the legacy references use the correct data types

-- First, let's check the current table structures
SELECT 'Current table structures:' as info;

SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('products', 'categories', 'orders')
AND column_name = 'id'
ORDER BY table_name;

-- If products table has TEXT id, we need to handle this properly
-- Let's create the enhanced tables without the foreign key constraints first
-- and then add them manually if needed

-- Drop the enhanced tables if they exist (to start fresh)
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS product_attributes CASCADE;
DROP TABLE IF EXISTS product_reviews CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS products_enhanced CASCADE;
DROP TABLE IF EXISTS categories_enhanced CASCADE;

-- Create enhanced products table WITHOUT foreign key to legacy table
CREATE TABLE IF NOT EXISTS products_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to existing product (if migrating) - NO FOREIGN KEY CONSTRAINT
    legacy_product_id TEXT, -- Will be validated by application logic
    
    -- Basic Product Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Category and Branding
    category_id UUID, -- Will reference categories_enhanced or be set manually
    brand VARCHAR(100),
    tags TEXT[], -- Array of tags for better search
    
    -- Pricing Information
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2), -- For profit calculation
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    
    -- Inventory Management
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 5,
    max_stock_level INTEGER DEFAULT 1000,
    in_stock BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT true,
    
    -- Product Details
    weight DECIMAL(8,3), -- in kg
    dimensions JSONB, -- {length, width, height, unit}
    unit VARCHAR(50) DEFAULT 'piece', -- piece, kg, liter, etc.
    size VARCHAR(100),
    color VARCHAR(50),
    
    -- Media and Content
    primary_image_url TEXT,
    image_urls TEXT[], -- Multiple images
    
    -- SEO and Marketing
    meta_title VARCHAR(255),
    meta_description TEXT,
    slug VARCHAR(255) UNIQUE,
    featured BOOLEAN DEFAULT false,
    trending BOOLEAN DEFAULT false,
    new_arrival BOOLEAN DEFAULT false,
    
    -- Ratings and Reviews
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    
    -- Product Status
    status VARCHAR(50) DEFAULT 'active', -- active, inactive, discontinued
    visibility VARCHAR(50) DEFAULT 'visible', -- visible, hidden, draft
    
    -- Nutritional Information (for food items)
    nutritional_info JSONB, -- {calories, protein, carbs, fat, etc.}
    
    -- Compliance and Certifications
    certifications TEXT[], -- organic, halal, kosher, etc.
    expiry_date DATE,
    manufacturing_date DATE,
    
    -- Shipping Information
    shipping_weight DECIMAL(8,3),
    shipping_class VARCHAR(50),
    free_shipping BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    
    -- Audit fields
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id)
);

-- Create categories enhanced table WITHOUT foreign key to legacy table
CREATE TABLE IF NOT EXISTS categories_enhanced (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Link to existing category (if migrating) - NO FOREIGN KEY CONSTRAINT
    legacy_category_id TEXT, -- Will be validated by application logic
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE,
    
    -- Hierarchy
    parent_id UUID REFERENCES categories_enhanced(id) ON DELETE CASCADE,
    level INTEGER DEFAULT 0,
    path TEXT, -- e.g., "Food > Groceries > Rice"
    
    -- Display and Organization
    display_order INTEGER DEFAULT 0,
    icon VARCHAR(100),
    image_url TEXT,
    color VARCHAR(7), -- Hex color code
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    visibility VARCHAR(50) DEFAULT 'visible',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Audit
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id)
);

-- Create product variants table
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_enhanced(id) ON DELETE CASCADE,
    
    -- Variant Details
    variant_name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    
    -- Variant Attributes
    attributes JSONB, -- {size: "Large", color: "Red", weight: "500g"}
    
    -- Media
    image_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create product images table
CREATE TABLE IF NOT EXISTS product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_enhanced(id) ON DELETE CASCADE,
    
    -- Image Details
    image_url TEXT NOT NULL,
    alt_text VARCHAR(255),
    caption TEXT,
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_enhanced(id) ON DELETE CASCADE,
    
    -- Review Details
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(255),
    
    -- Rating and Content
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    review_text TEXT,
    
    -- Media
    images TEXT[],
    
    -- Status
    is_approved BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create product attributes table (for custom fields)
CREATE TABLE IF NOT EXISTS product_attributes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_enhanced(id) ON DELETE CASCADE,
    
    -- Attribute Details
    attribute_name VARCHAR(255) NOT NULL,
    attribute_value TEXT NOT NULL,
    attribute_type VARCHAR(50) DEFAULT 'text', -- text, number, boolean, date
    
    -- Organization
    display_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create inventory logs table (for tracking stock changes)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES products_enhanced(id) ON DELETE CASCADE,
    
    -- Log Details
    action VARCHAR(50) NOT NULL, -- add, remove, adjust, sale, return
    quantity_change INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    
    -- Reference Information
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    
    -- Notes
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW()
);

-- Now add the foreign key constraint for category_id in products_enhanced
ALTER TABLE products_enhanced 
ADD CONSTRAINT fk_products_enhanced_category_id 
FOREIGN KEY (category_id) REFERENCES categories_enhanced(id) ON DELETE SET NULL;

-- Create all the indexes
CREATE INDEX IF NOT EXISTS idx_products_enhanced_legacy_id ON products_enhanced(legacy_product_id);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_category_id ON products_enhanced(category_id);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_status ON products_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_featured ON products_enhanced(featured);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_in_stock ON products_enhanced(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_price ON products_enhanced(price);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_rating ON products_enhanced(rating);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_created_at ON products_enhanced(created_at);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_slug ON products_enhanced(slug);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_sku ON products_enhanced(sku);

CREATE INDEX IF NOT EXISTS idx_categories_enhanced_legacy_id ON categories_enhanced(legacy_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_enhanced_parent_id ON categories_enhanced(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_enhanced_slug ON categories_enhanced(slug);
CREATE INDEX IF NOT EXISTS idx_categories_enhanced_is_active ON categories_enhanced(is_active);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(display_order);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_approved ON product_reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_product_reviews_created_at ON product_reviews(created_at);

CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id ON product_attributes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_attributes_name ON product_attributes(attribute_name);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_action ON inventory_logs(action);

-- Enable RLS on all new tables
ALTER TABLE products_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories_enhanced ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for admin access
CREATE POLICY "Admin can manage all enhanced products" ON products_enhanced
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all product variants" ON product_variants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all product images" ON product_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all product reviews" ON product_reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all product attributes" ON product_attributes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all inventory logs" ON inventory_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can manage all enhanced categories" ON categories_enhanced
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Insert some sample enhanced categories
INSERT INTO categories_enhanced (name, description, slug, display_order, is_active) VALUES
('Fruits & Vegetables', 'Fresh fruits and vegetables', 'fruits-vegetables', 1, true),
('Dairy & Eggs', 'Milk, cheese, eggs and dairy products', 'dairy-eggs', 2, true),
('Meat & Seafood', 'Fresh meat, poultry and seafood', 'meat-seafood', 3, true),
('Pantry Essentials', 'Rice, flour, spices and cooking essentials', 'pantry-essentials', 4, true),
('Beverages', 'Drinks, juices and beverages', 'beverages', 5, true),
('Snacks & Confectionery', 'Chips, cookies, chocolates and snacks', 'snacks-confectionery', 6, true),
('Household & Personal Care', 'Cleaning supplies and personal care items', 'household-personal-care', 7, true),
('Frozen Foods', 'Frozen vegetables, meat and ready-to-eat meals', 'frozen-foods', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Fixed foreign key constraints - Enhanced tables created successfully!' as status;
SELECT 'Legacy references are stored as TEXT without foreign key constraints for safety.' as note;
SELECT 'Use application logic to validate legacy references when needed.' as recommendation;
