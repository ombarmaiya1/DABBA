# ==============================================================================
# Node.js + Express Production Dockerfile
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Create non-root user for container security
USER node

# Copy production dependencies and application source
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node . .

EXPOSE 5000
CMD ["npm", "run", "start"]
