# QA CHECKLIST — Fase 2, Stap 2.3 (Watchlist & Trending)

## Acceptatiecriteria
- [ ] Watchlist: vanuit CoinsPage en CoinDetailPage **toevoegen/verwijderen** (★/☆), persistent via localStorage.
- [ ] HomePage: **Watchlist-sectie** toont geselecteerde coins (naam, symbool, prijs, 24u%).
- [ ] HomePage: **Trending-sectie** toont relevante coins (via /search/trending, fallback top 7 gainers).
- [ ] Klik op item navigeert naar `#/coin/<id>`.
- [ ] Geen console-errors in happy path.
- [ ] Event “rr:watchlist-changed” werkt; UI ververst zonder reload.
- [ ] UI consistent met rr-classes en bestaande themafix.

## Testcases
### Watchlist
- [ ] CoinsPage: klik ☆ → ★; item verschijnt in Home → Watchlist.
- [ ] CoinsPage: klik ★ → ☆; item verdwijnt uit Watchlist.
- [ ] DetailPage: knop ‘☆ Watch/★ In watchlist’ werkt idem.
- [ ] Reload → watchlist blijft bestaan (localStorage).

### Trending
- [ ] Home → Trending gevuld. (Netwerk ok) 
- [ ] Als trending endpoint faalt → fallback top 7 gainers zichtbaar.
- [ ] Klik op ☆ in Trending voegt item toe aan Watchlist.

### Regressie
- [ ] Home live search (2.2) blijft werken (incl. herstel zoekterm).
- [ ] CoinsPage tabs/zoek/klik → detail blijven werken.
- [ ] Back-knop gedrag (history + fallback) blijft correct.
