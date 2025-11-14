# Use Node.js LTS version
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY js/Backend/package*.json ./js/Backend/

# Install dependencies
WORKDIR /app/js/Backend
RUN npm ci --only=production
RUN npm install
# Copy application files
WORKDIR /app
COPY js/Backend/ ./js/Backend/

# Create database directory for volumes
RUN mkdir -p /app/database

# Set working directory to Backend
WORKDIR /app/js/Backend

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
