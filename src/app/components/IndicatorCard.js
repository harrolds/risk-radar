import { RiskGauge } from './RiskGauge.js';
const iconMap = {
  rsi: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M4 12c2-4 6-4 8 0s6 4 8 0"/></svg>',
  macd: '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="4" y="10" width="2" height="8" fill="currentColor"/><rect x="9" y="6" width="2" height="12" fill="currentColor"/><rect x="14" y="12" width="2" height="6" fill="currentColor"/><rect x="19" y="8" width="2" height="10" fill="currentColor"/></svg>',
  ma: '<svg viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="2" d="M3 17c3-5 6-9 9-5s6 8 9 2"/></svg>',
  boll: '<svg viewBox="0 0 24 24" width="18" height="18"><ellipse cx="12" cy="12" rx="9" ry="5" stroke="currentColor" fill="none" stroke-width="2"/></svg>'
};
export function IndicatorCard({ title, valueText, tone='neutral', hint='', score=50, type }) {
  const el=document.createElement('div');
  el.className=`rr-card rr-ind-card tone-${tone}`;
  const icon=iconMap[type]||'';
  el.innerHTML=`
    <div class="rr-ind-top">
      <div class="rr-ind-icon">${icon}</div>
      <div class="rr-ind-title">${title}</div>
    </div>
    <div class="rr-ind-value">${valueText||'-'}</div>
    ${hint?`<div class="rr-ind-hint">${hint}</div>`:''}
    <div class="rr-ind-gauge"></div>
  `;
  const g=el.querySelector('.rr-ind-gauge'); if(g) g.appendChild(RiskGauge(score||50,'mini'));
  return el;
}
