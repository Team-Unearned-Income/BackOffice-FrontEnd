const routes = [
  {
    path: 'admins',
    children: [
      {
        path: '',
        name: 'AdminsList',
        component: () => import('./AdminsList.vue')
      },
      {
        path: 'detail',
        name: 'AdminsDetail',
        component: () => import('./AdminsDetail.vue')
      }
    ]
  },
  {
    path: 'admin-ips',
    name: 'AdminIPList',
    component: () => import('./AdminIPList.vue')
  }
]

export default routes
