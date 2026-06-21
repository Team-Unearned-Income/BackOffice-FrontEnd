import attractionRoutes from './attraction/routes'
import lunapassRoutes from './lunapass/routes'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'

const routes = [
  {
    path: 'operate',
    component: ModuleHeader,
    children: [...lunapassRoutes, ...attractionRoutes]
  }
]

export default routes
