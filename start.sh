#!/bin/bash
# Start the backend server in background
cd /home/runner/workspace/server && node src/index.js &

# Give server a moment to start
sleep 2

# Start the frontend
cd /home/runner/workspace/client && npx vite --host 0.0.0.0 --port 5000
