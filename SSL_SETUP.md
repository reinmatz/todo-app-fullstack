# SSL/TLS Setup Guide

## Übersicht

Diese Anleitung beschreibt die SSL/TLS-Konfiguration für die Todo-App in Development und Production.

---

## 🔐 Development Setup (Self-Signed Certificates)

### 1. Zertifikate generieren

Die Self-Signed Certificates wurden bereits erstellt:

```bash
cd /Users/reinhard/Documents/ClaudeProjekte/todo-app
ls -la certs/
```

**Dateien:**
- `certs/dev-cert.pem` - SSL Certificate (4096-bit RSA)
- `certs/dev-key.pem` - Private Key

**Details:**
- Gültigkeitsdauer: 365 Tage
- Algorithmus: RSA 4096-bit
- Common Name: localhost
- Organisation: TodoApp Development

### 2. Nginx mit SSL starten

**Option A: Nur Backend/DB ohne SSL (Original)**
```bash
docker-compose -f docker-compose.dev.yml up -d
```
- Frontend: http://localhost:8080
- Backend: http://localhost:3000

**Option B: Mit Nginx und SSL/TLS**
```bash
docker-compose -f docker-compose.dev-ssl.yml up --build -d
```
- Frontend: **https://localhost:8080** ⭐
- HTTP Redirect: http://localhost → https://localhost:8080
- Backend (intern): http://backend:3000

### 3. Browser-Warnung akzeptieren

Bei ersten Zugriff erscheint eine Warnung wegen Self-Signed Certificate:

**Chrome/Edge:**
1. Klicke "Advanced"
2. Klicke "Proceed to localhost (unsafe)"

**Firefox:**
1. Klicke "Advanced"
2. Klicke "Accept the Risk and Continue"

**Safari:**
1. Klicke "Show Details"
2. Klicke "visit this website"
3. Klicke "Visit Website"

⚠️ **Dies ist normal für Self-Signed Certificates in Development!**

### 4. Verifikation

```bash
# Check SSL Certificate
openssl s_client -connect localhost:8080 -showcerts

# Check HTTPS Response
curl -k https://localhost:8080

# Check HTTP → HTTPS Redirect
curl -I http://localhost
```

---

## 🚀 Production Setup (Let's Encrypt)

### Voraussetzungen

1. **Domain Name** registriert und DNS konfiguriert
2. **Server** mit öffentlicher IP-Adresse
3. **Port 80 & 443** geöffnet in Firewall
4. **Docker & Docker Compose** installiert

### 1. Domain-Konfiguration

Aktualisiere `nginx/nginx.prod.conf`:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

Ersetze `yourdomain.com` mit deiner echten Domain!

### 2. Let's Encrypt Certificate erstellen

**Initial Certificate:**

```bash
# Stoppe Nginx falls läuft
docker-compose down

# Erstelle Certificate mit Certbot
docker run -it --rm \
  -v $(pwd)/certs:/etc/letsencrypt \
  -v $(pwd)/nginx/certbot:/var/www/certbot \
  -p 80:80 \
  certbot/certbot certonly \
  --standalone \
  --preferred-challenges http \
  -d yourdomain.com \
  -d www.yourdomain.com \
  --email your@email.com \
  --agree-tos \
  --no-eff-email
```

**Certificates werden erstellt in:**
- `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- `/etc/letsencrypt/live/yourdomain.com/privkey.pem`
- `/etc/letsencrypt/live/yourdomain.com/chain.pem`

### 3. Auto-Renewal Setup

Let's Encrypt Certificates laufen nach 90 Tagen ab. Auto-Renewal einrichten:

**Erstelle `scripts/renew-cert.sh`:**

```bash
#!/bin/bash
docker run --rm \
  -v $(pwd)/certs:/etc/letsencrypt \
  -v $(pwd)/nginx/certbot:/var/www/certbot \
  certbot/certbot renew \
  --webroot \
  --webroot-path=/var/www/certbot

# Reload Nginx
docker-compose exec nginx nginx -s reload
```

**Cronjob einrichten:**

```bash
# Crontab öffnen
crontab -e

# Füge hinzu (prüft täglich um 2:00 Uhr)
0 2 * * * /path/to/todo-app/scripts/renew-cert.sh >> /var/log/certbot-renewal.log 2>&1
```

### 4. Production Docker Compose

Aktualisiere `.env.production`:

```bash
FRONTEND_URL=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

Starte Production Stack:

```bash
docker-compose -f docker-compose.yml up --build -d
```

### 5. Verifikation

```bash
# SSL Labs Test (extern)
# Besuche: https://www.ssllabs.com/ssltest/
# Analysiere: yourdomain.com

# Lokaler Check
openssl s_client -connect yourdomain.com:443 -showcerts

# HTTP → HTTPS Redirect
curl -I http://yourdomain.com

# HTTPS Response
curl -I https://yourdomain.com
```

**Erwartetes Ergebnis: A+ Rating bei SSL Labs**

---

## 🔒 Security Features

### Implementierte Security Headers

#### 1. HSTS (HTTP Strict Transport Security)
```nginx
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
- Erzwingt HTTPS für 2 Jahre
- Gilt auch für Subdomains
- Preload für HSTS Preload List

#### 2. X-Frame-Options
```nginx
X-Frame-Options: DENY
```
- Verhindert Clickjacking Attacks
- Verbietet Embedding in iframes

#### 3. X-Content-Type-Options
```nginx
X-Content-Type-Options: nosniff
```
- Verhindert MIME-Type Sniffing
- Erhöht Security gegen Drive-by Downloads

#### 4. X-XSS-Protection
```nginx
X-XSS-Protection: 1; mode=block
```
- Aktiviert XSS Filter im Browser
- Blockt Seite bei XSS-Verdacht

#### 5. Content Security Policy (CSP)

**Development (permissive):**
```nginx
Content-Security-Policy: default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
```

**Production (strict):**
```nginx
Content-Security-Policy: default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  frame-ancestors 'none';
```

#### 6. Referrer Policy
```nginx
Referrer-Policy: strict-origin-when-cross-origin
```

#### 7. Permissions Policy
```nginx
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### TLS Configuration

**Protokolle:**
- ✅ TLS 1.3 (bevorzugt)
- ✅ TLS 1.2 (Fallback)
- ❌ TLS 1.1, 1.0, SSLv3 (deaktiviert)

**Cipher Suites:**
- ECDHE-ECDSA-AES128-GCM-SHA256
- ECDHE-RSA-AES128-GCM-SHA256
- ECDHE-ECDSA-AES256-GCM-SHA384
- ECDHE-RSA-AES256-GCM-SHA384
- ECDHE-ECDSA-CHACHA20-POLY1305

**OCSP Stapling:**
- ✅ Aktiviert in Production
- Verbessert Performance
- Erhöht Privacy

---

## 🧪 Testing

### 1. SSL Certificate Test

```bash
# Development
openssl s_client -connect localhost:8080

# Production
openssl s_client -connect yourdomain.com:443
```

### 2. Security Headers Test

```bash
# Development
curl -I -k https://localhost:8080

# Production
curl -I https://yourdomain.com
```

Erwartete Headers:
```
HTTP/2 200
strict-transport-security: max-age=63072000
x-frame-options: DENY
x-content-type-options: nosniff
x-xss-protection: 1; mode=block
content-security-policy: ...
```

### 3. HTTP → HTTPS Redirect

```bash
# Sollte 301 zu HTTPS redirecten
curl -I http://localhost        # Dev
curl -I http://yourdomain.com   # Prod
```

### 4. Online Tools

**SSL Labs:**
https://www.ssllabs.com/ssltest/

**Security Headers:**
https://securityheaders.com/

**Mozilla Observatory:**
https://observatory.mozilla.org/

---

## ⚠️ Troubleshooting

### Problem: "SSL Certificate Verify Failed"

**Ursache:** Self-Signed Certificate in Dev
**Lösung:** `-k` Flag bei curl verwenden oder Browser-Warnung akzeptieren

```bash
curl -k https://localhost:8080
```

### Problem: "Connection Refused" auf Port 8080

**Check:**
```bash
# Container läuft?
docker ps | grep nginx

# Port binding korrekt?
docker port todo-nginx-dev

# Logs checken
docker logs todo-nginx-dev
```

**Lösung:**
```bash
docker-compose -f docker-compose.dev-ssl.yml restart nginx
```

### Problem: Let's Encrypt Rate Limit

**Ursache:** Zu viele Versuche
**Lösung:** Staging Environment nutzen

```bash
certbot certonly --staging ...
```

### Problem: Nginx 502 Bad Gateway

**Ursache:** Backend nicht erreichbar
**Check:**
```bash
# Backend läuft?
docker ps | grep backend

# Netzwerk korrekt?
docker network inspect todo-app_frontend-network
```

**Lösung:**
```bash
docker-compose -f docker-compose.dev-ssl.yml restart backend
```

### Problem: Certificate Renewal Failed

**Check Logs:**
```bash
cat /var/log/certbot-renewal.log
```

**Manual Renewal:**
```bash
./scripts/renew-cert.sh
```

---

## 📊 Performance

### Gzip Compression

Aktiviert für:
- text/plain
- text/css
- text/javascript
- application/javascript
- application/json

**Erwartete Einsparung:** 60-80% für Text-Dateien

### HTTP/2

✅ Aktiviert in Nginx Config
- Multiplexing
- Server Push (optional)
- Header Compression

### Caching

**Static Assets:**
- Expires: 1 Jahr
- Cache-Control: public, immutable

**HTML Files:**
- No cache (immer aktuell)

---

## 🎯 Best Practices

### Development
- ✅ Self-Signed Certificates OK
- ✅ Browser-Warnung akzeptieren
- ✅ Permissive CSP für HMR
- ⚠️ Nie in Production verwenden!

### Production
- ✅ Let's Encrypt verwenden
- ✅ Auto-Renewal einrichten
- ✅ Strict CSP aktivieren
- ✅ HSTS Preload
- ✅ SSL Labs A+ Rating anstreben

### Security Checklist
- [ ] TLS 1.3 aktiviert
- [ ] Weak Ciphers deaktiviert
- [ ] Security Headers korrekt
- [ ] CSP ohne 'unsafe-*'
- [ ] OCSP Stapling aktiv
- [ ] Certificate Monitoring
- [ ] Auto-Renewal getestet

---

## 📚 Weitere Ressourcen

- **Let's Encrypt Docs:** https://letsencrypt.org/docs/
- **Mozilla SSL Config Generator:** https://ssl-config.mozilla.org/
- **OWASP Security Headers:** https://owasp.org/www-project-secure-headers/
- **CSP Reference:** https://content-security-policy.com/

---

**Erstellt:** 22. Oktober 2025
**Version:** 1.0
