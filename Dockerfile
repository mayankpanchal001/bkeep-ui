# Multi-stage build for optimized production image
# Stage 1: Dependencies - Install and cache dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json* ./

# Install dependencies with clean cache
# Use npm ci for reproducible builds (faster and more reliable than npm install)
RUN npm ci --no-audit --no-fund --prefer-offline && \
    npm cache clean --force

# Stage 2: Builder - Build the application
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files for potential rebuilds
COPY package.json package-lock.json* ./

# Copy source code and configuration files
# Copy in order: config files first, then source code for better caching
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY components.json ./
COPY public ./public
COPY src ./src

# Build arguments for environment variables
# These are available at build time and can be overridden
ARG VITE_API_ENDPOINT=http://72.62.161.70:4000/api/v1
ARG VITE_ENVIRONMENT=production
ARG VITE_BUILD_DATE
ARG VITE_GIT_COMMIT

# Set environment variables (Vite requires these at build time)
# Vite bakes these into the JavaScript bundle, so they cannot be changed at runtime
ENV NODE_ENV=production
ENV VITE_API_ENDPOINT=${VITE_API_ENDPOINT}
ENV VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
ENV VITE_BUILD_DATE=${VITE_BUILD_DATE}
ENV VITE_GIT_COMMIT=${VITE_GIT_COMMIT}

# Build the application
# This runs: tsc -b && vite build
# Add error handling and verify build output
RUN npm run build && \
    test -d dist && \
    test -f dist/index.html || (echo "Build failed: dist/index.html not found" && exit 1)

# Stage 3: Production - Serve with nginx
FROM nginx:alpine AS production

# Install curl for health checks (lightweight alternative to wget)
RUN apk add --no-cache curl

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Ensure nginx can read the files
RUN chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /usr/share/nginx/html

# Add labels for metadata
LABEL maintainer="bkeep-accounting"
LABEL description="BKeep Accounting Frontend"
LABEL version="1.0.0"

# Expose port 80
EXPOSE 80

# Health check to ensure the container is running properly
# Use curl instead of wget (more reliable in alpine)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost/health || exit 1

# Start nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
