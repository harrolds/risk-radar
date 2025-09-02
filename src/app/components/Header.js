import { t, getLocale, setLocale } from '../i18n/index.js';

function icon(name, size=18) {
  const icons = {
    home: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12l9-9 9 9"/><path d="M9 21V9h6v12"/></svg>`,
    cog: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 1 .49 1.87l-.2.53a2 2 0 0 1-2.62 1.14l-.51-.2a7 7 0 0 1-1.69.98l-.08.54a2 2 0 0 1-1.98 1.64h-.57a2 2 0 0 1-1.98-1.64l-.08-.54a7 7 0 0 1-1.69-.98l-.51.2a2 2 0 0 1-2.62-1.14l-.2-.53A1.7 1.7 0 0 1 4.6 15l.43-.32a6.9 6.9 0 0 1 0-1.35L4.6 13a1.7 1.7 0 0 1-.49-1.87l.2-.53A2 2 0 0 1 6.93 9.5l.51.2c.52-.37 1.09-.7 1.69-.98l.08-.54A2 2 0 0 1 11.19 6.5h.57c.98 0 1.8.7 1.98 1.64l.08.54c.6.28 1.17.61 1.69.98l.51-.2a2 2 0 0 1 2.62 1.14l.2.53c.2.66 0 1.35-.49 1.87l-.43.33c.05.45.05.9 0 1.35l.43.33Z"/></svg>`
  };
  return icons[name] || '';
}

export function Header() {
  const el = document.createElement('header');
  el.className = 'rr-header';
  el.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;">
      <a href="#/" style="font-weight:700;letter-spacing:0.3px;display:flex;align-items:center;gap:8px;">
        ${icon('home',20)} <span>${t('app.title')}</span>
      </a>
      <nav class="rr-headnav" style="display:flex;gap:12px;align-items:center;">
        <label class="rr-langlabel" for="rr-lang" style="font-size:0.9rem;">${t('nav.language')}</label>
        <select id="rr-lang" aria-label="${t('nav.language')}" style="padding:6px 8px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text);">
          <option value="nl">${t('lang.nl')}</option>
          <option value="de">${t('lang.de')}</option>
          <option value="en">${t('lang.en')}</option>
        </select>
        <a href="#/settings" aria-label="${t('nav.settings')}">${icon('cog')} <span>${t('nav.settings')}</span></a>
      </nav>
    </div>
  `;
  const sel = el.querySelector('#rr-lang');
  sel.value = getLocale();
  sel.addEventListener('change', () => setLocale(sel.value));
  return el;
}
