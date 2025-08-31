export async function fetchJson(url, opts={}){
  const res = await fetch(url,{headers:{'accept':'application/json',...(opts.headers||{})},...opts})
  if(!res.ok){ const t=await res.text().catch(()=> ''); throw new Error(`HTTP ${res.status} @ ${url} :: ${t.slice(0,140)}`) }
  return res.json()
}
