// src/router.js
// Back-compat shim: leid alle router-imports door naar de app-router.
// Hiermee voorkom je parallelle/legacy routers en gebroken imports.
export * from './app/router.js';
export { default } from './app/router.js';
