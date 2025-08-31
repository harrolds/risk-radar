export const fmt = {
  currencyEUR(v){ try{ return new Intl.NumberFormat('nl-NL',{style:'currency',currency:'EUR',maximumFractionDigits:8}).format(v)}catch(e){ return v } },
  pct(v){ const s=(v>=0?'+':'') + (Number.isFinite(v)?v.toFixed(2):v); return s+'%'},
  symbol(s){ return (s||'').toUpperCase() }
}
