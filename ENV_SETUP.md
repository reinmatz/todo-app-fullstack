# Environment Configuration Guide

## Übersicht

Dieses Projekt verwendet unterschiedliche Environment-Konfigurationen für Development und Production. Die Konfigurationsdateien sind **nicht** im Git-Repository enthalten und müssen lokal erstellt werden.

## Verfügbare Environment-Dateien

- `.env.example` - Template mit allen verfügbaren Variablen
- `.env.development` - Development-Konfiguration (bereits erstellt)
- `.env.production` - Production-Konfiguration (bereits erstellt)

⚠️ **WICHTIG**: Die `.env.development` und `.env.production` Dateien enthalten Beispiel-Secrets. **Ändern Sie diese vor dem produktiven Einsatz!**

## Setup für Development

### 1. Secrets überprüfen

Die `.env.development` Datei enthält bereits sichere Development-Werte. Keine Änderungen notwendig für lokales Testen.

```bash
# Entwicklungsumgebung starten
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Zugriff

- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Setup für Production

### 1. Neue Secrets generieren

⚠️ **WICHTIG**: Generieren Sie NEUE Secrets für Production!

```bash
# JWT Secret generieren (256-bit)
openssl rand -base64 64

# Datenbank-Passwort generieren
openssl rand -base64 32
```

### 2. `.env.production` bearbeiten

```bash
nano .env.production
```

Ändern Sie mindestens:
- `DB_PASSWORD` - Neues, sicheres Passwort
- `JWT_SECRET` - Neu generiertes Secret
- `FRONTEND_URL` - Ihre Domain (z.B. https://yourdomain.com)
- `VITE_API_URL` - Ihre API-URL (z.B. https://yourdomain.com/api)

### 3. Production starten

```bash
# Produktionsumgebung bauen und starten
docker-compose up -d
```

## Environment-Variablen Referenz

### Database Configuration

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `DB_USER` | PostgreSQL Benutzername | `todouser` |
| `DB_PASSWORD` | PostgreSQL Passwort | `changeme` |
| `DB_NAME` | Datenbankname | `tododb` |
| `DB_HOST` | Datenbank-Host | `postgres` (Docker) |
| `DB_PORT` | Datenbank-Port | `5432` |

### JWT Configuration

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `JWT_SECRET` | Secret für Token-Signierung (min. 256-bit) | generiert mit `openssl` |
| `JWT_EXPIRES_IN` | Token-Gültigkeitsdauer | `24h` |

### Application Configuration

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `NODE_ENV` | Umgebung | `development` oder `production` |
| `PORT` | Backend-Port | `3000` |
| `FRONTEND_URL` | Frontend-URL für CORS | `http://localhost:8080` |
| `VITE_API_URL` | API-URL für Frontend | `http://localhost:3000` |

### Optional: Logging (Development)

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `LOG_LEVEL` | Log-Level | `debug`, `info`, `error` |
| `ENABLE_LOGGING` | Logging aktivieren | `true`, `false` |

## Sicherheits-Checkliste

Vor Production-Deployment:

- [ ] Neue JWT Secret generiert
- [ ] Neues DB-Passwort generiert
- [ ] `.env.production` mit korrekten Werten konfiguriert
- [ ] FRONTEND_URL auf echte Domain gesetzt
- [ ] VITE_API_URL auf echte API-URL gesetzt
- [ ] Keine Development-Secrets in Production verwendet
- [ ] `.env` Dateien NICHT in Git committed
- [ ] Backup der `.env.production` an sicherem Ort

## Troubleshooting

### Problem: "JWT Secret not configured"

**Lösung**: Überprüfen Sie, ob `JWT_SECRET` in der `.env` Datei gesetzt ist.

```bash
# Testen
docker exec todo-backend-dev printenv | grep JWT_SECRET
```

### Problem: "Cannot connect to database"

**Lösung**:
1. Überprüfen Sie DB-Credentials in `.env`
2. Stellen Sie sicher, dass PostgreSQL-Container läuft:

```bash
docker ps | grep postgres
```

### Problem: Environment-Variablen werden nicht geladen

**Lösung**:
1. Container neu bauen:

```bash
docker-compose down
docker-compose up --build -d
```

2. Überprüfen Sie die Dateinamen (keine Leerzeichen, korrekte Extension)

## Weitere Informationen

- **Docker Compose**: Siehe `docker-compose.dev.yml` und `docker-compose.yml`
- **Security Best Practices**: Siehe `/docs/SECURITY.md` (geplant)
- **Deployment Guide**: Siehe `/docs/DEPLOYMENT.md` (geplant)

## Support

Bei Problemen:
1. Überprüfen Sie die Container-Logs: `docker-compose logs -f`
2. Testen Sie die Verbindung zur Datenbank
3. Validieren Sie das Format der `.env` Datei (keine Leerzeichen um `=`)
