FROM node:22-alpine
  # Build: 2026-04-22-v3 (embedded templates — game downloads optional)
  RUN apk add --no-cache wget tar
  WORKDIR /app
  COPY package.json .
  COPY dist/ ./dist/
  COPY public/ ./public/

  # Oyun dosyalarını indir — başarısız olursa devam et (şablonlar zaten index.mjs içinde gömülü)
  RUN mkdir -p /app/public/games && \
      echo "WolfGold indiriliyor..." && \
      (wget -q --timeout=120 "https://github.com/mikronoastorize-spec/roulette-casino/releases/download/v1.0/wg-game.tar.gz" \
           -O /tmp/wg-game.tar.gz && \
      tar xzf /tmp/wg-game.tar.gz -C /app/public/games/ && \
      rm /tmp/wg-game.tar.gz && \
      echo "WolfGold OK") || echo "WARN: WolfGold indir basarisiz — devam ediliyor" && \
      echo "PP oyunlar indiriliyor..." && \
      (wget -q --timeout=120 "https://github.com/mikronoastorize-spec/roulette-casino/releases/download/v1.0/games-pp.tar.gz" \
           -O /tmp/games-pp.tar.gz && \
      tar xzf /tmp/games-pp.tar.gz -C /app/public/games/ && \
      rm /tmp/games-pp.tar.gz && \
      echo "PP OK") || echo "WARN: PP oyunlar indir basarisiz — devam ediliyor" && \
      echo "Oyun dosyaları: $(ls /app/public/games/ 2>/dev/null | tr '\n' ' ')"

  EXPOSE 8080
  CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
  