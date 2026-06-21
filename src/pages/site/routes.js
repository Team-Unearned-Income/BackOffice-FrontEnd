import mainVisualsRoute from './mainVisuals/routes'
import bannersRoute from './banners/routes'
import popupsRoute from './popups/routes'
import codesRoute from './codeManagement/routes'
import adminsRoute from './admins/routes'
import authRoute from './authManagement/routes'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'

const routes = [
  {
    path: 'site',
    component: ModuleHeader,
    children: [
      ...mainVisualsRoute,
      ...bannersRoute,
      ...popupsRoute,
      ...codesRoute,
      ...adminsRoute,
      ...authRoute
    ]
  }
]

export default routes
