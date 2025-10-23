# Todo-App API Documentation

**Version:** 1.0
**Base URL:** `http://localhost:3000/api` (development) | `https://yourdomain.com/api` (production)
**Authentication:** JWT Bearer Token

---

## Table of Contents

1. [Authentication](#authentication)
2. [Todos](#todos)
3. [Tags](#tags)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)

---

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### POST /api/auth/register

Register a new user account.

**Request:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Validation:**
- `username`: 3-30 characters, alphanumeric and underscores only
- `email`: Valid email format
- `password`: Minimum 8 characters, must contain uppercase, lowercase, number, and special character

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-10-23T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request`: Validation failed
- `409 Conflict`: Username or email already exists

---

### POST /api/auth/login

Login with existing credentials.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors:**
- `400 Bad Request`: Missing credentials
- `401 Unauthorized`: Invalid credentials

---

### GET /api/auth/me

Get current authenticated user information.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2025-10-23T10:30:00.000Z"
  }
}
```

**Errors:**
- `401 Unauthorized`: Invalid or missing token

---

## Todos

### GET /api/todos

Get all todos for the authenticated user.

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (`pending`, `in_progress`, `completed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `tag` (optional): Filter by tag name
- `search` (optional): Search in title and description

**Example:**
```
GET /api/todos?status=pending&priority=high
GET /api/todos?search=meeting
GET /api/todos?tag=work
```

**Response (200 OK):**
```json
{
  "success": true,
  "todos": [
    {
      "id": 1,
      "title": "Complete project documentation",
      "description": "Write comprehensive API docs",
      "status": "in_progress",
      "priority": "high",
      "dueDate": "2025-10-25T00:00:00.000Z",
      "tags": [
        {
          "id": 1,
          "name": "work",
          "color": "#3B82F6"
        }
      ],
      "userId": 1,
      "createdAt": "2025-10-23T10:30:00.000Z",
      "updatedAt": "2025-10-23T14:15:00.000Z"
    }
  ]
}
```

---

### GET /api/todos/:id

Get a specific todo by ID.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "todo": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2025-10-25T00:00:00.000Z",
    "tags": [
      {
        "id": 1,
        "name": "work",
        "color": "#3B82F6"
      }
    ],
    "userId": 1,
    "createdAt": "2025-10-23T10:30:00.000Z",
    "updatedAt": "2025-10-23T14:15:00.000Z"
  }
}
```

**Errors:**
- `404 Not Found`: Todo not found
- `403 Forbidden`: Todo belongs to another user

---

### POST /api/todos

Create a new todo.

**Authentication:** Required

**Request:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high",
  "dueDate": "2025-10-25T00:00:00.000Z",
  "tags": [1, 2]
}
```

**Validation:**
- `title`: Required, 1-200 characters
- `description`: Optional, max 1000 characters
- `status`: Optional, one of: `pending`, `in_progress`, `completed` (default: `pending`)
- `priority`: Optional, one of: `low`, `medium`, `high` (default: `medium`)
- `dueDate`: Optional, valid ISO 8601 date
- `tags`: Optional, array of tag IDs

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "todo": {
    "id": 1,
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "status": "pending",
    "priority": "high",
    "dueDate": "2025-10-25T00:00:00.000Z",
    "tags": [
      {
        "id": 1,
        "name": "work",
        "color": "#3B82F6"
      }
    ],
    "userId": 1,
    "createdAt": "2025-10-23T10:30:00.000Z",
    "updatedAt": "2025-10-23T10:30:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Validation failed

---

### PUT /api/todos/:id

Update an existing todo.

**Authentication:** Required

**Request:**
```json
{
  "title": "Complete project documentation (Updated)",
  "status": "completed",
  "priority": "medium",
  "tags": [1]
}
```

**Note:** All fields are optional. Only provided fields will be updated.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todo updated successfully",
  "todo": {
    "id": 1,
    "title": "Complete project documentation (Updated)",
    "description": "Write comprehensive API docs",
    "status": "completed",
    "priority": "medium",
    "dueDate": "2025-10-25T00:00:00.000Z",
    "tags": [
      {
        "id": 1,
        "name": "work",
        "color": "#3B82F6"
      }
    ],
    "userId": 1,
    "createdAt": "2025-10-23T10:30:00.000Z",
    "updatedAt": "2025-10-23T15:45:00.000Z"
  }
}
```

**Errors:**
- `404 Not Found`: Todo not found
- `403 Forbidden`: Todo belongs to another user
- `400 Bad Request`: Validation failed

---

### DELETE /api/todos/:id

Delete a todo.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

**Errors:**
- `404 Not Found`: Todo not found
- `403 Forbidden`: Todo belongs to another user

---

## Tags

### GET /api/tags

Get all tags for the authenticated user.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "tags": [
    {
      "id": 1,
      "name": "work",
      "color": "#3B82F6",
      "userId": 1,
      "createdAt": "2025-10-23T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "personal",
      "color": "#10B981",
      "userId": 1,
      "createdAt": "2025-10-23T10:00:00.000Z"
    }
  ]
}
```

---

### GET /api/tags/:id

Get a specific tag by ID.

**Authentication:** Required

**Response (200 OK):**
```json
{
  "success": true,
  "tag": {
    "id": 1,
    "name": "work",
    "color": "#3B82F6",
    "userId": 1,
    "createdAt": "2025-10-23T10:00:00.000Z"
  }
}
```

**Errors:**
- `404 Not Found`: Tag not found
- `403 Forbidden`: Tag belongs to another user

---

### POST /api/tags

Create a new tag.

**Authentication:** Required

**Request:**
```json
{
  "name": "urgent",
  "color": "#EF4444"
}
```

**Validation:**
- `name`: Required, 1-30 characters, alphanumeric and spaces
- `color`: Required, valid hex color code (e.g., `#FF5733`)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Tag created successfully",
  "tag": {
    "id": 3,
    "name": "urgent",
    "color": "#EF4444",
    "userId": 1,
    "createdAt": "2025-10-23T16:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Validation failed
- `409 Conflict`: Tag name already exists for this user

---

### PUT /api/tags/:id

Update an existing tag.

**Authentication:** Required

**Request:**
```json
{
  "name": "high-priority",
  "color": "#DC2626"
}
```

**Note:** Both fields are optional. Only provided fields will be updated.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tag updated successfully",
  "tag": {
    "id": 3,
    "name": "high-priority",
    "color": "#DC2626",
    "userId": 1,
    "createdAt": "2025-10-23T16:00:00.000Z",
    "updatedAt": "2025-10-23T16:30:00.000Z"
  }
}
```

**Errors:**
- `404 Not Found`: Tag not found
- `403 Forbidden`: Tag belongs to another user
- `400 Bad Request`: Validation failed

---

### DELETE /api/tags/:id

Delete a tag.

**Authentication:** Required

**Note:** Deleting a tag will remove it from all associated todos.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Tag deleted successfully"
}
```

**Errors:**
- `404 Not Found`: Tag not found
- `403 Forbidden`: Tag belongs to another user

---

## Error Handling

All errors follow a consistent format:

**Error Response:**
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data or validation failed
- `401 Unauthorized`: Authentication required or token invalid
- `403 Forbidden`: Authenticated but not authorized to access resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (username, email, tag name)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Validation Errors

Validation errors include detailed field-level information:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

---

## Rate Limiting

Rate limits are applied to prevent abuse:

- **General API endpoints:** 100 requests per minute per IP
- **Authentication endpoints:** 5 requests per minute per IP

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1698068400
```

**Rate Limit Exceeded (429):**
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

---

## Example Usage

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePassword123!"
  }'
```

**Create Todo:**
```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Complete API documentation",
    "description": "Write comprehensive docs",
    "priority": "high",
    "status": "in_progress"
  }'
```

**Get All Todos:**
```bash
curl -X GET http://localhost:3000/api/todos \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Update Todo:**
```bash
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "completed"
  }'
```

**Delete Todo:**
```bash
curl -X DELETE http://localhost:3000/api/todos/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### JavaScript (Axios) Examples

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let token = '';

// Register
const register = async () => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePassword123!'
  });
  token = response.data.token;
};

// Login
const login = async () => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'john@example.com',
    password: 'SecurePassword123!'
  });
  token = response.data.token;
};

// Create Todo
const createTodo = async () => {
  const response = await axios.post(
    `${API_URL}/todos`,
    {
      title: 'Complete API documentation',
      priority: 'high',
      status: 'in_progress'
    },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.todo;
};

// Get All Todos
const getTodos = async () => {
  const response = await axios.get(`${API_URL}/todos`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data.todos;
};

// Update Todo
const updateTodo = async (id) => {
  const response = await axios.put(
    `${API_URL}/todos/${id}`,
    { status: 'completed' },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data.todo;
};

// Delete Todo
const deleteTodo = async (id) => {
  await axios.delete(`${API_URL}/todos/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};
```

---

## Security Notes

1. **HTTPS Only:** In production, always use HTTPS
2. **Token Storage:** Store JWT tokens securely (httpOnly cookies recommended)
3. **Token Expiration:** Tokens expire after 7 days
4. **CORS:** Configure allowed origins in `.env` file
5. **Rate Limiting:** Respect rate limits to avoid being blocked
6. **Input Validation:** All inputs are validated on the server
7. **SQL Injection:** Protected via Sequelize ORM parameterized queries
8. **XSS Protection:** Helmet.js security headers applied

---

## Health Check

**GET /health**

Check if the server is running (no authentication required).

**Response (200 OK):**
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

---

**Documentation Version:** 1.0
**Last Updated:** October 23, 2025
**Support:** https://github.com/YOUR_USERNAME/todo-app-fullstack/issues
