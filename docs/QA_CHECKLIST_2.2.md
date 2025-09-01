# QA CHECKLIST — Fase 2, Stap 2.2 (HomePage live zoekfunctie)

## Acceptatiecriteria
- [ ] HomePage toont een zoekveld dat **live** filtert op de CoinGecko-marktlijst.
- [ ] Resultaten tonen naam, symbool, prijs (EUR) en 24u% met `rr-badge pos/neg`.
- [ ] Klik op resultaat navigeert naar `#/coin/<id>`.
- [ ] Geen console-errors in happy path.
- [ ] Lege input toont geen lijst en een subtiele hint (“Typ om te zoeken…”).
- [ ] Niet-bestaande query toont nette “Geen resultaten” melding.
- [ ] Debounce van ca. 200ms voorkomt onnodige renders.
- [ ] Data wordt lazy geladen bij focus op zoekveld en hergebruikt via de bestaande cache.

## Testcases
### Happy path
- [ ] Focus in zoekveld → data laadt (status “Laden…” verdwijnt).
- [ ] Typ “btc”, “eth”, “doge” → resultaten verschijnen (≤ 50).
- [ ] Klik op een resultaat → `#/coin/<id>` detailpagina opent.

### Edge cases
- [ ] Lege input → lijst leeg, status “Typ om te zoeken…”
- [ ] Query met geen match (bijv. “zzzzzz”) → status “Geen resultaten…”
- [ ] Snel wissen (clear) → lijst leeg, focus blijft in input.

### Regressie
- [ ] CoinsPage blijft werken (tabs, zoek, klik naar detail).
- [ ] Header/Footer/BottomNav blijven zichtbaar en ongewijzigd.
