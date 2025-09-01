import { fetchOHLC, downsampleCandles } from '../data/ohlcService.js';
import { toCloses, SMA, Bollinger, RSI, zipToSeries } from '../data/indicators.js';

const ranges = [
  {key:'7D', days:7},
  {key:'30D', days:30},
  {key:'90D', days:90},
  {key:'180D', days:180},
  {key:'1Y', days:365},
];

export function ChartControls({ current='90D', onChange }) {
  const wrap = document.createElement('div');
  wrap.className = 'rr-chart-controls';
  ranges.forEach(r => {
    const b = document.createElement('button');
    b.className = 'rr-pill' + (r.key===current ? ' active' : '');
    b.textContent = r.key;
    b.addEventListener('click', () => onChange(r.key, r.days));
    wrap.appendChild(b);
  });
  const reload = document.createElement('button');
  reload.className = 'rr-pill';
  reload.textContent = 'Herlaad';
  reload.addEventListener('click', () => onChange(current, ranges.find(x=>x.key===current).days, { force:true }));
  wrap.appendChild(reload);
  return wrap;
}

function ensureLib() {
  if (typeof window.LightweightCharts === 'undefined') {
    throw new Error('Grafiekbibliotheek niet geladen. Controleer index.html script tag.');
  }
  return window.LightweightCharts;
}

export function CoinCharts(root, { coinId, vsCurrency='eur' }) {
  const lc = ensureLib();

  // Structure
  root.innerHTML = '';
  const controls = document.createElement('div');
  const candleBox = document.createElement('div');
  const rsiBox = document.createElement('div');
  controls.className = 'rr-chart-controls-wrap';
  candleBox.className = 'rr-chart rr-chart-candles';
  rsiBox.className = 'rr-chart rr-chart-rsi';
  root.appendChild(controls);
  root.appendChild(candleBox);
  root.appendChild(rsiBox);

  let currentKey = '90D';
  let aborter = null;
  let candleChart, candleSeries, sma6Series, sma9Series, bbUpSeries, bbMidSeries, bbDownSeries;
  let rsiChart, rsiSeries;

  function renderControls() {
    controls.innerHTML = '';
    controls.appendChild(ChartControls({ current: currentKey, onChange: (key, days, opts={}) => {
      currentKey = key;
      loadAndRender(days, opts.force);
      renderControls();
    }}));
  }

  async function loadAndRender(days=90, force=false) {
    // Abort inflight
    if (aborter) aborter.abort();
    aborter = new AbortController();
    const { signal } = aborter;

    candleBox.classList.add('loading');
    rsiBox.classList.add('loading');

    try {
      let candles = await fetchOHLC({ coinId, vsCurrency, days, signal });
      candles = downsampleCandles(candles, 800);

      // Build charts lazily
      if (!candleChart) {
        candleChart = lc.createChart(candleBox, {
          height: 360,
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
          layout: { background: { type: 'solid', color: 'transparent' }, textColor: getComputedStyle(document.documentElement).getPropertyValue('--rr-text') || '#ccc' },
          grid: { horzLines: { color: 'rgba(128,128,128,0.1)' }, vertLines: { color: 'rgba(128,128,128,0.05)' } },
        });
        candleSeries = candleChart.addCandlestickSeries({
          upColor: '#0ecb81', downColor: '#f6465d', borderVisible: false, wickUpColor: '#0ecb81', wickDownColor: '#f6465d',
        });
        sma6Series = candleChart.addLineSeries({ lineWidth: 2 });
        sma9Series = candleChart.addLineSeries({ lineWidth: 2 });
        bbUpSeries = candleChart.addLineSeries({ lineWidth: 1 });
        bbMidSeries = candleChart.addLineSeries({ lineWidth: 1, lineStyle: lc.LineStyle.Dotted });
        bbDownSeries = candleChart.addLineSeries({ lineWidth: 1 });

        // RSI chart
        rsiChart = lc.createChart(rsiBox, {
          height: 160,
          rightPriceScale: { borderVisible: false },
          timeScale: { borderVisible: false },
          layout: { background: { type: 'solid', color: 'transparent' }, textColor: getComputedStyle(document.documentElement).getPropertyValue('--rr-text') || '#ccc' },
          grid: { horzLines: { color: 'rgba(128,128,128,0.1)' }, vertLines: { color: 'rgba(128,128,128,0.05)' } },
        });
        rsiSeries = rsiChart.addLineSeries({ lineWidth: 2 });
        const rsi50 = rsiChart.addLineSeries({ lineWidth: 1 });
        rsi50.setData([]); // baseline will be set with times
      }

      // Set series data
      candleSeries.setData(candles.map(c => ({ time: c.time, open: c.open, high: c.high, low: c.low, close: c.close })));

      const closes = toCloses(candles);
      const times = candles.map(c => c.time);

      const sma6 = SMA(closes, 6);
      const sma9 = SMA(closes, 9);
      const bb = Bollinger(closes, 20, 2);
      const rsi = RSI(closes, 14);

      sma6Series.setData(zipToSeries(times, sma6));
      sma9Series.setData(zipToSeries(times, sma9));
      bbUpSeries.setData(zipToSeries(times, bb.up));
      bbMidSeries.setData(zipToSeries(times, bb.mid));
      bbDownSeries.setData(zipToSeries(times, bb.down));

      rsiSeries.setData(zipToSeries(times, rsi));

      // Y-range for RSI fixed 0-100
      rsiChart.priceScale('right').applyOptions({ scaleMargins: { top: 0.1, bottom: 0.1 } });
      rsiChart.timeScale().fitContent();
      candleChart.timeScale().fitContent();

      // remove loading
      candleBox.classList.remove('loading');
      rsiBox.classList.remove('loading');
    } catch (err) {
      console.warn('Charts load error', err);
      candleBox.classList.remove('loading');
      rsiBox.classList.remove('loading');
      candleBox.innerHTML = `<div class="rr-error">Kon grafiekdata niet laden (${err?.message || err}).</div>`;
      rsiBox.innerHTML = '';
    }
  }

  renderControls();
  loadAndRender(90);

  // Handle resize
  const ro = new ResizeObserver(() => {
    if (candleChart) candleChart.applyOptions({ width: root.clientWidth });
    if (rsiChart) rsiChart.applyOptions({ width: root.clientWidth });
  });
  ro.observe(root);

  return {
    destroy() {
      try { ro.disconnect(); } catch{}
      // lightweight-charts instances do not require explicit destroy for GC, but we can remove nodes
      root.innerHTML = '';
    }
  };
}
