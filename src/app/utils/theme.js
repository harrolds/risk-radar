// src/app/utils/theme.js
// Simple theme management: persist to localStorage and reflect on <html data-theme="...">

const STORAGE_KEY = 'rr_theme';
const VALID = new Set(['dark','light']);

function applyTheme(theme) {
  const t = VALID.has(theme) ? theme : 'dark';
  try {
    document.documentElement.setAttribute('data-theme', t);
  } catch {}
}

export function getTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (VALID.has(v)) return v;
  } catch {}
  // default: dark (matches CSS default)
  return 'dark';
}

export function setTheme(theme) {
  const t = VALID.has(theme) ? theme : 'dark';
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
  applyTheme(t);
  // Notify listeners (optional)
  try {
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: t } }));
  } catch {}
}

export function initTheme() {
  applyTheme(getTheme());
}
