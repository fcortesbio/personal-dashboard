# API Documentation

This document provides a comprehensive guide to the Personal Dashboard API endpoints.

## Base URLs

- **Development**: `http://localhost:3001`
- **Production**: `http://localhost:3000`

## OpenAPI Specification

The full OpenAPI 3.0 specification is available at:
- **JSON**: [`docs/openapi.json`](./openapi.json)
- **Interactive UI** (when running): `http://localhost:3001/api-docs`

---

## Courses

Manage your learning courses and track progress.

### Create a Course

Create a new course entry.

**Endpoint**: `POST /courses`

**Request Body**:
```json
{
  "name": "Amazon Junior Software Developer with GenAI",
  "current_module": "Exploring conditional statements",
  "link": "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements"
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "name": "Amazon Junior Software Developer with GenAI",
  "current_module": "Exploring conditional statements",
  "link": "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements"
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Amazon Junior Software Developer with GenAI",
    "current_module": "Exploring conditional statements",
    "link": "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements"
  }'
```

---

### Get All Courses

Retrieve all courses.

**Endpoint**: `GET /courses`

**Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "Amazon Junior Software Developer with GenAI",
    "current_module": "Exploring conditional statements",
    "link": "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements"
  },
  {
    "id": 2,
    "name": "Docker Mastery",
    "current_module": null,
    "link": null
  }
]
```

**Example**:
```bash
curl http://localhost:3001/courses
```

---

### Get a Course by ID

Retrieve a specific course.

**Endpoint**: `GET /courses/{id}`

**Parameters**:
- `id` (path, integer, required): Course ID

**Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "Amazon Junior Software Developer with GenAI",
  "current_module": "Exploring conditional statements",
  "link": "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements"
}
```

**Error** (`404 Not Found`):
```json
{
  "error": "Course not found"
}
```

**Example**:
```bash
curl http://localhost:3001/courses/1
```

---

### Update a Course

Update an existing course.

**Endpoint**: `PUT /courses/{id}`

**Parameters**:
- `id` (path, integer, required): Course ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Course Name",
  "current_module": "New Module",
  "link": "https://example.com/new-link"
}
```

**Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "Updated Course Name",
  "current_module": "New Module",
  "link": "https://example.com/new-link"
}
```

**Example**:
```bash
curl -X PUT http://localhost:3001/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "current_module": "Advanced Topics",
    "link": "https://example.com/advanced"
  }'
```

---

### Delete a Course

Delete a course.

**Endpoint**: `DELETE /courses/{id}`

**Parameters**:
- `id` (path, integer, required): Course ID

**Response** (`204 No Content`)

**Error** (`404 Not Found`):
```json
{
  "error": "Course not found"
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3001/courses/1
```

---

## Bookmarks

Manage your bookmarks and quick links.

### Create a Bookmark

Create a new bookmark entry.

**Endpoint**: `POST /bookmarks`

**Request Body**:
```json
{
  "name": "GitHub",
  "link": "https://github.com"
}
```

**Response** (`201 Created`):
```json
{
  "id": 1,
  "name": "GitHub",
  "link": "https://github.com"
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub",
    "link": "https://github.com"
  }'
```

---

### Get All Bookmarks

Retrieve all bookmarks.

**Endpoint**: `GET /bookmarks`

**Response** (`200 OK`):
```json
[
  {
    "id": 1,
    "name": "GitHub",
    "link": "https://github.com"
  },
  {
    "id": 2,
    "name": "Stack Overflow",
    "link": "https://stackoverflow.com"
  }
]
```

**Example**:
```bash
curl http://localhost:3001/bookmarks
```

---

### Get a Bookmark by ID

Retrieve a specific bookmark.

**Endpoint**: `GET /bookmarks/{id}`

**Parameters**:
- `id` (path, integer, required): Bookmark ID

**Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "GitHub",
  "link": "https://github.com"
}
```

**Error** (`404 Not Found`):
```json
{
  "error": "Bookmark not found"
}
```

**Example**:
```bash
curl http://localhost:3001/bookmarks/1
```

---

### Update a Bookmark

Update an existing bookmark.

**Endpoint**: `PUT /bookmarks/{id}`

**Parameters**:
- `id` (path, integer, required): Bookmark ID

**Request Body** (all fields optional):
```json
{
  "name": "Updated Name",
  "link": "https://updated-link.com"
}
```

**Response** (`200 OK`):
```json
{
  "id": 1,
  "name": "Updated Name",
  "link": "https://updated-link.com"
}
```

**Example**:
```bash
curl -X PUT http://localhost:3001/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "link": "https://github.com/fcortesbio"
  }'
```

---

### Delete a Bookmark

Delete a bookmark.

**Endpoint**: `DELETE /bookmarks/{id}`

**Parameters**:
- `id` (path, integer, required): Bookmark ID

**Response** (`204 No Content`)

**Error** (`404 Not Found`):
```json
{
  "error": "Bookmark not found"
}
```

**Example**:
```bash
curl -X DELETE http://localhost:3001/bookmarks/1
```

---

## GitHub

Fetch GitHub user repositories.

### Get User Repositories

Retrieve a list of public repositories for a GitHub user.

**Endpoint**: `GET /github`

**Query Parameters**:
- `username` (string, required): GitHub username
- `limit` (integer, optional): Maximum number of repositories to return (1-100, default: 5)

**Response** (`200 OK`):
```json
{
  "profile_url": "https://github.com/fcortesbio",
  "repositories": [
    {
      "name": "personal-dashboard",
      "url": "https://github.com/fcortesbio/personal-dashboard",
      "description": "A personal dashboard application",
      "stars": 42,
      "language": "JavaScript",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "name": "another-repo",
      "url": "https://github.com/fcortesbio/another-repo",
      "description": null,
      "stars": 5,
      "language": "Python",
      "updated_at": "2024-01-10T08:15:00Z"
    }
  ]
}
```

**Errors**:

**400 Bad Request** - Missing username:
```json
{
  "error": "username query parameter is required"
}
```

**404 Not Found** - User doesn't exist:
```json
{
  "error": "GitHub user not found"
}
```

**429 Too Many Requests** - Rate limit exceeded:
```json
{
  "error": "GitHub API rate limit exceeded"
}
```

**Examples**:
```bash
# Get 5 most recent repositories (default)
curl "http://localhost:3001/github?username=fcortesbio"

# Get 10 most recent repositories
curl "http://localhost:3001/github?username=fcortesbio&limit=10"
```

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "error": "Description of what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `204 No Content` - Request succeeded with no response body
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

---

## Notes

- All request and response bodies use `application/json` content type
- All timestamps follow ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`)
- Fields marked as `nullable` can be `null` or omitted
- The API uses SQLite for data persistence
