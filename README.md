# Personal Localhost Dashboard

This project is a personal, self-hosted dashboard application designed to bring all my key productivity tools into one place. It runs locally using Docker and Traefik, with a custom backend (Express.js) and frontend.

## Minimum Viable Product (MVP)

The V1 of this dashboard will be a single-page application featuring the following "smart widgets":

* **Pending Tasks (High-Priority):** A highly conspicuous list of all pending tasks from my Google Tasks.
* **Quick-Add Task:** A text input to instantly add a new task to my Google Tasks.
* **Weekly Calendar:** An overview of my Google Calendar events for the upcoming week.
* **GitHub Projects:** A dynamic list of my 5-10 most recently updated GitHub repositories, plus a static link to my profile.
* **My Courses (Manual Tracker):** A custom-built tracker for my online courses (e.g., Coursera) where I can manually save and update the course name, current module, and a direct link to the module.
* **Quick Links:** A static, editable list of my most-used bookmarks (e.g., Medium, etc.).

## Architectural Stack

* **Reverse Proxy:** Traefik (running as a central "gatekeeper" container).
* **Backend:** Node.js / Express.js (running in a Docker container).
* **Database:** SQLite (for storing course/link data and Google `refresh_tokens`).
* **Frontend:** (To be determined: React/Vue/etc.)

---

## Development Plan

The project is broken down into three main phases to manage complexity.

### Phase 1: The "Internal & Simple Auth" Backend

The goal of this phase is to build the core backend and get all non-Google widgets functional. This provides a fast path to a usable product.

* **Database:** Initialize the SQLite database and connect it to the Express app. Store the DB file in a persistent Docker volume.
* **"My Courses" API:** Build the full `POST`, `GET`, `PUT`, and `DELETE` (CRUD) endpoints for managing the `courses` table in the database.
* **"Quick Links" API:** Build the CRUD endpoints for managing the `links` table.
* **GitHub API:** Build a single `GET /api/github/repos` endpoint that reads a Personal Access Token from an environment variable and fetches the latest repositories from the GitHub API.

**Result:** A working backend with 3/5 widgets fully functional. The frontend can be built against these endpoints.

### Phase 2: The Google OAuth 2.0 Flow

This phase is the main technical hurdle: securely authenticating with Google.

* **Google Cloud Project:** Configure a new project in the Google API Console.
* **Enable APIs:** Turn on the **Google Calendar API** and **Google Tasks API**.
* **Configure OAuth Screen:** Set up the OAuth 2.0 consent screen and create `Client ID` and `Client Secret` credentials.
* **Build Auth Endpoints:**
    * `GET /api/auth/google`: Redirects the user to Google's login page.
    * `GET /api/auth/google/callback`: The endpoint Google redirects to after login. This endpoint will exchange the received `code` for a `refresh_token`.
* **Token Storage:** Securely store the `refresh_token` in the SQLite database.

**Result:** The backend is now fully authorized to make API calls to Google on my behalf.

### Phase 3: The Google Widgets

With authentication complete, this phase involves building the final API endpoints for the remaining widgets.

* **"Pending Tasks" Endpoint:**
    * `GET /api/tasks`: Fetches and returns all pending tasks from the Google Tasks API.
* **"Quick-Add Task" Endpoint:**
    * `POST /api/tasks`: Takes a `{"title": "..."}` JSON body and creates a new task in Google Tasks.
* **"Weekly Calendar" Endpoint:**
    * `GET /api/calendar/events`: Fetches and returns all calendar events for the next 7 days.

**Result:** The backend is 100% complete and all features of the MVP are fully supported.
