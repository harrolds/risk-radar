import { t } from '../i18n/index.js';
import { formatPriceEUR } from '../utils/format.js';
import { fetchPriceOrFallback } from '../data/priceService.js';
import { fetchOHLC } from '../data/ohlcService.js';

function ascendingPair(a,b){ return a<=b ? [a,b] : [b,a]; }

function trendScore(closes){
  if (!closes || closes.length < 8) return { dir: t('trend.insufficient'), conf: 0 };
  const n = closes.length;
  const xs = Array.from({length:n}, (_,i)=>i);
  const meanX = xs.reduce((a,b)=>a+b,0)/n;
  const meanY = closes.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for (let i=0;i<n;i++){ num += (xs[i]-meanX)*(closes[i]-meanY); den += (xs[i]-meanX)*(xs[i]-meanX); }
  const slope = den === 0 ? 0 : num/den;
  const varY = closes.reduce((a,y)=>a+(y-meanY)*(y-meanY),0)/n;
  const varX = xs.reduce((a,x)=>a+(x-meanX)*(x-meanX),0)/n || 1;
  const r = Math.max(0, Math.min(1, (slope*slope*varX)/(varY||1)));
  const conf = Math.round(r*100);
  const dir = slope>0 ? t('trend.up') : slope<0 ? t('trend.down') : t('trend.flat');
  return { dir, conf };
}

export function PredictionBlock({ coinId }){
  const el = document.createElement('section');
  el.className = 'rr-card rr-predict';
  el.innerHTML = `
    <div class="rr-pred-head">
      <div class="rr-pred-tabs">
        <button class="active" data-p="24h">${t('pred.tab.24h')}</button>
        <button data-p="7d">${t('pred.tab.7d')}</button>
        <button data-p="30d">${t('pred.tab.30d')}</button>
      </div>
    </div>
    <div class="rr-pred-result rr-subtle">${t('pred.obs')}</div rr-subtle">${t('pred.obs')}</div>
  `;

  const res = el.querySelector('.rr-pred-result');
  const tabs = Array.from(el.querySelectorAll('.rr-pred-tabs button'));

  function rangeLabel(){ const sel = el.querySelector('.rr-pred-tabs .active'); return sel? sel.textContent : ''; }

  async function load(period){
    try{
            const days = period==='24h' ? 1 : (period==='7d' ? 7 : 30);
      const currentPrice = await fetchPriceOrFallback({ coinId });
      const candles = await fetchOHLC({ coinId, days });
      const closes = (candles||[]).map(c=>c.close).slice(-30);
      const { dir, conf } = trendScore(closes);

      const factor = 1 + Math.max(0.02, (100-conf)/1000);
      let low  = (currentPrice||0) / factor;
      let high = (currentPrice||0) * factor;
      [low, high] = ascendingPair(low, high);

            const title = t('pred.result').replace('{period}', rangeLabel());

      res.innerHTML = `<div><strong>${dir}</strong></div>
        <div class="rr-conf-bar"><div style="width:${conf}%"></div></div>
        <div class="rr-subtle" style="margin-top:8px;">${title} (±1σ): 
          <strong>${formatPriceEUR(low)}</strong> – <strong>${formatPriceEUR(high)}</strong></div>`;
    }catch(e){
      console.warn('PredictionBlock load error', e);
      res.textContent = t('pred.loadfail');
    }
  }

  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    load(btn.dataset.p);
  }));

  // initial
  load('24h');
  return el;
}