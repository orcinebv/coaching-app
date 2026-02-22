# Sprint 1: Fundering (Weken 1-2)

## Sprint Doel
De basisinfrastructuur opzetten met Nx workspace, database, en eerste API endpoints.

## 📊 Team Capaciteit
- Platform Squad: 20 story points
- Backend Squad: 18 story points
- Frontend Squad: 15 story points
- QA Squad: 10 story points

## 📋 Geselecteerde Stories

### Platform Squad (20 punten)

#### PLAT-001: Nx Workspace Setup (8 punten)
**Als** platform engineer  
**Wil ik** een Nx workspace met Angular en NestJS  
**Zodat** we een monorepo hebben voor alle code

**Acceptatie Criteria:**
- [x] Nx workspace draait met `pnpm start:all`
- [x] Angular app (coaching-web) bereikbaar op http://localhost:4200
- [x] NestJS app (coaching-api) bereikbaar op http://localhost:3000/api
- [x] Git repository geïnitialiseerd met .gitignore
- [x] README.md met basis instructies
- [x] Nx Cloud geconfigureerd voor caching

**Taken:**
1. `npx create-nx-workspace@latest coaching-app --preset=angular-nest --appName=coaching-web --style=scss --packageManager=pnpm`
2. Test of beide apps starten
3. Maak .env.example met basis variabelen
4. Commit naar git

#### PLAT-002: Docker Development Setup (7 punten)
**Als** ontwikkelaar  
**Wil ik** een docker-compose setup met alle services  
**Zodat** ik lokaal kan ontwikkelen met de juiste infrastructuur

**Acceptatie Criteria:**
- [x] docker-compose.yml met PostgreSQL, Redis, n8n
- [x] Alle services starten met `docker-compose up`
- [x] Volumes voor persistente data
- [x] Healthchecks voor alle services
- [x] .env bestand voor configuratie
- [x] Dockerfiles voor API en Web (multi-stage)

**Taken:**
1. Maak docker-compose.yml met postgres, redis, n8n
2. Maak Dockerfile voor coaching-api (NestJS)
3. Maak Dockerfile voor coaching-web (Angular + nginx)
4. Configureer volumes en networks
5. Test of alles samenwerkt

#### PLAT-003: Shared Libraries Aanmaken (5 punten)
**Als** architect  
**Wil ik** gedeelde libraries voor types en utilities  
**Zodat** code herbruikbaar is tussen frontend en backend

**Acceptatie Criteria:**
- [x] shared-types library met interfaces
- [x] coaching-utils library met helper functies
- [x] data-access library (Prisma)
- [x] api-client library (Angular services)
- [x] coaching-ui library (gedeelde componenten)
- [x] Alle libraries zijn geïmporteerd en werken

**Taken:**
1. `nx g @nx/js:lib shared-types`
2. `nx g @nx/js:lib coaching-utils`
3. `nx g @nx/nest:lib data-access`
4. `nx g @nx/angular:lib api-client --standalone`
5. `nx g @nx/angular:lib coaching-ui --standalone`

### Backend Squad (18 punten)

#### BACK-001: Database Schema met Prisma (8 punten)
**Als** backend developer  
**Wil ik** een compleet Prisma schema met alle modellen  
**Zodat** we data kunnen opslaan voor de coaching app

**Acceptatie Criteria:**
- [x] Prisma geïnstalleerd in data-access library
- [x] Schema met User, Conversation, Message modellen
- [x] Schema met CheckIn, CoachingSettings modellen
- [x] Schema met Session, N8nData modellen
- [x] Migratie gegenereerd en uitgevoerd
- [x] Prisma client gegenereerd
- [x] PrismaService met lifecycle hooks

**Taken:**
1. Installeer Prisma in libs/data-access
2. Definieer alle modellen in schema.prisma
3. Voeg relaties en indexes toe
4. Genereer migratie: `npx prisma migrate dev --name init`
5. Maak PrismaService met onModuleInit/onModuleDestroy

#### BACK-002: Basis Chat Module (5 punten)
**Als** backend developer  
**Wil ik** een chat module met een simpel echo endpoint  
**Zodat** de frontend kan testen of de API werkt

**Acceptatie Criteria:**
- [x] ChatModule gegenereerd met Nx
- [x] POST /chat endpoint accepteert berichten
- [x] Validatie met class-validator
- [x] Error handling met NestJS filters
- [x] Swagger documentatie
- [x] Unit tests voor controller en service

**Taken:**
1. `nx g @nx/nest:module chat --project=coaching-api`
2. `nx g @nx/nest:controller chat --project=coaching-api --flat`
3. `nx g @nx/nest:service chat --project=coaching-api --flat`
4. Implementeer echo functionaliteit
5. Voeg DTOs en validatie toe

#### BACK-003: Health Check Endpoint (3 punten)
**Als** operations engineer  
**Wil ik** een health check endpoint  
**Zodat** we kunnen monitoren of de API live is

**Acceptatie Criteria:**
- [x] GET /health endpoint
- [x] Checkt database connectie
- [x] Checkt redis connectie (indien beschikbaar)
- [x] Return status 200 als alles ok
- [x] Gedetailleerde status in response

**Taken:**
1. Maak HealthController
2. Implementeer database health check
3. Implementeer redis health check
4. Return gestructureerde response

#### BACK-004: Repository Pattern (2 punten)
**Als** backend developer  
**Wil ik** repositories voor data toegang  
**Zodat** database logica gecentraliseerd is

**Acceptatie Criteria:**
- [x] BaseRepository met generieke CRUD
- [x] UserRepository met specifieke queries
- [x] ConversationRepository
- [x] MessageRepository
- [x] CheckInRepository

**Taken:**
1. Maak BaseRepository abstract class
2. Implementeer UserRepository
3. Implementeer ConversationRepository
4. Implementeer MessageRepository
5. Implementeer CheckInRepository

### Frontend Squad (15 punten)

#### FRONT-001: Angular Project Configuratie (5 punten)
**Als** frontend developer  
**Wil ik** een werkende Angular setup  
**Zodat** ik kan beginnen met ontwikkelen

**Acceptatie Criteria:**
- [x] Angular met standalone components en signals
- [x] SCSS voor styling
- [x] Routing geconfigureerd
- [x] HttpClient setup met interceptors
- [x] Environment configuratie (dev/prod)
- [x] Basis layout component

**Taken:**
1. Check of Angular correct is ingesteld
2. Configureer environments
3. Maak LayoutComponent met header/footer
4. Setup HttpClient met interceptors
5. Voeg eerste route toe

#### FRONT-002: Shared UI Components (5 punten)
**Als** frontend developer  
**Wil ik** herbruikbare UI componenten in coaching-ui library  
**Zodat** ze overal gebruikt kunnen worden

**Acceptatie Criteria:**
- [x] ButtonComponent met varianten
- [x] InputComponent met validatie
- [x] CardComponent voor containers
- [x] LoadingSpinnerComponent
- [x] ErrorMessageComponent
- [x] Alle componenten standalone en getest

**Taken:**
1. Genereer ButtonComponent
2. Genereer InputComponent
3. Genereer CardComponent
4. Genereer LoadingSpinnerComponent
5. Genereer ErrorMessageComponent
6. Schrijf unit tests voor elk component

#### FRONT-003: API Client Library Setup (3 punten)
**Als** frontend developer  
**Wil ik** een API client library  
**Zodat** alle API calls centraal zijn

**Acceptatie Criteria:**
- [x] ApiClientModule met base URL configuratie
- [x] BaseApiService met HTTP methods
- [x] Error handling interceptor
- [x] Loading interceptor
- [x] Token interceptor (basis)

**Taken:**
1. Maak BaseApiService met get/post/put/delete
2. Implementeer ErrorInterceptor
3. Implementeer LoadingInterceptor
4. Implementeer TokenInterceptor (placeholder)
5. Exporteer services via index.ts

#### FRONT-004: POC Chat Widget (2 punten)
**Als** frontend developer  
**Wil ik** een simpele chat widget  
**Zodat** we de verbinding met backend kunnen testen

**Acceptatie Criteria:**
- [x] ChatWidgetComponent met input veld
- [x] Berichten worden getoond in lijst
- [x] Send button verstuurt bericht naar API
- [x] Responsive design
- [x] Unit tests voor component

**Taken:**
1. Genereer ChatWidgetComponent
2. Bouw template met message list en input
3. Implementeer sendMessage functie
4. Voeg styling toe
5. Schrijf tests

### QA Squad (10 punten)

#### QA-001: Test Infrastructuur (5 punten)
**Als** QA engineer  
**Wil ik** een complete testinfrastructuur  
**Zodat** we kwaliteit kunnen waarborgen

**Acceptatie Criteria:**
- [x] Jest configuratie voor backend
- [x] Jest configuratie voor frontend
- [x] Playwright setup voor E2E tests
- [x] Coverage rapporten
- [x] CI/CD ready test scripts
- [x] Test data factories

**Taken:**
1. Configureer Jest voor NestJS
2. Configureer Jasmine voor Angular
3. Installeer en configureer Cypress
4. Maak test:coverage script
5. Maak test data factories

#### QA-002: Unit Tests Backend (3 punten)
**Als** QA engineer  
**Wil ik** unit tests voor backend services  
**Zodat** we zeker weten dat de logica klopt

**Acceptatie Criteria:**
- [x] Tests voor ChatService
- [x] Tests voor HealthController
- [x] Tests voor PrismaService
- [x] Mock implementaties voor database
- [x] 80% code coverage minimum

**Taken:**
1. Schrijf tests voor ChatService
2. Schrijf tests voor HealthController
3. Schrijf tests voor PrismaService
4. Implementeer mocks
5. Check coverage

#### QA-003: Unit Tests Frontend (2 punten)
**Als** QA engineer  
**Wil ik** unit tests voor Angular componenten  
**Zodat** de UI correct werkt

**Acceptatie Criteria:**
- [x] Tests voor ButtonComponent
- [x] Tests voor InputComponent
- [x] Tests voor ChatWidgetComponent
- [x] Tests voor ApiClient services
- [x] 80% code coverage minimum

**Taken:**
1. Schrijf tests voor ButtonComponent
2. Schrijf tests voor InputComponent
3. Schrijf tests voor ChatWidgetComponent
4. Schrijf tests voor BaseApiService
5. Check coverage

## 📊 Sprint Backlog Totaal: 63 punten

## 🔍 Dependencies & Risico's

### Dependencies
- PLAT-001 moet eerst (basis workspace)
- PLAT-002 kan parallel aan PLAT-001
- BACK-001 heeft PLAT-003 nodig (data-access library)
- BACK-002 heeft BACK-001 nodig (database)
- FRONT-001 heeft PLAT-001 nodig
- FRONT-002 kan parallel aan FRONT-001
- QA-001 heeft alle andere nodig voor volledige tests

### Risico's
1. **Nieuwe tech stack**: Team moet wennen aan Nx
2. **Docker complexiteit**: Mac/Windows verschillen
3. **Prisma learning curve**: Nieuw voor sommigen
4. **Capaciteit**: 63 punten is ambitieus voor eerste sprint

## 🎯 Sprint Goals
1. ✅ Werkende Nx workspace met Angular + NestJS
2. ✅ Database schema en Prisma setup
3. ✅ Basis API endpoints
4. ✅ Eerste UI componenten
5. ✅ Testinfrastructuur

## 📈 Definition of Done
- [x] Code geschreven en lokaal getest
- [x] Unit tests slagen
- [x] Code coverage ≥80%
- [x] Code gereviewd door squad lead
- [x] Documentatie bijgewerkt
- [x] Gedemonstreerd in sprint review
- [x] Gecommit naar main branch

## 🚀 Sprint Review (Einde Sprint)
**Demo onderdelen:**
1. Nx workspace met beide apps
2. Docker compose met alle services
3. Prisma schema en database
4. POST /chat endpoint in Postman
5. Chat widget in browser
6. Test rapport met coverage

## 🔄 Retrospective Items
- Wat ging goed?
- Wat kan beter?
- Actiepunten voor volgende sprint