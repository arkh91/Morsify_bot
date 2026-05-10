#!/bin/bash

# ─────────────────────────────────────────────────────────────
# Morsify Bot Initializer
# ─────────────────────────────────────────────────────────────

# =========================
# Check Root
# =========================
check_root() {
    if [ "$EUID" -ne 0 ]; then
        echo "[✗] Please run this script as root."
        echo ""
        echo "Example:"
        echo "sudo bash Initializing.sh"
        exit 1
    fi

    echo "[✓] Running as root."
}

# =========================
# Install Dependencies
# =========================
install_dependencies() {

    echo "[+] Updating system packages..."
    apt update -y
    apt upgrade -y

    echo "[+] Installing required packages..."
    apt install -y \
        curl \
        wget \
        git \
        unzip \
        mysql-server \
        build-essential

    echo "[+] Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs

    echo "[+] Installing PM2..."
    npm install -g pm2

    echo "[+] Installing npm dependencies..."

    npm install \
        axios \
        express \
        mysql2 \
        node-telegram-bot-api

    echo "[✓] Dependencies installed."
}

# =========================
# Initialize Database
# =========================
initialize_database() {

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " MySQL Database Configuration"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    read -p "Enter MySQL username: " DB_USER
    read -s -p "Enter MySQL password: " DB_PASSWORD
    echo ""
    
    DB_NAME="Morsify"

    echo ""
    echo "[+] Creating database and tables..."

    mysql <<EOF

CREATE DATABASE IF NOT EXISTS ${DB_NAME};

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'
IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

FLUSH PRIVILEGES;

USE ${DB_NAME};

CREATE TABLE IF NOT EXISTS accounts (
    UserID BIGINT PRIMARY KEY,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Username VARCHAR(50),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    UserID BIGINT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Username VARCHAR(50),
    UsedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID)
        REFERENCES accounts(UserID)
        ON DELETE CASCADE
);

EOF

    echo "[✓] Database initialized successfully."

    # Optional db.js generator
    cat > db.js <<EOF
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: '${DB_USER}',
    password: '${DB_PASSWORD}',
    database: '${DB_NAME}',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;
EOF

    echo "[✓] db.js generated successfully."
}

# =========================
# Main
# =========================
main() {

    check_root
    install_dependencies
    initialize_database

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo " Morsify Installation Complete"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Start bot:"
    echo "pm2 start main.js --name Morsify"
    echo ""
    echo "Save PM2:"
    echo "pm2 save"
    echo ""
}

main
