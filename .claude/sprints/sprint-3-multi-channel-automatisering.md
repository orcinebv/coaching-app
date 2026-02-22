# Sprint 3: Multi-Channel Automatisering (Weken 5-6)

## Sprint Doel
De coaching app uitbreiden met multi-channel notificaties (email, in-app, push) en geautomatiseerde n8n workflows zodat gebruikers op het juiste moment de juiste reminders ontvangen.

## 📊 Team Capaciteit
- Platform Squad: 10 story points
- Backend Squad: 20 story points
- Frontend Squad: 18 story points
- QA Squad: 8 story points

## 📋 Geselecteerde Stories

### Platform Squad (10 punten)

#### PLAT-007: Email Service Configuratie (5 punten)
**Als** platform engineer
**Wil ik** een email service via nodemailer/SMTP
**Zodat** de app emails kan sturen voor notificaties

**Acceptatie Criteria:**
- [x] NotificationModule met nodemailer
- [x] SMTP configuratie via environment variabelen
- [x] Email templates voor check-in reminder
- [x] Email template voor weekly report
- [x] Fallback bij email falen (log + doorgaan)

**Taken:**
1. Installeer nodemailer en @types/nodemailer
2. Maak NotificationModule met service
3. Implementeer HTML email templates
4. Configureer SMTP via .env
5. Test email verzending

#### PLAT-008: PWA Setup (5 punten)
**Als** platform engineer
**Wil ik** de app als PWA configureren
**Zodat** gebruikers de app kunnen installeren en push notificaties ontvangen

**Acceptatie Criteria:**
- [x] Web manifest met icons
- [x] Angular service worker geconfigureerd
- [x] Offline fallback pagina
- [x] Push notificatie permissie flow

**Taken:**
1. Voeg @angular/pwa toe
2. Configureer ngsw-config.json
3. Maak manifest.json met icons
4. Implementeer push notificatie permissie

---

### Backend Squad (20 punten)

#### BACK-009: Webhook GET Endpoints voor n8n (5 punten)
**Als** backend developer
**Wil ik** GET endpoints voor n8n workflows
**Zodat** n8n de juiste gebruikersdata kan ophalen

**Acceptatie Criteria:**
- [x] GET /webhooks/checkin-reminder - gebruikers met notificaties aan
- [x] GET /webhooks/weekly-report/users - alle actieve gebruikers
- [x] Filtering op notificatie-instellingen
- [x] Response bevat naam, email en tijdzone

**Taken:**
1. Voeg GET handlers toe aan WebhooksController
2. Haal gebruikers op via UsersService
3. Filter op notification-instellingen
4. Test met n8n workflow

#### BACK-010: NotificationService (8 punten)
**Als** backend developer
**Wil ik** een centrale notification service
**Zodat** alle notificaties (email, in-app) consistent worden verstuurd

**Acceptatie Criteria:**
- [x] NotificationService met sendEmail methode
- [x] Email template voor check-in reminder
- [x] Email template voor weekly report
- [x] In-app notificatie via WebSocket
- [x] Notificatie log in database
- [x] POST /webhooks/send-notification endpoint

**Taken:**
1. Maak NotificationModule en NotificationService
2. Implementeer nodemailer integratie
3. Maak HTML email templates
4. Koppel aan WebSocket gateway
5. Voeg webhook endpoint toe

#### BACK-011: CoachingSettings Endpoints (7 punten)
**Als** backend developer
**Wil ik** REST endpoints voor coaching instellingen
**Zodat** gebruikers hun coachingstijl kunnen aanpassen

**Acceptatie Criteria:**
- [x] GET /users/me/coaching-settings
- [x] PUT /users/me/coaching-settings
- [x] Validatie van coachingStyle waarden
- [x] focusAreas als JSON array
- [x] Automatisch aanmaken bij eerste ophalen
- [x] Tests

**Taken:**
1. Voeg coaching-settings endpoints toe aan UsersController
2. Implementeer logica in UsersService
3. Valideer input met DTO
4. Schrijf tests

---

### Frontend Squad (18 punten)

#### FRONT-008: Settings Pagina (8 punten)
**Als** frontend gebruiker
**Wil ik** een instellingen pagina
**Zodat** ik mijn notificaties en coaching voorkeuren kan beheren

**Acceptatie Criteria:**
- [x] SettingsComponent met tabs (Notificaties / Coaching)
- [x] Notificatie toggle (aan/uit)
- [x] Check-in tijd instelling
- [x] CoachingStyle selector (supportive, challenging, analytical)
- [x] FocusAreas multi-select
- [x] Opslaan met feedback
- [x] Route /settings met auth guard

**Taken:**
1. Maak SettingsComponent met tabs
2. Implementeer notificatie instellingen form
3. Implementeer coaching instellingen form
4. Voeg route toe aan app.routes.ts
5. Link in navbar

#### FRONT-009: In-App Notificatie Component (5 punten)
**Als** frontend gebruiker
**Wil ik** in-app notificaties zien
**Zodat** ik reminders ontvang zonder email te hoeven checken

**Acceptatie Criteria:**
- [x] NotificationBannerComponent
- [x] WebSocket listener voor reminders
- [x] Toast-stijl notificatie (5 sec auto-dismiss)
- [x] Notificatie history in signal store

**Taken:**
1. Maak NotificationBannerComponent
2. Luister op WebSocket reminder events
3. Voeg notificatie store toe
4. Integreer in app.component.ts

#### FRONT-010: PWA Manifest & Service Worker (5 punten)
**Als** frontend gebruiker
**Wil ik** de app kunnen installeren op mijn telefoon
**Zodat** ik snelle toegang heb zoals een native app

**Acceptatie Criteria:**
- [x] manifest.json met naam, icons, kleuren
- [x] Service worker voor caching
- [x] Installatie prompt
- [x] Offline fallback

**Taken:**
1. Configureer Angular PWA
2. Maak manifest.json
3. Genereer app icons
4. Configureer cache strategie in ngsw-config.json

---

### n8n Workflows (buiten story points)

#### N8N-001: Daily Check-in Workflow updaten
- Voeg email stap toe na WebSocket reminder
- Gebruik /webhooks/send-notification endpoint

#### N8N-002: Weekly Report Workflow updaten
- Voeg email verzending toe voor rapport
- Format rapport als HTML email

---

## 🏁 Definition of Done
- Alle acceptatiecriteria afgevinkt
- n8n workflows getest en actief
- Email templates getest
- Settings pagina werkend
- PWA installeerbaar op mobiel
