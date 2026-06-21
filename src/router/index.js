import { createRouter, createWebHistory } from 'vue-router'
import { ref } from 'vue'

import routes from './routes.js'

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
    // previousQueryUrl.value = from.fullPath
    // const user = sessionStorage.getItem('user')
    if (to.matched.some((routeInfo) => routeInfo.meta.authRequired)) {
      next()
      // if (!user) {
      //   alert('로그인후 이용바랍니다.')
      //   router.replace({ name: 'Login' }).then(() => {
      //     next()
      //   })
      // } else {
      //   next()
      // }
    } else {
      next()
    }
  })
}

export { previousQueryUrl }

export default router
