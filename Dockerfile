FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY shared/package.json shared/
COPY backend/package.json backend/
COPY prisma/ prisma/

RUN npm ci

COPY shared/ shared/
RUN npm run build --workspace=shared

COPY backend/ backend/

RUN npx prisma generate

EXPOSE 3001

CMD ["npx", "tsx", "backend/src/server.ts"]
