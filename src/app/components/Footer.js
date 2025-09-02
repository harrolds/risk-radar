import { t } from '../i18n/index.js';
export function Footer() {
  const el = document.createElement('footer');
  el.className = 'rr-footer';
  el.innerHTML = `
    <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
      <span class="rr-subtle">${t('footer.copy').replace('{year}', new Date().getFullYear())}</span>
      <span class="rr-subtle">${t('footer.phase')}</span>
    </div>
  `;
  return el;
}