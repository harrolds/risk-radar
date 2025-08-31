import { fmt } from '../../utils/format.js'
export function CoinListItem(c){
  const pct=c.price_change_percentage_24h ?? 0
  const cls=pct>=0?'pos':'neg'
  return `<li class="coin-item">
    <div class="coin-icon"></div>
    <div class="coin-meta">
      <div class="coin-name"><a data-link href="/coin/${c.id}" onclick="event.preventDefault();alert('Detail later in Fase 1');">${c.name}</a></div>
      <div class="coin-symbol">${fmt.symbol(c.symbol)}</div>
    </div>
    <div style="text-align:right">
      <div class="price">${fmt.currencyEUR(c.current_price)}</div>
      <div class="pct ${cls}">${fmt.pct(pct)}</div>
    </div>
  </li>`
}
