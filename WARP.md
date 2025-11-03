# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Backend Development
All commands run from `backend/` directory:

- **`npm run dev`** - Start development server with auto-reload (uses `.env.dev`). Dev server normally runs on port 4001; falling back to 3000 indicates env data is not being loaded.
- **`npm run dev:watch`** - Alternative: watch specific files for changes during development.
- **`npm start`** - Start production server (uses environment variables, no auto-reload).
- **`npm run lint`** - Run ESLint with auto-fix enabled.

### Backend Testing
All commands run from `backend/` directory:

- **`npm test`** - Run all test suites (courses, bookmarks, GitHub). Uses in-memory SQLite databases to isolate tests.
- **`NODE_ENV=test node tests/courses.test.js`** - Run individual course tests.
- **`NODE_ENV=test node tests/bookmarks.test.js`** - Run individual bookmark tests.
- **`node tests/github.test.js`** - Run GitHub API tests (doesn't require NODE_ENV=test).

**Important rule**: Assume ports 4000 and 4001 are always busy. If you need to initialize a new server instance (e.g., for testing changes), start the server manually on port 3500.

### Frontend Development
All commands run from `frontend/` directory:

- **`npm run dev`** - Start Vite development server with hot module replacement.
- **`npm run build`** - Build production bundle.
- **`npm run preview`** - Preview production build locally.
- **`npm run lint`** - Run ESLint checks.

### Docker
Run from project root:

- **`docker compose up -d`** - Start containerized deployment with Traefik integration.
- **`docker compose logs -f dashboard_backend`** - View backend logs.
- **`docker compose logs -f dashboard_frontend`** - View frontend logs.
- **`docker compose down`** - Stop containers.
- **`docker compose up -d --build`** - Rebuild and restart after code changes.

## Architecture Overview

### Stack
- **Backend:** Express.js (Node.js ES modules)
- **Frontend:** React 19 + Vite (using rolldown-vite for faster builds)
- **Styling:** Tailwind CSS 4.x
- **Database:** SQLite with WAL mode (better-sqlite3)
- **Authentication:** Google OAuth 2.0 with automatic token refresh
- **External APIs:** Google Calendar, Google Tasks, GitHub
- **API Documentation:** Swagger/OpenAPI (auto-generated from JSDoc)
- **Deployment:** Docker + Traefik reverse proxy

### High-Level Structure

**Backend** (`backend/`) follows a **Controller-Route-Middleware** pattern:

1. **Routes Layer** (`routes/`) - Express route definitions with JSDoc comments for OpenAPI generation
2. **Controllers Layer** (`controllers/`) - Business logic and external API calls
3. **Middleware Layer** (`middleware/`) - Authentication enforcement for protected endpoints
4. **Database Layer** (`db/`) - SQLite initialization and schema setup
5. **Main Entry** (`index.js`) - Express app configuration, middleware setup, route mounting

**Frontend** (`frontend/src/`) follows a **React Context + Custom Hooks** pattern:

1. **API Layer** (`api/client.js`) - Centralized HTTP client with credentials management
2. **Context Layer** (`contexts/`) - Global state management (e.g., AuthContext for authentication)
3. **Hooks Layer** (`hooks/`) - Custom hooks for data fetching (useCourses, useTasks, useCalendar, etc.)
4. **Components Layer** (`components/`) - Reusable UI components organized by feature (Tasks, Calendar, Layout)
5. **Pages Layer** (`pages/`) - Top-level views (Dashboard)
6. **Main Entry** (`main.jsx`) - React app initialization and provider wrapping

### Key Architectural Components

#### Authentication Flow
**Backend OAuth Flow:**
- User calls `GET /auth/google/login` → redirects to Google OAuth consent screen
- Google redirects back to `GET /auth/google/callback` with authorization code
- Callback handler exchanges code for tokens, stores in SQLite's `auth_tokens` table
- Protected routes (`/calendar`, `/tasks`) use middleware to check `isAuthenticated()` before processing
- Tokens auto-refresh 5 minutes before expiration via controller logic

**Frontend Auth Flow:**
- `AuthContext` provides global authentication state (user, isAuthenticated, isLoading)
- On mount, `AuthContext` calls `/auth/status` to check authentication
- Unauthenticated users see login prompt linking to `/auth/google/login`
- `apiClient` includes `credentials: 'include'` for session cookie management
- Custom hooks (`useAuth`) expose auth state and logout functionality to components

#### Multi-API Integration Pattern
Each external API (GitHub, Google Calendar, Google Tasks) follows a consistent **Backend → Frontend** pattern:

**Backend Layer:**
- **Route file** (`routes/`) defines HTTP endpoints with validation
- **Controller file** (`controllers/`) handles actual API call logic
- **Error handling** includes specific error messages and fallbacks
- **Middleware** (`middleware/auth.js`) protects sensitive endpoints requiring authentication

**Frontend Layer:**
- **Custom hook** (`hooks/`) manages data fetching, state, and mutations (e.g., `useTasks`, `useCalendar`)
- **Component** (`components/`) consumes hook and renders UI
- **API client** (`api/client.js`) handles all HTTP requests with automatic error handling

Example: Tasks API
- Backend: `routes/tasks.js` → `controllers/tasks.js` → Google Tasks API
- Frontend: `hooks/useTasks.js` → `api/client.js` → Backend API
- UI: `components/Tasks/TaskList.jsx` uses `useTasks()` hook for display and mutations

#### Database Strategy
- **Production:** Persistent SQLite at `./data/dashboard.db` with WAL journaling
- **Testing:** In-memory databases created per test file (isolated, no data pollution)
- **Schema:** 3 tables - `courses`, `bookmarks`, `auth_tokens`
- Migrations handled by simple `CREATE TABLE IF NOT EXISTS` pattern (no ORM)

### Data Flow Examples

**Scenario 1: Fetch Calendar Events (Full Stack, Authenticated)**
```
User views Dashboard page
  → useCalendar() hook calls apiClient.get('/calendar?days=7')
  → apiClient sends GET /calendar?days=7 (with credentials)
  → Backend: middleware/auth.js checks isAuthenticated()
  → Backend: controllers/auth.js auto-refreshes expired token if needed
  → Backend: controllers/calendar.js calls Google Calendar API
  → Backend: formats events, returns JSON response
  → Frontend: hook updates state, component re-renders with events
```

**Scenario 2: Create Course (Simple CRUD)**
```
User submits course form
  → useCourses() hook calls apiClient.post('/courses', courseData)
  → Backend: routes/courses.js validates input
  → Backend: controllers/courses.js inserts to SQLite
  → Backend: returns 201 with new course ID
  → Frontend: hook adds new course to state, UI updates
```

**Scenario 3: Mark Task Complete (Optimistic Update)**
```
User clicks task checkbox
  → useTasks() hook optimistically updates local state
  → Hook calls apiClient.patch('/tasks/:id', {completed: true})
  → Backend: middleware/auth.js validates authentication
  → Backend: controllers/tasks.js calls Google Tasks API
  → Backend: returns updated task
  → Frontend: confirms update or rolls back on error
```

### Port Configuration
- **Backend Development:** Port 4001 (configurable via `PORT` env var in backend/.env.dev)
- **Frontend Development:** Vite default (typically 5173, configurable via `VITE_PORT`)
- **Backend Production (Docker):** Port 4000 (exposed to host)
- **Frontend Production (Docker):** Port 80 internally, exposed as 3000 to host
- **Traefik Proxy:** Routes `http://dashboard.localhost/` to frontend (port 80) and `http://dashboard.localhost/api` to backend (port 4000)
- **API Base URL:** Frontend uses `VITE_API_URL` env var (defaults to `http://localhost:4001` in dev)
- **Environment files:** Backend uses `.env.dev` for development, `.env` for production/Docker

## Environment Variables

### Backend (`backend/.env.dev` or `backend/.env`)
Required for core functionality:
- `GOOGLE_CLIENT_ID` - From Google Cloud Console
- `GOOGLE_CLIENT_SECRET` - From Google Cloud Console  
- `GOOGLE_REDIRECT_URI` - e.g., `http://localhost:3000/auth/google/callback`

Optional:
- `PORT` - Server port (default: 3000, typically 4001 in dev)
- `ENV` - Set to `development` for dev mode features (default: `production`)
- `NODE_ENV` - Set to `test` for test suites
- `GITHUB_TOKEN` - For private repo access (public repos work without)
- `GITHUB_USERNAME` - GitHub username for fetching repos

### Frontend (`frontend/.env`)
- `VITE_API_URL` - Backend API base URL (default: `http://localhost:4001`)

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