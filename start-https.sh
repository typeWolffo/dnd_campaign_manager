#!/bin/bash

echo "🚀 Starting D&D Campaign Manager with HTTPS proxy..."

# Start Caddy
echo "🔄 Starting Caddy..."
cd reverse-proxy
npm run start
cd ..

# Start backend
echo "🖥️ Starting backend..."
cd api
bun run dev &
API_PID=$!
cd ..

# Start frontend
echo "🎨 Starting frontend..."
cd web
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ All started!"
echo "📱 https://app.dnd.localhost"
echo "🔌 https://api.dnd.localhost"
echo ""
echo "Stop: kill $API_PID $FRONTEND_PID && cd reverse-proxy && npm run stop"

wait
