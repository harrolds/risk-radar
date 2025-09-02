import { formatPriceEUR } from '../utils/format.js';
import { fetchPriceOrFallback } from '../data/priceService.js';
import { fetchOHLC } from '../data/ohlcService.js';

function trendScore(closes){
  if(!closes||closes.length<8) return { dir:'Onvoldoende data', conf:0 };
  const n=closes.length, xs=[...Array(n).keys()];
  const meanX=xs.reduce((a,b)=>a+b,0)/n, meanY=closes.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for(let i=0;i<n;i++){ num+=(xs[i]-meanX)*(closes[i]-meanY); den+=(xs[i]-meanX)**2; }
  const slope=num/den, rel=slope/meanY;
  const score=rel*1000; // schaal
  let dir='Zijwaarts'; if(score>0.5) dir='Stijgend'; else if(score<-0.5) dir='Dalend';
  const conf=Math.min(100,Math.round(Math.abs(score*50)));
  return {dir,conf};
}

export function PredictionBlock({ coinId }){
  const el=document.createElement('div');
  el.className='rr-predict';
  el.innerHTML=`<h2 class="rr-section-title">Basis voorspelling</h2>
    <div class="rr-pills" id="rr-predict-tabs">
      <button class="rr-pill active" data-h="1">24 uur</button>
      <button class="rr-pill" data-h="7">7 dagen</button>
      <button class="rr-pill" data-h="30">30 dagen</button>
    </div>
    <div id="rr-predict-result" class="rr-predict-result">–</div>`;
  const res=el.querySelector('#rr-predict-result');
  const tabs=el.querySelectorAll('#rr-predict-tabs .rr-pill');
  async function load(days){
    res.textContent='Bezig met berekenen...';
    try{
      const candles=await fetchOHLC({coinId:coinId, days:days});
      const closes=candles.map(c=>c.close);
      const {dir,conf}=trendScore(closes);
      // compute expected range based on historical volatility
      const lastClose = closes[closes.length-1];
      let currentPrice = lastClose;
      try { 
        const p = await fetchPriceOrFallback({ coinId: coinId, vsCurrency: 'eur' });
        if (p != null) currentPrice = p;
      } catch {}
      // log-return volatility
      const rets = [];
      for (let i=1;i<closes.length;i++){ const r = Math.log(closes[i]/closes[i-1]); if (isFinite(r)) rets.push(r); }
      const mean = rets.reduce((a,b)=>a+b,0)/(rets.length||1);
      const variance = rets.reduce((a,b)=>a+(b-mean)*(b-mean),0)/(rets.length||1);
      const sigma = Math.sqrt(variance); // daily
      const horizonDays = h; // 1,7,30
      const z = 1; // ~68% band
      const factor = Math.exp(z * sigma * Math.sqrt(Math.max(1, horizonDays)));
      let low = currentPrice / factor;
      let high = currentPrice * factor;
      // Nudge band richting trend
      if (dir==='Stijgend'){ low = currentPrice / (factor*0.9); high = currentPrice * (factor*0.9); }
      if (dir==='Dalend'){ low = currentPrice / (factor*0.9); high = currentPrice * (factor*0.9); [low,high] = [low*1.02, high*0.98]; }
      res.innerHTML = `<div><strong>${dir}</strong></div>
        <div class="rr-conf-bar"><div style="width:${conf}%"></div></div>
        <div class="rr-subtle" style="margin-top:8px;">Verwachte prijs (±1σ) voor ${h===1?'24 uur':(h===7?'7 dagen':'30 dagen')}: 
          <strong>${formatPriceEUR(low)}</strong> tot <strong>${formatPriceEUR(high)}</strong></div>`;
    }catch(e){ res.textContent='Kon voorspelling niet laden'; }
  }
  tabs.forEach(btn=>btn.addEventListener('click',()=>{
    tabs.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); load(parseInt(btn.dataset.h));
  }));
  load(1);
  return el;
}
