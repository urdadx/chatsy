# Use Node.js 21+ as the base image
FROM node:21-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app/apps/server

# Copy server package.json and install dependencies
COPY package.json ./

# Install dependencies directly for the server
RUN npm install --production=false

# Copy source code
COPY . ./

# Build the websocket server
RUN npm run build

# Production stage
FROM node:21-alpine AS production

# Set working directory
WORKDIR /app/apps/server

# Copy built websocket server
COPY --from=base /app/apps/server/dist ./dist
COPY --from=base /app/apps/server/package.json ./

# Install production dependencies only
RUN npm install --production

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