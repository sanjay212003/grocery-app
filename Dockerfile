# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY backend/package*.json ./backend/
COPY frontend/ ./frontend/

# Install dependencies
WORKDIR /app/backend
RUN npm install

# Copy backend source
COPY backend/ .

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "app.js"]
