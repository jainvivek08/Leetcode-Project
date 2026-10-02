# ==========================================
# CodeQuest Backend Dockerfile (Node 20 Alpine)
# ==========================================
FROM node:20-alpine AS base

# Install build dependencies for native packages (bcrypt, etc.)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy application source code
COPY . .

# Set default production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose API port
EXPOSE 3000

# Start server
CMD ["node", "src/index.js"]
