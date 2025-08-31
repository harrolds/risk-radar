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
        <select id="lang">
          <option value="nl">Nederlands</option>
          <option value="en">English</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
    <p class="rr-subtle" style="margin-top:8px;">(Thema-instelling wordt opgeslagen en automatisch toegepast.)</p>
  `;

  // Sync huidige thema naar select
  const themeSel = el.querySelector('#theme');
  const current = localStorage.getItem('rr_theme') || 'dark';
  themeSel.value = current;

  // Wissel thema + opslaan
  themeSel.addEventListener('change', () => {
    const v = themeSel.value;
    localStorage.setItem('rr_theme', v);
    document.body.classList.toggle('light', v === 'light');
  });

  return el;
}
