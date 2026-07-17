import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'

import routes from './routes.js'
import { useAuthStore } from '@/stores/auth'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

const previousQueryUrl = ref(null)

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: (to, from, savedPosition) => {
    document.querySelector('.scroll')?.scrollTo(0, 0)
    return { left: 0, top: 0 }
  },
  routes
})

export const setRouterBeforeEach = () => {
  return router.beforeEach((to, from, next) => {
    previousQueryUrl.value = from.fullPath
    if (to.matched.some((routeInfo) => routeInfo.meta.authRequired)) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedin) {
        next({ name: 'Login' })
        return
      }
    }
    next()
  })
}

export { previousQueryUrl }

export default router
