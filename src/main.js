import './assets/scss/main.scss'
import './assets/scss/common.scss'

import pinia from '@/stores'
import { createApp } from 'vue'

import quasarLang from 'quasar/lang/ko-KR'
import { Quasar, Dialog } from 'quasar'
import globalProperty from '@/plugin/globalProperty.js'
import globalComponent from '@/plugin/globalComponent.js'
import mitt from 'mitt'

import router, { setRouterBeforeEach } from './router'

import App from './App.vue'

/** Store */
const emitter = mitt()

const app = createApp(App)

setRouterBeforeEach(router)

app
  .use(pinia)
  .use(router)
  .use(globalProperty)
  .use(globalComponent)
  .use(Quasar, {
    lang: quasarLang,
    plugins: {
      Dialog
    }
  })
  .provide('emitter', emitter)
  .mount('#app')
