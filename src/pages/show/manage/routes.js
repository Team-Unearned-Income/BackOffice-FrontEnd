const routes = [
  {
    path: 'manage',
    children: [
      {
        path: '',
        name: 'ShowManageList',
        component: () => import('./ShowManageList.vue')
      },
      {
        path: 'detail',
        name: 'ShowManageDetail',
        component: () => import('./ShowManageDetail.vue')
      }
    ]
  }
]

export default routes
