# syntax=docker/dockerfile:1

# ---- Build the Angular app ----
FROM node:22-alpine AS build

WORKDIR /app

COPY app/package.json app/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY app/angular.json app/tsconfig*.json ./
COPY app/src ./src
RUN npm run build:prod

# ---- Install server dependencies ----
FROM node:22-alpine AS server-deps

WORKDIR /server

COPY server/package.json server/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ---- Runtime ----
FROM node:22-alpine

ENV NODE_ENV=production
WORKDIR /app

COPY --from=server-deps /server/node_modules ./node_modules
COPY server/server.js ./
COPY --from=build /app/dist ./dist

USER node
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -qO- http://127.0.0.1:${SERVER_PORT:-5000}/ >/dev/null || exit 1

ENTRYPOINT ["node", "server.js"]
