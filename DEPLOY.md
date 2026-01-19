# 🚀 Deployment Guide - Gaming Control Panel

Bu rehber VPS üzerinde Gaming Control Panel'i nasıl kuracağınızı adım adım açıklar.

## 📋 Ön Gereksinimler

- Ubuntu 20.04+ veya Debian 11+ VPS
- Minimum 2GB RAM
- Root veya sudo erişimi
- İnternet bağlantısı

## 🔧 Hızlı Kurulum

### 1. VPS'e Bağlanın

```bash
ssh root@YOUR_VPS_IP
```

### 2. Repository'yi Klonlayın

```bash
cd ~
git clone https://github.com/mwlih28-gif/Cursor-Pterodactyl.git
cd Cursor-Pterodactyl
```

### 3. Install Script'i Çalıştırın

```bash
chmod +x install.sh
sudo ./install.sh
```

**NOT:** Eğer `git pull` hatası alırsanız (local changes), şu komutları çalıştırın:

```bash
cd ~/Cursor-Pterodactyl
git stash
git pull
chmod +x install.sh
sudo ./install.sh
```

## 🎯 Kurulum Seçenekleri

Install script'i çalıştırdığınızda size şu seçenekler sunulur:

### [0] Install the Panel (API + Frontend)
Sadece Panel'i kurar (Backend API + Frontend)

### [1] Install the Daemon (Node Agent)
Sadece Daemon'ı kurar (Node Agent)

### [2] Install both [0] and [1] on the same machine ⭐ ÖNERİLEN
Hem Panel hem Daemon'ı aynı makinede kurar (Test/Development için ideal)

### [3] Install Panel with SSL (Let's Encrypt)
SSL sertifikası ile Panel'i kurar (Production için önerilir)

### [4] Uninstall Panel or Daemon
Kurulumu kaldırır

## 📝 Kurulum Adımları

### 1. Sistem Gereksinimleri Kontrolü

Script otomatik olarak şunları kontrol eder:
- OS sürümü
- RAM miktarı
- Disk alanı

### 2. Domain veya IP Ayarları

- **Domain varsa:** Domain adınızı girin (örn: `panel.example.com`)
- **Domain yoksa:** Boş bırakın, IP adresi kullanılır

### 3. Veritabanı Ayarları

- **Database name:** Varsayılan `gaming_panel` (Enter ile geçebilirsiniz)
- **Database username:** Varsayılan `postgres` (Enter ile geçebilirsiniz)
- **Database password:** Boş bırakırsanız otomatik oluşturulur

### 4. Redis Ayarları

- **Redis password:** Boş bırakırsanız otomatik oluşturulur

### 5. Admin Hesabı

- **Admin email:** Admin hesabınızın e-posta adresi
- **Admin username:** Varsayılan `admin` (Enter ile geçebilirsiniz)
- **Admin password:** Boş bırakırsanız otomatik oluşturulur

## 🛠️ Manuel Kurulum (Sorun Giderme)

Eğer otomatik kurulum başarısız olursa, adım adım manuel kurulum yapabilirsiniz:

### 1. Git Pull Hatası Çözümü

```bash
cd ~/Cursor-Pterodactyl
git stash                    # Local değişiklikleri sakla
git pull                     # Güncellemeleri çek
git stash pop                # Değişiklikleri geri getir (isteğe bağlı)
```

### 2. Go Kurulumu

```bash
# Go'yu kontrol et
which go

# Go yoksa manuel kurulum
cd /tmp
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
rm -rf /usr/local/go
tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
rm go1.21.5.linux-amd64.tar.gz

# PATH'i export et (geçici)
export PATH=$PATH:/usr/local/go/bin

# PATH'i kalıcı yap
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Go versiyonunu kontrol et
go version
```

### 3. Backend Manuel Kurulumu

```bash
cd ~/Cursor-Pterodactyl/backend

# PATH'i export et
export PATH=$PATH:/usr/local/go/bin

# Bağımlılıkları indir
/usr/local/go/bin/go mod download
/usr/local/go/bin/go mod tidy

# Backend'i derle
/usr/local/go/bin/go build -o gaming-panel-api main.go

# Test et
./gaming-panel-api
```

### 4. Daemon Manuel Kurulumu

```bash
cd ~/Cursor-Pterodactyl/daemon

# PATH'i export et
export PATH=$PATH:/usr/local/go/bin

# Bağımlılıkları indir
/usr/local/go/bin/go mod download
/usr/local/go/bin/go mod tidy

# Daemon'ı derle
/usr/local/go/bin/go build -o gaming-panel-daemon main.go

# Test et
./gaming-panel-daemon
```

## 🔍 Sorun Giderme

### Sorun: `go: command not found`

**Çözüm:**
```bash
export PATH=$PATH:/usr/local/go/bin
# Veya tam path kullanın:
/usr/local/go/bin/go version
```

### Sorun: `git pull` hatası (local changes)

**Çözüm:**
```bash
cd ~/Cursor-Pterodactyl
git stash
git pull
chmod +x install.sh
sudo ./install.sh
```

### Sorun: `go.sum` missing entries

**Çözüm:**
```bash
cd ~/Cursor-Pterodactyl/backend  # veya daemon
export PATH=$PATH:/usr/local/go/bin
/usr/local/go/bin/go mod download
/usr/local/go/bin/go mod tidy
```

### Sorun: Backend build hatası

**Çözüm:**
```bash
cd ~/Cursor-Pterodactyl/backend
export PATH=$PATH:/usr/local/go/bin
rm -rf go.sum
/usr/local/go/bin/go mod download
/usr/local/go/bin/go mod tidy
/usr/local/go/bin/go clean -cache
/usr/local/go/bin/go build -o gaming-panel-api main.go
```

### Sorun: Database bağlantı hatası

**Çözüm:**
```bash
# PostgreSQL servisini kontrol et
sudo systemctl status postgresql

# PostgreSQL'i başlat
sudo systemctl start postgresql

# Bağlantıyı test et
sudo -u postgres psql -c "SELECT version();"
```

### Sorun: Redis bağlantı hatası

**Çözüm:**
```bash
# Redis servisini kontrol et
sudo systemctl status redis-server

# Redis'i başlat
sudo systemctl start redis-server

# Bağlantıyı test et
redis-cli ping
```

## 🌐 Erişim Bilgileri

Kurulum tamamlandıktan sonra:

- **Panel URL:** `http://YOUR_VPS_IP:3001` veya `https://YOUR_DOMAIN`
- **API URL:** `http://YOUR_VPS_IP:3000` veya `https://YOUR_DOMAIN/api`

### Admin Giriş Bilgileri

Kurulum sırasında oluşturduğunuz admin hesabı ile giriş yapabilirsiniz:
- **Email:** Kurulum sırasında girdiğiniz email
- **Username:** Kurulum sırasında girdiğiniz username
- **Password:** Kurulum sırasında oluşturulan veya girdiğiniz şifre

**NOT:** Şifre otomatik oluşturulduysa, kurulum sonunda ekranda gösterilir. Log dosyasını kontrol edebilirsiniz:

```bash
cat /var/log/gaming-panel-installer.log | grep -i password
```

## 📦 Servis Yönetimi

### Backend Servisini Kontrol Etme

```bash
sudo systemctl status gaming-panel-backend
```

### Backend Servisini Başlatma/Durdurma

```bash
sudo systemctl start gaming-panel-backend
sudo systemctl stop gaming-panel-backend
sudo systemctl restart gaming-panel-backend
```

### Daemon Servisini Kontrol Etme

```bash
sudo systemctl status gaming-panel-daemon
```

### Daemon Servisini Başlatma/Durdurma

```bash
sudo systemctl start gaming-panel-daemon
sudo systemctl stop gaming-panel-daemon
sudo systemctl restart gaming-panel-daemon
```

### Logları İzleme

```bash
# Backend logları
sudo journalctl -u gaming-panel-backend -f

# Daemon logları
sudo journalctl -u gaming-panel-daemon -f

# Installer logları
tail -f /var/log/gaming-panel-installer.log
```

## 🔐 Güvenlik

### Firewall Ayarları

```bash
# UFW firewall kurulumu (eğer yoksa)
sudo apt install ufw

# Gerekli portları aç
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Backend API (sadece internal için)
sudo ufw allow 3001/tcp  # Frontend (development için)

# Firewall'u aktif et
sudo ufw enable
sudo ufw status
```

### SSL Sertifikası (Production)

SSL sertifikası için seçenek [3]'ü kullanabilirsiniz veya manuel olarak:

```bash
# Certbot kurulumu
sudo apt install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d YOUR_DOMAIN

# Otomatik yenileme test
sudo certbot renew --dry-run
```

## 🎮 Minecraft Sunucusu Kurulumu

Panel kurulduktan sonra Minecraft sunucusu kurmak için:

1. Panel'e giriş yapın: `http://YOUR_VPS_IP:3001`
2. Dashboard'dan "New Server" butonuna tıklayın
3. Sunucu ayarlarını yapılandırın:
   - **Server Type:** Minecraft
   - **Version:** 1.20.1 (veya istediğiniz versiyon)
   - **RAM:** 2048MB (veya daha fazla)
   - **Port:** 25565 (veya başka bir port)
4. "Create Server" butonuna tıklayın
5. Sunucunuz hazır! Console'dan başlatabilirsiniz.

## 📞 Destek

Sorun yaşarsanız:
1. Log dosyalarını kontrol edin
2. GitHub Issues'a sorun bildirin
3. Installer log'unu paylaşın: `/var/log/gaming-panel-installer.log`

## ✅ Kurulum Sonrası Kontrol Listesi

- [ ] Panel'e erişebiliyor musunuz?
- [ ] Admin hesabı ile giriş yapabiliyor musunuz?
- [ ] Backend servisi çalışıyor mu? (`sudo systemctl status gaming-panel-backend`)
- [ ] Daemon servisi çalışıyor mu? (`sudo systemctl status gaming-panel-daemon`)
- [ ] Database bağlantısı çalışıyor mu?
- [ ] Redis bağlantısı çalışıyor mu?
- [ ] Firewall ayarları yapıldı mı?
- [ ] SSL sertifikası kuruldu mu? (Production için)

## 🎉 Başarılı Kurulum!

Kurulum tamamlandıktan sonra Gaming Control Panel'inizi kullanmaya başlayabilirsiniz!

**Sonraki Adımlar:**
1. Panel'e giriş yapın
2. İlk sunucunuzu oluşturun
3. Plugin'leri yükleyin
4. Kullanıcıları yönetin

Mutlu oyunlar! 🎮
