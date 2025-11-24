# Backend Dockerfile
FROM node:18-bullseye-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create database directory for volumes
RUN mkdir -p /app/database

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
