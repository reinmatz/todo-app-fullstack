#!/bin/bash

# Docker Integration Test Script
# Tests Backend, Frontend und PostgreSQL in Docker-Umgebung

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:3000/api"
FRONTEND_URL="http://localhost:8080"
TEST_EMAIL="dockertest_$(date +%s)@example.com"
TEST_USERNAME="dockertest_$(date +%s)"
TEST_PASSWORD="Test123!"

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Todo-App Docker Integration Tests${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        exit 1
    fi
}

# Test 1: Check if containers are running
echo -e "${YELLOW}[1] Checking Docker Containers...${NC}"
docker ps | grep -q "todo-postgres-dev" && \
docker ps | grep -q "todo-backend-dev" && \
docker ps | grep -q "todo-frontend-dev"
print_result $? "All containers running"

# Test 2: Check PostgreSQL
echo -e "\n${YELLOW}[2] Testing PostgreSQL Connection...${NC}"
docker exec todo-postgres-dev pg_isready -U todouser > /dev/null 2>&1
print_result $? "PostgreSQL is ready"

# Test 3: Check if tables exist
echo -e "\n${YELLOW}[3] Checking Database Tables...${NC}"
TABLES=$(docker exec todo-postgres-dev psql -U todouser -d tododb -t -c "\dt" | grep -c "users\|todos\|tags")
[ "$TABLES" -ge 3 ]
print_result $? "Database tables exist (users, todos, tags)"

# Test 4: Backend Health Check
echo -e "\n${YELLOW}[4] Testing Backend API...${NC}"
curl -f -s http://localhost:3000/health > /dev/null 2>&1
print_result $? "Backend API is reachable"

# Test 5: Frontend Health Check
echo -e "\n${YELLOW}[5] Testing Frontend...${NC}"
curl -f -s http://localhost:8080 > /dev/null 2>&1
print_result $? "Frontend is reachable"

# Test 6: User Registration
echo -e "\n${YELLOW}[6] Testing User Registration...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$TEST_USERNAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "$REGISTER_RESPONSE" | grep -q '"success":true'
print_result $? "User registration successful"

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ FAIL${NC}: No token received"
    exit 1
fi
echo "   Token received: ${TOKEN:0:30}..."

# Test 7: User Login
echo -e "\n${YELLOW}[7] Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

echo "$LOGIN_RESPONSE" | grep -q '"success":true'
print_result $? "User login successful"

# Update token from login
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test 8: Get Current User
echo -e "\n${YELLOW}[8] Testing Get Current User...${NC}"
ME_RESPONSE=$(curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "$ME_RESPONSE" | grep -q "$TEST_EMAIL"
print_result $? "Get current user info"

# Test 9: Create Todo
echo -e "\n${YELLOW}[9] Testing Create Todo...${NC}"
CREATE_TODO_RESPONSE=$(curl -s -X POST $BASE_URL/todos \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker Test Todo",
    "description": "Created by automated test",
    "priority": "high",
    "due_date": "2025-12-31",
    "tags": ["docker", "test", "automated"]
  }')

echo "$CREATE_TODO_RESPONSE" | grep -q '"success":true'
print_result $? "Create todo"

TODO_ID=$(echo "$CREATE_TODO_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "   Created Todo ID: $TODO_ID"

# Test 10: Get All Todos (without pagination)
echo -e "\n${YELLOW}[10] Testing Get All Todos...${NC}"
GET_TODOS_RESPONSE=$(curl -s "$BASE_URL/todos" \
  -H "Authorization: Bearer $TOKEN")

echo "$GET_TODOS_RESPONSE" | grep -q '"success":true'
print_result $? "Get all todos"

# Test 11: Get Todos with Pagination
echo -e "\n${YELLOW}[11] Testing Pagination...${NC}"
PAGINATED_RESPONSE=$(curl -s "$BASE_URL/todos?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "$PAGINATED_RESPONSE" | grep -q '"pagination"'
print_result $? "Pagination metadata returned"

CURRENT_PAGE=$(echo "$PAGINATED_RESPONSE" | grep -o '"currentPage":[0-9]*' | cut -d':' -f2)
[ "$CURRENT_PAGE" = "1" ]
print_result $? "Correct page number (1)"

# Test 12: Get Todo by ID
echo -e "\n${YELLOW}[12] Testing Get Todo by ID...${NC}"
GET_TODO_RESPONSE=$(curl -s "$BASE_URL/todos/$TODO_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$GET_TODO_RESPONSE" | grep -q "Docker Test Todo"
print_result $? "Get todo by ID"

# Test 13: Update Todo
echo -e "\n${YELLOW}[13] Testing Update Todo...${NC}"
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/todos/$TODO_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Docker Test Todo",
    "priority": "critical"
  }')

echo "$UPDATE_RESPONSE" | grep -q "Updated Docker Test Todo"
print_result $? "Update todo"

# Test 14: Toggle Todo Completion
echo -e "\n${YELLOW}[14] Testing Toggle Todo...${NC}"
TOGGLE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/todos/$TODO_ID/toggle" \
  -H "Authorization: Bearer $TOKEN")

echo "$TOGGLE_RESPONSE" | grep -q '"success":true'
print_result $? "Toggle todo completion"

# Test 15: Filter by Status
echo -e "\n${YELLOW}[15] Testing Filter by Status...${NC}"
FILTER_RESPONSE=$(curl -s "$BASE_URL/todos?status=completed" \
  -H "Authorization: Bearer $TOKEN")

echo "$FILTER_RESPONSE" | grep -q '"success":true'
print_result $? "Filter todos by status"

# Test 16: Filter by Priority
echo -e "\n${YELLOW}[16] Testing Filter by Priority...${NC}"
PRIORITY_RESPONSE=$(curl -s "$BASE_URL/todos?priority=critical" \
  -H "Authorization: Bearer $TOKEN")

echo "$PRIORITY_RESPONSE" | grep -q '"success":true'
print_result $? "Filter todos by priority"

# Test 17: Search Todos
echo -e "\n${YELLOW}[17] Testing Search...${NC}"
SEARCH_RESPONSE=$(curl -s "$BASE_URL/todos?search=Docker" \
  -H "Authorization: Bearer $TOKEN")

echo "$SEARCH_RESPONSE" | grep -q "Docker"
print_result $? "Search todos"

# Test 18: Sort Todos
echo -e "\n${YELLOW}[18] Testing Sort...${NC}"
SORT_RESPONSE=$(curl -s "$BASE_URL/todos?sortBy=priority&order=ASC" \
  -H "Authorization: Bearer $TOKEN")

echo "$SORT_RESPONSE" | grep -q '"success":true'
print_result $? "Sort todos"

# Test 19: Get Tags
echo -e "\n${YELLOW}[19] Testing Get Tags...${NC}"
TAGS_RESPONSE=$(curl -s "$BASE_URL/tags" \
  -H "Authorization: Bearer $TOKEN")

echo "$TAGS_RESPONSE" | grep -q '"success":true'
print_result $? "Get all tags"

echo "$TAGS_RESPONSE" | grep -q "docker"
print_result $? "Tags from todo creation exist"

# Test 20: Delete Todo
echo -e "\n${YELLOW}[20] Testing Delete Todo...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/todos/$TODO_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$DELETE_RESPONSE" | grep -q '"success":true'
print_result $? "Delete todo"

# Test 21: Verify Todo Deleted
echo -e "\n${YELLOW}[21] Testing Verify Deletion...${NC}"
VERIFY_DELETE=$(curl -s "$BASE_URL/todos/$TODO_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$VERIFY_DELETE" | grep -q '"success":false'
print_result $? "Todo no longer exists"

# Test 22: Performance Test (Response Time)
echo -e "\n${YELLOW}[22] Testing API Performance...${NC}"
START_TIME=$(date +%s%N)
curl -s "$BASE_URL/todos" \
  -H "Authorization: Bearer $TOKEN" > /dev/null
END_TIME=$(date +%s%N)
DURATION=$((($END_TIME - $START_TIME) / 1000000))  # Convert to milliseconds

echo "   Response time: ${DURATION}ms"
[ "$DURATION" -lt 1000 ]
print_result $? "Response time under 1000ms"

# Test 23: Database Persistence
echo -e "\n${YELLOW}[23] Testing Database Persistence...${NC}"
TODO_COUNT=$(docker exec todo-postgres-dev psql -U todouser -d tododb -t -c "SELECT COUNT(*) FROM todos;" | tr -d ' ')
[ "$TODO_COUNT" -ge 0 ]
print_result $? "Database queries work correctly"

# Test 24: Check User Count
echo -e "\n${YELLOW}[24] Testing User Count...${NC}"
USER_COUNT=$(docker exec todo-postgres-dev psql -U todouser -d tododb -t -c "SELECT COUNT(*) FROM users;" | tr -d ' ')
echo "   Total users in database: $USER_COUNT"
[ "$USER_COUNT" -ge 1 ]
print_result $? "At least one user exists"

# Final Summary
echo -e "\n${YELLOW}========================================${NC}"
echo -e "${GREEN}✓ All Tests Passed!${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""
echo "Summary:"
echo "  - All Docker containers running"
echo "  - PostgreSQL operational"
echo "  - Backend API functional"
echo "  - Frontend accessible"
echo "  - Authentication working"
echo "  - Todo CRUD operations successful"
echo "  - Pagination implemented"
echo "  - Filters and search working"
echo "  - Tags system operational"
echo "  - Performance acceptable"
echo ""
echo -e "${GREEN}Docker environment is ready for development!${NC}"
