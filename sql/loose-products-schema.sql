-- Loose Products Database Schema Enhancement
-- This script adds support for loose products with variable quantities

-- Add loose product fields to products_enhanced table
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS is_loose BOOLEAN DEFAULT FALSE;
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS product_type VARCHAR(20) DEFAULT 'solid'; -- 'solid', 'liquid'
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS base_unit VARCHAR(20) DEFAULT 'kg'; -- 'kg', 'gm', 'liter', 'ml'
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS base_price DECIMAL(10,2) DEFAULT 0.00; -- price per base unit
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS min_quantity DECIMAL(10,3) DEFAULT 0.1; -- minimum quantity
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS max_quantity DECIMAL(10,3) DEFAULT 10.0; -- maximum quantity
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS step_size DECIMAL(10,3) DEFAULT 0.1; -- increment step
ALTER TABLE products_enhanced ADD COLUMN IF NOT EXISTS common_sizes JSONB DEFAULT '[]'::jsonb; -- ["500gm", "1kg", "2kg", "5kg"]

-- Add comments for documentation
COMMENT ON COLUMN products_enhanced.is_loose IS 'Whether this product supports variable quantities (loose products)';
COMMENT ON COLUMN products_enhanced.product_type IS 'Type of product: solid (atta, rice, dal) or liquid (oil, milk, juice)';
COMMENT ON COLUMN products_enhanced.base_unit IS 'Base unit for pricing: kg, gm, liter, ml';
COMMENT ON COLUMN products_enhanced.base_price IS 'Price per base unit (e.g., price per kg)';
COMMENT ON COLUMN products_enhanced.min_quantity IS 'Minimum quantity customer can order';
COMMENT ON COLUMN products_enhanced.max_quantity IS 'Maximum quantity customer can order';
COMMENT ON COLUMN products_enhanced.step_size IS 'Increment step for quantity selection';
COMMENT ON COLUMN products_enhanced.common_sizes IS 'JSON array of common sizes for quick selection';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_enhanced_is_loose ON products_enhanced(is_loose);
CREATE INDEX IF NOT EXISTS idx_products_enhanced_product_type ON products_enhanced(product_type);

-- Update existing products to detect loose products
UPDATE products_enhanced 
SET is_loose = TRUE,
    product_type = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN 'liquid'
        ELSE 'solid'
    END,
    base_unit = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN 'liter'
        ELSE 'kg'
    END,
    base_price = CASE 
        WHEN price > 0 THEN price
        ELSE 50.00
    END,
    min_quantity = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN 0.25
        ELSE 0.5
    END,
    max_quantity = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN 10.0
        ELSE 10.0
    END,
    step_size = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN 0.25
        ELSE 0.5
    END,
    common_sizes = CASE 
        WHEN LOWER(name) LIKE '%oil%' OR LOWER(name) LIKE '%milk%' OR LOWER(name) LIKE '%juice%' OR LOWER(name) LIKE '%water%' THEN '["250ml", "500ml", "1L", "2L", "5L"]'::jsonb
        ELSE '["500gm", "1kg", "2kg", "5kg", "10kg"]'::jsonb
    END
WHERE LOWER(name) LIKE '%loose%';

-- Insert some sample loose products for testing
INSERT INTO products_enhanced (
    name, description, price, original_price, discount_percentage, 
    stock_quantity, sku, category_id, status, featured,
    is_loose, product_type, base_unit, base_price, min_quantity, max_quantity, step_size, common_sizes
) VALUES 
(
    'Loose Atta (Premium Wheat)', 
    'Premium quality wheat flour for rotis and parathas', 
    50.00, 60.00, 16.67, 
    100, 'LOOSE-ATTA-001', 
    (SELECT id FROM categories_enhanced WHERE name = 'Flour & Grains' LIMIT 1),
    'active', false,
    true, 'solid', 'kg', 50.00, 0.5, 10.0, 0.5, 
    '["500gm", "1kg", "2kg", "5kg", "10kg"]'::jsonb
),
(
    'Loose Basmati Rice', 
    'Premium long grain basmati rice', 
    80.00, 90.00, 11.11, 
    50, 'LOOSE-RICE-001', 
    (SELECT id FROM categories_enhanced WHERE name = 'Rice & Grains' LIMIT 1),
    'active', true,
    true, 'solid', 'kg', 80.00, 0.5, 10.0, 0.5, 
    '["500gm", "1kg", "2kg", "5kg", "10kg"]'::jsonb
),
(
    'Loose Mustard Oil', 
    'Pure cold-pressed mustard oil', 
    120.00, 140.00, 14.29, 
    30, 'LOOSE-OIL-001', 
    (SELECT id FROM categories_enhanced WHERE name = 'Cooking Oil' LIMIT 1),
    'active', false,
    true, 'liquid', 'liter', 120.00, 0.25, 5.0, 0.25, 
    '["250ml", "500ml", "1L", "2L", "5L"]'::jsonb
),
(
    'Loose Fresh Milk', 
    'Fresh cow milk delivered daily', 
    60.00, 65.00, 7.69, 
    20, 'LOOSE-MILK-001', 
    (SELECT id FROM categories_enhanced WHERE name = 'Dairy' LIMIT 1),
    'active', false,
    true, 'liquid', 'liter', 60.00, 0.5, 5.0, 0.5, 
    '["500ml", "1L", "2L", "5L"]'::jsonb
);

-- Create a view for easy loose products querying
CREATE OR REPLACE VIEW loose_products_view AS
SELECT 
    id,
    name,
    description,
    price,
    original_price,
    discount_percentage,
    stock_quantity,
    sku,
    category_id,
    status,
    featured,
    product_type,
    base_unit,
    base_price,
    min_quantity,
    max_quantity,
    step_size,
    common_sizes,
    created_at,
    updated_at
FROM products_enhanced 
WHERE is_loose = TRUE;

-- Grant permissions
GRANT SELECT ON loose_products_view TO anon, authenticated;

-- Add RLS policies for loose products
ALTER TABLE products_enhanced ENABLE ROW LEVEL SECURITY;

-- Policy for reading loose products (public access)
CREATE POLICY "Allow public read access to loose products" ON products_enhanced
    FOR SELECT USING (is_loose = TRUE AND status = 'active');

-- Policy for admin access to loose products
CREATE POLICY "Allow admin full access to loose products" ON products_enhanced
    FOR ALL USING (auth.role() = 'service_role');

COMMENT ON TABLE loose_products_view IS 'View for easy access to loose products with variable quantities';
