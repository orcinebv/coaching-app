# Sprint 6: Enterprise Readiness (Weken 11-12)

## Sprint Doel
De coaching app wordt klaar voor professioneel gebruik door organisaties en coaches. We voegen multi-tenancy, rolgebaseerde toegang, auditlogging, GDPR-compliance en een coach/admin dashboard toe. De infrastructuur wordt enterprise-grade.

## 🎯 Focus van deze Sprint
- 🏢 **Multi-tenancy** – Organisaties kunnen eigen omgeving beheren met coaches en coachees
- 🔐 **Role-Based Access Control** – Admin/Coach/User rollen met fine-grained permissions
- 📋 **Audit Logging** – Volledige audittrail van alle acties
- 🛡️ **GDPR Compliance** – Data export, account verwijdering, privacy instellingen
- 👨‍💼 **Coach Dashboard** – Coaches kunnen meerdere coachees monitoren
- ⚙️ **Admin Panel** – Gebruikersbeheer, AI-kosten, systeemstatus
- 🚀 **Onboarding Wizard** – Nieuwe gebruikers stap-voor-stap begeleiden

## 📊 Team Capaciteit
- Platform Squad: 18 story points
- Backend Squad: 25 story points
- Frontend Squad: 22 story points
- QA Squad: 11 story points

## 📋 Geselecteerde Stories

### Platform Squad (18 punten)

#### PLAT-018: Multi-tenancy Infrastructuur (6 punten)
**Als** platform engineer
**Wil ik** een multi-tenant architectuur
**Zodat** meerdere organisaties de app onafhankelijk kunnen gebruiken

**Acceptatie Criteria:**
- [x] Organization model in database (naam, slug, plan, limiet gebruikers)
- [x] Alle user data scoped aan organization
- [x] Organization aanmaken via admin
- [x] Gebruikers uitnodigen naar organization
- [x] Coach toewijzen aan coachees binnen org

**Taken:**
1. Organization + UserOrganization modellen in Prisma schema
2. Backend Organization module met CRUD
3. User-to-organization koppeling
4. Coach-coachee relatie

#### PLAT-019: GDPR & Data Privacy (5 punten)
**Als** platform engineer
**Wil ik** volledige GDPR-compliance
**Zodat** gebruikers controle hebben over hun data

**Acceptatie Criteria:**
- [x] Data export endpoint (alle persoonlijke data als JSON)
- [x] Account verwijdering (soft delete + anonimisering)
- [x] Audit log van eigen acties
- [x] Privacy instellingen pagina
- [x] Data retention policies

**Taken:**
1. Export endpoint GET /users/me/export
2. Account delete endpoint DELETE /users/me/account
3. Data anonimisering bij verwijdering
4. Privacy settings UI

#### PLAT-020: Cache Optimalisatie (4 punten)
**Als** platform engineer
**Wil ik** verbeterde cachestrategie
**Zodat** AI-kosten dalen en performance verbetert

**Acceptatie Criteria:**
- [x] Verbeterde TTL's per data type
- [x] Cache invalidation bij data wijzigingen
- [x] Cache hit rate monitoring
- [x] Specifieke caching voor AI-resultaten

**Taken:**
1. Review huidige Redis caching implementatie
2. Optimaliseren TTL strategie
3. Cache warming voor frequente queries
4. Monitoring cache effectiveness

#### PLAT-021: Audit Logging (3 punten)
**Als** platform engineer
**Wil ik** een volledige audittrail
**Zodat** we weten wie wat wanneer heeft gedaan

**Acceptatie Criteria:**
- [x] AuditLog model in database
- [x] NestJS interceptor logt schrijf-operaties
- [x] Admin kan audit logs inzien
- [x] Gebruiker kan eigen audit log inzien

**Taken:**
1. AuditLog model in Prisma
2. AuditInterceptor implementeren
3. Admin endpoint voor audit logs
4. User endpoint voor eigen audit log

### Backend Squad (25 punten)

#### BACK-022: Role-Based Access Control (7 punten)
**Als** backend developer
**Wil ik** RBAC implementeren
**Zodat** admins, coaches en gebruikers andere rechten hebben

**Acceptatie Criteria:**
- [x] Role enum: ADMIN, COACH, USER
- [x] @Roles() decorator voor endpoints
- [x] RolesGuard implementatie
- [x] Admin-only endpoints beschermd
- [x] Coach-only endpoints beschermd
- [x] Rol wijzigen via admin endpoint

**Taken:**
1. Role enum definieren
2. Roles decorator + RolesGuard
3. Bestaande endpoints beschermen
4. Admin endpoint voor rol-wijziging

#### BACK-023: Admin Module (6 punten)
**Als** backend developer
**Wil ik** admin-functionaliteit
**Zodat** beheerders de applicatie kunnen beheren

**Acceptatie Criteria:**
- [x] GET /admin/users – alle gebruikers met paginering
- [x] PATCH /admin/users/:id/role – rol wijzigen
- [x] PATCH /admin/users/:id/deactivate – gebruiker deactiveren
- [x] GET /admin/stats – platform statistieken
- [x] GET /admin/ai-costs – AI-kosten per gebruiker
- [x] GET /admin/audit-logs – alle audit logs

**Taken:**
1. Admin module aanmaken
2. Gebruikersbeheer endpoints
3. Platform statistieken aggregatie
4. AI-kosten overzicht
5. Audit log viewer

#### BACK-024: Coach Dashboard API (6 punten)
**Als** backend developer
**Wil ik** een coach-specifieke API
**Zodat** coaches hun coachees kunnen monitoren

**Acceptatie Criteria:**
- [x] GET /coach/coachees – lijst van coachees
- [x] GET /coach/coachees/:id/overview – volledig overzicht coachee
- [x] GET /coach/coachees/:id/checkins – check-ins van coachee
- [x] GET /coach/alerts – crisis alerts over alle coachees
- [x] POST /coach/coachees/:id/notes – coaching notities toevoegen

**Taken:**
1. Coach module aanmaken
2. Coachee overzicht endpoints
3. Crisis alert aggregatie
4. Coaching notities functionaliteit

#### BACK-025: GDPR Endpoints (6 punten)
**Als** backend developer
**Wil ik** GDPR-compliance endpoints
**Zodat** gebruikers hun rechten kunnen uitoefenen

**Acceptatie Criteria:**
- [x] GET /users/me/export – volledige data export (JSON)
- [x] DELETE /users/me/account – account verwijderen + anonimiseren
- [x] GET /users/me/audit-log – eigen activiteiten log
- [x] Data anonimisering (email, naam vervangen door hashes)
- [x] Export bevat: profiel, check-ins, goals, journal, conversations, exercises

**Taken:**
1. Export service implementeren
2. Account deletion + anonimisering
3. Audit log endpoint voor user
4. Download als JSON bestand

### Frontend Squad (22 punten)

#### FRONT-023: Admin Panel (6 punten)
**Als** frontend developer
**Wil ik** een admin dashboard
**Zodat** beheerders de applicatie kunnen beheren

**Acceptatie Criteria:**
- [x] Route /admin (alleen voor ADMIN rol)
- [x] Gebruikerslijst met rollen en status
- [x] Rol wijzigen via dropdown
- [x] Platform statistieken (totaal users, actief, AI kosten)
- [x] Audit log viewer
- [x] AI-kosten tabel per gebruiker

**Taken:**
1. Admin feature module aanmaken
2. Gebruikerslijst component
3. Statistieken dashboard
4. Audit log component
5. Role guard voor admin route

#### FRONT-024: Coach Dashboard (5 punten)
**Als** frontend developer
**Wil ik** een coach dashboard
**Zodat** coaches hun coachees kunnen monitoren

**Acceptatie Criteria:**
- [x] Route /coach (alleen voor COACH/ADMIN rol)
- [x] Coachee kaarten met mood trend
- [x] Crisis alert badges
- [x] Doorklikken naar coachee detail
- [x] Coaching notities toevoegen

**Taken:**
1. Coach feature module
2. Coachee lijst met kaarten
3. Alert banner component
4. Coachee detail view
5. Notities functionaliteit

#### FRONT-025: Onboarding Wizard (5 punten)
**Als** frontend developer
**Wil ik** een onboarding wizard
**Zodat** nieuwe gebruikers goed van start gaan

**Acceptatie Criteria:**
- [x] Stap 1: Welkom + naam invullen
- [x] Stap 2: Coaching doelen kiezen
- [x] Stap 3: Eerste check-in doen
- [x] Stap 4: App tour (tooltips)
- [x] Voortgangsindicator (stappen)
- [x] Overslaan mogelijk (na stap 1)
- [x] Wordt getoond bij eerste login (isNewUser flag)

**Taken:**
1. Onboarding wizard component
2. Stap-component structuur
3. Progress indicator
4. App tour implementatie
5. isNewUser logica in auth

#### FRONT-026: Privacy Instellingen (GDPR) (6 punten)
**Als** frontend developer
**Wil ik** privacy instellingen
**Zodat** gebruikers GDPR-rechten kunnen uitoefenen

**Acceptatie Criteria:**
- [x] Privacy tab in Settings pagina
- [x] "Download mijn data" knop (JSON export)
- [x] "Account verwijderen" knop met bevestigingsdialoog
- [x] Overzicht van opgeslagen data categorieën
- [x] Eigen audit log (recente activiteiten)

**Taken:**
1. Privacy tab in settings
2. Data export knop + download
3. Account delete flow met confirmatie
4. Data overzicht component
5. Eigen activiteiten log

### QA Squad (11 punten)

#### QA-018: Security & RBAC Tests (4 punten)
**Als** QA engineer
**Wil ik** RBAC en security tests
**Zodat** we zeker weten dat toegangscontrole werkt

**Acceptatie Criteria:**
- [x] Test dat user-endpoints niet toegankelijk zijn als admin/coach endpoint
- [x] Test dat coach geen data van andere coaches kan zien
- [x] Test account verwijdering (data anonimisering)
- [x] Test GDPR export volledigheid

**Taken:**
1. RBAC unit tests
2. Integration tests voor admin endpoints
3. Coach isolation tests
4. GDPR compliance tests

#### QA-019: Multi-tenant Isolatie Tests (4 punten)
**Als** QA engineer
**Wil ik** tests voor data-isolatie
**Zodat** gebruikers van org A nooit data van org B kunnen zien

**Acceptatie Criteria:**
- [x] Test cross-tenant data lekkage
- [x] Test coach-coachee relatie grenzen
- [x] Test org admin rechten

**Taken:**
1. Multi-tenant isolatie tests
2. Coach-coachee boundary tests
3. Org admin scope tests

#### QA-020: End-to-End Onboarding Test (3 punten)
**Als** QA engineer
**Wil ik** een E2E test voor de onboarding flow
**Zodat** nieuwe gebruikers altijd correct worden begeleid

**Acceptatie Criteria:**
- [x] Registratie → onboarding wizard → dashboard
- [x] Wizard stappen werken correct
- [x] Skip functionaliteit werkt
- [x] IsNewUser vlag wordt correct bijgehouden

**Taken:**
1. E2E test registratie flow
2. Onboarding wizard navigatie tests
3. Wizard completion verificatie

## 📊 Sprint Backlog Totaal: 76 punten

## 🔍 Dependencies & Risico's

### Dependencies
| Story | Afhankelijk van | Reden |
|-------|-----------------|-------|
| BACK-022 | PLAT-021 | Rollen nodig voor audit logs |
| BACK-023 | BACK-022 | Admin endpoints vereisen RBAC |
| BACK-024 | PLAT-018 | Coach-coachee relatie vereist org structuur |
| FRONT-023 | BACK-023 | Admin API nodig voor admin UI |
| FRONT-024 | BACK-024 | Coach API nodig voor coach UI |
| FRONT-025 | BACK-022 | isNewUser vlag vereist auth aanpassing |
| FRONT-026 | BACK-025 | GDPR endpoints nodig voor privacy UI |

### Risico's
| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Data migratie** | Hoog | Backup voor migratie, rollback plan |
| **Breaking changes API** | Medium | Versioning, backwards compatibility |
| **Multi-tenant data lekkage** | Kritiek | Uitgebreide tests, code review |
| **Performance audit logging** | Medium | Async logging, geen blocking calls |
| **GDPR correctheid** | Hoog | Juridische review van anonimisering |

## 🎯 Sprint Goals
1. ✅ Multi-tenant architectuur operationeel
2. ✅ RBAC volledig geïmplementeerd
3. ✅ Audit logging actief
4. ✅ Coach dashboard beschikbaar
5. ✅ Admin panel beschikbaar
6. ✅ GDPR-compliant data export & verwijdering
7. ✅ Onboarding wizard voor nieuwe gebruikers

## 📈 Definition of Done
- [x] Code geschreven en lokaal getest
- [x] Unit tests slagen
- [x] Multi-tenant isolatie getest
- [x] RBAC werkt correct
- [x] GDPR export volledig
- [x] Database migratie succesvol
- [x] Code gereviewd
- [x] Gecommit naar main branch

## 🚀 Sprint Review (Einde Sprint)
**Demo onderdelen:**
1. Admin panel: gebruikersbeheer + rollen
2. Coach dashboard: coachee overzicht + alerts
3. Onboarding wizard: nieuwe gebruiker flow
4. GDPR: data export + account verwijdering
5. Audit log: activiteiten inzien
6. Multi-tenant: org aanmaken + gebruikers uitnodigen

## 🔄 Retrospective Items

**Actiepunten vanuit Sprint 5:**
- ✅ Optimaliseren van cachestrategie (PLAT-020)
- ✅ Performance tuning voor batchverwerking
- ✅ Uitbreiden van crisissignalering met meer nuance (coach alerts)

**Actiepunten voor Sprint 7 (indien van toepassing):**
- SSO/OAuth integratie (Google, Azure AD)
- API Keys voor externe integraties
- White-labeling voor enterprise klanten
- Advanced analytics (BI dashboard voor admins)
