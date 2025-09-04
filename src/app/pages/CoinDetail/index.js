import { t } from '../../i18n/index.js';
import { formatPriceEUR, formatPct2 } from '../../utils/format.js';
import { isInWatchlist, toggleWatchlist } from '../../data/watchlist.js';
import { RiskGauge } from '../../components/RiskGauge.js';
import { IndicatorCard } from '../../components/IndicatorCard.js';
import { PredictionBlock } from '../../components/PredictionBlock.js';
import { fetchOHLC } from '../../data/ohlcService.js';
import { RSI, SMA, MACD, Bollinger } from '../../data/indicators.js';
import { COINGECKO } from '../../config.js';
import { fetchPriceOrFallback } from '../../data/priceService.js';
import { fetchMarketsByIds } from '../../data/coingecko.js';

function toneFrom(value,kind){ if(value==null)return'neutral'; if(kind==='rsi'){if(value<30||value>70)return'warn'; return'value-ok';} if(kind==='macd'){return value>0?'ok':'warn';} if(kind==='bb'){return value>0?'ok':'warn';} if(kind==='ma'){return value>0?'ok':'danger';} return'neutral'; }

export function renderCoinDetail({ id }){
  const el=document.createElement('div'); el.className='rr-page rr-page-detail'; const coin=id||'onbekend';
  el.innerHTML=/*html*/`
    <div class="rr-head">
      <div class="rr-head-info">
        <h1 class="rr-title">${coin}</h1>
        <div class="rr-btn-row">
          <button id="rr-detail-star" class="rr-pill">☆ Watch</button>
          <button id="rr-compare" class="rr-pill">Compare</button>
        </div>
      </div>
      <div class="rr-head-price" id="rr-head-price">—</div>
    </div>
    <section class="rr-hero" id="rr-hero"></section>
    <h2 class="rr-section-title">Indicators</h2>
    <section class="rr-grid" id="rr-indicators"></section>
    <div id="rr-predict-wrap"></div>
  `;
  const star=el.querySelector('#rr-detail-star');
  if(star){ const sync=()=>{const a=isInWatchlist(id); star.textContent=a?'★ Watching':'☆ Watch';}; sync(); star.addEventListener('click',e=>{e.preventDefault(); toggleWatchlist(id); sync();}); }
  const cmp=el.querySelector('#rr-compare'); if(cmp){ cmp.addEventListener('click',e=>{ e.preventDefault(); alert('Compare (later)'); }); }

  // hero chart
  (async function(){
    try{
      const data = await fetchOHLC(id); // [{t, o, h, l, c}]
      const last = data?.[data.length-1]; const priceEl=el.querySelector('#rr-head-price'); if(priceEl){ priceEl.textContent= last ? formatPriceEUR(last.c) : '—'; }
      const hero=el.querySelector('#rr-hero'); if(hero){ hero.innerHTML='<div class="rr-skel rr-hero-skel">Grafiek…</div>'; setTimeout(()=>{ hero.innerHTML='<canvas width="600" height="180" class="rr-hero-canvas"></canvas>'; }, 300); }
    }catch(e){ console.warn('ohlc error', e); }
  })();

  // indicators
  (async function(){
    const wrap=el.querySelector('#rr-indicators');
    try{
      const [rsi,sma,macd,bb] = await Promise.all([
        RSI(id).catch(()=>null),
        SMA(id).catch(()=>null),
        MACD(id).catch(()=>null),
        Bollinger(id).catch(()=>null)
      ]);
      const cards=[
        IndicatorCard({ title:'RSI', value: rsi?.value ?? null, tone: toneFrom(rsi?.value,'rsi') }),
        IndicatorCard({ title:'SMA Δ', value: sma?.delta ?? null, tone: toneFrom(sma?.delta,'ma') }),
        IndicatorCard({ title:'MACD', value: macd?.value ?? null, tone: toneFrom(macd?.value,'macd') }),
        IndicatorCard({ title:'Bollinger', value: bb?.width ?? null, tone: toneFrom(bb?.width,'bb') })
      ];
      wrap.innerHTML = cards.map(c=>c).join('');
    }catch(e){ console.warn('indicators error', e); }
  })();

  // prediction block (stub)
  (async function(){
    const wrap=document.getElementById('rr-predict-wrap');
    try{
      wrap.innerHTML = PredictionBlock({ id });
    }catch(e){ console.warn('prediction error', e); }
  })();

  // live price (fallback)
  (async function(){
    try{
      const m=await fetchMarketsByIds([id]); const p=m?.[0]?.current_price??null; const elp=document.getElementById('rr-head-price'); if(elp&&p!=null){ elp.textContent=formatPriceEUR(p); }
    }catch(e){ console.warn('market fallback error', e); }
  })();

  return el;
}
