import { getCoinsList } from '../../../api/coins.js'
import { CoinListItem } from '../../components/CoinListItem.js'
import { Tabs } from '../../components/Tabs.js'

const tpl = `<div class="container">
  <div class="section">
    <input id="search" class="input" placeholder="Zoek coin (naam of ticker)…">
  </div>
  <div class="space"></div>
  <div class="section" id="tabs"></div>
  <div class="space"></div>
  <div class="section">
    <ul id="coinsList" class="list"></ul>
  </div>
</div>`

function filterByTab(list, tab){
  if(tab==='gainers') return list.filter(c=>(c.price_change_percentage_24h??0)>0).sort((a,b)=>b.price_change_percentage_24h-a.price_change_percentage_24h)
  if(tab==='losers') return list.filter(c=>(c.price_change_percentage_24h??0)<0).sort((a,b)=>a.price_change_percentage_24h-b.price_change_percentage_24h)
  return list
}

export default async function render(){
  const root=document.createElement('div'); root.innerHTML=tpl
  const listEl=root.querySelector('#coinsList')
  const tabsEl=root.querySelector('#tabs')
  const searchEl=root.querySelector('#search')

  let tab='all'
  tabsEl.innerHTML=Tabs({active:tab})

  let list=[]
  async function load(){
    try{ list=await getCoinsList({force:true}); renderList() }
    catch(e){ listEl.innerHTML=`<li class="small">Kon coins niet laden. (${e.message})</li>` }
  }

  function renderList(){
    const q=(searchEl.value||'').toLowerCase().trim()
    let view=filterByTab(list,tab)
    if(q) view=view.filter(c=>c.name.toLowerCase().includes(q)||(c.symbol||'').toLowerCase().includes(q))
    listEl.innerHTML = view.map(CoinListItem).join('') || '<li class="small">Geen resultaten.</li>'
  }

  tabsEl.addEventListener('click',(e)=>{
    const b=e.target.closest('button[data-tab]'); if(!b) return
    tab=b.dataset.tab; tabsEl.innerHTML=Tabs({active:tab}); renderList()
  })
  searchEl.addEventListener('input', renderList)

  await load()
  return root.innerHTML
}
