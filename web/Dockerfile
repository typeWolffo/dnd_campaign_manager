FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Build application
COPY . ./
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files and install production deps
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=build /app/build ./build

# Create non-root user
RUN addgroup -g 1001 -S nodejs &&
    adduser -S -u 1001 -G nodejs react

RUN chown -R react:nodejs /app
USER react

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
