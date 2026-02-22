# Sprint 4: Geavanceerde Mental Coaching Features (Weken 7-8)

## Sprint Doel
Uitbreiden met geavanceerde mental coaching functionaliteiten: uitgebreide doelen, journaling, mood analytics, en oefeningen bibliotheek. **Geen foto-uploads** - pure tekst-gebaseerde coaching.

## 🎯 Focus van deze Sprint
- 📝 **Doelen stellen** met SMART methodiek
- 📔 **Journaling** met dagelijkse prompts
- 📊 **Mood analytics** en patronen herkennen
- 🧘 **Oefeningen bibliotheek** voor zelfhulp
- 📄 **PDF rapportages** voor voortgang

## 📊 Team Capaciteit
- Platform Squad: 16 story points
- Backend Squad: 26 story points
- Frontend Squad: 26 story points
- QA Squad: 16 story points

## 📋 Geselecteerde Stories

### Platform Squad (16 punten)

#### PLAT-010: PDF Rapportage Generator (6 punten)
**Als** platform engineer  
**Wil ik** een PDF rapportage generator  
**Zodat** gebruikers hun voortgang kunnen downloaden en delen met hun coach

**Acceptatie Criteria:**
- [x] PDF generatie met Puppeteer/PDFKit
- [x] Template voor weekrapport
- [x] Template voor maandrapport
- [x] Grafieken in PDF (via Chart.js of ingebakken)
- [x] Automatische styling (huisstijl)
- [x] Queue voor achtergrond generatie
- [x] Download link met expiry (7 dagen)

**Taken:**
1. Installeer PDF generatie dependencies:
```bash
pnpm add puppeteer handlebars pdfkit