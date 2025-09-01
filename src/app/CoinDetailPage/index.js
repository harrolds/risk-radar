import { isInWatchlist, toggleWatchlist } from '../data/watchlist.js';
import { RiskGauge } from '../components/RiskGauge.js';
import { IndicatorCard } from '../components/IndicatorCard.js';
import { fetchOHLC } from '../data/ohlcService.js';
import { RSI, SMA, MACD, Bollinger } from '../data/indicators.js';
import { COINGECKO } from '../config.js';

async function fetchPrice(coinId){
  const url = `${COINGECKO.BASE_URL}/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=${COINGECKO.VS_CURRENCY}`;
  const res = await fetch(url);
  const j = await res.json();
  return j?.[coinId]?.[COINGECKO.VS_CURRENCY] ?? null;
}
function toneFrom(value, kind){
  if(value==null) return 'neutral';
  if(kind==='rsi'){ if(value<30||value>70) return 'warn'; return 'ok'; }
  if(kind==='macd'){ return value>0?'ok':value<0?'danger':'neutral'; }
  if(kind==='ma'){ return value>0?'ok':value<0?'danger':'neutral'; }
  return 'neutral';
}

export function renderCoinDetailPage({ id }){
  const el=document.createElement('div');
  el.className='rr-page rr-page-detail';
  const coin=id||'onbekend';
  el.innerHTML=`
    <div class="rr-page-head">
      <a class="rr-back" href="javascript:void(0)" id="rr-back-link">←</a>
      <div class="rr-head-title"><h1>${coin}</h1><div class="rr-head-price" id="rr-head-price">—</div></div>
      <button id="rr-detail-star" class="rr-pill">☆ Watch</button>
    </div>
    <section class="rr-hero" id="rr-hero"></section>
    <h2 class="rr-section-title">Indicators</h2>
    <section class="rr-grid" id="rr-indicators"></section>
  `;

  // Back
  const backEl=el.querySelector('#rr-back-link');
  if(backEl) backEl.addEventListener('click', (e)=>{ e.preventDefault(); if(history.length>1) history.back(); else location.hash='#/coins'; });

  // Watchlist
  const starBtn=el.querySelector('#rr-detail-star');
  if(starBtn){
    const sync=()=>{ const active=isInWatchlist(id); starBtn.textContent=active?'★ In watchlist':'☆ Watch'; starBtn.classList.toggle('active',active); };
    sync();
    starBtn.addEventListener('click', (e)=>{ e.preventDefault(); toggleWatchlist(id); sync(); });
  }

  // Price
  fetchPrice(id).then(p=>{
    const t=el.querySelector('#rr-head-price');
    if(t) t.textContent = p!=null ? new Intl.NumberFormat('nl-NL',{style:'currency',currency:COINGECKO.VS_CURRENCY.toUpperCase()}).format(p) : '—';
  }).catch(()=>{});

  const hero=el.querySelector('#rr-hero');
  const grid=el.querySelector('#rr-indicators');

  (async()=>{
    try{
      const candles=await fetchOHLC({ coinId:id, days:90 });
      const closes=candles.map(c=>c.close);

      const rsi=RSI(closes,14);
      const lastRSI=rsi[rsi.length-1];

      const ma6=SMA(closes,6);
      const ma9=SMA(closes,9);
      const maSignal=(ma6[ma6.length-1]!=null && ma9[ma9.length-1]!=null) ? (ma6[ma6.length-1]-ma9[ma9.length-1]) : null;

      const macd=MACD(closes,12,26,9);
      const lastMACD=macd.macd[macd.macd.length-1];

      const bb=Bollinger(closes,20,2);
      const lastClose=closes[closes.length-1];
      const lastUp=bb.up[bb.up.length-1], lastDown=bb.down[bb.down.length-1];

      // rudimentaire risicoscore 0..100
      let score=50;
      if(lastRSI!=null) score += (lastRSI-50)*0.6;
      if(lastMACD!=null) score += lastMACD>0? -5 : 5;
      if(lastUp!=null && lastDown!=null && lastClose!=null){
        const width=(lastUp-lastDown)/(lastClose||1);
        score += Math.min(20, Math.max(-20, (width-0.1)*100));
      }
      score=Math.round(Math.max(0,Math.min(100,score)));
      if(hero) hero.appendChild(RiskGauge(score,'Risk'));

      grid.appendChild(IndicatorCard({ title:'RSI (14)', valueText: Number.isFinite(lastRSI)? (lastRSI.toFixed(0)+(lastRSI<30?' · Oversold':lastRSI>70?' · Overbought':' · Neutral')) : '—', tone:toneFrom(lastRSI,'rsi') }));
      grid.appendChild(IndicatorCard({ title:'MACD', valueText: lastMACD!=null? (lastMACD>0?'Bullish':'Bearish'):'—', tone:toneFrom(lastMACD,'macd') }));
      grid.appendChild(IndicatorCard({ title:'MA6 / MA9', valueText: maSignal!=null? (maSignal>0?'Bullish':'Bearish'):'—', tone:toneFrom(maSignal,'ma') }));
      grid.appendChild(IndicatorCard({ title:'Bollinger (20,2)', valueText: (lastClose!=null && lastUp!=null && lastDown!=null)? (lastClose>lastUp?'Above band':lastClose<lastDown?'Below band':'Within bands'):'—', tone:'neutral' }));

    }catch(e){
      if(hero) hero.innerHTML='<div class="rr-error">Kon indicatoren niet laden.</div>';
    }
  })();

  return el;
}
