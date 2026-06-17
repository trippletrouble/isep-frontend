FROM node:25-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY ./package.json ./package-lock.json* ./
RUN npm ci

FROM node:25-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:25-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 frontend

COPY --from=builder /app/public ./public
COPY --from=builder --chown=frontend:nodejs /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

USER frontend

EXPOSE 5173

ENV PORT=5173

ENV HOSTNAME="0.0.0.0"

CMD ["node_modules/.bin/vite", "preview", "--host", "0.0.0.0", "--port", "5173"]