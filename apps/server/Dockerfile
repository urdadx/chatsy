# Use Node.js 22+ as the base image
FROM node:22-alpine AS base

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the server
RUN npm run build

# Development stage
FROM node:22-alpine AS development

# Set working directory
WORKDIR /app

# Copy everything from base
COPY --from=base /app ./

# Expose development server port
EXPOSE 3001

# Run development server
CMD ["npm", "run", "dev"]