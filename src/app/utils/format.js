export function formatPriceEUR(value){
  const n = Number(value ?? 0);
  return n.toLocaleString('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 5, maximumFractionDigits: 5 });
}
export function formatPct2(value){
  const n = Number(value ?? 0);
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}
