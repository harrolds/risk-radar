export function RiskGauge(score=50,label='Risk'){const el=document.createElement('div');el.className='rr-gauge';const s=Math.min(100,Math.max(0,Number(score)||0));const color=s<=33?'var(--ok)':s<=66?'var(--warn)':'var(--danger)';el.innerHTML=`
  <div class="rr-gauge-arc" style="color:${color};">
    <svg viewBox="0 0 200 120" width="100%" height="100" aria-hidden="true">
      <path d="M10,110 A90,90 0 0,1 190,110" fill="none" stroke="var(--border)" stroke-width="16" stroke-linecap="round"/>
      <path d="M10,110 A90,90 0 0,1 190,110" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round"
            stroke-dasharray="282" stroke-dashoffset="${282 - 282*(s/100)}"/>
    </svg>
    <div class="rr-gauge-center">
      <div class="rr-gauge-score">${s}</div>
      <div class="rr-gauge-text">${s<=33?'Low Risk':s<=66?'Medium Risk':'High Risk'}</div>
      <div class="rr-gauge-hint">0 = safer · 100 · riskier</div>
    </div>
  </div>`;return el;}
