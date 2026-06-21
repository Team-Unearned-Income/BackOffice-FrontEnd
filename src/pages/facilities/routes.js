import stores from './stores/routes.js'
import amenities from './amenities/routes.js'
import restroom from './restroom/routes.js'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'

const routes = [
  {
    path: 'facilities',
    component: ModuleHeader,
    children: [...stores, ...amenities, ...restroom]
  }
]

export default routes
