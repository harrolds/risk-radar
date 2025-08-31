export function Tabs({active='all'}={}){
  return `<div class="tabs">
    <button class="tab ${active==='all'?'active':''}" data-tab="all">Alle coins</button>
    <button class="tab ${active==='gainers'?'active':''}" data-tab="gainers">Stijgers</button>
    <button class="tab ${active==='losers'?'active':''}" data-tab="losers">Dalers</button>
  </div>`
}
