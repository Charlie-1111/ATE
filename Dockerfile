# ATE — single service (API + Socket.IO + Vite static)
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/

RUN npm ci

COPY client ./client
COPY server ./server

RUN npm run build --workspace=client

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN npm ci --omit=dev

COPY server ./server
COPY --from=build /app/client/dist ./client/dist

# Render / Fly / others inject PORT
ENV PORT=8080
EXPOSE 8080
CMD ["node", "server/index.js"]
