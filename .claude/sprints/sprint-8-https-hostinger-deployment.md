Hier is de aangepaste **Sprint 7** met tekstknoppen en sliders in plaats van emoji's, zoals gevraagd.

## 📋 Sprint 7: Dagboek Optimalisatie - Health App UX met Tekstknoppen (Weken 13-14)

**Bestand:** `sprint-7-dagboek-health-ux-tekstknoppen.md`

```markdown
# Sprint 7: Dagboek Optimalisatie - Health App UX met Tekstknoppen (Weken 13-14)

## Sprint Doel
Het dagboekdeel van de app volledig herontwerpen naar de intuïtieve UX van de iPhone Gezondheid-app, maar dan **met tekstknoppen en sliders** in plaats van emoji's. Gebruikers kunnen met simpele tekstknoppen hun gemoedstoestand vastleggen, met categorisatie van emoties en een aangenaam/onaangenaam schaal (slider), met optionele tekstuele toelichting.

## 🎯 Waarom deze Sprint?
Het huidige dagboek werkt met tekstinvoer, wat:
- ❌ Te veel interpretatie vraagt van gebruikers
- ❌ Niet consistent is (iedereen beschrijft anders)
- ❌ Moeilijk te analyseren is voor patronen
- ❌ Hoge drempel heeft ("moet ik nu iets schrijven?")

De iPhone Gezondheid-app bewijst dat het anders kan:
- ✅ Simpele knoppen, snel in te vullen
- ✅ Gestandaardiseerde emoties (minder interpretatie)
- ✅ Aangenaam/onaangenaam slider (nuance)
- ✅ Optionele tekst (alleen als gebruiker wil)
- ✅ Lagere drempel = vaker invullen

**Afwijking van Gezondheid-app**: Waar de Gezondheid-app emoji's gebruikt, gebruiken wij **duidelijke tekstknoppen** voor maximale helderheid en toegankelijkheid.

## 📊 Team Capaciteit
- Platform Squad: 10 story points
- Backend Squad: 18 story points
- Frontend Squad: 28 story points (+2 door extra slider component)
- UX/Design: 12 story points
- QA Squad: 14 story points

## 🎨 UX Design Stories

#### UX-001: Emotie Bibliotheek Ontwerp met Tekstknoppen (4 punten)
**Als** UX designer  
**Wil ik** een complete emotiebibliotheek ontwerpen met tekstknoppen  
**Zodat** gebruikers een duidelijke, herkenbare set emoties hebben om uit te kiezen

**Acceptatie Criteria:**
- [x] 12-16 kernemoties geselecteerd (gebaseerd op psychologische modellen)
- [x] Elke emotie krijgt een **duidelijk tekstlabel** (geen emoji)
- [x] Emoties gegroepeerd in categorieën (positief/neutraal/negatief)
- [x] Consistent kleurenschema (groen=positief, geel=neutraal, rood=negatief)
- [x] Knoppen hebben voldoende contrast en zijn goed leesbaar
- [x] Getest met gebruikers op herkenbaarheid en leesbaarheid
- [x] Documentatie voor developers (welke tekst, kleur, groep)

**Beschrijving:**
Deze story ontwerpt de basisemotieset met tekstknoppen in plaats van emoji's. Gebaseerd op psychologische modellen (zoals Plutchik of Ekman) maar vertaald naar herkenbare dagelijkse emoties. Elke emotie krijgt een vast tekstlabel, kleur en categorie zodat de hele app consistent is.

**Emotieset met tekstknoppen (concept)**:

| Categorie | Emoties (tekstknoppen) |
|-----------|------------------------|
| **Positief** | Blij, Kalm, Opgewekt, Zelfverzekerd, Dankbaar, Ontspannen |
| **Neutraal** | Neutraal, Bedachtzaam, Moe, Afwezig, Geconcentreerd |
| **Negatief** | Verdrietig, Boos, Angstig, Gestrest, Teleurgesteld, Gefrustreerd |

**Knop ontwerp**:
- Hoekige of afgeronde knoppen (A/B testen)
- Witte tekst op gekleurde achtergrond
- Voldoende padding voor touch doelen (minimaal 44x44px)
- Hover/active states voor feedback

#### UX-002: Aangenaam/Onaangenaam Slider Ontwerp (3 punten)
**Als** UX designer  
**Wil ik** een intuïtieve slider voor aangenaam/onaangenaam  
**Zodat** gebruikers nuance kunnen aangeven met een vloeiende beweging

**Acceptatie Criteria:**
- [x] Continue slider van 0-10 of 0-100
- [x] Visuele representatie (kleurverloop van rood naar groen)
- [x] Tekstlabels onder de slider ("Zeer onaangenaam" links, "Neutraal" midden, "Zeer aangenaam" rechts)
- [x] Huidige waarde wordt getoond (bijv. 7/10)
- [x] Toont altijd de gekozen emotie in de context
- [x] Werkt op zowel mobile (vegen) als desktop (slepen)
- [x] Getest op begrijpelijkheid

**Beschrijving:**
De slider voegt nuance toe aan de basisemotie. "Blij" kan immers mild blij of extatisch zijn. De gebruiker ziet een slider met kleurverloop van rood (onaangenaam) naar groen (aangenaam), met duidelijke tekstlabels.

**Slider ontwerp**:
```
Zeer onaangenaam    Neutraal    Zeer aangenaam
    [😖]              [😐]           [😊]
    ├─────────────────┼─────────────────┤
    ●───────────────┴─────────────────┘
    ↑
  Huidige positie (7 - aangenaam)
```

#### UX-003: Factoren Bibliotheek met Tekstknoppen (3 punten)
**Als** UX designer  
**Wil ik** een set herkenbare factoren die stemming beïnvloeden  
**Zodat** gebruikers context kunnen geven zonder te typen

**Acceptatie Criteria:**
- [x] 8-10 veelvoorkomende factoren geselecteerd
- [x] Elk met **duidelijk tekstlabel** (geen iconen)
- [x] Knoppen met subtiele icoontjes optioneel, maar tekst primair
- [x] Meerdere factoren tegelijk selecteerbaar
- [x] Optioneel "Anders, namelijk" veld met tekstinvoer
- [x] Getest op herkenbaarheid

**Beschrijving:**
In de Gezondheid-app kun je factoren toevoegen zoals "werk", "vrienden", "gezondheid". Deze story ontwerpt een vergelijkbare set voor onze app, maar dan met duidelijke tekstknoppen zodat gebruikers snel context kunnen geven zonder te hoeven typen.

**Factoren met tekstknoppen (concept)**:
- Werk/Studie
- Familie
- Vrienden
- Gezondheid
- Financiën
- Thuis
- Doelen
- Vrije tijd
- Anders (met tekstveld)

**Knop ontwerp**:
- Kleinere knoppen dan emoties (tag-achtig)
- Grijze achtergrond, donkere tekst
- Bij selectie: gekleurde achtergrond (blauw)
- Afgeronde hoeken (pill shape)

#### UX-004: Complete Flow Prototype met Tekstknoppen (2 punten)
**Als** UX designer  
**Wil ik** een klikbaar prototype van de hele flow met tekstknoppen  
**Zodat** we kunnen testen met gebruikers voor ontwikkeling

**Acceptatie Criteria:**
- [x] Figma prototype met alle schermen (alleen tekst, geen emoji's)
- [x] Flow van begin tot eind (emotie → slider → factoren → notitie)
- [x] Mobile en desktop variant
- [x] Getest met 5 gebruikers op begrijpelijkheid
- [x] Feedback verwerkt in definitief ontwerp

**Beschrijving:**
Voordat er code wordt geschreven, maken we een volledig prototype dat we kunnen testen met echte gebruikers. Zo ontdekken we problemen vroeg en kunnen we het ontwerp optimaliseren voordat developers ermee beginnen.

### Platform Squad (10 punten)

#### PLAT-023: Database Uitbreiding voor Emoties (5 punten)
**Als** platform engineer  
**Wil ik** de database uitbreiden voor het nieuwe dagboekformaat  
**Zodat** we emoties, sliders en factoren kunnen opslaan

**Acceptatie Criteria:**
- [x] MoodEntry tabel met alle velden (emotie_id, slider_waarde (0-100), factoren, notitie)
- [x] Emotions tabel met alle beschikbare emoties (tekstlabel, kleur, categorie)
- [x] Factors tabel met alle beschikbare factoren (tekstlabel)
- [x] Migraties voor bestaande data (conversie van tekst naar nieuw formaat)
- [x] Indexen voor snelle analyse (emotie, slider_waarde, datum)

**Beschrijving:**
Het huidige dagboek slaat tekst op. Het nieuwe dagboek slaat gestructureerde data op: welke emotie (tekst), slider waarde (0-100), welke factoren, en optioneel tekst.

**Nieuw datamodel**:
```mermaid
erDiagram
    MOOD_ENTRY {
        id uuid
        user_id uuid
        emotion_id uuid
        slider_value int 0-100
        notes text optional
        created_at timestamp
    }
    
    EMOTION {
        id uuid
        label string      "Bijv. 'Blij'"
        color string      "Hex code"
        category string   "positief/neutraal/negatief"
        active boolean
        sort_order int
    }
    
    FACTOR {
        id uuid
        label string      "Bijv. 'Werk/Studie'"
        active boolean
        sort_order int
    }
```

### Backend Squad (18 punten)

#### BACK-027: Mood Entry API (5 punten)
**Als** backend developer  
**Wil ik** een complete API voor mood entries met slider  
**Zodat** de frontend emoties kan opslaan en ophalen

**Acceptatie Criteria:**
- [x] POST /api/mood (nieuwe entry met emotie_id, slider_value, factor_ids, notes)
- [x] GET /api/mood (entries met filters op datum)
- [x] GET /api/mood/:id (detail met alle velden)
- [x] PUT /api/mood/:id (wijzigen)
- [x] DELETE /api/mood/:id (verwijderen)
- [x] Validatie: slider_value 0-100, max 5 factoren

#### BACK-028: Emoties & Factoren API (3 punten)
**Als** backend developer  
**Wil ik** endpoints voor het ophalen van beschikbare emoties en factoren  
**Zodat** de frontend altijd de actuele lijst toont

**Acceptatie Criteria:**
- [x] GET /api/emotions (alle actieve emoties met label, kleur, categorie)
- [x] GET /api/factors (alle actieve factoren met label)
- [x] Gesorteerd op sort_order
- [x] Cachebaar (omdat ze weinig wijzigen)

#### BACK-029: Analyse API voor Dagboekdata (5 punten)
**Als** backend developer  
**Wil ik** endpoints voor het analyseren van dagboekdata met slider  
**Zodat** het dashboard inzichten kan tonen

**Acceptatie Criteria:**
- [x] GET /api/mood/trends (gemiddelde slider-waarde over tijd)
- [x] GET /api/mood/distribution (verdeling over emoties)
- [x] GET /api/mood/correlations (correlatie tussen factoren en slider-waarde)
- [x] GET /api/mood/heatmap (kalender met kleur op basis van slider)
- [x] Filter op periode (week/maand/jaar)

**Voorbeelden van inzichten**:
- "Je gemiddelde stemming was deze week 72/100 (aangenaam)"
- "Op dagen dat je 'Werk' selecteert, is je stemming gemiddeld 15 punten lager"
- "Je stemming is de afgelopen maand verbeterd van 65 naar 78"

#### BACK-030: Rapportage Generator voor Dagboek (5 punten)
**Als** backend developer  
**Wil ik** een rapportagegenerator specifiek voor dagboekdata met slider  
**Zodat** gebruikers wekelijkse samenvattingen krijgen

**Acceptatie Criteria:**
- [x] Weekrapport met gemiddelde slider-waarde en meest gekozen emoties
- [x] Inzichten over patronen (beste/slechtste dag o.b.v. slider)
- [x] Vergelijking met vorige week (+5% verbetering)
- [x] Factoren die samenhangen met hoge/lage slider-waarden
- [x] PDF export mogelijkheid
- [x] Push notificatie bij nieuw rapport

### Frontend Squad (28 punten)

#### FRONT-027: Emotie Keuze Component met Tekstknoppen (6 punten)
**Als** frontend developer  
**Wil ik** een component voor het kiezen van emoties met tekstknoppen  
**Zodat** gebruikers snel hun emotie kunnen selecteren

**Acceptatie Criteria:**
- [x] Grid van tekstknoppen (4x4 of 3x5 afhankelijk van scherm)
- [x] Elke knop toont **alleen tekst** (geen emoji) met achtergrondkleur
- [x] Kleuren conform categorie (groen/geel/rood)
- [x] Hover/tap effect
- [x] Geselecteerde emotie krijgt visuele bevestiging (donkere rand, checkmark)
- [x] Scrollbaar bij veel emoties
- [x] Responsive (past aan scherm)

**Visueel ontwerp**:
```
┌─────────────────────────┐
│ Hoe voel je je?         │
├─────────────────────────┤
│ ┌────────┐ ┌────────┐   │
│ │  Blij  │ │  Kalm  │   │
│ │ (groen)│ │ (groen)│   │
│ └────────┘ └────────┘   │
│ ┌────────┐ ┌────────┐   │
│ │Opgewekt│ │Dankbaar│   │
│ │ (groen)│ │ (groen)│   │
│ └────────┘ └────────┘   │
│ ┌────────┐ ┌────────┐   │
│ │Neutraal│ │  Moe   │   │
│ │ (geel) │ │ (geel) │   │
│ └────────┘ └────────┘   │
│ ┌────────┐ ┌────────┐   │
│ │Verdrie-│ │  Boos  │   │
│ │  tig   │ │ (rood) │   │
│ │ (rood) │ └────────┘   │
│ └────────┘              │
└─────────────────────────┘
```

#### FRONT-028: Aangenaam/Onaangenaam Slider Component (6 punten)
**Als** frontend developer  
**Wil ik** een slider component voor de aangenaam/onaangenaam schaal  
**Zodat** gebruikers nuance kunnen aangeven met een vloeiende beweging

**Acceptatie Criteria:**
- [x] Continue HTML5 range slider of custom implementatie
- [x] Bereik 0-100 met initiële waarde 50 (neutraal)
- [x] Kleurverloop van rood (links) naar groen (rechts)
- [x] Drie tekstlabels onder de slider: "Onaangenaam", "Neutraal", "Aangenaam"
- [x] Huidige waarde wordt getoond (bijv. "75 - Aangenaam")
- [x] Toont de gekozen emotie als context ("Je voelt je: Blij - 75")
- [x] Werkt met touch (vegen) en mouse (slepen)
- [x] Live update van waarde tijdens slepen

**Visueel ontwerp**:
```
┌─────────────────────────────────┐
│ Je voelt je: Blij               │
├─────────────────────────────────┤
│                                  │
│  Onaangenaam    Neutraal    Aangenaam
│  └──────────────┼──────────────┘
│  ○──────────────┼──────────────┘
│                 ↑
│            Huidig: 75
│            (Aangenaam)
└─────────────────────────────────┘
```

#### FRONT-029: Factoren Selectie Component met Tekstknoppen (4 punten)
**Als** frontend developer  
**Wil ik** een component voor het kiezen van factoren met tekstknoppen  
**Zodat** gebruikers context kunnen geven zonder typen

**Acceptatie Criteria:**
- [x] Grid van tekstknoppen (pill-shaped)
- [x] Elke knop toont tekstlabel (bijv. "Werk/Studie")
- [x] Optioneel klein icoontje naast tekst, maar tekst is primair
- [x] Meerdere factoren tegelijk selecteerbaar
- [x] Geselecteerde factoren krijgen blauwe achtergrond
- [x] Maximaal 5 factoren (toon waarschuwing bij overschrijding)
- [x] Optioneel "Anders" veld met tekstinvoer
- [x] Responsive (wrap bij klein scherm)

**Visueel ontwerp**:
```
┌─────────────────────────┐
│ Wat is van invloed?     │
│ (meerdere mogelijk)     │
├─────────────────────────┤
│ ┌────────────┐ ┌────────────┐
│ │Werk/Studie │ │  Familie   │
│ └────────────┘ └────────────┘
│ ┌────────────┐ ┌────────────┐
│ │  Vrienden  │ │ Gezondheid │
│ └────────────┘ └────────────┘
│ ┌────────────┐ ┌────────────┐
│ │ Financiën  │ │   Thuis    │
│ └────────────┘ └────────────┘
│ ┌────────────┐ ┌────────────┐
│ │  Doelen    │ │ Vrije tijd │
│ └────────────┘ └────────────┘
│ ┌────────────────────────┐
│ │ Anders: ______________ │
│ └────────────────────────┘
└─────────────────────────┘
```

#### FRONT-030: Optionele Notitie Component (2 punten)
**Als** frontend developer  
**Wil ik** een component voor optionele tekstnotities  
**Zodat** gebruikers extra context kunnen geven als ze willen

**Acceptatie Criteria:**
- [x] "Voeg notitie toe" knop die tekstveld opent
- [x] Tekstarea met karakterlimiet (500)
- [x] Toon resterende karakters
- [x] Optioneel, niet verplicht

#### FRONT-031: Complete Dagboek Flow met Slider (6 punten)
**Als** frontend developer  
**Wil ik** de volledige flow van emotie tot opslag met slider  
**Zodat** gebruikers in één sessie hun stemming kunnen vastleggen

**Acceptatie Criteria:**
- [x] Stapsgewijze flow (emotie → slider → factoren → notitie → bevestiging)
- [x] Terugknop naar vorige stap
- [x] Voortgangsindicator (stap 1 van 4)
- [x] In stap 2 (slider) wordt de gekozen emotie getoond
- [x] Opslaan naar API met alle data (emotie_id, slider_value, factor_ids, notes)
- [x] Bevestigingsscherm na opslaan
- [x] Foutafhandeling (bij netwerkproblemen)

**Flow**:
```
Stap 1: Emotie kiezen (tekstknop)
    ↓
Stap 2: Slider (0-100) met context "Je voelt je: [emotie]"
    ↓
Stap 3: Factoren kiezen (tekstknoppen)
    ↓
Stap 4: Optionele notitie
    ↓
Bevestiging: "Opgeslagen! Je voelde je [emotie] met [waarde]/100"
```

#### FRONT-032: Dagboek Overzicht met Kalender (4 punten)
**Als** frontend developer  
**Wil ik** een kalenderoverzicht van alle dagboekentries  
**Zodat** gebruikers hun emoties over tijd kunnen zien

**Acceptatie Criteria:**
- [x] Maandkalender met kleurcodering per dag (rood-groen o.b.v. slider)
- [x] Bij klikken op dag: details van die dag
- [x] Toon tekst van meest voorkomende emotie (geen emoji)
- [x] Kleur gebaseerd op gemiddelde slider-waarde (rood=laag, groen=hoog)
- [x] Navigatie tussen maanden
- [x] Vandaag-knop

**Visueel ontwerp**:
```
┌─────────────────────────┐
│     Maart 2026          │
├─────────────────────────┤
│ ma di wo do vr za zo    │
│                   1     │
│                    │    │
│ 2  3  4  5  6  7  8     │
│ │  │  │  │  │  │  │     │
│ 9 10 11 12 13 14 15     │
│16 17 18 19 20 21 22     │
│23 24 25 26 27 28 29     │
│30 31                    │
│                         │
│ Legenda:                 │
│ ■ = Blij (75-100)       │
│ ■ = Neutraal (40-74)    │
│ ■ = Verdrietig (0-39)   │
└─────────────────────────┘
```

### QA Squad (14 punten)

#### QA-023: UX Testen met Gebruikers (4 punten)
**Als** QA engineer  
**Wil ik** gebruikertests uitvoeren met het nieuwe dagboek (tekstknoppen + slider)  
**Zodat** we weten of het echt makkelijker is dan tekst

**Acceptatie Criteria:**
- [x] Test met 10 gebruikers
- [x] Test begrip van slider (weten ze wat 0-100 betekent?)
- [x] Test snelheid van invoer (seconden)
- [x] Test of tekstknoppen duidelijk genoeg zijn (geen emoji nodig?)
- [x] Tevredenheidsscore (1-10)
- [x] Rapport met bevindingen

#### QA-024: Slider Precisie Tests (3 punten)
**Als** QA engineer  
**Wil ik** tests voor de slider functionaliteit  
**Zodat** gebruikers nauwkeurig kunnen aangeven

**Acceptatie Criteria:**
- [x] Test op verschillende devices (touch, mouse)
- [x] Test precisie (kan gebruiker 42 selecteren?)
- [x] Test responsive gedrag
- [x] Test met toetsenbord (pijltjes)
- [x] Test dat waarde correct wordt opgeslagen

#### QA-025: Data Validatie Tests (3 punten)
**Als** QA engineer  
**Wil ik** tests voor data validatie  
**Zodat** er geen ongeldige data in de database komt

**Acceptatie Criteria:**
- [x] Test slider buiten 0-100
- [x] Test met te veel factoren (>5)
- [x] Test met te lange notities (>500)
- [x] Test met ontbrekende emotie
- [x] Test met SQL injectie

#### QA-026: Migratie Tests (2 punten)
**Als** QA engineer  
**Wil ik** tests voor de datamigratie  
**Zodat** bestaande gebruikers geen data verliezen

**Acceptatie Criteria:**
- [x] Test conversie van tekst naar emotie+slider
- [x] Controle dat alle entries zijn gemigreerd
- [x] Test met edge cases (lege entries)

#### QA-027: Cross-browser & Device Tests (2 punten)
**Als** QA engineer  
**Wil ik** tests op verschillende devices en browsers  
**Zodat** de dagboekflow overal goed werkt

**Acceptatie Criteria:**
- [x] Test op iPhone (touch, slider)
- [x] Test op Android (touch, slider)
- [x] Test op tablet
- [x] Test op desktop (mouse, toetsenbord)

## 📊 Sprint Backlog Totaal: 92 punten

| Squad | Punten |
|-------|--------|
| UX/Design | 12 |
| Platform | 10 |
| Backend | 18 |
| Frontend | 28 |
| QA | 14 |
| **Totaal** | **82** |

## 🔍 Dependencies & Risico's

### Dependencies
| Story | Afhankelijk van | Reden |
|-------|-----------------|-------|
| Alle frontend | UX-001 t/m UX-004 | Ontwerp moet klaar zijn |
| FRONT-027 | BACK-028 | Emoties uit API |
| FRONT-028 | - | Slider is los component |
| FRONT-031 | Alle andere frontend | Bouwt op componenten |

### Risico's

| Risico | Impact | Mitigatie |
|--------|--------|-----------|
| **Slider begrijpen gebruikers wel?** | Medium | Uitgebreide UX-testen, tooltips |
| **Tekstknoppen minder expressief dan emoji** | Laag | Gebruikers wennen snel, kleur helpt |
| **Migratie van oude data** | Hoog | Backup, rollback, handmatige correctie optie |

## 🎯 Sprint Goals
1. ✅ Dagboek met tekstknoppen voor emoties
2. ✅ Slider (0-100) voor aangenaam/onaangenaam
3. ✅ Factoren met tekstknoppen
4. ✅ Optionele notities
5. ✅ Kalender met kleurcodering o.b.v. slider
6. ✅ Alle data gestructureerd opgeslagen

## 📈 Definition of Done
- [x] UX ontwerp getest met gebruikers (slider begrepen)
- [x] Database migratie succesvol
- [x] Alle API endpoints werken
- [x] Slider werkt op alle devices
- [x] Flow volledig doorlopen van emotie tot opslag
- [x] Cross-browser tests geslaagd

## 🚀 Sprint Review (Einde Sprint)
**Demo onderdelen:**
1. Emotie kiezen met tekstknoppen
2. Slider gebruiken voor nuance
3. Factoren selecteren
4. Kalender met kleurcodering
5. Analyses (gemiddelde slider per dag/week)
```

## ✅ Samenvatting Sprint 7 (Tekstknoppen versie)

| Onderdeel | Emoji-versie | Tekstknop-versie |
|-----------|--------------|------------------|
| **Emoties** | 😊 Blij | [Blij] (tekstknop) |
| **Nuance** | 5-punts schaal met emoji | Continue slider 0-100 |
| **Factoren** | Iconen + tekst | Tekstknoppen (primair) |
| **Toegankelijkheid** | Goed | **Beter** (duidelijke tekst) |
| **Internationalisatie** | Emoji universeel | Tekst moet vertaald |
| **Expressiviteit** | Hoog | Middel (kleur helpt) |

**Deze versie is beter voor:**
- Oudere gebruikers die emoji's niet begrijpen
- Professionele context (zakelijke coaching)
- Toegankelijkheid (schermlezers)
- Duidelijkheid (geen interpretatie van emoji's)