#!/bin/bash

# Setup script for GitHub Actions deployment secrets
# This script helps you generate SSH keys and find deployment information

set -e

echo "🔐 GitHub Actions Deployment Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Generate SSH Key
echo -e "${BLUE}Step 1: Generating SSH Key Pair${NC}"
echo "----------------------------------------"

KEY_NAME="github_deploy"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

if [ -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}⚠️  Key $KEY_PATH already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Using existing key..."
    else
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
        ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$KEY_PATH" -N ""
        echo -e "${GREEN}✅ New SSH key generated${NC}"
    fi
else
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$KEY_PATH" -N ""
    echo -e "${GREEN}✅ SSH key generated${NC}"
fi

# Step 2: Display Public Key
echo ""
echo -e "${BLUE}Step 2: Public Key (to add to server)${NC}"
echo "----------------------------------------"
echo -e "${GREEN}Copy this public key and add it to your server's ~/.ssh/authorized_keys:${NC}"
echo ""
cat "$KEY_PATH.pub"
echo ""

# Step 3: Display Private Key
echo ""
echo -e "${BLUE}Step 3: Private Key (for GitHub Secret: DEPLOY_SSH_KEY)${NC}"
echo "----------------------------------------"
echo -e "${YELLOW}⚠️  WARNING: This is your PRIVATE KEY. Keep it secret!${NC}"
echo -e "${GREEN}Copy this entire output (including BEGIN/END lines) for GitHub Secret:${NC}"
echo ""
cat "$KEY_PATH"
echo ""

# Step 4: Get Server Information
echo ""
echo -e "${BLUE}Step 4: Server Information${NC}"
echo "----------------------------------------"
read -p "Enter your server IP or hostname: " SERVER_HOST
read -p "Enter your SSH username (default: deploy): " SERVER_USER
SERVER_USER=${SERVER_USER:-deploy}
read -p "Enter SSH port (default: 22): " SERVER_PORT
SERVER_PORT=${SERVER_PORT:-22}

# Step 5: Test Connection
echo ""
echo -e "${BLUE}Step 5: Testing SSH Connection${NC}"
echo "----------------------------------------"
echo "Attempting to connect to $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

if ssh -i "$KEY_PATH" -p "$SERVER_PORT" -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_HOST" "echo 'Connection successful!'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful!${NC}"

    # Check if Docker is installed
    echo ""
    echo "Checking Docker installation..."
    if ssh -i "$KEY_PATH" -p "$SERVER_PORT" "$SERVER_USER@$SERVER_HOST" "docker --version" 2>/dev/null; then
        echo -e "${GREEN}✅ Docker is installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker is not installed on the server${NC}"
        echo "Install Docker with: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    fi
else
    echo -e "${YELLOW}⚠️  Could not connect. Make sure:${NC}"
    echo "  1. Public key is added to server's ~/.ssh/authorized_keys"
    echo "  2. Server IP and username are correct"
    echo "  3. Firewall allows SSH connections"
    echo ""
    echo "To add the public key manually:"
    echo "  ssh-copy-id -i $KEY_PATH.pub -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
fi

# Step 6: Summary
echo ""
echo -e "${BLUE}Step 6: GitHub Secrets Summary${NC}"
echo "----------------------------------------"
echo ""
echo "Add these secrets to GitHub:"
echo "  Repository → Settings → Secrets and variables → Actions"
echo ""
echo -e "${GREEN}DEPLOY_HOST:${NC}"
echo "  $SERVER_HOST"
echo ""
echo -e "${GREEN}DEPLOY_USER:${NC}"
echo "  $SERVER_USER"
echo ""
echo -e "${GREEN}DEPLOY_SSH_KEY:${NC}"
echo "  (See private key above - copy entire content)"
echo ""
if [ "$SERVER_PORT" != "22" ]; then
    echo -e "${GREEN}DEPLOY_PORT:${NC}"
    echo "  $SERVER_PORT"
    echo ""
fi

echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Add the secrets to GitHub (see above)"
echo "  2. Push code to trigger the build workflow"
echo "  3. Check GitHub Actions tab for deployment status"
