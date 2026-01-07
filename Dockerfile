# ==============================================================================
# UCAB Tasks - Dockerfile
# Optimized for development with hot-reload
# ==============================================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp (if needed)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
RUN npm ci

# Copy source code
COPY . .

# Expose the application port
EXPOSE 3000

# Start in development mode with hot-reload
CMD ["npm", "run", "start:dev"]
