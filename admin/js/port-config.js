// Port Configuration for Different Development Servers
// Automatically detects and configures URLs based on current port

class PortConfig {
    constructor() {
        this.currentPort = window.location.port || '80';
        this.currentHost = window.location.hostname || 'localhost';
        this.protocol = window.location.protocol || 'http:';
        
        this.init();
    }
    
    init() {
        console.log('🌐 Port Configuration Initializing...');
        console.log(`📍 Current URL: ${window.location.href}`);
        console.log(`🚪 Port: ${this.currentPort}`);
        console.log(`🏠 Host: ${this.currentHost}`);
        
        // Configure URLs based on port
        this.configureForCurrentPort();
        
        // Set global configuration
        this.setGlobalConfig();
        
        console.log('✅ Port configuration complete');
    }
    
    configureForCurrentPort() {
        switch(this.currentPort) {
            case '5501':
                console.log('🔧 Detected Live Server (port 5501) - Cursor/VS Code');
                this.setupForLiveServer();
                break;
                
            case '8000':
                console.log('🔧 Detected Python HTTP Server (port 8000)');
                this.setupForPythonServer();
                break;
                
            case '3000':
                console.log('🔧 Detected Node.js Development Server (port 3000)');
                this.setupForNodeServer();
                break;
                
            default:
                console.log('🔧 Unknown port, using default configuration');
                this.setupDefault();
                break;
        }
    }
    
    setupForLiveServer() {
        this.config = {
            serverType: 'live-server',
            autoSyncUrl: 'http://localhost:3001/api/sync-products',
            baseUrl: `${this.protocol}//${this.currentHost}:${this.currentPort}`,
            corsEnabled: true,
            allowedOrigins: ['http://127.0.0.1:5501', 'http://localhost:5501'],
            notes: 'Using Cursor/VS Code Live Server extension'
        };
    }
    
    setupForPythonServer() {
        this.config = {
            serverType: 'python-http',
            autoSyncUrl: 'http://localhost:3001/api/sync-products',
            baseUrl: `${this.protocol}//${this.currentHost}:${this.currentPort}`,
            corsEnabled: false,
            allowedOrigins: ['http://localhost:8000'],
            notes: 'Using Python http.server'
        };
    }
    
    setupForNodeServer() {
        this.config = {
            serverType: 'node-dev',
            autoSyncUrl: 'http://localhost:3001/api/sync-products',
            baseUrl: `${this.protocol}//${this.currentHost}:${this.currentPort}`,
            corsEnabled: true,
            allowedOrigins: ['http://localhost:3000'],
            notes: 'Using Node.js development server'
        };
    }
    
    setupDefault() {
        this.config = {
            serverType: 'unknown',
            autoSyncUrl: 'http://localhost:3001/api/sync-products',
            baseUrl: `${this.protocol}//${this.currentHost}:${this.currentPort}`,
            corsEnabled: true,
            allowedOrigins: [`${this.protocol}//${this.currentHost}:${this.currentPort}`],
            notes: 'Default configuration for unknown server'
        };
    }
    
    setGlobalConfig() {
        // Set global configuration object
        window.portConfig = this.config;
        
        // Set individual global variables for backward compatibility
        window.AUTO_SYNC_URL = this.config.autoSyncUrl;
        window.BASE_URL = this.config.baseUrl;
        window.SERVER_TYPE = this.config.serverType;
        
        // Log configuration
        console.log('🔧 Global configuration set:', this.config);
    }
    
    // Helper methods
    getAutoSyncUrl() {
        return this.config.autoSyncUrl;
    }
    
    getBaseUrl() {
        return this.config.baseUrl;
    }
    
    isLiveServer() {
        return this.config.serverType === 'live-server';
    }
    
    isPythonServer() {
        return this.config.serverType === 'python-http';
    }
    
    getCorsHeaders() {
        if (this.config.corsEnabled) {
            return {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': this.config.allowedOrigins[0] || '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            };
        }
        return {
            'Content-Type': 'application/json'
        };
    }
    
    // Test connectivity to auto-sync server
    async testAutoSyncConnection() {
        try {
            console.log('🧪 Testing auto-sync server connection...');
            
            const response = await fetch('http://localhost:3001/health', {
                method: 'GET',
                headers: this.getCorsHeaders()
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Auto-sync server connection successful:', result);
                return { success: true, result };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
        } catch (error) {
            console.error('❌ Auto-sync server connection failed:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Show current configuration info
    showConfigInfo() {
        const info = `
🌐 Current Configuration:
📍 URL: ${window.location.href}
🚪 Port: ${this.currentPort}
🔧 Server Type: ${this.config.serverType}
🔗 Auto-sync URL: ${this.config.autoSyncUrl}
📝 Notes: ${this.config.notes}
        `;
        
        console.log(info);
        return this.config;
    }
}

// Initialize port configuration immediately
const portConfigManager = new PortConfig();

// Test auto-sync connection after initialization
setTimeout(() => {
    portConfigManager.testAutoSyncConnection();
}, 1000);

// Export for global access
window.portConfigManager = portConfigManager; 