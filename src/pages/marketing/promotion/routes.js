const routes = [
  {
    path: 'promotion',
    children: [
      {
        path: '',
        name: 'PromotionList',
        component: () => import('./PromotionList.vue')
      },
      {
        path: 'detail',
        name: 'PromotionDetail',
        component: () => import('./PromotionDetail.vue')
      }
    ]
  }
]

export default routes
