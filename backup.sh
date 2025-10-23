#!/bin/bash

# Todo-App Database Backup Script
# Backs up PostgreSQL database with compression and retention policy

set -e

# Configuration
BACKUP_DIR="/opt/backups/todo-app"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Todo-App Database Backup${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Date: $(date)"
echo "Backup Directory: $BACKUP_DIR"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

# Check if postgres container is running
if ! docker ps | grep -q "todo-postgres-prod"; then
    echo -e "${RED}Error: PostgreSQL container is not running${NC}"
    exit 1
fi

# Perform backup
echo -e "${GREEN}Creating database backup...${NC}"
if docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U todouser tododb > "$BACKUP_DIR/db_$DATE.sql"; then
    echo -e "${GREEN}✓ Database dumped successfully${NC}"
else
    echo -e "${RED}✗ Database dump failed${NC}"
    exit 1
fi

# Compress backup
echo -e "${GREEN}Compressing backup...${NC}"
if gzip "$BACKUP_DIR/db_$DATE.sql"; then
    BACKUP_FILE="$BACKUP_DIR/db_$DATE.sql.gz"
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed: $BACKUP_SIZE${NC}"
else
    echo -e "${RED}✗ Compression failed${NC}"
    exit 1
fi

# Clean old backups
echo -e "${GREEN}Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
DELETED=$(find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo -e "${GREEN}✓ Deleted $DELETED old backup(s)${NC}"

# List current backups
echo ""
echo -e "${YELLOW}Current Backups:${NC}"
ls -lh "$BACKUP_DIR"/db_*.sql.gz 2>/dev/null || echo "No backups found"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Backup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo "Backup File: $(basename $BACKUP_FILE)"
echo "Size: $BACKUP_SIZE"
echo ""

# Optional: Send notification (uncomment and configure)
# curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage" \
#   -d "chat_id=<YOUR_CHAT_ID>" \
#   -d "text=✅ Todo-App backup completed: $BACKUP_FILE ($BACKUP_SIZE)"

exit 0
