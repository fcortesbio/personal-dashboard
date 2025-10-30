# Docker Deployment Guide

This guide covers building and running the Personal Dashboard API in Docker.

## Quick Start (Development)

### Prerequisites
- Docker and Docker Compose installed
- `.env` file (optional, for GitHub features)

### Build and Run

```bash
# Build the image
docker build -t personal-dashboard:latest .

# Run with docker-compose (dev setup - no Traefik)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Test the API
curl http://localhost:3000/health
curl http://localhost:3000/api-docs

# Stop the container
docker-compose -f docker-compose.dev.yml down
```

## Manual Docker Run

```bash
# Build image
docker build -t personal-dashboard:latest .

# Run container
docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  -e GITHUB_TOKEN=your_token_here \
  -e GITHUB_USERNAME=your_username \
  --name dashboard_backend \
  personal-dashboard:latest

# View logs
docker logs -f dashboard_backend

# Stop container
docker stop dashboard_backend
docker rm dashboard_backend
```

## Production Deployment (with Traefik)

### Prerequisites
- External Traefik network created: `traefik_proxy`
- `.env` file with environment variables

### Setup

```bash
# Ensure Traefik network exists
docker network create traefik_proxy

# Deploy with production compose file
docker-compose up -d

# Verify
docker-compose logs -f backend
```

### Access Points
- **API**: `http://dashboard.localhost/api/*`
- **Docs**: `http://dashboard.localhost/api/api-docs`

## Docker Image Details

### Multi-Stage Build
The Dockerfile uses a **multi-stage build** for optimization:

1. **Builder Stage** (`node:25-alpine`)
   - Installs build tools (python3, make, g++)
   - Installs dependencies (compiles native modules like better-sqlite3)
   - Copies application code

2. **Final Stage** (`node:25-alpine`)
   - Copies only compiled `node_modules` and code
   - Creates data directory
   - Removes build tools (smaller image size)

### Image Size
- Builder stage: ~600MB (discarded)
- Final image: ~150MB

## Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# GitHub API (optional)
GITHUB_TOKEN=ghp_xxxxx
GITHUB_USERNAME=fcortesbio
```

## Volumes

**Data Directory** (`./data:/app/data`)
- Persists SQLite database
- Ensures data survives container restarts
- Mounted at `/app/data` in container

## Health Check

Container includes a health check that verifies:
- Endpoint: `GET /health`
- Interval: 10 seconds
- Timeout: 5 seconds
- Retries: 3

View health status:
```bash
docker ps # Check STATUS column
docker inspect dashboard_backend_dev --format='{{.State.Health.Status}}'
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker logs dashboard_backend

# Verify image was built
docker images | grep personal-dashboard
```

### Port 3000 already in use
```bash
# Find process using port
lsof -i :3000

# Or change port in docker-compose.dev.yml
ports:
  - "3001:3000"  # Maps host:3000 to container:3001
```

### Database permission errors
```bash
# Ensure data directory is writable
chmod 755 ./data

# Or change ownership if needed
chown -R $USER:$USER ./data
```

### Network errors (Traefik)
```bash
# Verify traefik_proxy network exists
docker network ls | grep traefik_proxy

# If not, create it
docker network create traefik_proxy
```

## Cleaning Up

```bash
# Remove container
docker stop dashboard_backend
docker rm dashboard_backend

# Remove image
docker rmi personal-dashboard:latest

# Remove all (CAUTION - deletes volumes too)
docker-compose down -v
```

## Best Practices

1. **Use `.env` file** - Store secrets securely, don't commit to git
2. **Mount data volume** - Prevents data loss on container restart
3. **Health checks** - Monitor container status in production
4. **Resource limits** - Add memory/CPU limits for stability

Example with resource limits:
```yaml
services:
  backend:
    build: .
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## File Structure

```
├── Dockerfile              # Multi-stage build configuration
├── docker-compose.yml      # Production (with Traefik)
├── docker-compose.dev.yml  # Development (local testing)
├── .dockerignore           # Files excluded from build
└── docs/DOCKER.md         # This file
```

---

**Next:** See [README.md](../README.md) for full project documentation.
