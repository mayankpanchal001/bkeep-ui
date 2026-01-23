# Multi-stage Dockerfile for BKeep Accounting Frontend
# Optimized for production with minimal image size

# Stage 1: Dependencies - Install npm packages
FROM node:20-alpine AS deps

# Add build tools required by some npm packages
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci && \
    npm cache clean --force

# Stage 2: Builder - Build the application
FROM node:20-alpine AS builder

# Add build tools
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy all source files (excluding items in .dockerignore)
COPY . .

# Build arguments for environment variables
ARG VITE_API_ENDPOINT=http://150.241.247.80:4000/api/v1
ARG VITE_ENVIRONMENT=production
ARG VITE_BUILD_DATE
ARG VITE_GIT_COMMIT=local

# Set environment variables for build
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_BUILD_DATE=$VITE_BUILD_DATE
ENV VITE_GIT_COMMIT=$VITE_GIT_COMMIT
ENV NODE_ENV=production
ENV HUSKY=0

# Debug: Show what files are present
RUN echo "=== Files in build directory ===" && \
    ls -la && \
    echo "=== Source directory ===" && \
    ls -la src/ && \
    echo "=== Config files ===" && \
    ls -la *.json *.ts *.js 2>/dev/null || true

# Build the application
RUN npm run build

# Verify build output
RUN echo "=== Build verification ===" && \
    test -d dist || (echo "ERROR: dist directory not found" && exit 1) && \
    echo "Build successful. Contents of dist:" && \
    ls -la dist && \
    test -f dist/index.html || (echo "ERROR: dist/index.html not found" && exit 1) && \
    echo "✓ Build completed successfully"

# Stage 3: Production - Serve with nginx
FROM nginx:stable-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Verify nginx configuration syntax
RUN nginx -t

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Verify files were copied and set permissions
RUN echo "=== Nginx directory contents ===" && \
    ls -la /usr/share/nginx/html && \
    test -f /usr/share/nginx/html/index.html || (echo "ERROR: index.html not found in nginx directory" && exit 1) && \
    echo "✓ Files copied successfully" && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Create nginx cache and log directories with proper permissions
RUN mkdir -p /var/cache/nginx && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx

# Expose port 80
EXPOSE 80

# Add labels for better container management
LABEL maintainer="BKeep Team"
LABEL description="BKeep Accounting Frontend"
LABEL version="1.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
