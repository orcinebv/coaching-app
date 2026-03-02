# Railway Deployment

## Services overzicht

| Service | Dockerfile | Poort |
|---------|-----------|-------|
| **backend** | `apps/api/Dockerfile` (production) | 3000 |
| **frontend** | `apps/web/Dockerfile` (production) | 80 |
| **postgres** | Railway managed | 5432 |
| **redis** | Railway managed | 6379 |

---

## Stap-voor-stap setup

### 1. Maak een Railway project aan

1. Ga naar [railway.app](https://railway.app) → Log in met GitHub
2. **New Project** → **Empty Project**

### 2. Voeg PostgreSQL toe

- **+ Add Service** → **Database** → **PostgreSQL**
- Railway maakt automatisch `DATABASE_URL` beschikbaar

### 3. Voeg Redis toe

- **+ Add Service** → **Database** → **Redis**
- Railway maakt automatisch `REDIS_URL` beschikbaar

### 4. Voeg de Backend toe

- **+ Add Service** → **GitHub Repo** → selecteer deze repo
- **Settings** tab:
  - Root Directory: `/` (project root)
  - Dockerfile Path: `apps/api/Dockerfile`
  - Docker Build Target: `production`
- **Variables** tab — voeg toe:

```
DATABASE_URL          → (automatisch via Railway Postgres)
REDIS_URL             → (automatisch via Railway Redis)
JWT_SECRET            → een willekeurige lange string (bijv. openssl rand -hex 32)
FRONTEND_URL          → https://jouw-frontend.up.railway.app
OPENAI_API_KEY        → sk-...
NODE_ENV              → production
PORT                  → 3000
```

### 5. Voeg de Frontend toe

- **+ Add Service** → **GitHub Repo** → selecteer deze repo
- **Settings** tab:
  - Root Directory: `/`
  - Dockerfile Path: `apps/web/Dockerfile`
  - Docker Build Target: `production`
- **Variables** tab — voeg toe:

```
BACKEND_URL           → https://jouw-backend.up.railway.app
```

> **Let op**: `BACKEND_URL` moet de publieke URL van de backend service zijn.
> Je vindt deze onder Settings → Domains van de backend service.

### 6. Domains instellen

- Backend: Settings → **Generate Domain** → bijv. `coaching-api.up.railway.app`
- Frontend: Settings → **Generate Domain** → bijv. `coaching-app.up.railway.app`
- Zet daarna `FRONTEND_URL` in de backend op de frontend domain URL

---

## Hoe variabelen werken

Railway koppelt services automatisch. Je kunt in de backend service variabelen
refereren vanuit andere services:

```
DATABASE_URL  = ${{Postgres.DATABASE_URL}}
REDIS_URL     = ${{Redis.REDIS_URL}}
```

---

## Niet op Railway (optioneel apart draaien)

- **n8n** → n8n.io cloud of aparte VPS
- **Grafana + Prometheus** → Grafana Cloud (gratis tier) of weglaten
