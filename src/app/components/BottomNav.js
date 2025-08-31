export function BottomNav() {
  const el = document.createElement('nav');
  el.className = 'rr-bottomnav';
  el.innerHTML = `
    <a href="#/" data-route="home">Home</a>
    <a href="#/coins" data-route="coins">Coins</a>
    <a href="#/settings" data-route="settings">Instellingen</a>
  `;
  function activate() {
    const hash = window.location.hash || '#/';
    el.querySelectorAll('a').forEach(a => {
      a.classList.toggle('active', hash.startsWith(a.getAttribute('href')));
    });
  }
  window.addEventListener('hashchange', activate);
  window.addEventListener('load', activate);
  activate();
  return el;
}
