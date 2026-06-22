const routes = [
  {
    path: 'notify',
    children: [
      {
        path: '',
        name: 'NotifyList',
        component: () => import('./MarketingNotifyList.vue')
      },
      {
        path: 'detail',
        name: 'NotifyDetail',
        component: () => import('./MarketingNotifyDetail.vue')
      }
    ]
  }

]

export default routes
