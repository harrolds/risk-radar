// /src/app/bootstrap/telemetry-init.js
// Los, klein bootstrap-bestand zodat je bestaande main.js/router.js niet hoeft aan te passen.
// Voeg dit bestand in je index.html toe als module-script.

import { initTelemetry, logPageView } from '../utils/logging.js';

// Versie en omgeving zet ik op basis van jouw laatste statusnotitie (Fase 2.5 afgerond)
initTelemetry({ appName: 'RiskRadar', appVersion: '2.5.0', env: 'prod' });

// Eerste pageview bij load
logPageView();

// SPA navigatie hooks (hash of history-push/pop)
window.addEventListener('hashchange', () => logPageView());
window.addEventListener('popstate', () => logPageView());

// Als jullie een custom router hebben die zelf navigeert zonder hash/popstate,
// kun je daar eventueel ook logPageView() aanroepen na elke route change.
