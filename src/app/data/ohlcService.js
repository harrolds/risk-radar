import { COINGECKO } from "../config.js";
function baseUrl(){return COINGECKO.MODE==="pro"?COINGECKO.PRO_BASE_URL:COINGECKO.BASE_URL;}
function authHeaders(){const h={Accept:"application/json"};if(COINGECKO.MODE==="demo"&&COINGECKO.API_KEY)h["x-cg-demo-api-key"]=COINGECKO.API_KEY;if(COINGECKO.MODE==="pro"&&COINGECKO.API_KEY)h["x-cg-pro-api-key"]=COINGECKO.API_KEY;return h;}
export async function fetchOHLC({coinId,vsCurrency='eur',days=90,signal}={}){const url=`${baseUrl()}/coins/${encodeURIComponent(coinId)}/ohlc?vs_currency=${encodeURIComponent(vsCurrency)}&days=${encodeURIComponent(days)}`;const res=await fetch(url,{headers:authHeaders(),signal});if(!res.ok){const t=await res.text().catch(()=>'');
throw new Error(`HTTP ${res.status} @ ohlc :: ${t.slice(0,120)}`);}const rows=await res.json();return rows.map(r=>({time:Math.floor(r[0]/1000),open:r[1],high:r[2],low:r[3],close:r[4]}));}
