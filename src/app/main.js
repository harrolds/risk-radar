// Bootstrapping app
import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';
import { getLocale } from './i18n/index.js';

/** THEMA handling */
export function applyTheme(theme) {
  const t = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('rr_theme', t);
}
(function bootTheme(){
  const saved = localStorage.getItem('rr_theme') || 'dark';
  applyTheme(saved);
})();

// Mount points
const headerMount = document.getElementById('rr-header');
const mainMount = document.getElementById('rr-main');
const footerMount = document.getElementById('rr-footer');
const bottomMount = document.getElementById('rr-bottomnav');

function mountHeader(){
  headerMount.innerHTML = '';
  headerMount.appendChild(Header());
}
function mountFooter(){
  footerMount.innerHTML = '';
  footerMount.appendChild(Footer());
}
function mountBottom(){
  bottomMount.innerHTML = '';
  bottomMount.appendChild(BottomNav());
}

// Router
const router = initRouter({ mount: mainMount });

function rerender(){
  // Rebuild header (needed for language labels)
  mountHeader();
  // Rerender current route
  window.dispatchEvent(new HashChangeEvent('hashchange'));
}

window.addEventListener('rr:locale', rerender);

// Periodic soft refresh for live data (kept from previous version)
(function bootTickers(){
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
})();

// Initial mount
mountHeader();
router.boot();
mountFooter();
mountBottom();
