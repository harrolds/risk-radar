// src/app/utils/debounce.js
// Eenvoudige debounce helper (standaard 300ms). Werkt met waarde-doorvoer.
export function debounce(fn, wait = 300) {
  let t = null;
  return function debounced(...args) {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
