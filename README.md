# ToDo Web Application

Eine vollständige ToDo-Management-Webanwendung mit Multi-User-Unterstützung, entwickelt mit React, Node.js, Express und PostgreSQL, bereitgestellt über Docker.

## Features

- Multi-User-Authentifizierung mit JWT
- Vollständige CRUD-Operationen für ToDos
- Prioritäten (Niedrig, Mittel, Hoch, Kritisch)
- Tags/Labels mit Autocomplete
- Fälligkeitsdaten mit visuellen Indikatoren
- Sortierung und Filterung
- Responsive Design
- Dockerisierte Architektur
- SSL/TLS-Unterstützung

## Technologie-Stack

### Frontend
- React 18.x
- Vite (Build Tool)
- React Router
- Axios
- CSS Modules

### Backend
- Node.js 20.x LTS
- Express.js 4.x
- Sequelize ORM
- JWT Authentication
- bcrypt (Password Hashing)
- express-validator

### Datenbank
- PostgreSQL 16.x

### DevOps
- Docker & Docker Compose
- Nginx (Reverse Proxy)

## Projektstruktur

```
todo-app/
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # React Components
│   │   ├── contexts/   # Context API
│   │   ├── services/   # API Services
│   │   └── utils/      # Helper Functions
│   ├── Dockerfile
│   └── Dockerfile.dev
├── backend/            # Node.js/Express Backend
│   ├── src/
│   │   ├── config/     # Configuration
│   │   ├── models/     # Database Models
│   │   ├── controllers/# Route Controllers
│   │   ├── middleware/ # Custom Middleware
│   │   └── routes/     # API Routes
│   ├── Dockerfile
│   └── Dockerfile.dev
├── database/           # Database Init Scripts
│   └── init.sql
├── docs/               # Documentation
├── docker-compose.yml      # Production Config
├── docker-compose.dev.yml  # Development Config
└── .env.example            # Environment Template
```

## Quick Start

### Voraussetzungen

- Docker Desktop für macOS
- Node.js 20.x (für lokale Entwicklung)
- Git

### Installation

1. **Repository klonen**
```bash
git clone <repository-url>
cd todo-app
```

2. **Environment-Variablen einrichten**
```bash
cp .env.example .env
# Bearbeiten Sie .env und fügen Sie sichere Secrets hinzu
```

3. **Secrets generieren**
```bash
# JWT Secret
openssl rand -base64 64

# DB Password
openssl rand -base64 32
```

### Development Setup

```bash
# Docker Desktop starten
open -a Docker

# Development Stack starten
docker-compose -f docker-compose.dev.yml up -d

# Logs verfolgen
docker-compose -f docker-compose.dev.yml logs -f
```

**Zugriff:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

### Production Deployment

```bash
# Images bauen
docker-compose build --no-cache

# Stack starten
docker-compose up -d

# Status prüfen
docker-compose ps
```

### Nützliche Befehle

```bash
# Stack stoppen
docker-compose down

# Mit Volume-Bereinigung
docker-compose down -v

# Logs anzeigen
docker-compose logs -f [service-name]

# In Container einsteigen
docker exec -it todo-backend sh
docker exec -it todo-postgres psql -U todouser -d tododb

# Datenbank-Backup
docker exec todo-postgres pg_dump -U todouser tododb > backup.sql

# Datenbank wiederherstellen
docker exec -i todo-postgres psql -U todouser tododb < backup.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Benutzer registrieren
- `POST /api/auth/login` - Benutzer anmelden
- `POST /api/auth/logout` - Benutzer abmelden
- `GET /api/auth/me` - Aktuellen Benutzer abrufen

### ToDos
- `GET /api/todos` - Alle ToDos abrufen
- `GET /api/todos/:id` - Einzelnes ToDo abrufen
- `POST /api/todos` - Neues ToDo erstellen
- `PUT /api/todos/:id` - ToDo aktualisieren
- `PATCH /api/todos/:id/toggle` - ToDo-Status umschalten
- `DELETE /api/todos/:id` - ToDo löschen

### Tags
- `GET /api/tags` - Alle Tags abrufen

Mehr Details in [docs/API.md](docs/API.md)

## Entwicklung

### Backend lokal entwickeln

```bash
cd backend
npm install
npm run dev
```

### Frontend lokal entwickeln

```bash
cd frontend
npm install
npm run dev
```

### Tests ausführen

```bash
# Backend Tests
cd backend
npm test
npm run test:coverage

# Frontend Tests
cd frontend
npm test
```

## Sicherheit

- JWT-basierte Authentifizierung (24h Token-Gültigkeit)
- bcrypt Password Hashing (12 Salt Rounds)
- Rate Limiting (5 Versuche/15min)
- CORS-Konfiguration
- CSP Headers
- SQL Injection Prevention (ORM Prepared Statements)
- Docker Network Segmentierung
- SSL/TLS Unterstützung

Details in [docs/SECURITY.md](docs/SECURITY.md)

## Fehlerbehebung

### Port bereits belegt
```bash
# Ports überprüfen
lsof -i :8080
lsof -i :3000
lsof -i :5432

# Prozess beenden
kill -9 <PID>
```

### Docker-Probleme
```bash
# Docker-System bereinigen
docker system prune -a

# Volumes löschen
docker volume prune
```

### Datenbankverbindung fehlgeschlagen
```bash
# PostgreSQL-Logs prüfen
docker-compose logs postgres

# Health Check prüfen
docker inspect --format='{{.State.Health.Status}}' todo-postgres
```

## Lizenz

ISC

## Autor

Reinhard

## Weitere Dokumentation

- [API-Dokumentation](docs/API.md)
- [Deployment-Guide](docs/DEPLOYMENT.md)
- [Architektur](docs/ARCHITECTURE.md)
- [Sicherheit](docs/SECURITY.md)

---

**Version:** 1.0.0
**Status:** In Entwicklung
