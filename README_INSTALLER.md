# 🦖 Gaming Control Panel - Otomatik Kurulum

## Hızlı Kurulum

### Tek Komut Kurulum (Remote)

```bash
bash <(curl -s https://raw.githubusercontent.com/yourusername/gaming-panel/main/installer.sh)
```

### Lokal Kurulum

```bash
chmod +x install.sh
sudo ./install.sh
```

## Kurulum Süreci

Kurulum scripti şu adımları otomatik olarak gerçekleştirir:

1. ✅ Sistem gereksinimlerini kontrol eder
2. ✅ Gerekli paketleri kurar (Go, Node.js, PostgreSQL, Redis, Docker, Nginx)
3. ✅ Veritabanını kurar ve şemasını oluşturur
4. ✅ Backend, Daemon ve Frontend'i derler
5. ✅ Systemd servisleri oluşturur
6. ✅ Nginx reverse proxy yapılandırır
7. ✅ SSL sertifikası kurar (Let's Encrypt)
8. ✅ Firewall yapılandırır
9. ✅ Admin kullanıcısı oluşturur
10. ✅ Tüm servisleri başlatır

## Kurulum Sırasında Sorulacak Sorular

### 1. Domain Adresi
```
Domain adresi (Enter = IP kullan): 
```
- Domain adresiniz varsa girin (örn: panel.example.com)
- Boş bırakılırsa sunucu IP adresi kullanılır

### 2. SSL Sertifikası
```
SSL sertifikası kurulsun mu? (y/n):
```
- Domain varsa Let's Encrypt SSL sertifikası kurulabilir
- Email adresi istenir

### 3. Admin Bilgileri
```
Admin email adresi: admin@example.com
Admin kullanıcı adı: admin
Admin şifresi (boş bırakılırsa otomatik oluşturulur): 
```

### 4. Node ID
```
Node ID (Enter = node-1): 
```
- Daemon için node ID (birden fazla node varsa farklı ID'ler kullanın)

### 5. Servis Kurulumları
```
PostgreSQL kurulsun mu? (y/n, Enter = y):
Redis kurulsun mu? (y/n, Enter = y):
Nginx kurulsun mu? (y/n, Enter = y):
```

## Kurulum Sonrası

### Giriş Bilgileri

Tüm giriş bilgileri şu dosyada saklanır:
```bash
cat /opt/gaming-panel/credentials.txt
```

### Servis Yönetimi

```bash
# Servisleri başlat
sudo systemctl start gaming-panel-api
sudo systemctl start gaming-panel-daemon
sudo systemctl start gaming-panel-frontend

# Servisleri durdur
sudo systemctl stop gaming-panel-api
sudo systemctl stop gaming-panel-daemon
sudo systemctl stop gaming-panel-frontend

# Servis durumunu kontrol et
sudo systemctl status gaming-panel-api
sudo systemctl status gaming-panel-daemon
sudo systemctl status gaming-panel-frontend

# Servisleri otomatik başlatma (önerilir)
sudo systemctl enable gaming-panel-api
sudo systemctl enable gaming-panel-daemon
sudo systemctl enable gaming-panel-frontend
```

### Logları Görüntüleme

```bash
# API logları
sudo journalctl -u gaming-panel-api -f

# Daemon logları
sudo journalctl -u gaming-panel-daemon -f

# Frontend logları
sudo journalctl -u gaming-panel-frontend -f

# Kurulum logu
tail -f /var/log/gaming-panel-installer.log
```

## Erişim

Kurulum tamamlandıktan sonra:

- **Frontend**: `http://your-domain-or-ip:3001` veya `https://your-domain` (SSL varsa)
- **API**: `http://your-domain-or-ip:3000/api/v1`
- **Health Check**: `http://your-domain-or-ip:3000/health`

## Sonraki Adımlar

1. **Admin Panel'e Giriş Yapın**
   - Kurulum sırasında oluşturduğunuz admin hesabı ile giriş yapın

2. **Node Oluşturun**
   - Admin Panel > Nodes
   - "Create Node" butonuna tıklayın
   - Node bilgilerini girin:
     - Name: Node 1
     - Hostname: node1.example.com
     - IP: 192.168.1.100
     - Port: 8080
     - Resources: CPU, RAM, Disk

3. **Allocations Oluşturun**
   - Node detay sayfasına gidin
   - Allocations sekmesine gidin
   - IP:Port çiftleri ekleyin (örn: 192.168.1.100:25565)

4. **İlk Sunucunuzu Oluşturun**
   - Dashboard > Create Server
   - Sunucu bilgilerini girin
   - Docker image seçin (örn: itzg/minecraft-server)
   - Kaynak limitlerini ayarlayın

## Sorun Giderme

### Servis Çalışmıyor

```bash
# Servis durumunu kontrol et
sudo systemctl status gaming-panel-api

# Son 50 satır log
sudo journalctl -u gaming-panel-api -n 50

# Servisi yeniden başlat
sudo systemctl restart gaming-panel-api
```

### Veritabanı Bağlantı Hatası

```bash
# PostgreSQL durumunu kontrol et
sudo systemctl status postgresql

# PostgreSQL'e bağlan
sudo -u postgres psql

# Veritabanını liste
\l

# Veritabanı oluştur (gerekirse)
CREATE DATABASE gaming_panel;
```

### Redis Bağlantı Hatası

```bash
# Redis durumunu kontrol et
sudo systemctl status redis-server

# Redis'e bağlan
redis-cli

# Ping test
PING
```

### Port Zaten Kullanımda

```bash
# Port kullanımını kontrol et
sudo netstat -tulpn | grep :3000

# Veya
sudo lsof -i :3000

# Servisi durdur ve yeniden başlat
sudo systemctl restart gaming-panel-api
```

### SSL Sertifikası Sorunu

```bash
# Sertifikayı yenile
sudo certbot renew

# Nginx'i yeniden başlat
sudo systemctl restart nginx
```

## Güncelleme

```bash
cd /opt/gaming-panel

# Kaynak kodları güncelle (git kullanıyorsanız)
git pull

# Backend'i yeniden derle
cd backend
export PATH=$PATH:/usr/local/go/bin
go mod download
go build -o gaming-panel-api main.go

# Frontend'i yeniden derle
cd ../frontend
npm install
npm run build

# Servisleri yeniden başlat
sudo systemctl restart gaming-panel-api
sudo systemctl restart gaming-panel-frontend
```

## Güvenlik

### Firewall

```bash
# Mevcut kuralları görüntüle
sudo ufw status

# Gerekli portları aç
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Firewall'u etkinleştir
sudo ufw enable
```

### Fail2Ban

Fail2Ban otomatik olarak kurulur ve aktif edilir.

### Şifre Değiştirme

```bash
# PostgreSQL şifresini değiştir
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'yeni-sifre';"

# Redis şifresini değiştir
# /etc/redis/redis.conf dosyasını düzenle
sudo nano /etc/redis/redis.conf
# requirepass yeni-sifre

# Backend .env dosyasını güncelle
sudo nano /opt/gaming-panel/backend/.env
# DATABASE_URL ve REDIS_URL'yi güncelle

# Servisleri yeniden başlat
sudo systemctl restart gaming-panel-api
sudo systemctl restart redis-server
```

## Sistem Gereksinimleri

- **OS**: Ubuntu 20.04+ veya Debian 11+
- **RAM**: Minimum 2GB (önerilen: 4GB+)
- **Disk**: Minimum 10GB boş alan
- **CPU**: 2+ çekirdek önerilir
- **Network**: İnternet bağlantısı (kurulum için)

## Destek

Sorun yaşıyorsanız:
1. Log dosyalarını kontrol edin: `/var/log/gaming-panel-installer.log`
2. Servis loglarını kontrol edin: `journalctl -u gaming-panel-api`
3. GitHub Issues sayfasına bakın
