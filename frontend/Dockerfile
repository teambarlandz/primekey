# Frontend Dockerfile - Multi-stage build for Next.js standalone output
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Public API base URL baked in at build time (relative path works behind the edge nginx)
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the application (standalone output)
RUN npm run build

# Production stage - run the standalone Node server
FROM node:20-alpine as production

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Copy standalone server and its pruned node_modules
COPY --from=builder /app/.next/standalone ./

# Copy static assets and public files
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Run as non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the Next.js standalone server
CMD ["node", "server.js"]
