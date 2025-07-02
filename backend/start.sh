#!/bin/bash

# EduFund Backend Startup Script

echo "🎓 Starting EduFund Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Please copy env.example to .env and configure your settings:"
    echo "   cp env.example .env"
    echo "   Then edit .env with your configuration"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p logs uploads

# Check if MongoDB is running (optional check)
if command -v mongod &> /dev/null; then
    if ! pgrep -x "mongod" > /dev/null; then
        echo "⚠️  MongoDB is not running. Please start MongoDB first."
        echo "   On macOS: brew services start mongodb-community"
        echo "   On Ubuntu: sudo systemctl start mongod"
        echo "   Or use MongoDB Atlas cloud service"
    fi
fi

# Start the server
echo "🚀 Starting server..."
echo "📍 Server will be available at: http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/health"
echo "📚 API docs: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
npm run dev 
 