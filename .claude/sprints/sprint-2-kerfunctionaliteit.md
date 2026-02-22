# Sprint 2: Kernfunctionaliteit met Signal Stores (Weken 3-4)

## Sprint Doel
De core coaching functionaliteit bouwen met AI integratie, authenticatie, en state management met **Angular Signal Stores**.

## 🎯 Waarom Signal Stores?
- **Eenvoudiger**: Geen boilerplate zoals NgRx
- **Performanter**: Gebaseerd op Angular signals
- **Type-safe**: Volledige TypeScript ondersteuning
- **Lichter**: Minder dependencies
- **Toekomst**: Angular's officiële richting

## 📊 Team Capaciteit
- Platform Squad: 15 story points
- Backend Squad: 25 story points
- Frontend Squad: 22 story points
- QA Squad: 12 story points

## 📋 Geselecteerde Stories

### Platform Squad (15 punten)

#### PLAT-004: Redis Cache Setup (5 punten)
**Als** platform engineer  
**Wil ik** Redis voor caching en sessieopslag  
**Zodat** de applicatie schaalbaar is

**Acceptatie Criteria:**
- [x] Redis container in docker-compose
- [x] RedisService in data-access library
- [x] Cache module in NestJS
- [x] TTL configuratie per cache type
- [x] Fallback mechanisme bij Redis uitval
- [x] Monitoring via Redis CLI

**Taken:**
1. Voeg Redis toe aan docker-compose
2. Maak RedisService met connectie
3. Implementeer cache decorators
4. Configureer TTL voor sessies
5. Test failover scenario

#### PLAT-005: n8n Productie Configuratie (5 punten)
**Als** platform engineer  
**Wil ik** n8n professioneel configureren  
**Zodat** workflows betrouwbaar draaien

**Acceptatie Criteria:**
- [x] n8n met PostgreSQL als database
- [x] Persistentie voor workflows
- [x] Environment variabelen voor credentials
- [x] Backup strategie voor workflows
- [x] Logging naar bestand
- [x] Healthchecks geconfigureerd

**Taken:**
1. Configureer n8n met PostgreSQL
2. Setup volumes voor workflows
3. Maak .env template voor n8n
4. Configureer logging
5. Test backup/restore

#### PLAT-006: Monitoring Setup (5 punten)
**Als** platform engineer  
**Wil ik** basis monitoring  
**Zodat** we problemen vroeg detecteren

**Acceptatie Criteria:**
- [x] Prometheus metrics endpoint
- [x] Grafana dashboard voor basics
- [x] Log aggregatie (ELK of simpel)
- [x] Alerts voor kritieke services
- [x] Uptime monitoring
- [x] Performance metrics

**Taken:**
1. Voeg Prometheus metrics toe aan API
2. Configureer Grafana
3. Setup logging aggregatie
4. Maak alert regels
5. Test monitoring

### Backend Squad (25 punten)

#### BACK-005: JWT Authenticatie (8 punten)
**Als** backend developer  
**Wil ik** complete JWT authenticatie  
**Zodat** gebruikers veilig kunnen inloggen

**Acceptatie Criteria:**
- [x] Register endpoint met SMS code (mock)
- [x] Login endpoint met JWT tokens
- [x] Refresh token mechanisme
- [x] JwtAuthGuard voor protected routes
- [x] Rate limiting op auth endpoints
- [x] Unit tests voor auth flow

**Taken:**
1. Installeer @nestjs/jwt, @nestjs/passport
2. Maak AuthModule met controller/service
3. Implementeer JwtStrategy en LocalStrategy
4. Maak guards voor protected routes
5. Implementeer refresh token logic
6. Schrijf unit tests

#### BACK-006: AI Agent Service (8 punten)
**Als** backend developer  
**Wil ik** een AI agent service die met n8n praat  
**Zodat** we AI-coaching kunnen integreren

**Acceptatie Criteria:**
- [x] N8nService voor communicatie met n8n
- [x] Retry logic met exponential backoff
- [x] Timeout handling
- [x] Fallback responses bij falen
- [x] Queue systeem voor requests
- [x] Logging van alle AI interacties

**Taken:**
1. Maak N8nService met HTTP client
2. Implementeer retry mechanisme
3. Voeg timeout configuratie toe
4. Maak fallback responses
5. Implementeer request queue met Bull
6. Voeg logging toe

#### BACK-007: Conversation Manager (5 punten)
**Als** backend developer  
**Wil ik** een conversation manager  
**Zodat** gesprekken correct worden opgeslagen

**Acceptatie Criteria:**
- [x] ConversationService voor CRUD
- [x] Context ophalen voor AI
- [x] Message opslag per conversatie
- [x] Automatisch nieuwe conversatie starten
- [x] Conversation status management
- [x] Tests voor alle operaties

**Taken:**
1. Implementeer ConversationService
2. Voeg methode toe voor context ophalen
3. Implementeer message opslag
4. Voeg status updates toe
5. Schrijf unit tests

#### BACK-008: Check-in Service (4 punten)
**Als** backend developer  
**Wil ik** een check-in service  
**Zodat** dagelijkse check-ins kunnen worden opgeslagen

**Acceptatie Criteria:**
- [x] CheckInService met CRUD
- [x] Emoji validatie
- [x] Trends analyse per gebruiker
- [x] Koppeling met conversation
- [x] Aggregatie functies
- [x] Tests

**Taken:**
1. Implementeer CheckInService
2. Voeg emoji validatie toe
3. Maak trend analyse functies
4. Koppel aan conversations
5. Schrijf tests

### Frontend Squad (22 punten) - AANGEPAST MET SIGNAL STORES

#### FRONT-005: Authenticatie Flow met Signal Store (8 punten)
**Als** frontend developer  
**Wil ik** een complete login/registratie flow met signal store  
**Zodat** gebruikers kunnen inloggen met reactieve state

**Acceptatie Criteria:**
- [x] AuthSignalStore met: user, isAuthenticated, loading, error
- [x] Login component met telefoon invoer
- [x] Verificatie code component
- [x] Registratie component
- [x] Auth guard voor protected routes (gebaseerd op signal)
- [x] Token opslag met auto-sync naar signal store
- [x] Auto-refresh van tokens
- [x] Unit tests voor store en componenten

**Taken:**
1. Installeer @angular/core (heeft signals al ingebouwd)
2. Maak `auth.store.ts` met signal store:
```typescript
import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  token: string | null;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: null,
    loading: false,
    error: null,
    token: localStorage.getItem('token')
  }),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => !!user() && !!token()),
    userName: computed(() => user()?.name || 'Gebruiker')
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    async login(phone: string) {
      patchState(store, { loading: true, error: null });
      try {
        const response = await authService.requestCode(phone).toPromise();
        patchState(store, { loading: false, verificationSent: true });
        return response;
      } catch (error) {
        patchState(store, { loading: false, error: error.message });
      }
    },
    
    async verifyCode(phone: string, code: string) {
      patchState(store, { loading: true, error: null });
      try {
        const response = await authService.verifyCode(phone, code).toPromise();
        localStorage.setItem('token', response.accessToken);
        patchState(store, { 
          user: response.user,
          token: response.accessToken,
          loading: false 
        });
      } catch (error) {
        patchState(store, { loading: false, error: error.message });
      }
    },
    
    logout() {
      localStorage.removeItem('token');
      patchState(store, { user: null, token: null });
    }
  }))
);