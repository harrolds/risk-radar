export function Footer() {
  const el = document.createElement('footer');
  el.className = 'rr-footer';
  el.innerHTML = `
    <div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
      <span class="rr-subtle">© ${new Date().getFullYear()} RiskRadar</span>
      <span class="rr-subtle">v1.0 Fase 1</span>
    </div>
  `;
  return el;
}
