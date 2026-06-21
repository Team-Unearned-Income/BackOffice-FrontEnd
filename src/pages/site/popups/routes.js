const routes = [
  {
    path: 'popups',
    children: [
      {
        path: '',
        name: 'PopupsList',
        component: () => import('./PopupsList.vue')
      },
      {
        path: 'detail',
        name: 'PopupsDetail',
        component: () => import('./PopupsDetail.vue')
      }
    ]
  }

]

export default routes
