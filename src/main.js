import { Router } from './router.js'
import { renderBottomNav } from './ui/components/BottomNav.js'
import { renderTopBar } from './ui/components/TopBar.js'

renderTopBar(document.getElementById('topbar'))
renderBottomNav(document.getElementById('bottomnav'))

const router = new Router(document.getElementById('app'))
router.start()
