# Use Node.js 22+ as the base image
FROM node:22-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy workspace config first (assuming built from monorepo root)
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# Copy all package.json files
COPY apps/server/package.json ./apps/server/
COPY packages/store/package.json ./packages/store/

# Install all dependencies (including dev for build tools)
RUN pnpm install

# Copy source code
COPY . .

# Build the websocket server
RUN pnpm --filter server build

# Production stage
FROM node:22-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy built websocket server
COPY --from=base /app/apps/server/dist ./apps/server/dist
COPY --from=base /app/apps/server/package.json ./apps/server/
COPY --from=base /app/apps/server/src ./apps/server/src

# Copy built packages
COPY --from=base /app/packages/store/dist ./packages/store/dist
COPY --from=base /app/packages/store/package.json ./packages/store/

COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml* ./
COPY --from=base /app/pnpm-workspace.yaml ./

# Copy startup script
COPY apps/server/start.sh ./
RUN chmod +x start.sh

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S wsserver -u 1001

# Change ownership of the app directory
RUN chown -R wsserver:nodejs /app

# Switch to non-root user
USER wsserver

# Expose WebSocket server port
EXPOSE 3001

# Set environment to production
ENV NODE_ENV=production

# Start the WebSocket server using startup script
CMD ["./start.sh"]