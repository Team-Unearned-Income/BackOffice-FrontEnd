import loginRoutes from '/src/pages/login/routes.js'
import homeRoutes from '/src/pages/home/routes.js'

// Knock-in BO 메뉴 라우트
import dashboardRoutes from '/src/pages/dashboard/routes.js'
import memberRoutes from '/src/pages/member/routes.js'
import postRoutes from '/src/pages/post/routes.js'
import reportRoutes from '/src/pages/report/routes.js'
import verificationRoutes from '/src/pages/verification/routes.js'
import supportRoutes from '/src/pages/support/routes.js'
import lifePatternRoutes from '/src/pages/lifePattern/routes.js'
import roomTypeRoutes from '/src/pages/roomType/routes.js'
import termsRoutes from '/src/pages/terms/routes.js'

// 기존 seoulland 라우트는 src/sample/ 로 분리 보관 (LNB 미노출, 라우터 미연결)

const routes = [
  {
    path: '/',
    // UI 작업용: 로그인 없이 첫 화면(대시보드)으로 바로 진입. 로그인은 /login 으로 여전히 접근 가능.
    // TODO: 백엔드 연동 후 redirect: { name: 'Login' } 로 복구
    redirect: '/dashboard'
  },
  // 소셜 로그인 / OAuth 콜백 (LNB·헤더 없는 단독 화면)
  ...loginRoutes,
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
      ...lifePatternRoutes,
      ...roomTypeRoutes,
      ...termsRoutes,
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    component: import('@/pages/error/NotFound.vue')
  }
]

export default routes
