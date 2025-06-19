# Install all dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install

# Install production dependencies only
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production

# Build stage
FROM oven/bun:1 AS build
WORKDIR /app

# Copy source and dependencies
COPY . ./
COPY --from=deps /app/node_modules ./node_modules

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:1-alpine

WORKDIR /app

# Copy package files and production dependencies
COPY package.json bun.lockb ./
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S nodejs &&
    adduser -S react -u 1001 -G nodejs

# Change ownership and switch to non-root user
RUN chown -R react:nodejs /app
USER react

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["bun", "run", "start"]
