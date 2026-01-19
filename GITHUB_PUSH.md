# 🚀 GitHub'a Push Rehberi

## 1. GitHub Repository Oluştur

1. GitHub'a git: https://github.com/new
2. Repository adı: `gaming-panel` (veya istediğin ad)
3. Public veya Private seç
4. README ekleme (zaten var)
5. "Create repository" tıkla

## 2. GitHub'a Push

```bash
# Remote repository ekle (yourusername'ı kendi GitHub kullanıcı adınla değiştir)
git remote add origin https://github.com/mwlih28-gif/Cursor-Pterodactyl.git

# Main branch'e git (veya master)
git branch -M main

# GitHub'a push et
git push -u origin main
```

## 3. Installer URL'lerini Güncelle

Push'tan sonra, aşağıdaki dosyalardaki `yourusername` kısmını gerçek GitHub kullanıcı adınla değiştir:

- `installer.sh` - satır 10
- `install.sh` - satır 25 (GITHUB_BASE_URL)
- `README.md` - satır 8

Sonra tekrar commit edip push et:

```bash
git add installer.sh install.sh README.md
git commit -m "Update GitHub URLs"
git push
```

## 4. Remote Installer Kullanımı

Artık şu komutla kurulum yapılabilir:

```bash
bash <(curl -s https://raw.githubusercontent.com/mwlih28-gif/Cursor-Pterodactyl/main/installer.sh)
```

## 5. VPS'e Kurulum

VPS'te şu komutları çalıştır:

```bash
# SSH ile VPS'e bağlan
ssh root@your-vps-ip

# GitHub'dan projeyi çek
git clone https://github.com/mwlih28-gif/Cursor-Pterodactyl.git
cd Cursor-Pterodactyl

# Kurulum scriptini çalıştır
chmod +x install.sh
sudo ./install.sh
```

## 6. Detaylı VPS Kurulum Rehberi

`DEPLOY.md` dosyasına bak - Minecraft server kurulumu dahil tüm adımlar orada.

## 7. Sorun Giderme

### GitHub'a push edemiyorum
- Git kullanıcı adı ve email'ini kontrol et
- GitHub'da repository'nin var olduğundan emin ol
- SSH key veya Personal Access Token kullan

### Installer çalışmıyor
- GitHub URL'lerinin doğru olduğundan emin ol
- curl'un kurulu olduğundan emin ol
- Network bağlantısını kontrol et
