export function renderTopBar(el){
  el.innerHTML = `<div class="topbar container">
    <div class="brand">RiskRadar <span class="badge">MVP</span></div>
    <div class="row" style="gap:8px">
      <a data-link href="/home">🏠</a>
      <a data-link href="/coins">🪙</a>
      <a href="#" onclick="event.preventDefault();alert('Settings later in Fase 1');">⚙️</a>
    </div>
  </div>`
}
