# Use Node.js 22+ as the base image (better compatibility)
FROM node:22-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app/apps/server

# Copy server package.json and install dependencies
COPY package.json ./

# Install dependencies with proper flags
RUN npm install --omit=dev=false

# Copy source code
COPY . ./

# Build the websocket server
RUN npm run build

# Production stage
FROM node:22-alpine AS production

# Set working directory
WORKDIR /app/apps/server

# Copy built websocket server
COPY --from=base /app/apps/server/dist ./dist
COPY --from=base /app/apps/server/package.json ./

# Install production dependencies only
RUN npm install --omit=dev

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
ENV PORT=3001

# Start the WebSocket server
CMD ["node", "dist/index.js"]