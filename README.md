# Personal Dashboard

A full-stack personal dashboard application with a Node.js backend and React frontend.

## Project Structure

```
personal-dashboard/
├── docker-compose.yml       # Orchestration for backend and frontend containers
├── .gitignore              # Git ignore rules
├── backend/                # Backend API service (Node.js + Express)
│   ├── Dockerfile
│   ├── package.json
│   ├── index.js
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── db/
│   └── tests/
├── frontend/               # Frontend web app (React + Vite)
│   ├── Dockerfile          # (to be created)
│   ├── package.json
│   └── src/
└── docs/                   # Project documentation
    ├── README.md           # Detailed documentation
    ├── WARP.md             # AI assistant guidelines
    ├── API.md              # API documentation
    └── ...
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)

### Running with Docker

```bash
docker-compose up
```

The backend will be available at `http://localhost:4000` (or via Traefik at `dashboard.localhost`).

### Local Development

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Documentation

See the `docs/` directory for detailed documentation:
- [Full Project Documentation](docs/README.md)
- [API Documentation](docs/API.md)
- [Docker Setup](docs/DOCKER.md)

## License

Private project.
