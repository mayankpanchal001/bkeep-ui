# Docker Setup Guide

This guide explains how to build and run the BKeep Accounting Frontend using Docker.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

### Build and Run

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

### Build Only

```bash
# Build the image
docker-compose build

# Build without cache (clean build)
docker-compose build --no-cache
```

## Configuration

### Environment Variables

The following environment variables can be set before building:

| Variable            | Default                           | Description                           |
| ------------------- | --------------------------------- | ------------------------------------- |
| `VITE_API_ENDPOINT` | `http://72.62.161.70:4000/api/v1` | API endpoint URL                      |
| `VITE_ENVIRONMENT`  | `production`                      | Environment type                      |
| `VITE_BUILD_DATE`   | (empty)                           | Build date (optional)                 |
| `VITE_GIT_COMMIT`   | `local`                           | Git commit hash (optional)            |
| `PORT`              | `80`                              | Host port to map to container port 80 |

### Examples

#### Custom API Endpoint

```bash
VITE_API_ENDPOINT=http://your-api-server.com/api/v1 docker-compose build
docker-compose up -d
```

#### Custom Port

```bash
PORT=3000 docker-compose up -d
```

#### Full Custom Build

```bash
VITE_API_ENDPOINT=http://72.62.161.70:4000/api/v1 \
VITE_ENVIRONMENT=production \
VITE_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
VITE_GIT_COMMIT=$(git rev-parse --short HEAD) \
PORT=8080 \
docker-compose build

docker-compose up -d
```

## Docker Commands

### View Running Container

```bash
docker ps
```

### View Container Logs

```bash
# Follow logs
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 frontend
```

### Execute Commands in Container

```bash
# Access shell
docker exec -it bkeep-frontend sh

# Check nginx status
docker exec bkeep-frontend nginx -t
```

### Restart Container

```bash
docker-compose restart frontend
```

### Remove Container and Image

```bash
# Stop and remove container
docker-compose down

# Remove container, image, and volumes
docker-compose down -v --rmi all
```

## Health Check

The container includes a health check endpoint at `/health`. You can verify it's working:

```bash
# From host
curl http://localhost/health

# From container
docker exec bkeep-frontend wget -qO- http://localhost/health
```

## Troubleshooting

### Build Fails

1. **Clear Docker cache:**

    ```bash
    docker-compose build --no-cache
    ```

2. **Check disk space:**
    ```bash
    docker system df
    docker system prune -a
    ```

### Container Won't Start

1. **Check logs:**

    ```bash
    docker-compose logs frontend
    ```

2. **Verify port is available:**
    ```bash
    # Check if port 80 is in use
    lsof -i :80
    # Or use a different port
    PORT=3000 docker-compose up -d
    ```

### API Calls Failing

1. **Verify API endpoint is correct:**
    - Check the built JavaScript bundle:

    ```bash
    docker exec bkeep-frontend cat /usr/share/nginx/html/assets/*.js | grep -i "api" | head -5
    ```

2. **Rebuild with correct endpoint:**
    ```bash
    VITE_API_ENDPOINT=http://72.62.161.70:4000/api/v1 docker-compose build --no-cache
    docker-compose up -d
    ```

## Production Deployment

### Best Practices

1. **Use specific image tags instead of `latest`:**

    ```yaml
    image: bkeep-frontend:v1.0.0
    ```

2. **Set resource limits** (uncomment in docker-compose.yml)

3. **Use secrets management** for sensitive environment variables

4. **Enable HTTPS** by adding an nginx reverse proxy with SSL certificates

5. **Set up monitoring** and logging aggregation

### CI/CD Integration

The Docker setup is compatible with CI/CD pipelines. Example GitHub Actions:

```yaml
- name: Build Docker image
  run: |
      docker-compose build
      docker-compose up -d
```

## Image Size Optimization

The multi-stage build creates an optimized image:

- **Dependencies stage**: ~500MB (not included in final image)
- **Builder stage**: ~1GB (not included in final image)
- **Production stage**: ~50MB (final image with nginx + built assets)

Total final image size: ~50-100MB

## Architecture

The Dockerfile uses a multi-stage build:

1. **deps**: Installs npm dependencies
2. **builder**: Builds the React application with Vite
3. **production**: Serves the built static files with nginx

This approach ensures:

- Smaller final image (only nginx + static files)
- Faster builds (dependency layer caching)
- Better security (no build tools in production image)
