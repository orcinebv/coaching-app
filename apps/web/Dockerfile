FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npx nx build web --configuration=production

# ---- Production (nginx + envsubst voor BACKEND_URL) ----
FROM nginx:alpine AS production

COPY --from=builder /app/dist/apps/web/browser /usr/share/nginx/html

# Gebruik nginx templates-map zodat BACKEND_URL automatisch wordt vervangen via envsubst
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ---- Development ----
FROM node:20-alpine AS development

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4200

CMD ["npx", "nx", "serve", "web", "--host", "0.0.0.0"]
