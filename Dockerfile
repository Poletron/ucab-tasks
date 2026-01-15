# ==============================================================================
# UCAB Tasks - Dockerfile (Optimized)
# Development image with hot-reload support
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (better layer caching)
COPY package*.json ./

# Install dependencies
# Note: No native build tools needed - all deps are pure JS or have prebuilt binaries
RUN npm ci --prefer-offline

# Copy source code (this layer changes most frequently, so it goes last)
COPY . .

# Expose the application port
EXPOSE 3000

# Start in development mode with hot-reload
CMD ["npm", "run", "start:dev"]
