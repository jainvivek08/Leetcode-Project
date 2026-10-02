# ==========================================
# CodeQuest Frontend Multi-stage Dockerfile
# ==========================================

# Stage 1: Build the React + Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for Vite environment variables
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Copy package manifests
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve static build with Nginx Alpine
FROM nginx:alpine

# Copy custom Nginx configuration with SPA fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
