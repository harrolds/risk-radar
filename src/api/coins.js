import { fetchJson } from './fetchJson.js'

const CONFIG={ MOCK_MODE:true, REFRESH_MS:180000, VS_CURRENCY:'eur' }
let cache={at:0, list:[]}

const MOCK=[
  { id:'bitcoin', symbol:'btc', name:'Bitcoin', image:'', current_price:54000, price_change_percentage_24h:1.23 },
  { id:'ethereum', symbol:'eth', name:'Ethereum', image:'', current_price:2400, price_change_percentage_24h:-0.85 },
  { id:'solana', symbol:'sol', name:'Solana', image:'', current_price:130, price_change_percentage_24h:3.77 },
  { id:'ripple', symbol:'xrp', name:'XRP', image:'', current_price:0.61, price_change_percentage_24h:-2.12 },
  { id:'cardano', symbol:'ada', name:'Cardano', image:'', current_price:0.42, price_change_percentage_24h:0.15 },
  { id:'dogecoin', symbol:'doge', name:'Dogecoin', image:'', current_price:0.12, price_change_percentage_24h:-1.11 }
]

export async function getCoinsList({force=false}={}){
  const now=Date.now()
  if(!force && (now-cache.at)<CONFIG.REFRESH_MS && cache.list.length) return cache.list
  if(CONFIG.MOCK_MODE){ cache={at:now,list:MOCK}; return cache.list }
  const url=`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${CONFIG.VS_CURRENCY}&order=market_cap_desc&per_page=250&page=1&price_change_percentage=24h`
  const list = await fetchJson(url)
  cache = {at:now, list}
  return list
}

export async function getTop5LowRisk(){
  const list = await getCoinsList({force:false})
  return [...list].sort((a,b)=>Math.abs(a.price_change_percentage_24h)-Math.abs(b.price_change_percentage_24h)).slice(0,5)
}
