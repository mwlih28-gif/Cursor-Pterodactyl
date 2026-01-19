# 🚀 VPS'e Kurulum Rehberi

## 1. GitHub'dan Projeyi Çek

```bash
# SSH ile VPS'e bağlan
ssh root@your-vps-ip

# Projeyi klonla
git clone https://github.com/mwlih28-gif/Cursor-Pterodactyl.git
cd Cursor-Pterodactyl
```

## 2. Otomatik Kurulum Scriptini Çalıştır

```bash
# Kurulum scriptini çalıştırılabilir yap
chmod +x install.sh installer.sh

# Kurulumu başlat
sudo ./install.sh
```

Kurulum sırasında sorulacak sorular:
- Domain adresi (opsiyonel)
- SSL sertifikası (Let's Encrypt)
- Database adı, kullanıcı, şifre
- Redis şifresi
- Admin email, username, password

## 3. Kurulum Sonrası

Kurulum tamamlandıktan sonra:

```bash
# Giriş bilgilerini kontrol et
cat /opt/gaming-panel/credentials.txt

# Servis durumunu kontrol et
systemctl status gaming-panel-api
systemctl status gaming-panel-daemon
systemctl status gaming-panel-frontend

# Logları kontrol et
journalctl -u gaming-panel-api -f
```

## 4. Panel'e Giriş

- Frontend URL: `http://your-ip:3001` veya `https://your-domain`
- Admin hesabı ile giriş yap

## 5. Minecraft Server Kurulumu

### A) Node Oluştur

1. Admin Panel > Nodes > Create New
2. Bilgileri doldur:
   - Name: Node-1
   - Hostname: node1.example.com
   - IP: VPS IP adresi
   - Port: 8080
   - Total RAM: 16 GB (örn: 17179869184 bytes)
   - Total CPU: 8 cores (örn: 8000000000 nano CPUs)
   - Total Disk: 100 GB (örn: 107374182400 bytes)

### B) Allocation Ekle

1. Node detay sayfasına git
2. Allocations sekmesi
3. "Add Allocation" tıkla
4. IP:Port ekle (örn: 178.208.187.30:25565)

### C) Minecraft Server Oluştur

1. Dashboard > Create Server
2. Bilgileri doldur:
   - Name: My Minecraft Server
   - Node: Oluşturduğun node'u seç
   - Docker Image: `itzg/minecraft-server`
   - Memory Limit: 4 GB (4294967296 bytes)
   - CPU Limit: 2000000000 (2 cores)
   - Disk Limit: 20 GB (21474836480 bytes)
   - Allocation: Oluşturduğun allocation'ı seç

### D) Server Başlat

1. Server detay sayfasına git
2. "Start" butonuna tıkla
3. Console sekmesinden server durumunu izle

## 6. Minecraft Server Yapılandırması

Server başladıktan sonra:

1. Files sekmesine git
2. `server.properties` dosyasını düzenle:
   - `online-mode=true` (güvenlik için)
   - `difficulty=easy` (zorluk)
   - `gamemode=survival` (oyun modu)
   - `max-players=20` (max oyuncu sayısı)
3. Değişiklikleri kaydet
4. Server'ı restart et

## 7. Firewall Ayarları

```bash
# Minecraft portunu aç (25565)
ufw allow 25565/tcp

# Panel portlarını aç
ufw allow 3000/tcp  # Backend API
ufw allow 3001/tcp  # Frontend
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

# Firewall durumunu kontrol et
ufw status
```

## 8. DNS Ayarları (Domain kullanıyorsanız)

A Record ekle:
```
Type: A
Host: @ (veya panel)
Value: VPS IP adresi
TTL: 3600
```

## 9. SSL Sertifikası (Opsiyonel)

Eğer kurulum sırasında SSL eklemediyseniz:

```bash
certbot --nginx -d your-domain.com --email your-email@example.com
```

## 10. Servisleri Yönetme

```bash
# Servisleri başlat
systemctl start gaming-panel-api
systemctl start gaming-panel-daemon
systemctl start gaming-panel-frontend

# Servisleri durdur
systemctl stop gaming-panel-api
systemctl stop gaming-panel-daemon
systemctl stop gaming-panel-frontend

# Servisleri yeniden başlat
systemctl restart gaming-panel-api
systemctl restart gaming-panel-daemon
systemctl restart gaming-panel-frontend

# Servis durumunu kontrol et
systemctl status gaming-panel-api
```

## 11. Sorun Giderme

### Servis çalışmıyor
```bash
# Logları kontrol et
journalctl -u gaming-panel-api -n 50
journalctl -u gaming-panel-daemon -n 50

# Port kullanımını kontrol et
netstat -tulpn | grep :3000
lsof -i :3000
```

### Database bağlantı hatası
```bash
# PostgreSQL durumunu kontrol et
systemctl status postgresql

# Database'e bağlan
sudo -u postgres psql
\l  # Database listesi
\q  # Çıkış
```

### Redis bağlantı hatası
```bash
# Redis durumunu kontrol et
systemctl status redis-server

# Redis'e bağlan
redis-cli
PING  # Yanıt: PONG olmalı
```

## 12. Güncelleme

```bash
cd /opt/gaming-panel
git pull
cd backend && go build -o gaming-panel-api main.go
cd ../daemon && go build -o gaming-panel-daemon main.go
cd ../frontend && npm install && npm run build
systemctl restart gaming-panel-api gaming-panel-daemon gaming-panel-frontend
```

## İpuçları

1. **Güvenlik**: Admin şifresini güçlü tutun
2. **Backup**: Düzenli olarak database ve server dosyalarını yedekleyin
3. **Monitoring**: Servis loglarını düzenli kontrol edin
4. **Resources**: Node kaynaklarını (RAM, CPU) doğru ayarlayın
5. **Ports**: Firewall'da gerekli portları açık tutun

## Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin
2. GitHub Issues'da arama yapın
3. Yeni issue açın
