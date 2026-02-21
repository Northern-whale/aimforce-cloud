# ---- Stage 1: Install dependencies ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package.json files for all workspace packages
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# ---- Stage 2: Build ----
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

WORKDIR /app

# Copy dependencies from previous stage (pnpm hoists all deps to root node_modules)
COPY --from=deps /app/node_modules ./node_modules

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=apps/web/prisma/schema.prisma

# Build the shared package first, then the web app
RUN pnpm run build

# ---- Stage 3: Production runner ----
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
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
