import loginRoutes from '/src/pages/login/routes.js'
import homeRoutes from '/src/pages/home/routes.js'

// Knock-in BO 메뉴 라우트
import dashboardRoutes from '/src/pages/dashboard/routes.js'
import memberRoutes from '/src/pages/member/routes.js'
import postRoutes from '/src/pages/post/routes.js'
import reportRoutes from '/src/pages/report/routes.js'
import verificationRoutes from '/src/pages/verification/routes.js'
import supportRoutes from '/src/pages/support/routes.js'

// 기존 seoulland 라우트 (LNB 미노출, 추후 정리 예정)
import operateRoutes from '/src/pages/operate/routes.js'
import showRoutes from '/src/pages/show/routes.js'
import marketingRoutes from '/src/pages/marketing/routes.js'
import facilitiesRoutes from '/src/pages/facilities/routes.js'
import siteRoutes from '/src/pages/site/routes.js'
import qrRoutes from '/src/pages/qr/routes.js'

const routes = [
  {
    path: '/',
    component: () => import('@/pages/login/Login.vue'),
    // UI 작업용: 로그인 없이 첫 화면(대시보드)으로 바로 진입. 로그인은 /login 으로 여전히 접근 가능.
    // TODO: 백엔드 연동 후 redirect: { name: 'Login' } 로 복구
    redirect: '/dashboard',
    children: [...loginRoutes]
  },
  {
    path: '/',
    component: () => import('@/components/layout/MainLayout.vue'),
    meta: { authRequired: true },
    children: [
      ...homeRoutes,
      ...dashboardRoutes,
      ...memberRoutes,
      ...postRoutes,
      ...reportRoutes,
      ...verificationRoutes,
      ...supportRoutes,
      ...operateRoutes,
      ...showRoutes,
      ...facilitiesRoutes,
      ...marketingRoutes,
      ...siteRoutes,
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: import('@/pages/error/NotFound.vue')
  },
  {
    path: '/qr',
    children:[
      ...qrRoutes
    ]
  }
]

export default routes
