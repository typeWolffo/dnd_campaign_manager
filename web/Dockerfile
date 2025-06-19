# Install all dependencies
FROM oven/bun:1 AS deps
WORKDIR /app
COPY package.json ./
COPY bun.lock ./
RUN bun install

# Install production dependencies only
FROM oven/bun:1 AS prod-deps
WORKDIR /app
COPY package.json ./
COPY bun.lock ./
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
COPY package.json ./
COPY bun.lock ./
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy built application
COPY --from=build /app/build ./build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S -u 1001 -G nodejs react

# Change ownership and switch to non-root user
RUN chown -R react:nodejs /app
USER react

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

RUN apk add --no-cache curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["bun", "run", "start"]
