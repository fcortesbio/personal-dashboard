# Personal Dashboard API

A self-hosted productivity dashboard backend that consolidates key tools and information into a unified API. Built with Node.js/Express.js, SQLite, and comprehensive test coverage.

**Status:** Phase 1 Complete ✅ - Core backend and 3/5 widgets functional.

## Features

### ✅ Phase 1 Complete
- **Courses API** - Track online courses with current module and links
- **Bookmarks API** - Manage quick-access links and bookmarks  
- **GitHub API** - Fetch recent repositories from GitHub
- **SQLite Database** - Persistent data storage with WAL mode
- **Test Suite** - 100% isolated test database, comprehensive coverage
- **OpenAPI Documentation** - Auto-generated Swagger UI at `/api-docs`

### 🔄 Phase 2 (Planned)
- **Google OAuth 2.0** - Secure authentication flow
- **Token Management** - Secure refresh token storage

### 📋 Phase 3 (Planned)  
- **Google Tasks API** - Fetch and create tasks
- **Google Calendar API** - Weekly calendar overview
- **Frontend** - React/Vue dashboard interface

## Quick Start

### Prerequisites
- Node.js 18+ (for native `fetch` support)
- npm or yarn
- Docker & Docker Compose (for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/fcortesbio/personal-dashboard
cd personal-dashboard

# Install dependencies
npm install

# Create development environment file
cp .env.example .env.dev
# Edit .env.dev and add your credentials

# Run tests
npm test

# Start development server (runs on port 4001)
npm run dev
```

Development server runs on `http://localhost:4001`

## API Endpoints

### 📚 Courses
Manage online course tracking:

- **GET** `/courses` - List all courses
- **POST** `/courses` - Create a course
- **GET** `/courses/:id` - Get course by ID
- **PUT** `/courses/:id` - Update course
- **DELETE** `/courses/:id` - Delete course

**Example:**
```json
{
  "name": "Amazon Junior Software Developer with GenAI",
  "current_module": "Exploring conditional statements",
  "link": "https://coursera.org/learn/..."
}
```

### 🔖 Bookmarks
Manage quick-access links:

- **GET** `/bookmarks` - List all bookmarks
- **POST** `/bookmarks` - Create a bookmark
- **GET** `/bookmarks/:id` - Get bookmark by ID
- **PUT** `/bookmarks/:id` - Update bookmark  
- **DELETE** `/bookmarks/:id` - Delete bookmark

**Example:**
```json
{
  "name": "GitHub",
  "link": "https://github.com"
}
```

### 🐙 GitHub
Fetch user repositories:

- **GET** `/github?username=fcortesbio&limit=5` - Get recent repos

**Response:**
```json
{
  "username": "fcortesbio",
  "profile_url": "https://github.com/fcortesbio",
  "repositories": [
    {
      "name": "personal-dashboard",
      "description": "Self-hosted productivity dashboard",
      "url": "https://github.com/fcortesbio/personal-dashboard",
      "updated_at": "2025-10-30T16:00:00Z",
      "language": "JavaScript",
      "stars": 0
    }
  ],
  "fetched_at": "2025-10-30T16:00:00Z"
}
```

## API Documentation

Interactive API docs available at: **http://localhost:3000/api-docs**

Auto-generated from JSDoc comments using swagger-jsdoc and Swagger UI.

## Environment Variables

```bash
# Server (optional)
PORT=3000
NODE_ENV=development

# GitHub API (optional - for private repos)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=fcortesbio
```

**GitHub Token:** Only needed for private repositories. Public repos work without authentication.

## Testing

**Test Database Isolation:** All tests use in-memory SQLite databases, ensuring production data safety.

```bash
# Run all tests
npm test

# Individual test suites
NODE_ENV=test node tests/courses.test.js
NODE_ENV=test node tests/bookmarks.test.js  
node tests/github.test.js
```

**Test Coverage:**
- ✅ Courses: 9 tests (CRUD operations, validation)
- ✅ Bookmarks: 11 tests (CRUD operations, validation)
- ✅ GitHub: 8 tests (API integration, error handling)

## Project Structure

```
├── controllers/          # Business logic
│   ├── courses.js        # Course management  
│   ├── bookmarks.js      # Bookmark management
│   └── github.js         # GitHub API integration
├── routes/               # Express route handlers
│   ├── courses.js        # Course endpoints
│   ├── bookmarks.js      # Bookmark endpoints
│   └── github.js         # GitHub endpoints
├── db/                   # Database setup
│   ├── database.js       # Production SQLite setup
│   └── test-database.js  # Test database factory
├── tests/                # Test suites
│   ├── courses.test.js   # Course API tests
│   ├── bookmarks.test.js # Bookmark API tests
│   └── github.test.js    # GitHub API tests
├── docs/                 # API documentation
│   ├── swaggerConfig.js  # Swagger setup
│   └── schemas.js        # OpenAPI schemas
└── data/                 # SQLite database files
```

## Database Schema

**courses**
- `id` - PRIMARY KEY
- `name` - Course name (required)
- `current_module` - Current module name
- `link` - Course/module URL

**bookmarks**  
- `id` - PRIMARY KEY
- `name` - Bookmark name (required)
- `link` - Bookmark URL

## Development

### Code Style
- ES6 modules (`import/export`)
- JSDoc comments for OpenAPI generation
- Consistent error handling
- Test-driven development (TDD)

### Git Workflow  
Following conventional commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test additions/changes
- `refactor:` - Code refactoring

### Branching Strategy
- `main` - Production ready code
- `feature/*` - New features (squash merge to main)
- Never commit directly to main

## Deployment

### Docker with Traefik

This project is configured to run with Docker and Traefik as a reverse proxy.

#### Prerequisites
- Docker and Docker Compose installed
- Traefik container running on the `traefik_proxy` network
- `/etc/hosts` configured with the dashboard hostname

#### Setup Instructions

1. **Configure `/etc/hosts`** to resolve the dashboard hostname:
   ```bash
   # Add this line to /etc/hosts
   127.0.0.1 dashboard
   ```
   On Linux/macOS, edit with: `sudo nano /etc/hosts`

2. **Create production environment file:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GitHub credentials and desired port
   ```

3. **Start the container:**
   ```bash
   docker compose up -d
   ```

4. **Access the API:**
   - Direct access: `http://localhost:4000/health`
   - Via Traefik: `http://dashboard/health`
   - API Documentation: `http://dashboard/api-docs`

#### Configuration
- The container exposes port 4000 (configurable via `.env` PORT variable)
- Traefik routes all traffic from `http://dashboard/` to the backend
- Data persists in `./data/` volume
- Logs are accessible via: `docker compose logs -f dashboard_backend`

#### Useful Commands
```bash
# View logs
docker compose logs -f dashboard_backend

# Stop containers
docker compose down

# Rebuild after code changes
docker compose up -d --build

# Remove volumes (clears database)
docker compose down -v
```

### Manual Deployment
```bash
# Production build
NODE_ENV=production npm start
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for new functionality
4. Commit changes (`git commit -m 'feat: add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

## License

MIT License - see LICENSE file for details.

---

**Next Phase:** Google OAuth 2.0 integration for Tasks and Calendar APIs.