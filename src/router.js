export class Router{
  constructor(root){
    this.root=root
    this.routes={
      '/': () => import('./ui/pages/HomePage/index.js').then(m=>m.default()),
      '/home': () => import('./ui/pages/HomePage/index.js').then(m=>m.default()),
      '/coins': () => import('./ui/pages/CoinsPage/index.js').then(m=>m.default())
    }
    this.onLinkClick=this.onLinkClick.bind(this)
    window.addEventListener('popstate',()=>this.render(location.pathname))
    document.addEventListener('click',this.onLinkClick)
  }
  onLinkClick(e){
    const a = e.target.closest('a[data-link]'); if(!a) return
    const href=a.getAttribute('href'); if(href.startsWith('http')) return
    e.preventDefault(); history.pushState({},'',href); this.render(href); this.highlight(href)
  }
  async render(path){
    const loader=this.routes[path]||this.routes['/']
    this.root.innerHTML='<div class="container"><div class="section">Laden…</div></div>'
    const html = await loader()
    this.root.innerHTML = html
    this.highlight(path)
  }
  highlight(path){
    document.querySelectorAll('#bottomnav a[data-link]').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===path))
  }
  start(){ this.render(location.pathname||'/'); this.highlight(location.pathname||'/') }
}
