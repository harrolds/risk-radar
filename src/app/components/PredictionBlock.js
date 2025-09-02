import { t } from '../i18n/index.js';
import { formatPriceEUR } from '../utils/format.js';
import { fetchPriceOrFallback } from '../data/priceService.js';
import { fetchOHLC } from '../data/ohlcService.js';

function trendScore(closes){
  if (!closes || closes.length < 8) return { dir: t('trend.insufficient'), conf: 0 };
  const n = closes.length;
  const xs = Array.from({length:n}, (_,i)=>i);
  const meanX = xs.reduce((a,b)=>a+b,0)/n;
  const meanY = closes.reduce((a,b)=>a+b,0)/n;
  let num=0, den=0;
  for (let i=0;i<n;i++){
    num += (xs[i]-meanX) * (closes[i]-meanY);
    den += (xs[i]-meanX) * (xs[i]-meanX);
  }
  const slope = den ? num/den : 0;
  const rel = meanY ? slope/meanY : 0;
  const score = rel * 1000;
  let dir=${t('trend.flat')};
  if (score > 0.5) dir = ${t('trend.up')};
  else if (score < -0.5) dir = ${t('trend.down')};
  const conf = Math.min(100, Math.max(0, Math.round(Math.abs(score*50))));
  return { dir, conf };
}

function labelForDays(days){
  if(days===1) return '24 uur';
  if(days===7) return '7 dagen';
  return '30 dagen';
}

function ascendingPair(a,b){
  return a<=b ? [a,b] : [b,a];
}

export function PredictionBlock({ coinId }){
  const el = document.createElement('div');
  el.className = 'rr-predict';
  el.innerHTML = `
    <div class="rr-predict-tabs">
      <button class="rr-pill active" data-h="1">24u</button>
      <button class="rr-pill" data-h="7">7d</button>
      <button class="rr-pill" data-h="30">30d</button>
    </div>
    <div class="rr-predict-res rr-subtle" style="margin-top:8px;"></div>
  `;
  const tabs = Array.from(el.querySelectorAll('.rr-predict-tabs .rr-pill'));
  const res = el.querySelector('.rr-predict-res');

  async function load(days){
    res.textContent = 'Bezig met berekenen...';
    try{
      const candles = await fetchOHLC({ coinId, days });
      const closes = candles.map(c => c.close).filter(v => typeof v === 'number' && isFinite(v));
      if (!closes.length) { res.textContent = ${t('trend.insufficient')}; return; }

      const { dir, conf } = trendScore(closes);

      // Start vanuit laatste close als fallback
      let currentPrice = closes[closes.length - 1];
      try{
        const p = await fetchPriceOrFallback({ coinId, vsCurrency: 'eur' });
        if (p != null) currentPrice = p;
      }catch{}

      // Dagelijkse logreturn-volatiliteit
      const rets = [];
      for (let i=1;i<closes.length;i++){
        const r = Math.log(closes[i] / closes[i-1]);
        if (isFinite(r)) rets.push(r);
      }
      const mean = rets.reduce((a,b)=>a+b,0) / (rets.length || 1);
      const variance = rets.reduce((a,b)=>a+(b-mean)*(b-mean),0) / (rets.length || 1);
      const sigma = Math.sqrt(Math.max(variance, 0)); // daily

      // ±1σ band
      const z = 1;
      const factor = Math.exp(z * sigma * Math.sqrt(Math.max(1, days)));
      let low  = currentPrice / factor;
      let high = currentPrice * factor;

      // Subtiele nudge richting trend (beide kanten evenredig verkleinen)
      if (dir === ${t('trend.up')}){ low /= 0.9; high *= 0.9; }
      else if (dir === ${t('trend.down')}){ low /= 0.9; high *= 0.9; [low, high] = [low*1.02, high*0.98]; }

      // **Altijd** in oplopende volgorde weergeven
      [low, high] = ascendingPair(low, high);

      res.innerHTML = `<div><strong>${dir}</strong></div>
        <div class="rr-conf-bar"><div style="width:${conf}%"></div></div>
        <div class="rr-subtle" style="margin-top:8px;">${t('pred.title').replace('{range}', sel ? sel.textContent : '').replace('{hours}', h)} (±1σ) voor ${labelForDays(days)}: 
          <strong>${formatPriceEUR(low)}</strong> tot <strong>${formatPriceEUR(high)}</strong></div>`;
    }catch(e){
      console.warn('PredictionBlock load error', e);
      res.textContent = t('pred.loadfail');
    }
  }

  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    load(parseInt(btn.dataset.h));
  }));

  // initial
  load(1);
  return el;
}
