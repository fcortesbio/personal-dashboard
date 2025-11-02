# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- **`npm run dev`** - Start development server with auto-reload (uses `.env.dev`). Dev server will normally runs on port 4001, port falling back to 3000 indicates that the env data is not being loaded or read.
- **`npm run dev:watch`** - Alternative: watch specific files for changes during development.

### Testing
- **`npm test`** - Run all test suites (courses, bookmarks, GitHub). Uses in-memory SQLite databases to isolate tests.
- **`NODE_ENV=test node tests/courses.test.js`** - Run individual course tests.
- **`NODE_ENV=test node tests/bookmarks.test.js`** - Run individual bookmark tests.
- **`node tests/github.test.js`** - Run GitHub API tests (doesn't require NODE_ENV=test).

**Important rule**: Assume port 4000 and 4001 are always busy, if require to initialize a new server instance, e.g., for testing changes, start the server manually with flags on port 3500

### Code Quality
- **`npm run lint`** - Run ESLint with auto-fix enabled.

### Production
- **`npm start`** - Start production server (uses environment variables, no auto-reload).

### Docker
- **`docker compose up -d`** - Start containerized deployment with Traefik integration.
- **`docker compose logs -f dashboard_backend`** - View live logs.
- **`docker compose down`** - Stop containers.
- **`docker compose up -d --build`** - Rebuild and restart after code changes.

## Architecture Overview

### Stack
- **Framework:** Express.js (Node.js ES modules)
- **Database:** SQLite with WAL mode (better-sqlite3)
- **Authentication:** Google OAuth 2.0 with automatic token refresh
- **External APIs:** Google Calendar, Google Tasks, GitHub
- **API Documentation:** Swagger/OpenAPI (auto-generated from JSDoc)
- **Deployment:** Docker + Traefik reverse proxy

### High-Level Structure

The application follows a **Controller-Route-Middleware** pattern:

1. **Routes Layer** (`routes/`) - Express route definitions with JSDoc comments for OpenAPI generation
2. **Controllers Layer** (`controllers/`) - Business logic and external API calls
3. **Middleware Layer** (`middleware/`) - Authentication enforcement for protected endpoints
4. **Database Layer** (`db/`) - SQLite initialization and schema setup
5. **Main Entry** (`index.js`) - Express app configuration, middleware setup, route mounting

### Key Architectural Components

#### Authentication Flow (Phase 2)
- User calls `GET /auth/google/login` → redirects to Google OAuth consent screen
- Google redirects back to `GET /auth/google/callback` with authorization code
- Callback handler exchanges code for tokens, stores in SQLite's `auth_tokens` table
- Protected routes (`/calendar`, `/tasks`) use middleware to check `isAuthenticated()` before processing
- Tokens auto-refresh 5 minutes before expiration via controller logic

#### Multi-API Integration Pattern
Each external API (GitHub, Google Calendar, Google Tasks) follows the same pattern:
- **Route file** defines HTTP endpoints with validation
- **Controller file** handles the actual API call logic
- **Error handling** includes specific error messages and fallbacks
- **Middleware** protects sensitive endpoints requiring authentication

Example: Tasks API
- `routes/tasks.js` - GET, POST, PATCH, DELETE endpoint definitions
- `controllers/tasks.js` - Google Tasks API calls, task creation/update/deletion logic
- `middleware/auth.js` - Ensures user authenticated before executing

#### Database Strategy
- **Production:** Persistent SQLite at `./data/dashboard.db` with WAL journaling
- **Testing:** In-memory databases created per test file (isolated, no data pollution)
- **Schema:** 3 tables - `courses`, `bookmarks`, `auth_tokens`
- Migrations handled by simple `CREATE TABLE IF NOT EXISTS` pattern (no ORM)

### Data Flow Examples

**Scenario 1: Fetch Calendar Events (Authenticated)**
```
GET /calendar?days=7 
  → middleware/auth.js checks isAuthenticated() 
  → controllers/auth.js auto-refreshes expired token if needed 
  → controllers/calendar.js calls Google Calendar API 
  → formats events, returns JSON response
```

**Scenario 2: Create Course (Simple CRUD)**
```
POST /courses (JSON body)
  → routes/courses.js validates input
  → controllers/courses.js inserts to SQLite
  → returns 201 with new course ID
```

### Port Configuration
- Development: Port 4001 (configurable via `PORT` env var)
- Traefik proxy: Routes `http://dashboard.localhost/` traffic to backend on port 4000
- Environment detection: `.env.dev` for development, `.env` for production/Docker

## Environment Variables

Required for core functionality:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console  
- `GOOGLE_REDIRECT_URI` - e.g., `http://localhost:3000/auth/google/callback`

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Set to `test` for tests, `development` for dev server
- `GITHUB_TOKEN` - For private repo access (public repos work without)
- `GITHUB_USERNAME` - GitHub username for fetching repos

Credentials for testing Google APIs are stored in `/.secrets` directory per project rules.

## Testing Patterns

### Test Database Isolation
Each test file creates a fresh in-memory SQLite database:
- `tests/courses.test.js` - 9 CRUD tests with in-memory DB
- `tests/bookmarks.test.js` - 11 CRUD tests with in-memory DB
- `tests/github.test.js` - 8 API integration tests (real GitHub API)

Production database (`./data/dashboard.db`) is never touched during testing.

### Integration Tests
Phase 2 features (OAuth, Calendar, Tasks) are integration tested against actual Google APIs. Credentials required in `.secrets/` or environment.

## Code Style
- ES6 modules with `import/export`
- JSDoc comments on all route handlers for OpenAPI documentation
- Consistent error handling with specific error codes
- ESLint configuration in `eslint.config.js` (no unused variables, recommended JS rules)

## Debugging Tips
- Enable detailed logging: Check `morgan` HTTP request logs in dev mode
- Database inspection: SQLite file at `./data/dashboard.db`, use `sqlite3` CLI or GUI tools
- Token issues: Check `auth_tokens` table timestamps and expiration logic in `controllers/auth.js`
- API failures: Check controller console logs and specific error messages 