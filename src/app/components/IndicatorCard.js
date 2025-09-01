export function IndicatorCard({title,valueText,tone='neutral',hint=''}){
  const el=document.createElement('div');
  el.className=`rr-card rr-ind-card tone-${tone}`;
  el.innerHTML=`<div class="rr-ind-title">${title}</div>
                <div class="rr-ind-value">${valueText||'-'}</div>
                ${hint?`<div class="rr-ind-hint">${hint}</div>`:''}`;
  return el;
}
