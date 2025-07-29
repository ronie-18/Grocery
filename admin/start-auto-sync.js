#!/usr/bin/env node

/**
 * Auto-Sync Startup Script
 * Checks requirements and starts the auto-sync system for products-data.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🚀 ================================');
console.log('🚀 Near & Now Auto-Sync Setup');
console.log('🚀 ================================');
console.log('');

// Check requirements
async function checkRequirements() {
    console.log('🔍 Checking requirements...');
    
    const checks = [
        {
            name: 'Node.js version',
            check: () => {
                const version = process.version;
                const majorVersion = parseInt(version.substring(1).split('.')[0]);
                return majorVersion >= 14;
            },
            fix: 'Please update Node.js to version 14 or higher'
        },
        {
            name: 'Firebase service account',
            check: () => fs.existsSync(path.join(__dirname, 'firebase-service-account.json')),
            fix: 'Please add your firebase-service-account.json file to the admin/ directory'
        },
        {
            name: 'Dependencies installed',
            check: () => {
                try {
                    require('firebase-admin');
                    require('express');
                    require('cors');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            fix: 'Run: npm install'
        },
        {
            name: 'Products data file exists',
            check: () => fs.existsSync(path.join(__dirname, '..', 'products-data.js')),
            fix: 'products-data.js will be created automatically'
        }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
        const passed = check.check();
        const status = passed ? '✅' : '❌';
        console.log(`${status} ${check.name}`);
        
        if (!passed) {
            console.log(`   💡 ${check.fix}`);
            allPassed = false;
        }
    }
    
    console.log('');
    
    if (!allPassed) {
        console.log('❌ Some requirements are not met. Please fix the issues above and try again.');
        process.exit(1);
    }
    
    console.log('✅ All requirements met!');
    return true;
}

// Start the sync server
function startSyncServer() {
    console.log('🚀 Starting auto-sync server...');
    console.log('');
    
    const serverProcess = spawn('node', ['sync-server.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Failed to start sync server:', error.message);
        process.exit(1);
    });
    
    serverProcess.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ Sync server exited with code ${code}`);
            process.exit(code);
        }
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down auto-sync server...');
        serverProcess.kill('SIGINT');
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down auto-sync server...');
        serverProcess.kill('SIGTERM');
        process.exit(0);
    });
}

// Show usage instructions
function showInstructions() {
    console.log('📖 How to use Auto-Sync:');
    console.log('');
    console.log('1. Keep this server running while using the admin panel');
    console.log('2. When you add/edit/delete products in admin panel:');
    console.log('   ✅ Changes are saved to Firebase (as before)');
    console.log('   ✅ products-data.js is automatically updated');
    console.log('   ✅ Main website gets real-time updates');
    console.log('');
    console.log('3. No more manual file downloads/replacements needed!');
    console.log('');
    console.log('🎯 Test it:');
    console.log('   - Open admin panel and add a product');
    console.log('   - Check that products-data.js file is updated');
    console.log('   - Verify product appears on main website');
    console.log('');
    console.log('⚠️  Keep this terminal window open while using admin panel');
    console.log('🛑 Press Ctrl+C to stop the auto-sync server');
    console.log('');
}

// Main execution
async function main() {
    try {
        await checkRequirements();
        showInstructions();
        startSyncServer();
    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = { checkRequirements, startSyncServer }; 