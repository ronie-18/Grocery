/**
 * Enhanced Express server to handle product sync requests
 * Provides reliable auto-sync for products-data.js file
 * Run this alongside your main application to enable auto-sync
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { syncProductsFromFirestore } = require('./sync-products');

const app = express();
const PORT = process.env.SYNC_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'products-sync-server',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Enhanced sync products endpoint
app.post('/api/sync-products', async (req, res) => {
  try {
    console.log('🔄 Received sync request from admin panel');
    console.log('📝 Request body:', req.body);
    
    // Start sync process
    const startTime = Date.now();
    await syncProductsFromFirestore();
    const duration = Date.now() - startTime;
    
    // Verify the file was created/updated
    const outputPath = path.join(__dirname, '..', 'products-data.js');
    const fileExists = fs.existsSync(outputPath);
    const fileStats = fileExists ? fs.statSync(outputPath) : null;
    
    const response = {
      success: true,
      message: 'Products synced successfully',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      fileInfo: fileExists ? {
        exists: true,
        size: fileStats.size,
        modified: fileStats.mtime.toISOString()
      } : { exists: false }
    };
    
    console.log('✅ Sync completed successfully:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      details: error.stack
    };
    
    res.status(500).json(errorResponse);
  }
});

// Manual trigger endpoint (for testing)
app.get('/api/sync-products', async (req, res) => {
  try {
    console.log('🔄 Manual sync triggered via GET request');
    
    const startTime = Date.now();
    await syncProductsFromFirestore();
    const duration = Date.now() - startTime;
    
    res.json({ 
      success: true, 
      message: 'Manual sync completed',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });
    
  } catch (error) {
    console.error('❌ Manual sync failed:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Status endpoint to check sync server capabilities
app.get('/api/status', (req, res) => {
  const outputPath = path.join(__dirname, '..', 'products-data.js');
  const fileExists = fs.existsSync(outputPath);
  const fileStats = fileExists ? fs.statSync(outputPath) : null;
  
  res.json({
    server: {
      status: 'running',
      port: PORT,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    },
    sync: {
      available: true,
      lastModified: fileExists ? fileStats.mtime.toISOString() : null,
      fileSize: fileExists ? fileStats.size : 0
    },
    endpoints: {
      sync: '/api/sync-products',
      health: '/health',
      status: '/api/status'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ================================');
  console.log('🚀 Products Sync Server Started!');
  console.log('🚀 ================================');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`🔄 Sync endpoint: http://localhost:${PORT}/api/sync-products`);
  console.log(`📊 Status check: http://localhost:${PORT}/api/status`);
  console.log('💡 Admin panel can now auto-sync products!');
  console.log('🎯 Auto-sync will trigger whenever you add/edit/delete products');
  console.log('');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please:`);
    console.error('   1. Stop any existing sync server');
    console.error('   2. Try a different port: SYNC_PORT=3002 npm run start-sync-server');
    console.error('   3. Or kill the process using this port');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

module.exports = app; 