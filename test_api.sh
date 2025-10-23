#!/bin/bash

echo "🧪 Testing Ocean-Friendly Product Finder API..."

API_BASE="http://localhost:5001/api"

# Test if API is running
echo "1. Testing if API is running..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/admin/users")
if [ "$response" = "200" ]; then
    echo "✅ API is running!"
else
    echo "❌ API is not running (HTTP $response)"
    echo "Please start the API first with: ./start_api.sh"
    exit 1
fi

# Test user registration endpoint
echo ""
echo "2. Testing user registration endpoint..."
curl -X POST "$API_BASE/userauth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "sensitivityPreferences": "Coral reef protection"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "3. Testing user login endpoint..."
curl -X POST "$API_BASE/userauth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "4. Testing products endpoint..."
curl -s "$API_BASE/products?pageSize=3" | head -5

echo ""
echo "✅ API testing complete!"
