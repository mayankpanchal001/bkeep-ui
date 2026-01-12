# Production API Endpoint Fix

## Problem

The production build was defaulting to `localhost` instead of the production API endpoint.

## Root Cause

1. The default fallback in `src/config/env.ts` was `http://0.0.0.0:8000/api` (localhost)
2. When `VITE_API_ENDPOINT` wasn't set during build, it used the localhost default

## Solution Applied

### 1. Updated `src/config/env.ts`

- Changed default to use production endpoint (`http://72.62.161.70:4000/api/v1`) when in production mode
- Added environment-aware defaults:
    - Production: `http://72.62.161.70:4000/api/v1`
    - Development: `http://localhost:4000/api/v1`

### 2. Updated `Dockerfile`

- Added default value for `VITE_API_ENDPOINT` build arg: `http://72.62.161.70:4000/api/v1`
- Ensures production builds always have the correct endpoint even if not explicitly set

### 3. GitHub Actions Workflow

- Already configured to set the correct endpoint based on environment
- Production builds use: `http://72.62.161.70:4000/api/v1`
- Can be overridden with GitHub secrets:
    - `VITE_API_ENDPOINT_PRODUCTION`
    - `VITE_API_ENDPOINT_STAGING`
    - `VITE_API_ENDPOINT_DEVELOPMENT`

## How to Verify

### Check the built application:

1. Build the Docker image:

    ```bash
    docker-compose build
    ```

2. Run the container:

    ```bash
    docker-compose up -d
    ```

3. Check the browser console or network tab to see which API endpoint is being used

4. Or inspect the built files:
    ```bash
    docker exec bkeep-frontend cat /usr/share/nginx/html/assets/*.js | grep -i "api" | head -5
    ```

### For GitHub Actions builds:

- Check the build logs to see which endpoint was used
- The workflow will show: `VITE_API_ENDPOINT=${{ steps.api.outputs.endpoint }}`

## Overriding the Endpoint

### Local Build:

```bash
VITE_API_ENDPOINT=http://your-api-server.com/api/v1 docker-compose build
```

### GitHub Actions:

Add a secret `VITE_API_ENDPOINT_PRODUCTION` with your production API URL

### Docker Build:

```bash
docker build \
  --build-arg VITE_API_ENDPOINT=http://your-api-server.com/api/v1 \
  -t bkeep-frontend .
```

## Current Defaults

| Environment | Default Endpoint                  |
| ----------- | --------------------------------- |
| Production  | `http://72.62.161.70:4000/api/v1` |
| Staging     | `http://72.62.161.70:4000/api/v1` |
| Development | `http://localhost:4000/api/v1`    |

## Important Notes

⚠️ **Vite environment variables are baked into the build at build time**

- They cannot be changed at runtime
- You must rebuild the image to change the API endpoint
- The endpoint is embedded in the JavaScript bundle

✅ **Best Practice**

- Always set `VITE_API_ENDPOINT` explicitly when building
- Use different endpoints for different environments
- Never commit production API endpoints to version control (use secrets)
