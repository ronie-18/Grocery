/**
 * Supabase Client Configuration for Admin
 * Centralized Supabase client for admin operations
 */

// Supabase configuration
const SUPABASE_URL = 'https://mpbszymyubxavjoxhzfm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wYnN6eW15dWJ4YXZqb3hoemZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTc5OTQsImV4cCI6MjA2OTg3Mzk5NH0.NnHFwGCkNpTWorV8O6vgn6uuqYPRek1QK4Sk_rcqLOg'

// Create Supabase client (will be available globally)
let supabaseClient = null

// Initialize Supabase immediately when script loads
function initializeSupabaseClient() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
        console.log('✅ Admin Supabase client initialized')
        return true
    } else {
        console.warn('⚠️ Supabase library not loaded yet')
        return false
    }
}

// Try to initialize immediately
if (!initializeSupabaseClient()) {
    // If not available, wait for it
    const checkSupabase = setInterval(() => {
        if (initializeSupabaseClient()) {
            clearInterval(checkSupabase)
        }
    }, 100)
    
    // Timeout after 10 seconds
    setTimeout(() => {
        clearInterval(checkSupabase)
        if (!supabaseClient) {
            console.error('❌ Failed to initialize Supabase client after 10 seconds')
        }
    }, 10000)
}

// Make client available globally
window.supabaseClient = supabaseClient

// Export for module systems (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { supabaseClient }
}
