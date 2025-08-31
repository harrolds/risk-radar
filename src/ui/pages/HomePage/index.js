import { getTop5LowRisk } from '../../../api/coins.js'
import { fmt } from '../../../utils/format.js'
const tpl = `<div class="container">
  <div class="section">
    <input id="home-search" class="input" placeholder="Zoek coin (bv. BTC, Ethereum)…">
  </div>
  <div class="space"></div>
  <div class="section">
    <h3>Watchlist</h3>
    <div id="watchlist" class="hscroll small">Nog geen items. (Fase 1 later)</div>
  </div>
  <div class="space"></div>
  <div class="section">
    <h3>Top 5 – Laagste risico (placeholder)</h3>
    <div id="top5" class="top5"></div>
  </div>
  <div class="space"></div>
  <div class="section small">
    <h3>Wat doet RiskRadar?</h3>
    <p>RiskRadar toont per coin een eenvoudige risicometer op basis van indicatoren. Start met de Coins pagina om te verkennen.</p>
  </div>
</div>`

export default async function render(){
  const root=document.createElement('div'); root.innerHTML=tpl
  const topEl=root.querySelector('#top5')
  try{
    const list=await getTop5LowRisk()
    topEl.innerHTML=list.map(c=>`<div class="card">
      <div class="small">${c.name} (${c.symbol.toUpperCase()})</div>
      <div class="row" style="justify-content:space-between">
        <div>${fmt.currencyEUR(c.current_price)}</div>
        <div class="pct ${(c.price_change_percentage_24h??0)>=0?'pos':'neg'}">${fmt.pct(c.price_change_percentage_24h??0)}</div>
      </div>
    </div>`).join('')
  }catch(e){
    topEl.innerHTML=`<div class="small">Kon top 5 niet laden. (${e.message})</div>`
  }
  return root.innerHTML
}
