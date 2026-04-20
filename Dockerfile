FROM node:22-alpine
WORKDIR /app
COPY package.json .
COPY dist/ ./dist/
COPY public/ ./public/
EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
