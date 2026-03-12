# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# ============================================
# Stage 2: Build the Next.js application
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set the API base URL for the build
# In Docker, Nginx proxies /api/* requests to the backend
ENV NEXT_PUBLIC_API_URL=/api

# Build the Next.js application (standalone output)
RUN npm run build

# ============================================
# Stage 3: Production image with Nginx + Node
# Uses Nginx to reverse proxy and serve
# static assets, while Node runs Next.js
# standalone server for SSR/dynamic routes.
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install Nginx
RUN apk add --no-cache nginx

# Copy the standalone Next.js server
COPY --from=builder /app/.next/standalone ./
# Copy static assets
COPY --from=builder /app/.next/static ./.next/static
# Copy public assets
COPY --from=builder /app/public ./public

# Copy Nginx config
COPY nginx.conf /etc/nginx/http.d/default.conf

# Expose port 80 (Nginx) — mapped to 3000 in docker-compose
EXPOSE 80

# Start Nginx and Next.js server together
# Next.js standalone listens on port 3000 internally,
# Nginx on port 80 proxies to it and to the backend API.
CMD sh -c "nginx && PORT=3000 HOSTNAME=0.0.0.0 node server.js"
