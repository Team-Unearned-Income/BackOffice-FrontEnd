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
  return router.beforeEach(async (to, from, next) => {
    previousQueryUrl.value = from.fullPath
    if (to.matched.some((routeInfo) => routeInfo.meta.authRequired)) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedin) {
        next({ name: 'Login' })
        return
      }
      // ADMIN이 아니면 대시보드 등 authRequired 라우트(LNB 메뉴 전체 + 직접 URL 접근 포함)
      // 진입 자체를 막고 '권한이 필요합니다' 페이지로 보낸다.
      // isAdmin === false로 이미 확인된 상태면 재확인 없이 바로 막는다.
      if (authStore.isAdmin === false) {
        next({ name: 'Forbidden' })
        return
      }
      // isAdmin이 아직 미확인(null)이면 `/bo/me`로 한 번 확인 후 캐싱한다.
      if (authStore.isAdmin !== true) {
        const isAdmin = await authStore.checkRole()
        if (!isAdmin) {
          next({ name: 'Forbidden' })
          return
        }
      }
    }
    next()
  })
}

export { previousQueryUrl }

export default router
