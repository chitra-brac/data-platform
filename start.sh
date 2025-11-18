#!/bin/bash

echo "🚀 Starting Family Law Data Showcase..."
echo ""

# Check if API dependencies are installed
echo "📦 Checking API dependencies..."
pip show fastapi > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "Installing API dependencies..."
    pip install -r api/requirements.txt
fi

# Check if frontend dependencies are installed
echo "📦 Checking frontend dependencies..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "Starting servers..."
echo ""

# Start API in background
echo "🔧 Starting API server on http://localhost:8000"
cd api && python main.py &
API_PID=$!
cd ..

# Wait for API to start
sleep 3

# Start frontend
echo "🎨 Starting frontend on http://localhost:3000"
cd frontend && npm run dev

# Cleanup on exit
trap "echo 'Stopping servers...'; kill $API_PID" EXIT
