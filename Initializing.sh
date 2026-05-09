#!/bin/bash

# ─────────────────────────────────────────────
# Morsify Telegram Bot - Full Dependency Setup
# Ubuntu / Debian
# ─────────────────────────────────────────────

set -e

echo "Updating packages..."
sudo apt update && sudo apt upgrade -y

echo "Installing system dependencies..."
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    build-essential \
    software-properties-common \
    ca-certificates

# Install Node.js 20
echo "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "Installing PM2..."
sudo npm install -g pm2

# ─────────────────────────────────────────────
# Install Telegram Bot + Project Dependencies
# ─────────────────────────────────────────────

echo "Installing Node.js libraries..."

npm install \
    node-telegram-bot-api \
    express \
    axios \
    mysql \
    dotenv

# Optional useful packages
npm install \
    cors \
    moment \
    uuid

echo ""
echo "─────────────────────────────────────────────"
echo "Installed packages:"
echo " - node-telegram-bot-api"
echo " - express"
echo " - axios"
echo " - mysql"
echo " - dotenv"
echo " - pm2"
echo "─────────────────────────────────────────────"

echo ""
echo "Node Version:"
node -v

echo "NPM Version:"
npm -v

echo ""
echo "Done."
echo ""

echo "Start your bot with:"
echo "node main.js"

echo ""
echo "Or use PM2:"
echo "pm2 start main.js --name morsify"
