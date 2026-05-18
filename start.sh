#!/bin/bash
# Install backend dependencies if needed
cd /home/runner/workspace/backend && npm install --silent

# Start the backend server in background
node src/index.js &

# Give server a moment to start
sleep 2

# Install frontend dependencies if needed
cd /home/runner/workspace/frontend && npm install --silent

# Start the frontend
npx vite --host 0.0.0.0 --port 5000
