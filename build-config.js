#!/usr/bin/env node

// Build script to generate configuration files from .env
const fs = require('fs');
const path = require('path');

// Read .env file
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
    
    if (!fs.existsSync(envPath)) {
        console.error('❌ .env file not found');
        process.exit(1);
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#')) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVars[key.trim()] = valueParts.join('=').trim();
            }
        }
    });
    
    return envVars;
}

// Generate local-config.js
function generateLocalConfig(envVars) {
    const config = {
        GOOGLE_MAPS_API_KEY: envVars.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE',
        NODE_ENV: 'development'
    };
    
    const content = `// Auto-generated from .env file
// WARNING: This file should not be committed to version control
// Add local-config.js to your .gitignore file

window.LOCAL_CONFIG = ${JSON.stringify(config, null, 4)};

// Log that local config is loaded (without exposing the key)
console.log('🔧 Local configuration loaded from .env file');
`;
    
    fs.writeFileSync('local-config.js', content);
    console.log('✅ Generated local-config.js from .env file');
}

// Generate production-config.js
function generateProductionConfig(envVars) {
    const config = {
        GOOGLE_MAPS_API_KEY: envVars.PRODUCTION_GOOGLE_MAPS_API_KEY || envVars.GOOGLE_MAPS_API_KEY || 'YOUR_PRODUCTION_API_KEY_HERE',
        NODE_ENV: 'production'
    };
    
    const content = `// Auto-generated from .env file
// WARNING: This file should not be committed to version control
// Add production-config.js to your .gitignore file

window.PRODUCTION_CONFIG = ${JSON.stringify(config, null, 4)};

// Log that production config is loaded (without exposing the key)
console.log('🏭 Production configuration loaded from .env file');
`;
    
    fs.writeFileSync('production-config.js', content);
    console.log('✅ Generated production-config.js from .env file');
}

// Main execution
try {
    console.log('🔧 Building configuration files from .env...');
    
    const envVars = loadEnvFile();
    console.log('📋 Loaded environment variables:', Object.keys(envVars));
    
    generateLocalConfig(envVars);
    generateProductionConfig(envVars);
    
    console.log('🎉 Configuration build completed successfully!');
    console.log('💡 Run this script whenever you update your .env file');
    
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
