FROM node:22-alpine
  # Build: 2026-04-22-v4 (fast build — no game downloads, templates embedded in index.mjs)
  WORKDIR /app
  COPY package.json .
  COPY dist/ ./dist/
  COPY public/ ./public/
  EXPOSE 8080
  CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
  