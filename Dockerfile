# --- Build Stage ---
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code and build production assets
COPY . .
RUN npm run build

# --- Production Runtime Stage ---
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy build artifacts and server script
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts

EXPOSE 3000

# Run with tsx or node
CMD ["npx", "tsx", "server.ts"]
