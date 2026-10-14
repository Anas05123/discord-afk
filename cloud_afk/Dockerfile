FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev 2>/dev/null || true

COPY . .

ENV PORT=10000
EXPOSE 10000

CMD ["node", "cloud_afk/voice_daemon.mjs"]
