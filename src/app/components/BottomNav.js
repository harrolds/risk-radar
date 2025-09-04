// src/app/components/BottomNav.js
export function BottomNav() {
  const wrap = document.createElement('div');
  wrap.className = 'rr-bottomnav';

  wrap.innerHTML = `
    <nav class="rr-bottomnav__nav">
      <a href="#/" data-route="home" class="rr-bottomnav__link">Home</a>
      <a href="#/coins" data-route="coins" class="rr-bottomnav__link">Coins</a>
      <a href="#/settings" data-route="settings" class="rr-bottomnav__link">Settings</a>
    </nav>
  `;

  // Active state
  const links = wrap.querySelectorAll('.rr-bottomnav__link');
  const syncActive = () => {
    const h = (location.hash || '#/').toLowerCase();
    links.forEach((a) => {
      const r = a.getAttribute('data-route');
      const on = (r === 'home' && (h === '#/' || h === '#')) || h === `#/${r}`;
      a.classList.toggle('is-active', !!on);
    });
  };
  syncActive();

  window.addEventListener('hashchange', syncActive);
  // geen cleanup hier — component leeft in shell

  return wrap;
}
