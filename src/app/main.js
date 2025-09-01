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

// export for SettingsPage usage
export { applyTheme };
