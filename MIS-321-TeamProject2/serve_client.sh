#!/bin/bash

echo "🌐 Starting web server for HTML files..."
echo "📁 Serving files from: $(pwd)/Client"
echo "🌊 Client will be available at: http://localhost:5000"
echo "🔗 API is available at: http://localhost:5001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Navigate to Client directory
cd "$(dirname "$0")/Client"

# Start Python web server on port 5000
python3 -m http.server 5000
