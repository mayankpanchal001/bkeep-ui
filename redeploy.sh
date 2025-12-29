#!/bin/bash

# Build the services without using cache
echo "Building services with --no-cache..."
docker-compose build --no-cache

# Start the services in detached mode
echo "Starting services..."
docker-compose up -d
