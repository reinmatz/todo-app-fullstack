# Docker-basierte Test-Anleitung

## Übersicht

Diese Anleitung beschreibt, wie man die Todo-App in der Docker-Umgebung testet. Alle Tests werden gegen die laufenden Docker-Container ausgeführt.

## Voraussetzungen

- Docker Desktop für MacOS installiert und gestartet
- `curl` oder ein API-Testing-Tool (Postman, Insomnia)
- Browser für Frontend-Tests

## 1. Docker-Umgebung starten

### Development-Umgebung

```bash
cd /Users/reinhard/Documents/ClaudeProjekte/todo-app

# Stoppe alte Container falls vorhanden
docker-compose -f docker-compose.dev.yml down -v

# Starte alle Services
docker-compose -f docker-compose.dev.yml up -d

# Logs verfolgen
docker-compose -f docker-compose.dev.yml logs -f
```

### Container-Status überprüfen

```bash
docker ps

# Erwartete Container:
# - todo-postgres-dev
# - todo-backend-dev
# - todo-frontend-dev
```

### Health-Checks

```bash
# PostgreSQL Check
docker exec todo-postgres-dev pg_isready -U todouser

# Backend Health
curl http://localhost:3000/api/health 2>/dev/null || echo "Backend not ready"

# Frontend Check
curl -I http://localhost:8080 2>/dev/null | head -1
```

## 2. Datenbank-Tests

### Verbindung zur Datenbank testen

```bash
# In PostgreSQL Container einloggen
docker exec -it todo-postgres-dev psql -U todouser -d tododb

# In psql:
\dt                    # Tabellen anzeigen
\d users              # User-Tabelle Schema
\d todos              # Todo-Tabelle Schema
\d tags               # Tags-Tabelle Schema
\d todo_tags          # Junction-Tabelle Schema

SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM todos;
SELECT COUNT(*) FROM tags;

# psql beenden
\q
```

### Datenbank-Backup erstellen

```bash
# Backup erstellen
docker exec todo-postgres-dev pg_dump -U todouser tododb > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup wiederherstellen (falls nötig)
docker exec -i todo-postgres-dev psql -U todouser tododb < backup_YYYYMMDD_HHMMSS.sql
```

## 3. Backend API-Tests (mit curl)

### 3.1 Authentication Tests

```bash
# Test 1: User Registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "testuser1@example.com",
    "password": "Test123!"
  }' | jq

# Erwartete Response: 201 Created mit Token

# Test 2: User Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser1@example.com",
    "password": "Test123!"
  }' | jq

# Token speichern für weitere Tests
export TOKEN="your-token-here"

# Test 3: Get Current User
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 4: Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3.2 Todo CRUD Tests

```bash
# Token von Login verwenden
export TOKEN="your-jwt-token-here"

# Test 1: Create Todo
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Todo",
    "description": "This is a test",
    "priority": "high",
    "due_date": "2025-12-31",
    "tags": ["test", "docker"]
  }' | jq

# Test 2: Get All Todos (mit Pagination)
curl "http://localhost:3000/api/todos?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: Get Todo by ID
curl http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 4: Update Todo
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Todo",
    "is_completed": false
  }' | jq

# Test 5: Toggle Todo Completion
curl -X PATCH http://localhost:3000/api/todos/1/toggle \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 6: Delete Todo
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3.3 Filter & Sort Tests

```bash
# Test 1: Filter by Status
curl "http://localhost:3000/api/todos?status=active" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 2: Filter by Priority
curl "http://localhost:3000/api/todos?priority=high" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 3: Search Todos
curl "http://localhost:3000/api/todos?search=meeting" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 4: Sort by Due Date
curl "http://localhost:3000/api/todos?sortBy=due_date&order=ASC" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 5: Combined Filters with Pagination
curl "http://localhost:3000/api/todos?status=active&priority=high&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 6: Filter by Tags
curl "http://localhost:3000/api/todos?tags=work&tags=urgent" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3.4 Pagination Tests

```bash
# Test 1: First Page
curl "http://localhost:3000/api/todos?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'

# Test 2: Second Page
curl "http://localhost:3000/api/todos?page=2&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'

# Test 3: Large Limit (should be capped at 100)
curl "http://localhost:3000/api/todos?limit=500" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'

# Test 4: Invalid Page (should default to 1)
curl "http://localhost:3000/api/todos?page=0" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'
```

### 3.5 Tags Tests

```bash
# Test 1: Get All Tags
curl http://localhost:3000/api/tags \
  -H "Authorization: Bearer $TOKEN" | jq

# Test 2: Create Todo with New Tags
curl -X POST http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tagged Todo",
    "tags": ["newtag1", "newtag2"]
  }' | jq

# Test 3: Verify Tags were Created
curl http://localhost:3000/api/tags \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 4. Frontend-Tests (Browser)

### 4.1 Manuelle UI-Tests

1. **Öffne Browser**: http://localhost:8080

2. **Test Registration**:
   - Klicke auf "Register"
   - Username: `testuser2`
   - Email: `testuser2@example.com`
   - Password: `Test123!`
   - Bestätige Registrierung
   - Sollte automatisch einloggen

3. **Test Login**:
   - Logout
   - Klicke auf "Login"
   - Gib Credentials ein
   - Sollte zur Todo-Seite weiterleiten

4. **Test Todo Creation**:
   - Klicke "+ New Todo"
   - Titel: "Frontend Test Todo"
   - Beschreibung: "Testing from browser"
   - Priorität: High
   - Fälligkeitsdatum: wählen
   - Tags: work, test
   - Speichern

5. **Test Todo List**:
   - Verifiziere Todo erscheint in Liste
   - Überprüfe Priority Badge (rot für high)
   - Überprüfe Tags werden angezeigt

6. **Test Filters**:
   - Status: Active
   - Priority: High
   - Suche: "Frontend"
   - Sort by: Due Date
   - Reset Filters

7. **Test Pagination**:
   - Erstelle mehrere Todos (>20)
   - Überprüfe Pagination erscheint
   - Navigate zwischen Seiten
   - Überprüfe "Showing X-Y of Z items"

8. **Test Todo Toggle**:
   - Klicke Checkbox
   - Todo sollte als completed markiert werden
   - Filter auf "Completed" setzen
   - Verifiziere Todo erscheint

9. **Test Todo Edit**:
   - Klicke Edit-Button (✏️)
   - Ändere Titel
   - Speichern
   - Verifiziere Änderungen

10. **Test Todo Delete**:
    - Klicke Delete-Button (🗑️)
    - Bestätige Löschung
    - Verifiziere Todo ist weg

### 4.2 Browser Console Tests

Öffne Browser DevTools (F12):

```javascript
// Test 1: Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test 2: Check Local Storage (Token)
console.log('Token:', localStorage.getItem('token'));

// Test 3: Make API Call from Console
fetch('/api/todos', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(r => r.json())
  .then(d => console.log('Todos:', d));

// Test 4: Check React DevTools
// Inspiziere Components und State
```

## 5. Integration Tests

### 5.1 Vollständiger User Flow

```bash
#!/bin/bash
# Script: test_complete_flow.sh

BASE_URL="http://localhost:3000/api"
EMAIL="flowtest@example.com"
PASSWORD="Test123!"

echo "1. Register User..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"flowtest\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')
echo "Token: ${TOKEN:0:20}..."

echo "2. Create 5 Todos..."
for i in {1..5}; do
  curl -s -X POST $BASE_URL/todos \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Todo $i\",\"priority\":\"medium\"}" > /dev/null
done

echo "3. Get All Todos (Page 1)..."
curl -s "$BASE_URL/todos?page=1&limit=3" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.pagination'

echo "4. Filter Active Todos..."
curl -s "$BASE_URL/todos?status=active" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.todos | length'

echo "5. Complete First Todo..."
curl -s -X PATCH $BASE_URL/todos/1/toggle \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

echo "6. Delete a Todo..."
curl -s -X DELETE $BASE_URL/todos/2 \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

echo "Test Flow Complete!"
```

### 5.2 Performance-Test

```bash
# Test: Response Time unter 500ms
time curl -s http://localhost:3000/api/todos \
  -H "Authorization: Bearer $TOKEN" > /dev/null

# Test: Mehrere parallele Requests
for i in {1..10}; do
  curl -s http://localhost:3000/api/todos \
    -H "Authorization: Bearer $TOKEN" > /dev/null &
done
wait
echo "All requests completed"
```

## 6. Container-Logs überprüfen

```bash
# Backend-Logs
docker logs todo-backend-dev -f

# Frontend-Logs
docker logs todo-frontend-dev -f

# PostgreSQL-Logs
docker logs todo-postgres-dev -f

# Alle Logs zusammen
docker-compose -f docker-compose.dev.yml logs -f
```

## 7. Troubleshooting

### Problem: Container startet nicht

```bash
# Status überprüfen
docker-compose -f docker-compose.dev.yml ps

# Logs anschauen
docker-compose -f docker-compose.dev.yml logs

# Container neu bauen
docker-compose -f docker-compose.dev.yml up --build -d
```

### Problem: Backend kann DB nicht erreichen

```bash
# Netzwerk überprüfen
docker network ls
docker network inspect todo-app_backend-network

# PostgreSQL erreichbar?
docker exec todo-backend-dev ping postgres -c 3
```

### Problem: Frontend kann Backend nicht erreichen

```bash
# Check Vite Proxy Config
docker exec todo-frontend-dev cat /app/vite.config.js

# Teste Backend-Verbindung vom Frontend-Container
docker exec todo-frontend-dev curl http://backend:3000/api/health
```

### Problem: Datenbank ist leer

```bash
# Init-Script manuell ausführen
docker exec -i todo-postgres-dev psql -U todouser tododb < /Users/reinhard/Documents/ClaudeProjekte/todo-app/database/init.sql
```

## 8. Test-Checkliste

### Backend Tests
- [ ] PostgreSQL läuft und ist erreichbar
- [ ] Backend-Server läuft auf Port 3000
- [ ] User Registration funktioniert
- [ ] User Login gibt Token zurück
- [ ] JWT-Token wird akzeptiert
- [ ] Todo CRUD operations funktionieren
- [ ] Filter funktionieren (status, priority, search)
- [ ] Sort funktioniert
- [ ] Pagination funktioniert (limit, offset, metadata)
- [ ] Tags werden erstellt und zugeordnet
- [ ] Rate Limiting aktiv (5 req/15min für Auth)
- [ ] CORS Headers korrekt

### Frontend Tests
- [ ] Frontend lädt auf Port 8080
- [ ] Registration-Seite funktioniert
- [ ] Login-Seite funktioniert
- [ ] Todo-Liste wird angezeigt
- [ ] Todo erstellen funktioniert
- [ ] Todo bearbeiten funktioniert
- [ ] Todo löschen funktioniert (mit Bestätigung)
- [ ] Todo Toggle funktioniert
- [ ] Filter funktionieren
- [ ] Sortierung funktioniert
- [ ] Pagination funktioniert
- [ ] Tags werden angezeigt
- [ ] Loading States angezeigt
- [ ] Error Messages angezeigt
- [ ] Responsive Design (Mobile)

### Integration Tests
- [ ] Frontend → Backend Kommunikation
- [ ] Backend → Database Kommunikation
- [ ] Authentication Flow komplett
- [ ] Todo CRUD Flow komplett
- [ ] Filter + Pagination kombiniert
- [ ] Mehrere User isoliert
- [ ] Container Restart behält Daten
- [ ] Backup & Restore funktioniert

## 9. Cleanup

```bash
# Stoppe alle Container
docker-compose -f docker-compose.dev.yml down

# Stoppe und lösche Volumes (Daten gehen verloren!)
docker-compose -f docker-compose.dev.yml down -v

# Lösche alle Images
docker-compose -f docker-compose.dev.yml down --rmi all

# System cleanup
docker system prune -a
```

## 10. Test-Report Template

```
# Test-Report: [Datum]

## Environment
- Docker Version: [version]
- OS: MacOS [version]
- Containers: All running ✓

## Backend Tests
- Authentication: ✓ PASS / ✗ FAIL
- Todo CRUD: ✓ PASS / ✗ FAIL
- Filters: ✓ PASS / ✗ FAIL
- Pagination: ✓ PASS / ✗ FAIL
- Tags: ✓ PASS / ✗ FAIL

## Frontend Tests
- UI Rendering: ✓ PASS / ✗ FAIL
- User Interactions: ✓ PASS / ✗ FAIL
- API Integration: ✓ PASS / ✗ FAIL

## Issues Found
1. [Issue description]
2. [Issue description]

## Performance
- Average Response Time: XXXms
- Page Load Time: XXXms

## Conclusion
[Overall assessment]
```
