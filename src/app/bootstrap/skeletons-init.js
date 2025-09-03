// src/app/bootstrap/skeletons-init.js
// Toont skeletons tijdens CG-calls. Containers (optioneel in je DOM):
//   #coins-list, #watchlist-list, #trending-list
(function(){
  const SEL = {
    coins:     '#coins-list',
    watchlist: '#watchlist-list',
    trending:  '#trending-list'
  };

  function ensureSkeleton(mount, type='coins') {
    const host = document.querySelector(mount);
    if (!host) return null;

    let sk = host.querySelector(':scope > .rr-skeleton');
    if (!sk) {
      sk = document.createElement('div');
      sk.className = 'rr-skeleton';
      sk.setAttribute('aria-hidden', 'true');
      sk.innerHTML = skeletonMarkup(type);
      host.prepend(sk);
    }
    sk.hidden = false;
    // Verberg echte inhoud (simpel: alles behalve skeleton)
    Array.from(host.children).forEach(ch => { if (ch !== sk) ch.style.opacity = '0.35'; });
    return sk;
  }

  function hideSkeleton(mount) {
    const host = document.querySelector(mount);
    if (!host) return;
    const sk = host.querySelector(':scope > .rr-skeleton');
    if (sk) sk.hidden = true;
    Array.from(host.children).forEach(ch => { if (ch !== sk) ch.style.opacity = ''; });
  }

  function skeletonMarkup(type) {
    const rows = (type === 'trending') ? 6 : 10;
    let html = '<div class="rr-skeleton-list">';
    for (let i=0;i<rows;i++){
      html += `
        <div class="skel-row">
          <div class="skel skel--avatar"></div>
          <div class="skel-col" style="gap:6px;min-width:0;">
            <div class="skel skel--line" style="width:55%"></div>
            <div class="skel skel--line" style="width:35%"></div>
          </div>
          <div class="skel skel--chip" style="width:72px"></div>
        </div>`;
    }
    html += '</div>';
    return html;
  }

  function applyStart(detail){
    if (!detail) return;
    const { endpoint, isWatchlist } = detail;
    if (endpoint === 'search_trending') {
      ensureSkeleton(SEL.trending, 'trending'); return;
    }
    if (endpoint === 'coins_markets') {
      if (isWatchlist) ensureSkeleton(SEL.watchlist, 'watchlist');
      else ensureSkeleton(SEL.coins, 'coins');
    }
  }
  function applyEnd(detail){
    if (!detail) return;
    const { endpoint, isWatchlist } = detail;
    if (endpoint === 'search_trending') {
      hideSkeleton(SEL.trending); return;
    }
    if (endpoint === 'coins_markets') {
      if (isWatchlist) hideSkeleton(SEL.watchlist);
      else hideSkeleton(SEL.coins);
    }
  }

  window.addEventListener('rr:cg:start', (e)=> applyStart(e.detail));
  window.addEventListener('rr:cg:end',   (e)=> applyEnd(e.detail));
})();
