#!/bin/bash

# Quick Docker Health Check Script
# Schneller Test ob alle Container laufen

echo "🔍 Todo-App Quick Health Check"
echo "================================"
echo ""

# Check Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker ist nicht gestartet!"
    echo "   Bitte starte Docker Desktop"
    exit 1
fi
echo "✓ Docker läuft"

# Check containers
echo ""
echo "📦 Container Status:"
if docker ps | grep -q "todo-postgres-dev"; then
    echo "  ✓ PostgreSQL"
else
    echo "  ❌ PostgreSQL nicht gefunden"
    exit 1
fi

if docker ps | grep -q "todo-backend-dev"; then
    echo "  ✓ Backend"
else
    echo "  ❌ Backend nicht gefunden"
    exit 1
fi

if docker ps | grep -q "todo-frontend-dev"; then
    echo "  ✓ Frontend"
else
    echo "  ❌ Frontend nicht gefunden"
    exit 1
fi

# Check PostgreSQL
echo ""
echo "🗄️  Database Check:"
if docker exec todo-postgres-dev pg_isready -U todouser > /dev/null 2>&1; then
    echo "  ✓ PostgreSQL bereit"
else
    echo "  ❌ PostgreSQL nicht bereit"
    exit 1
fi

# Check Backend API
echo ""
echo "🔌 API Check:"
if curl -f -s http://localhost:3000/ > /dev/null 2>&1; then
    echo "  ✓ Backend API erreichbar (Port 3000)"
else
    echo "  ❌ Backend API nicht erreichbar"
    exit 1
fi

# Check Frontend
echo ""
echo "🌐 Frontend Check:"
if curl -f -s http://localhost:8080 > /dev/null 2>&1; then
    echo "  ✓ Frontend erreichbar (Port 8080)"
else
    echo "  ❌ Frontend nicht erreichbar"
    exit 1
fi

# Database Tables Check
echo ""
echo "📊 Database Tables:"
TABLES=$(docker exec todo-postgres-dev psql -U todouser -d tododb -t -c "\dt" 2>/dev/null | wc -l)
if [ "$TABLES" -ge 4 ]; then
    echo "  ✓ Tabellen existieren ($TABLES gefunden)"
else
    echo "  ⚠️  Möglicherweise fehlen Tabellen"
fi

# Show URLs
echo ""
echo "================================"
echo "✅ Alle Checks erfolgreich!"
echo ""
echo "📍 Zugriff auf die Anwendung:"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3000"
echo ""
echo "🧪 Vollständige Tests ausführen:"
echo "   ./test_docker.sh"
echo ""
