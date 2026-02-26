# Use Node.js 18 Alpine for smaller image
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runtime

# Set working directory
WORKDIR /app

# Copy package files
COPY --from=build /app/package*.json ./

# Copy built Next.js application
COPY --from=build /app/.next ./.next

# Copy public assets
COPY --from=build /app/public ./public

# Copy Next.js config
COPY --from=build /app/next.config.ts ./

# Install only production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]