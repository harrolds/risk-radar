// Bootstrapping app: header, main, footer en router
import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';

/** THEMA: set via html[data-theme] for reliable CSS variable switching */
function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('rr_theme', t);
}

(function bootTheme(){
  const saved = localStorage.getItem('rr_theme') || 'dark';
  applyTheme(saved);
})();

const appRoot = document.getElementById('rr-app');

const shell = document.createElement('div');
shell.className = 'rr-shell';

const header = Header();
const main = document.createElement('main');
main.id = 'rr-main';
const footer = Footer();
const bottomNav = BottomNav();

shell.appendChild(header);
shell.appendChild(main);
shell.appendChild(footer);
shell.appendChild(bottomNav);
appRoot.appendChild(shell);

initRouter({ mount: main });
startAutoRefresh();

// export for SettingsPage usage
export { applyTheme };


// --- Auto Refresh: dispatch 'rr:refresh' every 60 seconds and on tab focus ---
function startAutoRefresh() {
  const isUserTyping = () => {
    const ae = document.activeElement;
    if (!ae) return false;
    const tag = (ae.tagName||'').toLowerCase();
    return tag === 'input' || tag === 'textarea' || ae.isContentEditable === true;
  };
  const INTERVAL_MS = 60 * 1000;
  setInterval(() => {
    if (!isUserTyping()) window.dispatchEvent(new CustomEvent('rr:refresh', { detail: { t: Date.now() } }));
  }, INTERVAL_MS);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      if (!isUserTyping()) window.dispatchEvent(new CustomEvent('rr:refresh', { detail: { t: Date.now(), reason: 'visibility' } }));
    }
  });
}
