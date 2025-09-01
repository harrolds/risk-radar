// Technical indicators for RiskRadar charts
// Inputs: array of { time, open, high, low, close } or arrays of closes
export function toCloses(ohlc) {
  return ohlc.map(c => Number(c.close));
}

export function SMA(values, period) {
  const out = new Array(values.length).fill(null);
  if (period <= 0) return out;
  let sum = 0;
  for (let i=0; i<values.length; i++) {
    const v = Number(values[i]);
    if (!Number.isFinite(v)) { sum += 0; } else { sum += v; }
    if (i >= period) {
      const old = Number(values[i - period]);
      sum -= Number.isFinite(old) ? old : 0;
    }
    if (i >= period - 1) {
      out[i] = sum / period;
    }
  }
  return out;
}

export function Bollinger(values, period=20, mult=2) {
  const mid = SMA(values, period);
  const up = new Array(values.length).fill(null);
  const down = new Array(values.length).fill(null);
  for (let i=0; i<values.length; i++) {
    if (mid[i] == null) continue;
    // Compute std dev over window
    const start = i - period + 1;
    const window = values.slice(start, i+1).map(Number);
    const m = mid[i];
    const variance = window.reduce((acc, x) => acc + Math.pow(x - m, 2), 0) / period;
    const sd = Math.sqrt(variance);
    up[i] = m + mult * sd;
    down[i] = m - mult * sd;
  }
  return { mid, up, down };
}

export function RSI(values, period=14) {
  const out = new Array(values.length).fill(null);
  if (period <= 0) return out;

  let gain = 0, loss = 0;
  for (let i=1; i<=period; i++) {
    const change = Number(values[i]) - Number(values[i-1]);
    if (change > 0) gain += change; else loss -= change;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain/avgLoss)));

  for (let i=period+1; i<values.length; i++) {
    const change = Number(values[i]) - Number(values[i-1]);
    const g = change > 0 ? change : 0;
    const l = change < 0 ? -change : 0;
    avgGain = ((avgGain * (period - 1)) + g) / period;
    avgLoss = ((avgLoss * (period - 1)) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain/avgLoss)));
  }
  return out;
}

export function zipToSeries(times, values) {
  const out = [];
  for (let i=0; i<times.length; i++) {
    const v = values[i];
    if (v == null || Number.isNaN(v)) continue;
    out.push({ time: times[i], value: Number(v) });
  }
  return out;
}
