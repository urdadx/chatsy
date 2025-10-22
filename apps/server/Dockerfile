# Use Node.js 22+ as the base image
FROM node:22-alpine AS base

# Install pnpm and build dependencies
RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++

# Set working directory to project root
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/*/package.json ./packages/*/

# Install all dependencies
RUN pnpm install

# Copy all source code
COPY . .

# Build the project
RUN pnpm build

# Development stage
FROM node:22-alpine AS development

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy everything from base
COPY --from=base /app ./

# Expose development server port
EXPOSE 3001

# Run development server
CMD ["pnpm", "dev"]