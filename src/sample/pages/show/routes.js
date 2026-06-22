import reserveRoutes from './reserve/routes.js'
import manageRoutes from './manage/routes.js'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'

const routes = [
  {
    path: 'show',
    component: ModuleHeader,
    children: [...reserveRoutes, ...manageRoutes]
  }
]

export default routes
