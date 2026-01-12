# Docker Setup Guide

This guide explains how to set up automatic Docker builds with GitHub Actions.

## 🚀 Quick Start

### Prerequisites

1. GitHub repository with Actions enabled
2. Docker installed locally (for testing)
3. Server with Docker installed (for deployment)

## 📋 Setup Instructions

### 1. GitHub Secrets Configuration

Go to your repository settings → Secrets and variables → Actions, and add the following secrets:

#### Required for Deployment (Optional)

- `DEPLOY_HOST`: Your server IP or hostname
- `DEPLOY_USER`: SSH username for deployment
- `DEPLOY_SSH_KEY`: Private SSH key for server access
- `DEPLOY_PORT`: SSH port (default: 22)

#### Optional API Endpoints (for different environments)

- `VITE_API_ENDPOINT_PRODUCTION`: Production API endpoint
- `VITE_API_ENDPOINT_STAGING`: Staging API endpoint
- `VITE_API_ENDPOINT_DEVELOPMENT`: Development API endpoint

### 2. How It Works

#### Automatic Builds

The workflow automatically builds Docker images when:

- **Push to main/master**: Builds production image
- **Push to develop**: Builds staging image
- **Push tags (v*.*.\*)**: Builds versioned image
- **Pull requests**: Builds but doesn't push (for testing)
- **Manual trigger**: Builds with selected environment

#### Image Tags

Images are tagged with:

- `latest`: Latest build from main/master
- `main` or `master`: Branch name
- `develop`: Branch name
- `v1.2.3`: Semantic version from tags
- `main-abc1234`: Branch name + commit SHA

### 3. Local Development

#### Build locally:

```bash
docker-compose build
```

#### Run locally:

```bash
docker-compose up -d
```

#### View logs:

```bash
docker-compose logs -f
```

#### Stop:

```bash
docker-compose down
```

### 4. Using Built Images

#### Pull from GitHub Container Registry:

```bash
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

#### Run the container:

```bash
docker run -d \
  --name bkeep-frontend \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

### 5. Environment Variables

The Dockerfile accepts these build arguments:

- `VITE_API_ENDPOINT`: API endpoint URL (default: `http://72.62.161.70:4000/api/v1` for production)
- `VITE_ENVIRONMENT`: Environment (production/staging/development)
- `VITE_BUILD_DATE`: Build timestamp (auto-set)
- `VITE_GIT_COMMIT`: Git commit SHA (auto-set)

**Important:** The API endpoint is baked into the build at build time. Make sure to:

- Set `VITE_API_ENDPOINT` when building for production
- Use the correct endpoint for your environment
- The default production endpoint is `http://72.62.161.70:4000/api/v1`

### 6. Deployment

#### Automatic Deployment

The `docker-deploy.yml` workflow automatically deploys when:

- Build workflow completes successfully on main/master
- Manually triggered with a specific image tag

#### Manual Deployment

1. Pull the image:

```bash
docker pull ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

2. Stop old container:

```bash
docker stop bkeep-frontend
docker rm bkeep-frontend
```

3. Run new container:

```bash
docker run -d \
  --name bkeep-frontend \
  -p 80:80 \
  --restart unless-stopped \
  ghcr.io/YOUR_USERNAME/YOUR_REPO:latest
```

## 🔧 Troubleshooting

### Build fails

- Check GitHub Actions logs
- Verify Dockerfile syntax
- Ensure all dependencies are in package.json

### Image not found

- Check GitHub Container Registry permissions
- Verify image was pushed successfully
- Check image name and tag

### Deployment fails

- Verify SSH credentials
- Check server Docker installation
- Ensure ports are not in use

## 📝 Notes

- Images are stored in GitHub Container Registry (ghcr.io)
- Build cache is used for faster builds
- Health checks are included in the container
- Nginx configuration is optimized for SPA routing
