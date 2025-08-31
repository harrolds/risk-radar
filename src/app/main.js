// Bootstrapping app: header, main, footer en router
import { initRouter } from './router.js';
import { Header } from './components/Header.js';
import { Footer } from './components/Footer.js';
import { BottomNav } from './components/BottomNav.js';

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
