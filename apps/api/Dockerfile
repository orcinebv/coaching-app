FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN DATABASE_URL=$DATABASE_URL npx prisma generate --schema=prisma/schema.prisma
RUN npx nx build api --configuration=production

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "main.js"]

FROM node:20-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN DATABASE_URL=$DATABASE_URL npx prisma generate --schema=prisma/schema.prisma

EXPOSE 3000

CMD ["npx", "nx", "serve", "api"]
