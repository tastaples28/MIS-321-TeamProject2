#!/bin/bash

echo "🚀 Starting Ocean-Friendly Product Finder API..."

# Kill any existing processes on port 5001
echo "🔍 Checking for existing processes on port 5001..."
lsof -ti:5001 | xargs kill -9 2>/dev/null || echo "No existing processes found"

# Wait a moment for the port to be released
sleep 2

# Navigate to API directory
cd "$(dirname "$0")/api"

# Build the project
echo "🔨 Building the API project..."
dotnet build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please check for compilation errors."
    exit 1
fi

echo "✅ Build successful!"

# Start the API
echo "🌊 Starting API server on http://localhost:5001..."
echo "📝 API will be available at:"
echo "   - Swagger UI: http://localhost:5001/swagger"
echo "   - User Registration: http://localhost:5001/api/userauth/register"
echo "   - User Login: http://localhost:5001/api/userauth/login"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

dotnet run
