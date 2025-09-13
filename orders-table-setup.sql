-- =====================================================
-- ORDERS TABLE SETUP
-- Near & Now Grocery App
-- =====================================================

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(255) UNIQUE,
    user_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_phone VARCHAR(255),
    
    -- Address information
    shipping_address JSONB,
    billing_address JSONB,
    
    -- Order items (stored as JSON)
    items JSONB NOT NULL DEFAULT '[]',
    
    -- Financial details
    subtotal DECIMAL(10,2) DEFAULT 0,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    handling_charge DECIMAL(10,2) DEFAULT 0,
    gst_amount DECIMAL(10,2) DEFAULT 0,
    order_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Order status and details
    order_status VARCHAR(50) DEFAULT 'placed',
    payment_method VARCHAR(50) DEFAULT 'cod',
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_notes TEXT,
    is_gift BOOLEAN DEFAULT false,
    source VARCHAR(255) DEFAULT 'Near & Now Checkout',
    
    -- Timestamps
    estimated_delivery_time TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON orders
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (for admin dashboard)
CREATE POLICY "Admin can view all orders" ON orders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

CREATE POLICY "Admin can update all orders" ON orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM admin_users 
            WHERE admin_users.id = auth.uid() 
            AND admin_users.is_active = true
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- Insert some sample orders for testing (optional)
INSERT INTO orders (
    order_number, 
    customer_name, 
    customer_phone, 
    customer_email,
    items, 
    order_total, 
    order_status,
    shipping_address
) VALUES 
(
    'ORD-001', 
    'John Doe', 
    '+91 9876543210', 
    'john@example.com',
    '[{"name": "Basmati Rice", "quantity": 2, "price": 120}, {"name": "Red Lentils", "quantity": 1, "price": 80}]',
    320.00,
    'placed',
    '{"streetAddress": "123 Main St", "city": "Mumbai", "state": "Maharashtra", "zipCode": "400001"}'
),
(
    'ORD-002', 
    'Jane Smith', 
    '+91 9876543211', 
    'jane@example.com',
    '[{"name": "Wheat Flour", "quantity": 1, "price": 60}, {"name": "Cooking Oil", "quantity": 1, "price": 150}]',
    210.00,
    'confirmed',
    '{"streetAddress": "456 Park Ave", "city": "Delhi", "state": "Delhi", "zipCode": "110001"}'
),
(
    'ORD-003', 
    'Mike Johnson', 
    '+91 9876543212', 
    'mike@example.com',
    '[{"name": "Sugar", "quantity": 1, "price": 45}, {"name": "Salt", "quantity": 1, "price": 25}, {"name": "Turmeric", "quantity": 1, "price": 30}]',
    100.00,
    'delivered',
    '{"streetAddress": "789 Oak St", "city": "Bangalore", "state": "Karnataka", "zipCode": "560001"}'
)
ON CONFLICT (order_number) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_status_history TO authenticated;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_status_history TO service_role;
