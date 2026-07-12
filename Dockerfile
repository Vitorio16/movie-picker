# syntax=docker/dockerfile:1

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.ts tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY public ./public
COPY src ./src
RUN npm run build

FROM node:22-alpine AS server-deps
WORKDIR /app/server
COPY server/package.json ./
RUN npm install --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

COPY server/package.json ./server/package.json
COPY --from=server-deps /app/server/node_modules ./server/node_modules
COPY server/src ./server/src
COPY --from=frontend-build /app/dist ./server/public

EXPOSE 8080
CMD ["node", "server/src/index.js"]
