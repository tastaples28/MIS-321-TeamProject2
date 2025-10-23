#!/bin/bash

echo "🗑️  Clearing Ocean-Friendly Product Finder Database..."

# Start the API in the background
cd /Users/mollywaldron/Documents/MIS321/MIS-321-TeamProject2/MIS-321-TeamProject2/api
dotnet run &
API_PID=$!

# Wait for API to start
echo "⏳ Waiting for API to start..."
sleep 15

# Test if API is running
if curl -s -I http://localhost:5001/api/admin/users > /dev/null 2>&1; then
    echo "✅ API is running!"
    
    # Clear the database
    echo "🧹 Clearing database..."
    RESPONSE=$(curl -s -X POST http://localhost:5001/api/admin/clear-database)
    
    if echo "$RESPONSE" | grep -q "successfully"; then
        echo "🎉 Database cleared successfully!"
        echo "📝 You can now manually enter your own data."
        echo "👤 Default admin user: admin / admin123"
    else
        echo "❌ Error clearing database: $RESPONSE"
    fi
else
    echo "❌ API is not running. Please start it manually and try again."
fi

# Stop the API
echo "🛑 Stopping API..."
kill $API_PID 2>/dev/null

echo "✅ Done!"
