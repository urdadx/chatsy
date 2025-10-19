# Use Node.js 21+ as the base image
FROM node:21-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy workspace config first
COPY pnpm-workspace.yaml ./
COPY package.json pnpm-lock.yaml* ./

# Copy all package.json files
COPY apps/web/package.json ./apps/web/
COPY apps/server/package.json ./apps/server/
COPY packages/store/package.json ./packages/store/

# Install all dependencies (including dev for build tools)
RUN pnpm install

# Copy source code
COPY . .

# Declare build arguments for all VITE environment variables
ARG VITE_NODE_ENV
ARG VITE_BETTER_AUTH_URL
ARG VITE_MONTHLY_STARTER_PLAN
ARG VITE_YEARLY_STARTER_PLAN
ARG VITE_MONTHLY_GROWTH_PLAN
ARG VITE_YEARLY_GROWTH_PLAN
ARG VITE_MONTHLY_PRO_PLAN
ARG VITE_YEARLY_PRO_PLAN
ARG VITE_EXTRA_MESSAGE_CREDITS_ADDON
ARG VITE_REMOVE_BRANDING_ADDON

# Set environment variables from build args
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_BETTER_AUTH_URL=$VITE_BETTER_AUTH_URL
ENV VITE_MONTHLY_STARTER_PLAN=$VITE_MONTHLY_STARTER_PLAN
ENV VITE_YEARLY_STARTER_PLAN=$VITE_YEARLY_STARTER_PLAN
ENV VITE_MONTHLY_GROWTH_PLAN=$VITE_MONTHLY_GROWTH_PLAN
ENV VITE_YEARLY_GROWTH_PLAN=$VITE_YEARLY_GROWTH_PLAN
ENV VITE_MONTHLY_PRO_PLAN=$VITE_MONTHLY_PRO_PLAN
ENV VITE_YEARLY_PRO_PLAN=$VITE_YEARLY_PRO_PLAN
ENV VITE_EXTRA_MESSAGE_CREDITS_ADDON=$VITE_EXTRA_MESSAGE_CREDITS_ADDON
ENV VITE_REMOVE_BRANDING_ADDON=$VITE_REMOVE_BRANDING_ADDON

# Build the TanStack Start application
RUN pnpm build

# Build the websocket server
RUN pnpm --filter server build

# Production stage
FROM node:21-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy built TanStack Start application
COPY --from=base /app/apps/web/.output ./apps/web/.output
COPY --from=base /app/apps/web/package.json ./apps/web/
COPY --from=base /app/apps/web/test ./apps/web/test
COPY --from=base /app/apps/web/drizzle ./apps/web/drizzle
COPY --from=base /app/apps/web/drizzle.config.ts ./apps/web/
COPY --from=base /app/apps/web/src ./apps/web/src
COPY --from=base /app/apps/web/.env* ./apps/web/

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
COPY start.sh ./
RUN chmod +x start.sh

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tanstack -u 1001

# Change ownership of the app directory
RUN chown -R tanstack:nodejs /app

# Switch to non-root user
USER tanstack

# Expose ports (TanStack Start on 3000, WebSocket server on 3001)
EXPOSE 3000 

# Set environment to production
ENV NODE_ENV=production

# Set working directory to the web app for relative paths to work
# WORKDIR /app/apps/web

# Run database migrations/push before starting the app
# RUN npx drizzle-kit push

# Start both web and websocket services
CMD ["./start.sh"]