#!/bin/bash

echo "🌊 Starting Ocean-Friendly Product Finder Application..."
echo ""

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
echo ""

# Start the API
echo "🌊 Starting API server on http://localhost:5001..."
echo "📝 Application will be available at:"
echo "   - Main App: http://localhost:5001/"
echo "   - Admin Panel: http://localhost:5001/admin.html"
echo "   - Login: http://localhost:5001/login.html"
echo "   - Signup: http://localhost:5001/signup.html"
echo "   - Product Lookup: http://localhost:5001/lookup.html"
echo "   - Swagger API Docs: http://localhost:5001/swagger"
echo ""
echo "🎉 Both API and HTML files are now served from the same port!"
echo "   This resolves the CORS issue and allows the frontend to communicate with the API."
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

dotnet run
