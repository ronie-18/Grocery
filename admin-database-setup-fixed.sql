-- =====================================================
-- ADMIN SYSTEM DATABASE SETUP (FIXED VERSION)
-- Near & Now Grocery App
-- =====================================================

-- 1. Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create admin activity logs table
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(255),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Create admin sessions table for session management
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for admin_users
CREATE POLICY "Admin users can view all admin data" ON admin_users
    FOR SELECT USING (true);

CREATE POLICY "Admin users can update admin data" ON admin_users
    FOR UPDATE USING (true);

CREATE POLICY "Admin users can insert new admins" ON admin_users
    FOR INSERT WITH CHECK (true);

-- 6. Create RLS Policies for admin_activity_logs
CREATE POLICY "Admin users can view all activity logs" ON admin_activity_logs
    FOR SELECT USING (true);

CREATE POLICY "Admin users can insert activity logs" ON admin_activity_logs
    FOR INSERT WITH CHECK (true);

-- 7. Create RLS Policies for admin_sessions
CREATE POLICY "Admin users can manage sessions" ON admin_sessions
    FOR ALL USING (true);

-- 8. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_activity_logs_created_at ON admin_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Insert default admin user with correct password hash
-- Password: admin123 (hashed with btoa(password + 'nearandnow_salt'))
-- The hash for 'admin123' + 'nearandnow_salt' = 'YWRtaW4xMjNuZWFyYW5kbm93X3NhbHQ='
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES (
    'admin', 
    'admin@nearandnow.com', 
    'YWRtaW4xMjNuZWFyYW5kbm93X3NhbHQ=', 
    'super_admin'
) ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    role = EXCLUDED.role;

-- 12. Create function to log admin activities
CREATE OR REPLACE FUNCTION log_admin_activity(
    p_admin_id UUID,
    p_action VARCHAR(255),
    p_table_name VARCHAR(255) DEFAULT NULL,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_activity_logs (
        admin_id, action, table_name, record_id, 
        old_values, new_values, ip_address, user_agent
    ) VALUES (
        p_admin_id, p_action, p_table_name, p_record_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- 13. Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS VOID AS $$
BEGIN
    DELETE FROM admin_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 14. Create function to get admin dashboard stats
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_orders', (SELECT COUNT(*) FROM orders),
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'total_products', (SELECT COUNT(*) FROM products),
        'total_revenue', (SELECT COALESCE(SUM(order_total), 0) FROM orders WHERE order_status = 'delivered'),
        'pending_orders', (SELECT COUNT(*) FROM orders WHERE order_status IN ('placed', 'confirmed', 'preparing')),
        'recent_orders', (
            SELECT json_agg(
                json_build_object(
                    'id', id,
                    'order_number', order_number,
                    'customer_name', customer_name,
                    'order_total', order_total,
                    'order_status', order_status,
                    'created_at', created_at
                )
            )
            FROM (
                SELECT * FROM orders 
                ORDER BY created_at DESC 
                LIMIT 5
            ) recent
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 15. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON admin_users TO authenticated;
GRANT ALL ON admin_activity_logs TO authenticated;
GRANT ALL ON admin_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION log_admin_activity TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_sessions TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats TO authenticated;

-- =====================================================
-- SETUP COMPLETE!
-- 
-- Default admin credentials:
-- Username: admin
-- Email: admin@nearandnow.com
-- Password: admin123
-- 
-- IMPORTANT: Change the default password immediately!
-- =====================================================
