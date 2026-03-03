#!/bin/bash
# =============================================================================
# RootED Backend - Start Script
# =============================================================================

cd "$(dirname "$0")/.."

docker-compose up -d
echo "RootED API started. View logs: docker-compose logs -f"
