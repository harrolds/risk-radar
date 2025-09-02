import { applyTheme } from '../../main.js';

export function renderSettingsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `
    <h1 class="rr-title">Instellingen</h1>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div>
        <label for="theme">Thema</label><br/>
        <select id="theme">
          <option value="dark">Donker</option>
          <option value="light">Licht</option>
        </select>
      </div>
      <div>
        <label for="lang">Taal</label><br/>
        <select id="lang" disabled>
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
    <p class="rr-subtle" style="margin-top:8px;">(Thema wordt opgeslagen. Taal volgt in Fase 2.)</p>
  `;

  const themeSel = el.querySelector('#theme');
  const current = localStorage.getItem('rr_theme') || 'dark';
  themeSel.value = current;

  themeSel.addEventListener('change', () => {
    const v = themeSel.value;
    applyTheme(v);
  });

  return el;
}
