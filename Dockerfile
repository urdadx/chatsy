# Use Node.js 21+ as the base image
FROM node:21-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the TanStack Start application
RUN pnpm build

# Production stage
FROM node:21-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm@10.10.0

# Set working directory
WORKDIR /app

# Copy built TanStack Start application
COPY --from=base /app/apps/web/.output ./apps/web/.output
COPY --from=base /app/apps/web/package.json ./apps/web/
COPY --from=base /app/package.json ./
COPY --from=base /app/pnpm-lock.yaml* ./

# Install only production dependencies
RUN cd apps/web && pnpm install --prod --frozen-lockfile

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S tanstack -u 1001

# Change ownership of the app directory
RUN chown -R tanstack:nodejs /app

# Switch to non-root user
USER tanstack

# Expose port (TanStack Start default is 3000)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the TanStack Start application
CMD ["node", "apps/web/.output/server/index.mjs"]