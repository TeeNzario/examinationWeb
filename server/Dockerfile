# ============================================
# Stage 1: Install dependencies and build
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for better caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy Prisma schema so we can generate the client
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the source code
COPY . .

# Build the NestJS application
RUN npm run build

# ============================================
# Stage 2: Production image
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Copy dependency files and install production-only deps
COPY package.json package-lock.json* ./
RUN npm install --omit=dev

# Copy Prisma schema and config (needed for migrations at runtime)
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Re-generate Prisma client in production node_modules
RUN npx prisma generate

# Copy the built application from builder stage
COPY --from=builder /app/dist ./dist

# Expose the backend port
EXPOSE 3001

# Run Prisma migrations then start the server
# Using sh -c so we can chain commands
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
