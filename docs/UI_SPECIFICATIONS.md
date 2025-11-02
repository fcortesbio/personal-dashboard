# Phase 3: Frontend Dashboard UI Specifications

## Overview
Personal Dashboard frontend built with React + Vite + Tailwind CSS. Deployed as part of the same monorepo, serving static files from the Express backend.

## Technology Stack
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** fetch API (or axios)
- **State Management:** React Context API / Zustand (if needed)

## Architecture

### Project Structure
```
personal-dashboard/
├── index.js (backend entry)
├── routes/, controllers/, middleware/ (backend APIs)
├── frontend/                      # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── MainLayout.jsx
│   │   │   ├── Calendar/
│   │   │   │   ├── WeekView.jsx
│   │   │   │   └── EventCard.jsx
│   │   │   ├── Tasks/
│   │   │   │   ├── TaskList.jsx
│   │   │   │   ├── TaskForm.jsx
│   │   │   │   └── TaskItem.jsx
│   │   │   └── Sidebar/
│   │   │       ├── CourseList.jsx
│   │   │       ├── BookmarkList.jsx
│   │   │       └── RepoList.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── LoginRedirect.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useCalendar.js
│   │   │   ├── useTasks.js
│   │   │   ├── useCourses.js
│   │   │   ├── useBookmarks.js
│   │   │   └── useRepos.js
│   │   ├── api/
│   │   │   └── client.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   ├── package.json
│   └── tailwind.config.js
├── docker-compose.yml (updated to serve frontend)
└── package.json (root)
```

### Deployment
- **Development:** Vite dev server on port 5173 (with backend on 4001)
- **Production:** Frontend built to `frontend/dist/`, served as static files from Express backend
- **Docker:** Single image with both backend and frontend

## Layout Design

### Dashboard Layout (3-Column)
```
┌─────────────────────────────────────────────────────────┐
│ Header: "Personal Dashboard" + Auth Status + Logout      │
├────────┬──────────────────────────────────────┬─────────┤
│        │                                      │         │
│ Sidebar│       Main Calendar View             │  Tasks  │
│ 170px  │     (Week grid, highlighted today)   │ 300px   │
│        │                                      │         │
│ - Courses (collapsible)                       │ - Task  │
│ - Bookmarks (collapsible)                     │   List  │
│ - GitHub Repos (collapsible)                  │ - Quick │
│   [Toggle menu]                               │   Create│
│        │                                      │ - Check │
│        │                                      │ - Delete│
│        │                                      │ - Edit  │
│        │                                      │         │
└────────┴──────────────────────────────────────┴─────────┘
```

### Responsive Behavior
- **Desktop (1200px+):** Full 3-column layout
- **Tablet (768px-1199px):** Sidebar collapses to icon-only, tasks drawer toggleable
- **Mobile (<768px):** Stack vertically - Header > Calendar > Tasks > Sidebar sections

## Component Specifications

### Header Component
**Responsibilities:**
- Display dashboard title
- Show current user (email)
- Show authentication status
- Logout button
- Responsive menu toggle for mobile

**Props:**
- `user` - Current authenticated user info
- `onLogout` - Callback for logout action

---

### Sidebar Component
**Responsibilities:**
- Display collapsible sections for Courses, Bookmarks, and Repos
- Toggle sidebar collapse state
- Show item counts
- Search/filter within each section
- Navigate to item details (open in modal or panel)

**State:**
- `isCollapsed` - Boolean for sidebar collapse
- `expandedSections` - Object tracking which sections are open

**Sections:**
1. **Courses**
   - List all courses
   - Show current module
   - Create new course (modal)
   - Click to view/edit details
   
2. **Bookmarks**
   - List all bookmarks with link icons
   - Create new bookmark (modal)
   - Click to open link in new tab
   
3. **GitHub Repos**
   - List recent repos
   - Show language, stars, last updated
   - Click to open repo in new tab
   - Fetch GitHub repos on demand

---

### Main Calendar Component (WeekView)
**Responsibilities:**
- Display current week (Monday-Sunday)
- Show day names and dates
- Highlight today's date
- Display events in time grid format
- Handle event navigation (previous/next week)
- Create new event button

**Features:**
- Time slots: 6 AM to 10 PM (16-hour day)
- Event cards show summary and time
- Click event to view/edit details
- Drag-and-drop event creation (optional Phase 3.1)
- Color coding for different calendar types (if multi-calendar support)

**State:**
- `currentWeek` - Start date of displayed week
- `events` - Array of events for the week
- `selectedEvent` - Currently selected/focused event

**Props:**
- `events` - Array of calendar events from backend
- `onEventClick` - Callback for event selection
- `onCreateEvent` - Callback for new event button
- `onWeekChange` - Callback for navigation

---

### Tasks Component
**Responsibilities:**
- Display task list sorted by status (incomplete first, then completed)
- Show task title, notes preview, due date
- Quick actions: check/uncheck, delete, edit
- Create new task form (inline or modal)
- Task status indicator

**Sections:**
1. **Active Tasks** (uncompleted, sorted by creation date)
   - Checkbox to mark complete
   - Delete button
   - Edit button (opens modal)
   - Click to expand full task details

2. **Completed Tasks** (collapsed section, expandable)
   - Grayed out styling
   - Undo button (mark incomplete)

**State:**
- `tasks` - Array of all tasks
- `filter` - 'all', 'active', or 'completed'
- `selectedTask` - Task being edited

---

### Modal/Dialog Components (Reusable)
**Create/Edit Forms:**
1. **Event Modal** - Calendar event creation/editing
   - Title, description, date/time, location
   - Save/Cancel buttons

2. **Task Modal** - Task creation/editing
   - Title, notes, due date (optional)
   - Save/Cancel buttons

3. **Course Modal** - Course creation/editing
   - Name, current module, link
   - Save/Cancel buttons

4. **Bookmark Modal** - Bookmark creation/editing
   - Name, link
   - Save/Cancel buttons

## Authentication Flow

### Initial Load
```
App.jsx loads
  ↓
useAuth() hook runs
  ↓
Call GET /auth/status
  ├─ If authenticated → Store user, proceed to Dashboard
  └─ If not authenticated → Redirect to /auth/google/login
      ↓
      User sees Google OAuth consent screen
      ↓
      Google redirects to /auth/google/callback
      ↓
      Backend stores token in SQLite
      ↓
      Redirect to /dashboard
      ↓
      useAuth() detects authenticated state
      ↓
      Dashboard renders
```

### Session Management
- Check auth status on app load
- Store auth state in Context/SessionStorage
- Attach auth cookies/tokens to all API requests (fetch credentials: 'include')
- Logout clears session and redirects to login

---

## Data Integration with Backend

### API Endpoints Used
**Authentication:**
- `GET /auth/status` - Check current session
- `GET /auth/google/login` - Initiate OAuth flow
- `GET /auth/google/callback` - OAuth redirect handler

**Calendar:**
- `GET /calendar?days=7` - Fetch events for next 7 days
- Can extend to fetch different ranges: 14, 30 days

**Tasks:**
- `GET /tasks` - List all tasks
- `POST /tasks` - Create new task (title, notes)
- `PATCH /tasks/:id` - Update task (mark complete/incomplete)
- `DELETE /tasks/:id` - Delete task

**Courses:**
- `GET /courses` - List all courses
- `POST /courses` - Create course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

**Bookmarks:**
- `GET /bookmarks` - List all bookmarks
- `POST /bookmarks` - Create bookmark
- `PUT /bookmarks/:id` - Update bookmark
- `DELETE /bookmarks/:id` - Delete bookmark

**GitHub:**
- `GET /github?username=fcortesbio&limit=5` - Fetch recent repos

---

## Hooks Architecture

### useAuth()
Manages authentication state and OAuth flow.

```javascript
const { user, isAuthenticated, isLoading, logout } = useAuth();
```

**Responsibilities:**
- Check `/auth/status` on mount
- Handle OAuth redirect/callback
- Store user info in context
- Provide logout function
- Expose loading state for spinners

---

### useCalendar()
Manages calendar events and navigation.

```javascript
const { 
  events, 
  currentWeek, 
  nextWeek, 
  prevWeek, 
  isLoading, 
  error 
} = useCalendar(days = 7);
```

---

### useTasks()
Manages task CRUD operations.

```javascript
const { 
  tasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  isLoading, 
  error 
} = useTasks();
```

---

### useCourses()
Manages course CRUD operations.

```javascript
const { 
  courses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  isLoading, 
  error 
} = useCourses();
```

---

### useBookmarks()
Manages bookmark CRUD operations.

```javascript
const { 
  bookmarks, 
  createBookmark, 
  updateBookmark, 
  deleteBookmark, 
  isLoading, 
  error 
} = useBookmarks();
```

---

### useRepos()
Manages GitHub repository fetching.

```javascript
const { 
  repos, 
  fetchRepos, 
  isLoading, 
  error 
} = useRepos(username, limit = 5);
```

---

## API Client (client.js)

### Purpose
Centralized HTTP client with:
- Base URL configuration
- Request/response interceptors
- Error handling
- Token management (credentials included)

```javascript
// Example usage
const response = await apiClient.get('/tasks');
const newTask = await apiClient.post('/tasks', { title: 'New Task' });
```

---

## Styling Strategy

### Tailwind CSS Utilities
- **Colors:** Use Tailwind palette with custom theme for accent colors
- **Layout:** Flexbox/Grid for responsive design
- **Components:** Pre-built component patterns (cards, buttons, modals)
- **Dark Mode:** Support togglable dark mode (optional Phase 3.1)

### Component Styling
- Use Tailwind classes directly in JSX
- Extract reusable component patterns to separate files
- Consistent spacing, typography, and colors across components

---

## State Management Strategy

### Context API (Recommended for MVP)
- `AuthContext` - User authentication state
- `CalendarContext` - Events and calendar state
- `TasksContext` - Tasks list and operations
- `UIContext` - UI state (modals, sidebar collapse, etc.)

### Consider Zustand if:
- State logic becomes complex
- Need middleware for actions
- Multiple components deeply consume same state

---

## File Structure by Feature

### auth/
- `useAuth.js` - Hook for auth state
- `AuthContext.jsx` - Auth context provider
- `authClient.js` - Auth API calls

### calendar/
- `useCalendar.js` - Calendar hook
- `CalendarContext.jsx` - Calendar context
- `calendarClient.js` - Calendar API calls

### tasks/
- `useTasks.js` - Tasks hook
- `TasksContext.jsx` - Tasks context
- `tasksClient.js` - Tasks API calls

*(Similar structure for courses, bookmarks, repos)*

---

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend (from frontend/ directory)
npm run dev
```

Both run concurrently with Vite dev server proxy handling API calls.

### Build for Production
```bash
# From frontend/
npm run build

# Output to frontend/dist/
# Backend serves these static files in production
```

---

## Testing Strategy (Optional Phase 3.1)

### Unit Tests
- Component logic with React Testing Library
- Hook testing with `@testing-library/react-hooks`

### Integration Tests
- Full user workflows (auth → view calendar → create task)

### E2E Tests (Optional)
- Cypress or Playwright for full flow testing

---

## Performance Considerations

- **Code Splitting:** Lazy load modals and heavy components
- **Image Optimization:** Compress any images/icons
- **API Caching:** Cache calendar/tasks data with stale-while-revalidate
- **Bundle Size:** Monitor Vite build output, keep under 200KB
- **Accessibility:** Semantic HTML, ARIA labels, keyboard navigation

---

## Milestones

### Phase 3.0 - MVP
1. ✅ Vite + React scaffold
2. ✅ Layout components (Header, Sidebar, MainLayout)
3. ✅ Authentication (useAuth hook, OAuth flow)
4. ✅ Calendar WeekView with events
5. ✅ Tasks list with CRUD operations
6. ✅ Sidebar sections (Courses, Bookmarks, Repos)
7. ✅ Modal forms for creating/editing items
8. ✅ Responsive design (mobile, tablet, desktop)

### Phase 3.1 - Polish & Features
- Dark mode toggle
- Event drag-and-drop (calendar)
- Task filtering/search
- Course/Bookmark management from UI
- Better error handling and loading states
- Toast notifications for actions

### Phase 3.2 - Advanced
- Multi-calendar support
- Task due date reminders
- Calendar event recurrence
- Bookmarks tagging/organization
- Export calendar/tasks to ICS

---

## Notes

- Keep components small and focused (single responsibility)
- Use TypeScript JSDoc for better IDE support (optional)
- Test auth flow thoroughly (OAuth redirect timing)
- Plan for CORS headers if frontend deployed separately later
- Monitor network requests in DevTools during development
