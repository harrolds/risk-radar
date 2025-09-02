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

function toneFrom(value,kind){ if(value==null)return'neutral'; if(kind==='rsi'){if(value<30||value>70)return'warn';return'ok';} if(kind==='macd'){return value>0?'ok':'danger';} if(kind==='ma'){return value>0?'ok':'danger';} return'neutral'; }

export function renderCoinDetailPage({ id }){
  const el=document.createElement('div'); el.className='rr-page rr-page-detail'; const coin=id||'onbekend';
  el.innerHTML=`
    <div class="rr-page-head">
      <div class="rr-head-left">
        <h1>${coin}</h1>
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
  if(star){ const sync=()=>{const a=isInWatchlist(id); star.textContent=a?'★ In watchlist':'☆ Watch'; star.classList.toggle('active',a);}; sync(); star.addEventListener('click',e=>{e.preventDefault(); toggleWatchlist(id); sync();}); }
  const cmp=el.querySelector('#rr-compare'); if(cmp){ cmp.addEventListener('click',e=>{e.preventDefault(); location.hash=`#/compare?base=${id}`; }); }
  fetchPriceOrFallback({ coinId: id, vsCurrency: COINGECKO.VS_CURRENCY }).then(p=>{ const t=el.querySelector('#rr-head-price'); if(t) t.textContent = formatPriceEUR(p); if(t) t.textContent=p!=null? new Intl.NumberFormat('nl-NL',{style:'currency',currency:COINGECKO.VS_CURRENCY.toUpperCase()}).format(p):'—';}).catch(()=>{});

  
  (async()=>{
    try{
      const p = await fetchPriceOrFallback({ coinId: id, vsCurrency: COINGECKO.VS_CURRENCY });
      const t = el.querySelector('#rr-head-price');
      if (t) t.textContent = formatPriceEUR(p);
    }catch(e){}
  })();


  async function updateDetailPriceUnified(){
    try{
      // Prefer marketsByIds to align with lists (price & pct from same source)
      const arr = await fetchMarketsByIds([id]);
      if (arr && arr.length){
        const d = arr[0];
        const t = el.querySelector('#rr-head-price');
        if (t) t.textContent = formatPriceEUR(d.current_price);
        return;
      }
    }catch(e){}
    // Fallback to simple_price if marketsByIds not available
    try{
      const p = await fetchPriceOrFallback({ coinId: id, vsCurrency: COINGECKO.VS_CURRENCY });
      const t = el.querySelector('#rr-head-price');
      if (t) t.textContent = formatPriceEUR(p);
    }catch(e){}
  }

  const hero=el.querySelector('#rr-hero'); const grid=el.querySelector('#rr-indicators');
  (async()=>{
    try{
      const candles=await fetchOHLC({coinId:id,days:90});
      const closes=candles.map(c=>c.close);
      const rsi=RSI(closes,14); const lastRSI=rsi[rsi.length-1];
      const ma6=SMA(closes,6); const ma9=SMA(closes,9); const maSig=(ma6[ma6.length-1]!=null&&ma9[ma9.length-1]!=null)?(ma6[ma6.length-1]-ma9[ma9.length-1]):null;
      const macd=MACD(closes,12,26,9); const lastMACD=macd.macd[macd.macd.length-1];
      const bb=Bollinger(closes,20,2); const lastClose=closes[closes.length-1]; const lastUp=bb.up[bb.up.length-1], lastDown=bb.down[bb.down.length-1];

      let score=50; if(lastRSI!=null) score+=(lastRSI-50)*0.6; if(lastMACD!=null) score+=lastMACD>0?-5:5;
      if(lastUp!=null&&lastDown!=null&&lastClose!=null){const w=(lastUp-lastDown)/(lastClose||1); score+=Math.min(20,Math.max(-20,(w-0.1)*100));}
      score=Math.round(Math.max(0,Math.min(100,score)));
      if(hero) hero.appendChild(RiskGauge(score,'main'));

      grid.appendChild(IndicatorCard({title:'RSI (14)', valueText:Number.isFinite(lastRSI)? (lastRSI.toFixed(0)+(lastRSI<30?' · Oversold':lastRSI>70?' · Overbought':' · Neutral')):'—', tone:toneFrom(lastRSI,'rsi'), score:lastRSI||50, type:'rsi'}));
      grid.appendChild(IndicatorCard({title:'MACD', valueText:lastMACD!=null?(lastMACD>0?'Bullish':'Bearish'):'—', tone:toneFrom(lastMACD,'macd'), score:Math.max(0,Math.min(100,50+(lastMACD||0)*100)), type:'macd'}));
      grid.appendChild(IndicatorCard({title:'MA6 / MA9', valueText:maSig!=null?(maSig>0?'Bullish':'Bearish'):'—', tone:toneFrom(maSig,'ma'), score:Math.max(0,Math.min(100,50+(maSig||0)*100)), type:'ma'}));
      let posScore=50; if(lastUp!=null&&lastDown!=null&&lastClose!=null){ const pos=(lastClose-lastDown)/Math.max(1e-9,(lastUp-lastDown)); posScore=Math.max(0,Math.min(100, Math.round(pos*100))); }
      grid.appendChild(IndicatorCard({title:'Bollinger (20,2)', valueText:(lastClose!=null&&lastUp!=null&&lastDown!=null)?(lastClose>lastUp?'Above band':lastClose<lastDown?'Below band':'Within bands'):'—', tone:'neutral', score:posScore, type:'boll'}));
    }catch(e){
      if(hero) hero.innerHTML='<div class="rr-error">Kon indicatoren niet laden.</div>';
    }
  })();

  const predWrap=el.querySelector('#rr-predict-wrap'); if(predWrap) predWrap.appendChild(PredictionBlock({coinId:id}));
  
  // Incremental update for detail price
  async function updateDetailPrice(){
    try{
      const fresh = await fetch(`${COINGECKO.CG_PROXY}?endpoint=simple_price&ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(COINGECKO.VS_CURRENCY)}&_t=${Date.now()}`, { cache:'no-store' });
      if(!fresh.ok) return;
      const j = await fresh.json();
      const val = j?.[id]?.[COINGECKO.VS_CURRENCY];
      if (val != null) {
        const t = el.querySelector('#rr-head-price');
        if (t) t.textContent = formatPriceEUR(val);
      }
    }catch(e){}
  }
  const onRRRefreshDetail = () => updateDetailPriceUnified();
window.addEventListener('rr:refresh', onRRRefreshDetail);
  el.addEventListener('rr:teardown', () => window.removeEventListener('rr:refresh', onRRRefreshDetail));

  return el;
}