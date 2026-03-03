#!/bin/bash
# =============================================================================
# SSH into RootED EC2 Instance
# =============================================================================

EC2_IP="13.61.162.222"
KEY_PATH="/Users/sandhanakrishnan/project_Z/backend/rooted.pem"
USER="ubuntu"

# Fix permissions if needed
chmod 400 "$KEY_PATH" 2>/dev/null

# Connect
ssh -i "$KEY_PATH" "$USER@$EC2_IP"
