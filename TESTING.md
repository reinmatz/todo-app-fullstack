# Testing Guide - ToDo App

## Schnellstart zum Testen der App

### Option 1: Lokales Testen (ohne Docker)

#### Voraussetzungen:
- PostgreSQL muss lokal laufen
- Node.js 20.x installiert

#### Schritte:

1. **PostgreSQL Datenbank erstellen**
```bash
# PostgreSQL starten (macOS)
brew services start postgresql@16

# Datenbank und User erstellen
psql postgres
CREATE DATABASE tododb;
CREATE USER todouser WITH PASSWORD 'todopass';
GRANT ALL PRIVILEGES ON DATABASE tododb TO todouser;
\q

# Schema initialisieren
psql -U todouser -d tododb -f database/init.sql
```

2. **Backend starten**
```bash
cd backend
npm install  # Falls noch nicht gemacht
npm run dev  # Startet auf Port 3000
```

3. **Frontend starten** (neues Terminal)
```bash
cd frontend
npm install  # Falls noch nicht gemacht
npm run dev  # Startet auf Port 8080
```

4. **App öffnen**
   - Öffne Browser: http://localhost:8080

---

### Option 2: Docker Compose (Development)

#### Voraussetzungen:
- Docker Desktop läuft

#### Schritte:

1. **Docker Desktop starten**
```bash
open -a Docker
# Warten bis Docker läuft
```

2. **Development Stack starten**
```bash
# Im Hauptverzeichnis todo-app/
docker-compose -f docker-compose.dev.yml up -d
```

3. **Logs verfolgen**
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

4. **App öffnen**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3000/health

5. **Stoppen**
```bash
docker-compose -f docker-compose.dev.yml down
```

---

## Test-Szenarien

### 1. Authentifizierung testen

1. **Registrierung**
   - Gehe zu http://localhost:8080/register
   - Registriere neuen User:
     - Username: testuser
     - Email: test@example.com
     - Password: Test1234!
   - Sollte automatisch einloggen und zu /todos redirecten

2. **Logout & Login**
   - Klicke "Logout" in Navbar
   - Gehe zu http://localhost:8080/login
   - Login mit Email + Password
   - Sollte zu /todos redirecten

3. **Protected Routes**
   - Logout
   - Versuche direkt zu http://localhost:8080/todos
   - Sollte zu /login redirecten

### 2. Todo Management testen

1. **Todo erstellen**
   - Klicke "+ New Todo"
   - Fülle aus:
     - Title: "Erste Aufgabe"
     - Description: "Das ist meine erste Todo"
     - Priority: High
     - Due Date: (Morgen)
     - Tags: Work, Urgent
   - Klicke "Create Todo"
   - Todo sollte in Liste erscheinen

2. **Todo als erledigt markieren**
   - Klicke Checkbox beim Todo
   - Sollte durchgestrichen werden
   - Sollte grau werden

3. **Todo bearbeiten**
   - Klicke Edit-Icon (✏️)
   - Ändere Title oder Beschreibung
   - Klicke "Update Todo"
   - Änderungen sollten sichtbar sein

4. **Todo löschen**
   - Klicke Delete-Icon (🗑️)
   - Bestätige im Dialog
   - Todo sollte verschwinden

### 3. Filter & Sortierung testen

1. **Status Filter**
   - Erstelle mehrere Todos
   - Markiere einige als erledigt
   - Filter Status: "Active" → Nur nicht-erledigte
   - Filter Status: "Completed" → Nur erledigte
   - Filter Status: "All" → Alle

2. **Priority Filter**
   - Erstelle Todos mit verschiedenen Prioritäten
   - Filter Priority: "High" → Nur High Priority
   - etc.

3. **Suche**
   - Tippe in Suchfeld
   - Todos sollten gefiltert werden

4. **Sortierung**
   - Sort by: "Due Date" → Sortiert nach Datum
   - Order: "ASC" / "DESC" → Ändert Reihenfolge

5. **Reset Filters**
   - Klicke "Reset Filters"
   - Alle Filter zurücksetzen

### 4. Tags testen

1. **Tags beim Erstellen**
   - Erstelle Todo mit mehreren Tags
   - Tags sollten als Badges angezeigt werden

2. **Tags filtern** (Backend unterstützt es)
   - API-Test: GET /api/todos?tags=work

### 5. Overdue Todos testen

1. **Überfälliges Todo erstellen**
   - Erstelle Todo mit Due Date = Gestern
   - Sollte rote Border haben
   - Sollte "Overdue!" Badge zeigen

---

## API Testing mit curl

### Authentifizierung
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'

# Kopiere TOKEN aus Response
```

### Todo CRUD
```bash
TOKEN="dein-jwt-token-hier"

# Alle Todos abrufen
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN"

# Todo erstellen
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Todo",
    "description": "Via curl erstellt",
    "priority": "high",
    "due_date": "2025-10-25",
    "tags": ["api", "test"]
  }'

# Todo aktualisieren (ID anpassen)
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "is_completed": true
  }'

# Todo löschen (ID anpassen)
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN"
```

### Filter & Sortierung
```bash
# Nur aktive Todos
curl -X GET "http://localhost:3000/api/todos?status=active" \
  -H "Authorization: Bearer $TOKEN"

# High Priority, sortiert nach Due Date
curl -X GET "http://localhost:3000/api/todos?priority=high&sortBy=due_date&order=ASC" \
  -H "Authorization: Bearer $TOKEN"

# Suche
curl -X GET "http://localhost:3000/api/todos?search=meeting" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Troubleshooting

### Problem: Backend startet nicht
```bash
# Prüfe ob PostgreSQL läuft
psql -U todouser -d tododb -c "SELECT 1;"

# Prüfe .env Datei
cat backend/.env

# Logs prüfen
cd backend && npm run dev
```

### Problem: Frontend startet nicht
```bash
# Prüfe Dependencies
cd frontend && npm install

# Prüfe Port 8080
lsof -i :8080

# Starte neu
npm run dev
```

### Problem: CORS Errors
- Backend FRONTEND_URL in .env prüfen
- Sollte sein: http://localhost:8080

### Problem: 401 Unauthorized
- Token abgelaufen → Neu einloggen
- Token nicht gespeichert → Browser localStorage prüfen

### Problem: Datenbank Connection Error
```bash
# PostgreSQL Status prüfen
brew services list

# PostgreSQL starten
brew services start postgresql@16

# Connection testen
psql -U todouser -d tododb
```

---

## Erwartete Ergebnisse

### Funktionierend:
✅ User Registration mit Validation
✅ User Login mit JWT
✅ Protected Routes
✅ Todo Create/Read/Update/Delete
✅ Todo Toggle (Checkbox)
✅ Priority Badges (farbcodiert)
✅ Tags (Multi-Select, Badges)
✅ Due Dates mit Overdue-Indicator
✅ Filter (Status, Priority)
✅ Sortierung (Date, Priority, Title)
✅ Suche (Title + Description)
✅ Responsive Design
✅ Loading States
✅ Error Messages
✅ Delete Confirmation

### Performance:
- API Response < 500ms ✓
- Page Load < 2s ✓
- Smooth UI Transitions ✓

---

## Nächste Schritte nach Testing

1. **Security Audit** durchführen
2. **Production Build** testen
3. **Docker Deployment** finalisieren
4. **Testing Suite** (Unit + E2E)
5. **Dokumentation** vervollständigen
