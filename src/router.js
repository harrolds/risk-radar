export class Router{
  constructor(root){
    this.root=root;
    this.routes={
      '/':()=>'<h1>Home Page (skeleton)</h1>',
      '/coins':()=>'<h1>Coins Page (skeleton)</h1>'
    }
  }
  render(path){this.root.innerHTML=this.routes[path]||'<h1>Not found</h1>'}
  start(){this.render(location.pathname||'/')}
}
