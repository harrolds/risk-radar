import { applyTheme } from '../../main.js';
import { t, getLocale, setLocale } from '../../i18n/index.js';

export function renderSettingsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `
    <h1 class="rr-title">${t('settings.title')}</h1>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div>
        <label for="theme">${t('settings.theme')}</label><br/>
        <select id="theme">
          <option value="dark">${t('theme.dark')}</option>
          <option value="light">${t('theme.light')}</option>
        </select>
      </div>
      <div>
        <label for="language">${t('settings.language')}</label><br/>
        <select id="language">
          <option value="nl">${t('lang.nl')}</option>
          <option value="de">${t('lang.de')}</option>
          <option value="en">${t('lang.en')}</option>
        </select>
      </div>
    </div>
    <p class="rr-subtle" style="margin-top:8px;">${t('settings.note')}</p>
  `;

  // Theme wiring
  const themeSel = el.querySelector('#theme');
  const currentTheme = localStorage.getItem('rr_theme') || 'dark';
  themeSel.value = currentTheme;
  themeSel.addEventListener('change', () => applyTheme(themeSel.value));

  // Language wiring
  const langSel = el.querySelector('#language');
  langSel.value = getLocale();
  langSel.addEventListener('change', () => setLocale(langSel.value));

  return el;
}
