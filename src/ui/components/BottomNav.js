export function renderBottomNav(el){
  el.innerHTML = `<div class="bottomnav container">
    <a data-link href="/home"><span>🏠</span><small>Home</small></a>
    <a data-link href="/coins"><span>🪙</span><small>Coins</small></a>
    <a href="#" onclick="event.preventDefault();alert('Compare later in Fase 1');"><span>⚖️</span><small>Vergelijk</small></a>
    <a href="#" onclick="event.preventDefault();alert('Portfolio later');"><span>📂</span><small>Portfolio</small></a>
    <a href="#" onclick="event.preventDefault();alert('Pro placeholder');"><span>⭐</span><small>Pro</small></a>
  </div>`
}
