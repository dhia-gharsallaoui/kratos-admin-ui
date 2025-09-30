#!/bin/bash

# Start local development with mock servers
# This script starts the mock Kratos/Hydra servers and Next.js dev server

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting local development environment...${NC}\n"

# Cleanup function
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
  if [ ! -z "$MOCK_PID" ]; then
    kill $MOCK_PID 2>/dev/null || true
  fi
  if [ ! -z "$NEXT_PID" ]; then
    kill $NEXT_PID 2>/dev/null || true
  fi
  exit 0
}

# Set up cleanup on exit
trap cleanup SIGINT SIGTERM EXIT

# Start mock server in background
echo -e "${GREEN}Starting mock Kratos/Hydra servers...${NC}"
node dev/mock-server.js &
MOCK_PID=$!

# Wait a moment for mock servers to start
sleep 2

# Check if mock server is still running
if ! kill -0 $MOCK_PID 2>/dev/null; then
  echo -e "${YELLOW}⚠️  Mock server failed to start${NC}"
  exit 1
fi

echo -e "\n${GREEN}Starting Next.js dev server...${NC}\n"

# Start Next.js dev server
npm run dev &
NEXT_PID=$!

# Wait for both processes
wait
