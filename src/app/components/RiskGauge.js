import { t } from '../i18n/index.js';
export function RiskGauge(score=50, variant='main'){
  const s=Math.min(100,Math.max(0,Number(score)||0));
  const color=s<=33?'var(--ok)':s<=66?'var(--warn)':'var(--danger)';
  const el=document.createElement('div');
  el.className='rr-gauge '+(variant==='mini'?'rr-gauge-mini':'');
  const isMini=variant==='mini'; const radius=isMini?40:90; const stroke=isMini?6:16;
  const vb=isMini?'0 0 100 60':'0 0 200 120'; const y=isMini?50:110; const end=isMini?90:190;
  const circumference=Math.PI*radius; const offset=circumference - circumference*(s/100);
  el.innerHTML=`
    <svg viewBox="${vb}" width="100%" height="${isMini?40:100}" aria-hidden="true">
      <path d="M10,${y} A${radius},${radius} 0 0,1 ${end},${y}" fill="none" stroke="var(--border)" stroke-width="${stroke}" stroke-linecap="round"/>
      <path d="M10,${y} A${radius},${radius} 0 0,1 ${end},${y}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
    </svg>
    ${isMini?'':`<div class="rr-gauge-center"><div class="rr-gauge-score">${s}</div><div class="rr-gauge-text">${s<=33?'Low Risk':s<=66?'Medium Risk':'High Risk'}</div><div class="rr-gauge-hint">0 = safer · 100 · riskier</div></div>`}
  `;
  return el;
}