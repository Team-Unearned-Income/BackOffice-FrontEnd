import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import ModuleHeader from '@/components/layout/ModuleHeader.vue'
import MainLayout from '@/components/layout/MainLayout.vue'

export default {
  install: (App) => {
    App.component('AlarmDialog', AlarmDialog)
    App.component('ModuleHeader', ModuleHeader)
    App.component('MainLayout', MainLayout)
  }
}
