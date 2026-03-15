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
ENV NEXT_PUBLIC_API_URL=https://api.teenzario.my.id

# Build the Next.js application (standalone output)
RUN npm run build


# ============================================
# Stage 3: Production runtime
# Runs the Next.js standalone server.
# Nginx reverse proxy is handled by a separate
# container defined in docker-compose.
# ============================================

FROM node:20-alpine AS production

WORKDIR /app

# Copy standalone Next.js server
COPY --from=builder /app/.next/standalone ./

# Copy static assets
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Next.js standalone server listens on port 3000
EXPOSE 3000

CMD ["node","server.js"]