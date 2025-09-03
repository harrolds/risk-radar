// src/app/bootstrap/skeletons-init.js
// Toont skeletons alléén bij initieel laden (lege lijsten). Geen dimmen van bestaande content.
// Containers (optioneel in je DOM):
//   #coins-list, #watchlist-list, #trending-list
(function () {
  const SEL = {
    coins: '#coins-list',
    watchlist: '#watchlist-list',
    trending: '#trending-list',
  };

  function getHost(sel) {
    return document.querySelector(sel);
  }
  function listCount(host) {
    if (!host) return 0;
    const list = host.querySelector('ul, ol');
    return list ? list.children.length : 0;
  }
  function containerIsEmpty(sel) {
    const host = getHost(sel);
    return host ? listCount(host) === 0 : false;
  }

  function skeletonMarkup(type) {
    const rows = type === 'trending' ? 6 : 10;
    let html = '<div class="rr-skeleton-list">';
    for (let i = 0; i < rows; i++) {
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

  function ensureSkeleton(sel, type) {
    const host = getHost(sel);
    if (!host) return null;

    // Alleen als de container nog leeg is tonen we skeletons
    if (!containerIsEmpty(sel)) return null;

    let sk = host.querySelector(':scope > .rr-skeleton');
    if (!sk) {
      sk = document.createElement('div');
      sk.className = 'rr-skeleton';
      sk.setAttribute('aria-hidden', 'true');
      sk.innerHTML = skeletonMarkup(type);
      host.prepend(sk);
    }
    sk.hidden = false;
    return sk;
  }

  function hideSkeleton(sel) {
    const host = getHost(sel);
    if (!host) return;
    const sk = host.querySelector(':scope > .rr-skeleton');
    if (sk) sk.hidden = true;
  }

  // Start/End handlers — toon alleen skeletons bij échte "leeg → laden" situaties
  function onStart(detail) {
    if (!detail) return;
    const { endpoint, ids = '' } = detail;

    // Trending: alleen skeleton als trending-container leeg is
    if (endpoint === 'search_trending') {
      if (containerIsEmpty(SEL.trending)) ensureSkeleton(SEL.trending, 'trending');
      return;
    }

    // Coins markets:
    // - Zonder ids => volledige lijst (Coins): skeleton alleen als coins-container leeg is
    // - Met ids    => batch refresh / watchlist: géén skeleton voor coins;
    //                alleen tonen als er een watchlist-container is én die leeg is
    if (endpoint === 'coins_markets') {
      if (ids) {
        if (containerIsEmpty(SEL.watchlist)) ensureSkeleton(SEL.watchlist, 'watchlist');
      } else {
        if (containerIsEmpty(SEL.coins)) ensureSkeleton(SEL.coins, 'coins');
      }
    }
  }

  function onEnd(detail) {
    if (!detail) return;
    const { endpoint, ids = '' } = detail;

    if (endpoint === 'search_trending') {
      hideSkeleton(SEL.trending);
      return;
    }
    if (endpoint === 'coins_markets') {
      if (ids) {
        hideSkeleton(SEL.watchlist);
      } else {
        hideSkeleton(SEL.coins);
      }
    }
  }

  window.addEventListener('rr:cg:start', (e) => onStart(e.detail));
  window.addEventListener('rr:cg:end', (e) => onEnd(e.detail));
})();
