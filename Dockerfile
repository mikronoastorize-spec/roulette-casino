FROM node:22-alpine
# Build: 2026-04-20-v2 (full deploy with game assets from GitHub Releases)
RUN apk add --no-cache wget tar
WORKDIR /app
COPY package.json .
COPY dist/ ./dist/
COPY public/ ./public/

# Oyun dosyalarını GitHub Releases'ten indir (build sırasında)
RUN mkdir -p /app/public/games && \
    echo "WolfGold indiriliyor..." && \
    wget -q "https://github.com/mikronoastorize-spec/roulette-casino/releases/download/v1.0/wg-game.tar.gz" \
         -O /tmp/wg-game.tar.gz && \
    tar xzf /tmp/wg-game.tar.gz -C /app/public/games/ && \
    rm /tmp/wg-game.tar.gz && \
    echo "PP oyunlar indiriliyor..." && \
    wget -q "https://github.com/mikronoastorize-spec/roulette-casino/releases/download/v1.0/games-pp.tar.gz" \
         -O /tmp/games-pp.tar.gz && \
    tar xzf /tmp/games-pp.tar.gz -C /app/public/games/ && \
    rm /tmp/games-pp.tar.gz && \
    echo "Oyun dosyaları hazır: $(ls /app/public/games/)"

EXPOSE 8080
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
