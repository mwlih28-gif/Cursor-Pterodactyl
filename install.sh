#!/bin/bash

set -e

######################################################################################
#                                                                                    #
# Project 'gaming-panel-installer'                                                    #
#                                                                                    #
# Copyright (C) 2024 - 2026, Gaming Panel Installer                                 #
#                                                                                    #
#   This program is free software: you can redistribute it and/or modify             #
#   it under the terms of the GNU General Public License as published by             #
#   the Free Software Foundation, either version 3 of the License, or                #
#   (at your option) any later version.                                              #
#                                                                                    #
#   This program is distributed in the hope that it will be useful,                  #
#   but WITHOUT ANY WARRANTY; without even the implied warranty of                   #
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                    #
#   GNU General Public License for more details.                                     #
#                                                                                    #
######################################################################################

# Versiyon bilgisi
export GITHUB_SOURCE="v1.0.0"
export SCRIPT_RELEASE="v1.0.0"
export GITHUB_BASE_URL="https://raw.githubusercontent.com/mwlih28-gif/Cursor-Pterodactyl/main"

LOG_PATH="/var/log/gaming-panel-installer.log"

# Renkler
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Yardımcı fonksiyonlar
output() {
    echo -e "* ${1}"
}

error() {
    echo -e "${RED}* [ERROR]${NC} ${1}"
    exit 1
}

warning() {
    echo -e "${YELLOW}* [WARNING]${NC} ${1}"
}

success() {
    echo -e "${GREEN}* [SUCCESS]${NC} ${1}"
}

info() {
    echo -e "${BLUE}* [INFO]${NC} ${1}"
}

# curl kontrolü
if ! [ -x "$(command -v curl)" ]; then
    error "curl is required in order for this script to work."
    error "Install using: apt-get install curl (Debian) or yum install curl (CentOS)"
fi

# Root kontrolü
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root. Use: sudo bash $0"
fi

# Banner
welcome() {
    clear
    cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🦖 GAMING CONTROL PANEL - INSTALLER                 ║
║                                                              ║
║          High-Performance Game Server Management             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
EOF
    output ""
    output "This installer will guide you through setting up your Gaming Control Panel."
    output ""
    sleep 2
}

# Ana kurulum fonksiyonu
execute() {
    echo -e "\n\n* gaming-panel-installer $(date) - Installing $1\n\n" >>$LOG_PATH
    
    case "$1" in
        "panel")
            install_panel
            ;;
        "daemon")
            install_daemon
            ;;
        "panel;daemon")
            install_panel
            info "Panel installation completed. Proceeding to Daemon installation..."
            sleep 2
            install_daemon
            ;;
        "panel_ssl")
            install_panel_ssl
            ;;
        "uninstall")
            uninstall
            ;;
        *)
            error "Unknown installation type: $1"
            ;;
    esac
    
    if [[ -n $2 ]]; then
        echo ""
        output "Installation of $1 completed."
        echo -n "* Do you want to proceed to $2 installation? (y/N): "
        read -r CONFIRM
        if [[ "$CONFIRM" =~ [Yy] ]]; then
            execute "$2"
        else
            warning "Installation of $2 aborted."
            exit 0
        fi
    fi
}

# Panel kurulumu
install_panel() {
    output "Starting Panel installation..."
    output ""
    
    # Sistem kontrolü
    check_system
    
    # Kullanıcı girdileri
    get_panel_inputs
    
    # Bağımlılıkları kur
    install_dependencies
    
    # Veritabanını kur
    install_database
    
    # Backend'i kur
    install_backend
    
    # Frontend'i kur
    install_frontend
    
    # Nginx yapılandır
    configure_nginx
    
    # Systemd servisleri
    create_systemd_services
    
    # Admin kullanıcısı oluştur
    create_admin_user
    
    # Servisleri başlat
    start_services
    
    # Başarı mesajı
    print_panel_success
}

# Panel SSL ile kurulum
install_panel_ssl() {
    output "Starting Panel installation with SSL..."
    output ""
    
    USE_SSL=true
    install_panel
    
    # SSL kurulumu
    setup_ssl_certificate
}

# Daemon kurulumu
install_daemon() {
    output "Starting Daemon installation..."
    output ""
    
    # Sistem kontrolü
    check_system
    
    # Daemon girdileri
    get_daemon_inputs
    
    # Docker kurulumu
    install_docker
    
    # Daemon kurulumu
    install_daemon_service
    
    # Systemd servisi
    create_daemon_service
    
    # Servisi başlat
    systemctl start gaming-panel-daemon
    systemctl enable gaming-panel-daemon
    
    success "Daemon installed successfully!"
    output "Daemon is now running and listening for commands."
}

# Sistem kontrolü
check_system() {
    output "Checking system requirements..."
    
    # OS kontrolü
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        error "Cannot detect OS. Only Ubuntu 20.04+ and Debian 11+ are supported."
    fi
    
    case $OS in
        ubuntu)
            if (( $(echo "$VERSION" | cut -d. -f1) < 20 )); then
                error "Ubuntu 20.04 or higher is required. Current: $VERSION"
            fi
            ;;
        debian)
            if (( $(echo "$VERSION" | cut -d. -f1) < 11 )); then
                error "Debian 11 or higher is required. Current: $VERSION"
            fi
            ;;
        *)
            warning "Unsupported OS: $OS. Continuing anyway..."
            ;;
    esac
    
    success "OS: $OS $VERSION"
    
    # RAM kontrolü
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [[ $RAM_GB -lt 2 ]]; then
        warning "Recommended minimum RAM: 2GB (Current: ${RAM_GB}GB)"
    else
        success "RAM: ${RAM_GB}GB"
    fi
    
    # Disk kontrolü
    DISK_GB=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [[ $DISK_GB -lt 10 ]]; then
        error "Minimum 10GB free disk space required. Current: ${DISK_GB}GB"
    else
        success "Disk: ${DISK_GB}GB free"
    fi
    
    output ""
}

# Panel girdileri
get_panel_inputs() {
    output "Panel Configuration"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output ""
    
    # Domain
    echo -n "* Domain name (leave blank to use IP): "
    read -r DOMAIN
    DOMAIN="${DOMAIN:-}"
    
    # Email (SSL için)
    if [[ "$USE_SSL" == "true" ]] || [[ -n "$DOMAIN" ]]; then
        echo -n "* Email address for SSL certificate: "
        read -r EMAIL
        while [[ -z "$EMAIL" ]]; do
            warning "Email is required for SSL certificate"
            echo -n "* Email address: "
            read -r EMAIL
        done
    fi
    
    # Database bilgileri
    output ""
    output "Database Configuration"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -n "* Database name [gaming_panel]: "
    read -r DB_NAME
    DB_NAME="${DB_NAME:-gaming_panel}"
    
    echo -n "* Database username [postgres]: "
    read -r DB_USER
    DB_USER="${DB_USER:-postgres}"
    
    echo -n "* Database password (leave blank to auto-generate): "
    read -rs DB_PASSWORD
    if [[ -z "$DB_PASSWORD" ]]; then
        DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        success "Database password auto-generated"
    fi
    echo ""
    
    # Redis bilgileri
    output ""
    output "Redis Configuration"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -n "* Redis password (leave blank to auto-generate): "
    read -rs REDIS_PASSWORD
    if [[ -z "$REDIS_PASSWORD" ]]; then
        REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
        success "Redis password auto-generated"
    fi
    echo ""
    
    # Admin bilgileri
    output ""
    output "Admin Account Configuration"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo -n "* Admin email address: "
    read -r ADMIN_EMAIL
    while [[ -z "$ADMIN_EMAIL" ]]; do
        warning "Admin email is required"
        echo -n "* Admin email address: "
        read -r ADMIN_EMAIL
    done
    
    echo -n "* Admin username [admin]: "
    read -r ADMIN_USERNAME
    ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
    
    echo -n "* Admin password (leave blank to auto-generate): "
    read -rs ADMIN_PASSWORD
    if [[ -z "$ADMIN_PASSWORD" ]]; then
        ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
        success "Admin password auto-generated"
    fi
    echo ""
    
    # JWT Secret
    JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/")
    
    # Kurulum dizini
    INSTALL_DIR="/opt/gaming-panel"
    
    output ""
}

# Daemon girdileri
get_daemon_inputs() {
    output "Daemon Configuration"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output ""
    
    echo -n "* Node ID [node-1]: "
    read -r NODE_ID
    NODE_ID="${NODE_ID:-node-1}"
    
    echo -n "* Redis URL [redis://localhost:6379/0]: "
    read -r REDIS_URL
    REDIS_URL="${REDIS_URL:-redis://localhost:6379/0}"
    
    # Redis şifresi varsa ekle
    if [[ -n "$REDIS_PASSWORD" ]]; then
        REDIS_URL="redis://:${REDIS_PASSWORD}@localhost:6379/0"
    fi
    
    INSTALL_DIR="/opt/gaming-panel"
    
    output ""
}

# Bağımlılık kurulumu
install_dependencies() {
    output "Installing dependencies..."
    
    apt-get update -qq
    apt-get install -y -qq \
        curl \
        wget \
        git \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        htop \
        nano \
        unzip \
        jq \
        certbot \
        python3-certbot-nginx \
        postgresql \
        postgresql-contrib \
        redis-server \
        nginx \
        python3-pip
    
    pip3 install --quiet bcrypt 2>/dev/null || true
    
    success "Dependencies installed"
    output ""
}

# Veritabanı kurulumu
install_database() {
    output "Setting up database..."
    
    systemctl start postgresql
    systemctl enable postgresql
    
    # PostgreSQL şifre ayarla
    sudo -u postgres psql -c "ALTER USER $DB_USER PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
    
    # Veritabanı oluştur
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || warning "Database already exists"
    
    # pgcrypto extension
    sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" 2>/dev/null || true
    
    # Redis yapılandır
    if [[ -n "$REDIS_PASSWORD" ]]; then
        sed -i "s/# requirepass foobared/requirepass $REDIS_PASSWORD/" /etc/redis/redis.conf
        sed -i "s/bind 127.0.0.1 ::1/bind 127.0.0.1/" /etc/redis/redis.conf
        systemctl restart redis-server
        systemctl enable redis-server
    fi
    
    success "Database configured"
    output ""
}

# Backend kurulumu
install_backend() {
    output "Installing backend..."
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    # Kaynak kodları kopyala veya klonla
    if [[ -d "../backend" ]]; then
        cp -r ../backend "$INSTALL_DIR/"
    else
        error "Backend source code not found. Please ensure you're running from the project directory."
    fi
    
    cd "$INSTALL_DIR/backend"
    
    # Go kurulumu
    if ! command -v go &> /dev/null; then
        install_golang
    fi
    
    export PATH=$PATH:/usr/local/go/bin
    
    # Bağımlılıkları indir ve derle
    go mod download
    go build -o gaming-panel-api main.go
    
    # .env dosyası oluştur
    cat > .env << EOF
DATABASE_URL=postgres://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?sslmode=disable
REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:6379/0
JWT_SECRET=${JWT_SECRET}
ALLOWED_ORIGINS=http://localhost:3001${DOMAIN:+,https://${DOMAIN}}
PORT=3000
EOF
    
    # Database migration
    setup_database_schema
    
    success "Backend installed"
    output ""
}

# Go kurulumu
install_golang() {
    output "Installing Go..."
    
    GO_VERSION="1.21.5"
    wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz
    rm -rf /usr/local/go
    tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
    rm go${GO_VERSION}.linux-amd64.tar.gz
    
    export PATH=$PATH:/usr/local/go/bin
    echo 'export PATH=$PATH:/usr/local/go/bin' >> /etc/profile
    
    success "Go $GO_VERSION installed"
}

# Database şema kurulumu
setup_database_schema() {
    output "Setting up database schema..."
    
    sudo -u postgres psql -d $DB_NAME << SQL
-- Tabloları oluştur
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    owner_id INTEGER NOT NULL,
    node_id INTEGER NOT NULL,
    allocation_id INTEGER NOT NULL,
    docker_image VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    memory_limit BIGINT,
    cpu_limit BIGINT,
    disk_limit BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nodes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip VARCHAR(45) NOT NULL,
    port INTEGER DEFAULT 8080,
    total_ram BIGINT,
    total_cpu BIGINT,
    total_disk BIGINT,
    used_ram BIGINT DEFAULT 0,
    used_cpu BIGINT DEFAULT 0,
    used_disk BIGINT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS allocations (
    id SERIAL PRIMARY KEY,
    node_id INTEGER NOT NULL,
    ip VARCHAR(45) NOT NULL,
    port INTEGER NOT NULL,
    assigned BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(node_id, port)
);

CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    server_id INTEGER NOT NULL,
    size BIGINT,
    path VARCHAR(500) NOT NULL,
    is_success BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id INTEGER,
    ip VARCHAR(45),
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_servers_owner ON servers(owner_id);
CREATE INDEX IF NOT EXISTS idx_servers_node ON servers(node_id);
CREATE INDEX IF NOT EXISTS idx_allocations_node ON allocations(node_id);

-- Rolleri oluştur
INSERT INTO roles (name, permissions, created_at, updated_at)
VALUES ('admin', '{"*": true}', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, permissions, created_at, updated_at)
VALUES ('user', '{"server.view": true, "server.manage": true}', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
SQL
    
    success "Database schema created"
}

# Frontend kurulumu
install_frontend() {
    output "Installing frontend..."
    
    cd "$INSTALL_DIR"
    
    # Kaynak kodları kopyala
    if [[ -d "../frontend" ]]; then
        cp -r ../frontend "$INSTALL_DIR/"
    else
        error "Frontend source code not found."
    fi
    
    cd "$INSTALL_DIR/frontend"
    
    # Node.js kurulumu
    if ! command -v node &> /dev/null; then
        install_nodejs
    fi
    
    # Bağımlılıkları indir ve derle
    npm install --silent
    npm run build
    
    # .env.local dosyası
    if [[ -n "$DOMAIN" ]]; then
        PROTOCOL="http"
        [[ "$USE_SSL" == "true" ]] && PROTOCOL="https"
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=${PROTOCOL}://${DOMAIN}
NEXT_PUBLIC_WS_URL=${PROTOCOL}://${DOMAIN}
EOF
    else
        cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):3000
NEXT_PUBLIC_WS_URL=ws://$(hostname -I | awk '{print $1}'):3000
EOF
    fi
    
    success "Frontend installed"
    output ""
}

# Node.js kurulumu
install_nodejs() {
    output "Installing Node.js..."
    
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y -qq nodejs
    
    success "Node.js $(node -v) installed"
}

# Nginx yapılandırması
configure_nginx() {
    output "Configuring Nginx..."
    
    cat > /etc/nginx/sites-available/gaming-panel << EOF
upstream backend {
    server localhost:3000;
}

upstream frontend {
    server localhost:3001;
}

server {
    listen 80;
    server_name ${DOMAIN:-_};

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
}
EOF

    ln -sf /etc/nginx/sites-available/gaming-panel /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
    
    success "Nginx configured"
    output ""
}

# SSL sertifikası kurulumu
setup_ssl_certificate() {
    if [[ -z "$DOMAIN" ]] || [[ -z "$EMAIL" ]]; then
        warning "SSL setup skipped: Domain or email not provided"
        return
    fi
    
    output "Setting up SSL certificate..."
    
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect
    
    success "SSL certificate installed"
    output ""
}

# Systemd servisleri
create_systemd_services() {
    output "Creating systemd services..."
    
    # Backend servisi
    cat > /etc/systemd/system/gaming-panel-api.service << EOF
[Unit]
Description=Gaming Control Panel API
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/backend
Environment="PATH=/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=$INSTALL_DIR/backend/gaming-panel-api
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    # Frontend servisi
    cat > /etc/systemd/system/gaming-panel-frontend.service << EOF
[Unit]
Description=Gaming Control Panel Frontend
After=network.target gaming-panel-api.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable gaming-panel-api
    systemctl enable gaming-panel-frontend
    
    success "Systemd services created"
    output ""
}

# Admin kullanıcısı oluştur
create_admin_user() {
    output "Creating admin user..."
    
    # Şifre hash'i oluştur
    ADMIN_PASSWORD_HASH=$(create_password_hash "$ADMIN_PASSWORD")
    
    # Admin kullanıcısını veritabanına ekle
    sudo -u postgres psql -d $DB_NAME << SQL
INSERT INTO users (email, username, password_hash, role_id, created_at, updated_at)
SELECT 
    '${ADMIN_EMAIL}',
    '${ADMIN_USERNAME}',
    '${ADMIN_PASSWORD_HASH}',
    r.id,
    NOW(),
    NOW()
FROM roles r
WHERE r.name = 'admin'
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id;
SQL
    
    success "Admin user created"
    output ""
}

# Şifre hash fonksiyonu
create_password_hash() {
    local password="$1"
    
    # Go ile hash oluştur (öncelikli)
    cd /tmp
    cat > hash_pass.go << 'HASH_EOF'
package main
import (
    "fmt"
    "golang.org/x/crypto/bcrypt"
    "os"
)
func main() {
    if len(os.Args) < 2 {
        os.Exit(1)
    }
    hash, _ := bcrypt.GenerateFromPassword([]byte(os.Args[1]), bcrypt.DefaultCost)
    fmt.Print(string(hash))
}
HASH_EOF
    
    export PATH=$PATH:/usr/local/go/bin
    if command -v go &> /dev/null && go mod init temp 2>/dev/null && go get golang.org/x/crypto/bcrypt 2>/dev/null && go build -o hash_pass hash_pass.go 2>/dev/null; then
        HASH=$(./hash_pass "$password")
        rm -f hash_pass hash_pass.go go.mod go.sum 2>/dev/null || true
        echo "$HASH"
    else
        # Fallback: Python bcrypt
        python3 -c "import bcrypt; print(bcrypt.hashpw(b'$password', bcrypt.gensalt()).decode())" 2>/dev/null || echo ""
    fi
}

# Servisleri başlat
start_services() {
    output "Starting services..."
    
    systemctl start gaming-panel-api
    sleep 2
    systemctl start gaming-panel-frontend
    sleep 2
    
    success "Services started"
    output ""
}

# Daemon servisi kurulumu
install_daemon_service() {
    output "Installing daemon..."
    
    mkdir -p "$INSTALL_DIR"
    cd "$INSTALL_DIR"
    
    if [[ -d "../daemon" ]]; then
        cp -r ../daemon "$INSTALL_DIR/"
    else
        error "Daemon source code not found."
    fi
    
    cd "$INSTALL_DIR/daemon"
    
    # Go kurulumu
    if ! command -v go &> /dev/null; then
        install_golang
    fi
    
    export PATH=$PATH:/usr/local/go/bin
    
    go mod download
    go build -o gaming-panel-daemon main.go
    
    # .env dosyası
    cat > .env << EOF
NODE_ID=${NODE_ID}
REDIS_URL=${REDIS_URL}
DOCKER_HOST=unix:///var/run/docker.sock
EOF
    
    # Docker kurulumu
    if ! command -v docker &> /dev/null; then
        install_docker
    fi
    
    success "Daemon installed"
    output ""
}

# Docker kurulumu
install_docker() {
    output "Installing Docker..."
    
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    systemctl start docker
    systemctl enable docker
    
    success "Docker installed"
}

# Daemon systemd servisi
create_daemon_service() {
    cat > /etc/systemd/system/gaming-panel-daemon.service << EOF
[Unit]
Description=Gaming Control Panel Daemon
After=network.target docker.service redis.service

[Service]
Type=simple
User=root
WorkingDirectory=$INSTALL_DIR/daemon
Environment="PATH=/usr/local/go/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=$INSTALL_DIR/daemon/gaming-panel-daemon
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable gaming-panel-daemon
}

# Başarı mesajı
print_panel_success() {
    welcome
    output ""
    success "Panel installation completed successfully!"
    output ""
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "Access Information"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [[ -n "$DOMAIN" ]]; then
        PROTOCOL="http"
        [[ "$USE_SSL" == "true" ]] && PROTOCOL="https"
        output "Frontend: ${PROTOCOL}://${DOMAIN}"
        output "API:      ${PROTOCOL}://${DOMAIN}/api/v1"
    else
        IP=$(hostname -I | awk '{print $1}')
        output "Frontend: http://${IP}:3001"
        output "API:      http://${IP}:3000/api/v1"
    fi
    output ""
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "Admin Credentials"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "Email:    ${ADMIN_EMAIL}"
    output "Username: ${ADMIN_USERNAME}"
    output "Password: ${ADMIN_PASSWORD}"
    output ""
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "Database Information"
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "Database: ${DB_NAME}"
    output "Username: ${DB_USER}"
    output "Password: ${DB_PASSWORD}"
    output ""
    output "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    output "All credentials saved to: ${INSTALL_DIR}/credentials.txt"
    output ""
    
    # Credentials dosyası oluştur
    cat > "$INSTALL_DIR/credentials.txt" << EOF
╔══════════════════════════════════════════════════════════════╗
║          🦖 GAMING CONTROL PANEL - CREDENTIALS               ║
╚══════════════════════════════════════════════════════════════╝

Admin Account
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Email:    ${ADMIN_EMAIL}
Username: ${ADMIN_USERNAME}
Password: ${ADMIN_PASSWORD}

Database
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database: ${DB_NAME}
Username: ${DB_USER}
Password: ${DB_PASSWORD}

Redis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Password: ${REDIS_PASSWORD}

Access URLs
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend: ${DOMAIN:-http://$(hostname -I | awk '{print $1}'):3001}
API:      ${DOMAIN:-http://$(hostname -I | awk '{print $1}'):3000}/api/v1

⚠️  IMPORTANT: Keep this file secure!
EOF
    
    chmod 600 "$INSTALL_DIR/credentials.txt"
    
    output "Next steps:"
    output "1. Visit the frontend URL above"
    output "2. Login with the admin credentials"
    output "3. Create a node (Admin > Nodes)"
    output "4. Add allocations to the node"
    output "5. Create your first game server!"
    output ""
}

# Kaldırma
uninstall() {
    warning "This will remove Gaming Control Panel from your system."
    echo -n "* Are you sure? (y/N): "
    read -r CONFIRM
    
    if [[ ! "$CONFIRM" =~ [Yy] ]]; then
        output "Uninstallation aborted."
        exit 0
    fi
    
    output "Uninstalling..."
    
    # Servisleri durdur
    systemctl stop gaming-panel-api 2>/dev/null || true
    systemctl stop gaming-panel-frontend 2>/dev/null || true
    systemctl stop gaming-panel-daemon 2>/dev/null || true
    
    # Servisleri kaldır
    systemctl disable gaming-panel-api 2>/dev/null || true
    systemctl disable gaming-panel-frontend 2>/dev/null || true
    systemctl disable gaming-panel-daemon 2>/dev/null || true
    
    rm -f /etc/systemd/system/gaming-panel-*.service
    systemctl daemon-reload
    
    # Dosyaları kaldır
    rm -rf /opt/gaming-panel
    
    # Nginx yapılandırmasını kaldır
    rm -f /etc/nginx/sites-enabled/gaming-panel
    rm -f /etc/nginx/sites-available/gaming-panel
    nginx -t && systemctl reload nginx
    
    success "Uninstallation completed"
}

# Script başlat
welcome
