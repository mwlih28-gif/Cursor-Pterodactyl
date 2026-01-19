# 🦖 Gaming Control Panel - Pterodactyl Alternative

High-performance game server control panel with microservices architecture. Modern, dark-themed UI similar to Pterodactyl with advanced features.

![GitHub](https://img.shields.io/github/license/yourusername/gaming-panel)
![GitHub stars](https://img.shields.io/github/stars/yourusername/gaming-panel)
![GitHub issues](https://img.shields.io/github/issues/yourusername/gaming-panel)

## 🚀 Hızlı Kurulum (Otomatik)

### Tek Komut Kurulum

```bash
bash <(curl -s https://raw.githubusercontent.com/yourusername/gaming-panel/main/installer.sh)
```

### Manuel Kurulum

```bash
git clone https://github.com/yourusername/gaming-panel.git
cd gaming-panel
chmod +x install.sh
sudo ./install.sh
```

**Detaylı kurulum dokümantasyonu için:** [README_INSTALLER.md](README_INSTALLER.md)

## 📸 Özellikler

### 🎨 Modern Dark Theme UI
- Pterodactyl benzeri dark theme tasarımı
- Responsive ve modern arayüz
- Real-time console (Xterm.js)
- Resource monitoring grafikleri

### 🖥️ Server Management
- Docker container yönetimi
- Server start/stop/restart
- Real-time metrics (CPU, RAM, Disk, Network)
- WebSocket console desteği
- Backup & Restore sistemi

### 🔐 Security
- JWT Authentication with Refresh Tokens
- Role-Based Access Control (RBAC)
- Rate limiting
- Audit logging
- SSL/HTTPS desteği

### 🔌 Plugin System
- Plugin installer
- Extensible architecture
- Community plugins

### 👥 User Management
- User administration
- Role management
- Activity tracking
- Login history

### 📊 Monitoring
- Real-time resource charts
- Server statistics
- Node monitoring
- Network metrics

## 🏗️ Architecture

```
Frontend (Next.js 14) → API Gateway (Go/Fiber) → Backend Services → Daemon (Node Agent) → Docker Containers
```

## 📦 Components

- **Frontend**: Next.js 14 with TailwindCSS, WebSocket for real-time console
- **API Gateway**: Go with Fiber framework, JWT authentication, gRPC communication
- **Daemon**: Node Agent managing Docker containers for game servers
- **Database**: PostgreSQL for relational data, Redis for caching and queues

## 🔧 Prerequisites

- Go 1.21+
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+
- Ubuntu 20.04+ / Debian 11+

## 📖 Quick Start

### Backend Setup
```bash
cd backend
go mod download
cp .env.example .env
# Edit .env with your configurations
go run main.go
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Daemon Setup
```bash
cd daemon
go mod download
cp .env.example .env
go run main.go
```

### Docker Compose (Full Stack)
```bash
docker-compose up -d
```

## 🎮 Minecraft Server Kurulumu

### 1. Panel Kurulumu
```bash
bash <(curl -s https://raw.githubusercontent.com/yourusername/gaming-panel/main/installer.sh)
```

### 2. Node Oluştur
- Admin Panel > Nodes > Create New
- Node bilgilerini gir (IP, Port, Resources)

### 3. Allocation Ekle
- Node detay sayfası > Allocations
- IP:Port çiftleri ekle (örn: 178.208.187.30:25565)

### 4. Minecraft Server Oluştur
- Dashboard > Create Server
- Server Type: Minecraft
- Docker Image: `itzg/minecraft-server`
- Resources ayarla (RAM, CPU, Disk)
- Allocation seç

### 5. Server Başlat
- Server detay sayfası > Start
- Console'dan server durumunu izle

## 📚 Documentation

- [Installation Guide](README_INSTALLER.md)
- [Architecture Documentation](ARCHITECTURE.md)
- [Setup Guide](SETUP.md)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by [Pterodactyl](https://pterodactyl.io)
- Built with Go, Next.js, and Docker

## 📞 Support

For support, open an issue on GitHub or check the documentation.

---

⭐ If you like this project, please give it a star on GitHub!
