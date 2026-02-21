# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Copy workspace config and lockfile first (for layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies (single stage avoids broken pnpm symlinks)
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Generate Prisma client and stage it at a known path for the runner
RUN pnpm --filter web exec -- prisma generate \
    && cp -rL $(find node_modules -path '*/.prisma/client' -type d | head -1) /tmp/prisma-client

# Build the shared package first, then the web app
RUN pnpm run build

# ---- Stage 2: Production runner ----
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy standalone output
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Copy Prisma schema and generated client
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma
COPY --from=builder /tmp/prisma-client ./node_modules/.prisma/client

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
