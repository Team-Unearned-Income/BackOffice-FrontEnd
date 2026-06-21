const routes = [
  {
    path: 'users',
    children: [
      {
        path: '',
        name: 'UsersList',
        component: () => import('./UsersList.vue')
      },
      {
        path: 'detail',
        name: 'UsersDetail',
        component: () => import('./UsersDetail.vue')
      }
    ]
  }

]

export default routes
