
    FROM node:20-alpine AS deps
    RUN apk add --no-cache libc6-compat
    WORKDIR /app

    COPY package.json package-lock.json ./
    RUN npm ci && npm cache clean --force

    FROM node:20-alpine AS builder
    RUN apk add --no-cache libc6-compat
    WORKDIR /app

    COPY --from=deps /app/node_modules ./node_modules
    COPY . .

    ARG VITE_API_ENDPOINT=http://150.241.247.80:4000/api/v1
    ARG VITE_ENVIRONMENT=production
    ARG VITE_BUILD_DATE
    ARG VITE_GIT_COMMIT=local

    ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT
    ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT
    ENV VITE_BUILD_DATE=$VITE_BUILD_DATE
    ENV VITE_GIT_COMMIT=$VITE_GIT_COMMIT
    ENV NODE_ENV=production
    ENV HUSKY=0

    RUN npm run build

    RUN test -d dist || (echo "ERROR: dist directory not found" && exit 1)

    FROM nginx:stable-alpine AS production

    RUN apk add --no-cache curl

    RUN rm -rf /usr/share/nginx/html/*
    COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

    COPY --from=builder /app/dist /usr/share/nginx/html

    RUN chown -R nginx:nginx /usr/share/nginx/html && \
        chmod -R 755 /usr/share/nginx/html && \
        mkdir -p /var/cache/nginx && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx

    EXPOSE 80

    LABEL maintainer="BKeep Team"
    LABEL description="BKeep Accounting Frontend"
    LABEL version="1.0.0"

    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
        CMD curl -f http://localhost/health || exit 1

    CMD ["nginx", "-g", "daemon off;"]
