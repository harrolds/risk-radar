# CHANGELOG (UNDER WATER) — Fase 2, Stap 2.2

**Basis:** riscradar_fase2_step2.1_based_on_themefix_navfix.zip  
**Datum:** 1 sept 2025  
**Status:** DRAFT (niet publiceren)

### Toegevoegd
- HomePage: live zoekfunctie op CoinGecko-marktlijst
  - Lazy load bij input-focus
  - Debounce (200ms)
  - Maximaal 50 resultaten (leesbaarheid)
  - Click → `#/coin/<id>`
  - Uitleg/tooltip voor gebruikers

### Ongewijzigd
- Router (`src/app/router.js`) ongewijzigd
- CoinsPage, SettingsPage, CoinDetailPage ongewijzigd
- Themafix-structuur en `rr-*` classes behouden
