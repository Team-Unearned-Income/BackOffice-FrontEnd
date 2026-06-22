import seachRoutes from './search/routes'
import promotionRoutes from './promotion/routes'
import notifyRoutes from './notify/routes'
import guidemapRoutes from './guidemap/routes'
import usersRoutes from './users/routes'
import groupTicketRoutes from './groupTicket/routes'
import alarmRoutes from './alarm/routes'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'
import autoNotifyRoutes from './autonotify/routes'

const routes = [
  {
    path: 'marketing',
    component: ModuleHeader,
    children: [
      ...seachRoutes,
      ...promotionRoutes,
      ...notifyRoutes,
      ...guidemapRoutes,
      ...usersRoutes,
      ...groupTicketRoutes,
      ...alarmRoutes,
      ...autoNotifyRoutes
    ]
  }
]

export default routes
