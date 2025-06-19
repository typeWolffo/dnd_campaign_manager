# Build stage
FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages installation
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY ./src ./src
COPY ./drizzle ./drizzle
COPY ./drizzle.config.ts ./drizzle.config.ts
COPY ./tsconfig.json ./tsconfig.json

# Set production environment for build
ENV NODE_ENV=production

# Compile to binary according to Elysia documentation
RUN bun build \
    --compile \
    --minify-whitespace \
    --minify-syntax \
    --target bun \
    --outfile server \
    ./src/index.ts

# Production stage
FROM gcr.io/distroless/base-debian12

WORKDIR /app

# Copy only the compiled binary
COPY --from=build /app/server ./server

# Use non-root user for security
USER nonroot:nonroot

# Runtime environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check for Coolify
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD ["/app/server", "--health"] || exit 1

# Start the server
CMD ["./server"]
