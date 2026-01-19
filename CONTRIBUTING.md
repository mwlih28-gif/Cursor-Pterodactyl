# Kurulum Scripti Kullanımı

## Hızlı Kurulum

Tek komutla kurulum (Remote):
```bash
bash <(curl -s https://raw.githubusercontent.com/yourusername/gaming-panel/main/installer.sh)
```

Veya lokal kurulum:
```bash
chmod +x install.sh
sudo ./install.sh
```

## Kurulum Seçenekleri

Kurulum sırasında sorulacak sorular:

1. **Domain Adresi**: Panel için domain (opsiyonel, boş bırakılabilir)
2. **SSL Sertifikası**: Let's Encrypt ile SSL kurulumu (domain varsa)
3. **Admin Email**: Admin kullanıcısının email adresi
4. **Admin Username**: Admin kullanıcı adı (varsayılan: admin)
5. **Admin Password**: Şifre (boş bırakılırsa otomatik oluşturulur)
6. **Node ID**: Daemon node ID (varsayılan: node-1)
7. **PostgreSQL**: PostgreSQL kurulumu (varsayılan: evet)
8. **Redis**: Redis kurulumu (varsayılan: evet)
9. **Nginx**: Nginx reverse proxy kurulumu (varsayılan: evet)

## Kurulum Sonrası

Tüm giriş bilgileri şu dosyada saklanır:
```
/opt/gaming-panel/credentials.txt
```

## Servis Komutları

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

# Logları görüntüle
sudo journalctl -u gaming-panel-api -f
sudo journalctl -u gaming-panel-daemon -f
sudo tail -f /var/log/gaming-panel-installer.log
```

## Sorun Giderme

### Servis çalışmıyor
```bash
sudo systemctl status gaming-panel-api
sudo journalctl -u gaming-panel-api -n 50
```

### Veritabanı bağlantı hatası
```bash
sudo -u postgres psql -c "\l"
sudo systemctl status postgresql
```

### Redis bağlantı hatası
```bash
redis-cli ping
sudo systemctl status redis-server
```

### Port zaten kullanımda
```bash
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000
```

## Güncelleme

```bash
cd /opt/gaming-panel
git pull  # Eğer git ile kurulduysa
# Backend ve frontend'i yeniden derle
# Servisleri yeniden başlat
```
