export function renderSettingsPage() {
  const el = document.createElement('div');
  el.className = 'rr-page';
  el.innerHTML = `
    <h1 class="rr-title">Instellingen</h1>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div>
        <label for="theme">Thema</label><br/>
        <select id="theme">
          <option value="dark" selected>Donker</option>
          <option value="light">Licht</option>
        </select>
      </div>
      <div>
        <label for="lang">Taal</label><br/>
        <select id="lang">
          <option value="nl" selected>Nederlands</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
    <p class="rr-subtle" style="margin-top:8px;">(In Fase 2 koppelen we deze instellingen app-breed.)</p>
  `;

  const themeSel = el.querySelector('#theme');
  themeSel.addEventListener('change', () => {
    document.body.classList.toggle('light', themeSel.value === 'light');
  });

  return el;
}
