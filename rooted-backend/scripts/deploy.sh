#!/bin/bash
# =============================================================================
# RootED Backend - Deployment Script
# Run this to deploy/update the application
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================="
echo "RootED Backend - Deployment"
echo "=========================================="

cd "$BACKEND_DIR"

# Check if Docker storage needs migration to /data (for disk space)
if [ -d /data ] && [ ! -L /var/lib/docker ] && [ -d /var/lib/docker ]; then
    echo "Migrating Docker storage to /data for more space..."
    sudo systemctl stop docker
    sudo mv /var/lib/docker /data/docker
    sudo ln -s /data/docker /var/lib/docker
    sudo systemctl start docker
    echo "Docker storage migrated to /data!"
fi

# Clean up Docker to free space
echo "Cleaning up Docker..."
docker system prune -f

# Check for .env file
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Create .env file with:"
    echo "  GEMINI_API_KEY=your_key_here"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=." .env; then
    echo "ERROR: GEMINI_API_KEY not set in .env file!"
    exit 1
fi

echo "Building Docker image..."
docker-compose build

echo "Stopping existing containers..."
docker-compose down || true

echo "Starting new containers..."
docker-compose up -d

echo "Waiting for health check..."
sleep 5

# Check health
if curl -s http://localhost:8000/health | grep -q "healthy"; then
    echo "=========================================="
    echo "Deployment Successful!"
    echo "=========================================="
    echo ""
    echo "API is running at: http://localhost:8000"
    echo "Health check: http://localhost:8000/health"
    echo ""
    echo "View logs: docker-compose logs -f"
else
    echo "=========================================="
    echo "Deployment may have issues!"
    echo "=========================================="
    echo "Check logs: docker-compose logs"
fi
