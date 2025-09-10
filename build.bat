@echo off
echo 🔧 Building configuration from .env file...
node build-config.js
if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
    echo 🚀 Starting development server...
    python -m http.server 8000
) else (
    echo ❌ Build failed!
    pause
)
