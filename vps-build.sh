#!/bin/bash

# VPS Build Script for BKeep Frontend
# This script helps build and deploy on the VPS server
# Usage: ./vps-build.sh [build|deploy|push|update|logs|status|stop|start|restart]

set -e

ACTION=${1:-build}
VPS_IP="150.241.247.80"
VPS_DOMAIN="finanza.ca"
IMAGE_NAME="bkeep-frontend:latest"
CONTAINER_NAME="bkeep-frontend"
DOCKER_USERNAME=${DOCKERHUB_USERNAME:-"mayankpanchal0001"}
DOCKERHUB_PASSWORD=${DOCKERHUB_PASSWORD:-"BkeepWork"}

# Build configuration
VITE_API_ENDPOINT=${VITE_API_ENDPOINT:-"http://$VPS_DOMAIN:4000/api/v1"}
VITE_ENVIRONMENT=${VITE_ENVIRONMENT:-"production"}
VITE_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "local")

echo "BKeep Frontend - VPS Build Script"
echo "=================================="
echo ""
echo "Action: $ACTION"
echo "VPS IP: $VPS_IP"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    echo "Please start Docker and try again"
    exit 1
fi

# Pre-build check function
pre_build_check() {
    echo "Running pre-build checks..."

    REQUIRED_FILES=(
        "Dockerfile"
        "package.json"
        "package-lock.json"
        "vite.config.ts"
        "tsconfig.json"
        "index.html"
        "docker/nginx.conf"
    )

    MISSING_FILES=()

    for file in "${REQUIRED_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            MISSING_FILES+=("$file")
        fi
    done

    if [ ${#MISSING_FILES[@]} -gt 0 ]; then
        echo "Error: Missing required files:"
        for file in "${MISSING_FILES[@]}"; do
            echo "   - $file"
        done
        exit 1
    fi

    echo "All required files present"
    echo ""
}

# Setup buildx function
setup_buildx() {
    echo "Setting up Docker buildx..."
    if ! docker buildx ls | grep -q "multiarch"; then
        docker buildx create --name multiarch --use 2>/dev/null || true
        docker buildx use multiarch 2>/dev/null || true
        docker buildx inspect --bootstrap 2>/dev/null || true
    else
        docker buildx use multiarch 2>/dev/null || docker buildx use default
    fi
    echo "Buildx ready"
    echo ""
}

case $ACTION in
    build)
        echo "Building Docker image..."
        echo ""

        pre_build_check

        echo "Build Configuration:"
        echo "  API Endpoint: $VITE_API_ENDPOINT"
        echo "  Environment:  $VITE_ENVIRONMENT"
        echo "  Build Date:   $VITE_BUILD_DATE"
        echo "  Git Commit:   $GIT_COMMIT"
        echo ""

        setup_buildx

        echo "Building image: $IMAGE_NAME"
        docker buildx build \
            --platform linux/amd64 \
            --build-arg VITE_API_ENDPOINT="$VITE_API_ENDPOINT" \
            --build-arg VITE_ENVIRONMENT="$VITE_ENVIRONMENT" \
            --build-arg VITE_BUILD_DATE="$VITE_BUILD_DATE" \
            --build-arg VITE_GIT_COMMIT="$GIT_COMMIT" \
            -t $IMAGE_NAME \
            -t bkeep-frontend:$GIT_COMMIT \
            --load \
            .

        echo ""
        echo "Build completed successfully!"
        echo ""
        echo "Image details:"
        docker images bkeep-frontend
        echo ""
        echo "Next steps:"
        echo "   Run: ./vps-build.sh deploy    (local docker-compose)"
        echo "   Or:  ./vps-build.sh push      (push to Docker Hub)"
        ;;

    deploy)
        echo "Deploying with docker-compose..."
        echo ""

        # Check if image exists, build if not
        if ! docker image inspect $IMAGE_NAME > /dev/null 2>&1; then
            echo "Image not found. Building first..."
            ./vps-build.sh build
        fi

        docker-compose up -d

        echo ""
        echo "Container deployed successfully!"
        echo ""
        echo "Container status:"
        docker-compose ps
        echo ""
        echo "View logs: docker-compose logs -f"
        echo "Access at: http://localhost"
        ;;

    push)
        echo "Building and pushing to Docker Hub..."
        echo ""

        pre_build_check
        setup_buildx

        REMOTE_IMAGE="$DOCKER_USERNAME/bkeep-frontend"

        echo "Build Configuration:"
        echo "  Docker Hub:   $DOCKER_USERNAME"
        echo "  API Endpoint: $VITE_API_ENDPOINT"
        echo "  Environment:  $VITE_ENVIRONMENT"
        echo "  Build Date:   $VITE_BUILD_DATE"
        echo "  Git Commit:   $GIT_COMMIT"
        echo ""

        # Login to Docker Hub
        echo "Logging in to Docker Hub..."
        if [ -n "$DOCKERHUB_PASSWORD" ]; then
            echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
        else
            docker login -u "$DOCKER_USERNAME"
        fi
        echo ""

        # Build and push
        echo "Building and pushing for linux/amd64..."
        docker buildx build --no-cache \
            --platform linux/amd64 \
            --build-arg VITE_API_ENDPOINT="$VITE_API_ENDPOINT" \
            --build-arg VITE_ENVIRONMENT="$VITE_ENVIRONMENT" \
            --build-arg VITE_BUILD_DATE="$VITE_BUILD_DATE" \
            --build-arg VITE_GIT_COMMIT="$GIT_COMMIT" \
            --tag $REMOTE_IMAGE:latest \
            --tag $REMOTE_IMAGE:$GIT_COMMIT \
            --push \
            .

        echo ""
        echo "Push completed successfully!"
        echo ""
        echo "Image: $REMOTE_IMAGE:latest"
        echo "Image: $REMOTE_IMAGE:$GIT_COMMIT"
        echo ""
        echo "Deploy on server:"
        echo "   ./vps-build.sh update"
        echo "   or manually:"
        echo "   docker pull $REMOTE_IMAGE:latest"
        echo "   docker run -d --name $CONTAINER_NAME -p 80:80 --restart unless-stopped $REMOTE_IMAGE:latest"
        ;;

    update)
        echo "Updating application on server..."
        echo ""

        REMOTE_IMAGE="$DOCKER_USERNAME/bkeep-frontend"
        IMAGE_TAG=${2:-"latest"}

        echo "Pulling $REMOTE_IMAGE:$IMAGE_TAG..."
        docker pull $REMOTE_IMAGE:$IMAGE_TAG

        # Stop and remove existing container
        echo ""
        echo "Stopping existing container..."
        docker stop $CONTAINER_NAME 2>/dev/null || true
        docker rm $CONTAINER_NAME 2>/dev/null || true

        # Run new container
        echo ""
        echo "Starting new container..."
        docker run -d \
            --name $CONTAINER_NAME \
            -p 80:80 \
            --restart unless-stopped \
            $REMOTE_IMAGE:$IMAGE_TAG

        echo ""
        echo "Update completed!"
        echo ""

        # Verify
        sleep 2
        echo "Container status:"
        docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

        # Health check
        echo ""
        if curl -f http://localhost/health > /dev/null 2>&1; then
            echo "Health check: OK"
        else
            echo "Health check: Pending (container starting)"
        fi

        echo ""
        echo "Access at: http://$VPS_IP"
        ;;

    logs)
        echo "Container logs:"
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker logs -f $CONTAINER_NAME
        else
            docker-compose logs -f
        fi
        ;;

    status)
        echo "Container status:"
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            echo ""
            echo "Resource usage:"
            docker stats --no-stream $CONTAINER_NAME 2>/dev/null || echo "Container not running"
        else
            docker-compose ps
        fi
        ;;

    stop)
        echo "Stopping container..."
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker stop $CONTAINER_NAME
        else
            docker-compose stop
        fi
        echo "Container stopped"
        ;;

    start)
        echo "Starting container..."
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker start $CONTAINER_NAME
        else
            docker-compose start
        fi
        echo "Container started"
        ;;

    restart)
        echo "Restarting container..."
        if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
            docker restart $CONTAINER_NAME
        else
            docker-compose restart
        fi
        echo "Container restarted"
        ;;

    *)
        echo "Usage: ./vps-build.sh [build|deploy|push|update|logs|status|stop|start|restart]"
        echo ""
        echo "Commands:"
        echo "  build   - Build Docker image locally (linux/amd64)"
        echo "  deploy  - Deploy locally using docker-compose"
        echo "  push    - Build and push to Docker Hub (for server deployment)"
        echo "  update  - Pull latest from Docker Hub and deploy (run on server)"
        echo "  logs    - View container logs"
        echo "  status  - Show container status and resource usage"
        echo "  stop    - Stop the container"
        echo "  start   - Start the container"
        echo "  restart - Restart the container"
        echo ""
        echo "Environment variables:"
        echo "  DOCKERHUB_USERNAME  - Docker Hub username (default: mayankpanchal0001)"
        echo "  DOCKERHUB_PASSWORD  - Docker Hub password/token (for non-interactive push)"
        echo "  VITE_API_ENDPOINT   - API endpoint (default: http://finanza.ca:4000/api/v1)"
        echo "  VITE_ENVIRONMENT    - Environment (default: production)"
        echo ""
        echo "Examples:"
        echo "  ./vps-build.sh build                    # Build image locally"
        echo "  ./vps-build.sh push                     # Build and push to Docker Hub"
        echo "  ./vps-build.sh update                   # Pull and deploy on server"
        echo "  DOCKERHUB_USERNAME=user ./vps-build.sh push  # Push with specific username"
        exit 1
        ;;
esac

echo ""
