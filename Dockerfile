# Multi-stage build for optimized production image
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with clean cache
RUN npm ci --no-audit --no-fund --prefer-offline && \
    npm cache clean --force

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for environment variables
ARG VITE_API_ENDPOINT
ARG VITE_ENVIRONMENT=production
ARG VITE_BUILD_DATE
ARG VITE_GIT_COMMIT

# Set environment variables
ENV NODE_ENV=production
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
ENV VITE_BUILD_DATE=$VITE_BUILD_DATE
ENV VITE_GIT_COMMIT=$VITE_GIT_COMMIT

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS production

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Add labels for metadata
LABEL maintainer="bkeep-accounting"
LABEL description="BKeep Accounting Frontend"
LABEL environment="${VITE_ENVIRONMENT:-production}"

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
