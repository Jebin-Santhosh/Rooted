#!/bin/bash
# =============================================================================
# EC2 Initial Setup Script for RootED Backend
# Run this on a fresh Amazon Linux 2023 / Ubuntu EC2 instance
# =============================================================================

set -e

echo "=========================================="
echo "RootED Backend - EC2 Setup Script"
echo "=========================================="

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS"
    exit 1
fi

echo "Detected OS: $OS"

# Update system
echo "Updating system packages..."
if [ "$OS" = "amzn" ] || [ "$OS" = "amazon" ]; then
    sudo yum update -y
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get update && sudo apt-get upgrade -y
fi

# Install Docker
echo "Installing Docker..."
if [ "$OS" = "amzn" ] || [ "$OS" = "amazon" ]; then
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
echo "Installing Docker Compose..."
DOCKER_COMPOSE_VERSION="v2.24.0"
sudo curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "Installing Git..."
if [ "$OS" = "amzn" ] || [ "$OS" = "amazon" ]; then
    sudo yum install -y git
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y git
fi

# Create app directory
echo "Creating application directory..."
sudo mkdir -p /opt/rooted
sudo chown $USER:$USER /opt/rooted

# Install useful tools
echo "Installing additional tools..."
if [ "$OS" = "amzn" ] || [ "$OS" = "amazon" ]; then
    sudo yum install -y htop vim nano
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y htop vim nano
fi

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Log out and log back in (for docker group)"
echo "2. Clone your repo: git clone <your-repo> /opt/rooted"
echo "3. Create .env file with GEMINI_API_KEY"
echo "4. Run: cd /opt/rooted/backend && ./scripts/deploy.sh"
echo ""
echo "Or run: newgrp docker (to use docker without logout)"
