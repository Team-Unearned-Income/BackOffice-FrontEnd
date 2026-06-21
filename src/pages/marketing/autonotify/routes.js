const routes = [
  {
    path: 'auto-alarm',
    children: [
      {
        path: '',
        name: 'AutoNotifyList',
        component: () => import('./MarketingAutoNotifyList.vue')
      },
      {
        path: 'edit',
        name: 'AutoNotifyEdit',
        component: () => import('./MarketingAutoNotifyEdit.vue')
      },
      {
        path: 'detail',
        name: 'AutoNotifyDetail',
        component: () => import('./MarketingAutoNotifyDetail.vue')
      }
    ]
  }

]

export default routes
