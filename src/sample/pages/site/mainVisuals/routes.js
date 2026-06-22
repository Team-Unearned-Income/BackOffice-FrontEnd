const routes = [
  {
    path: 'main-visuals',
    children: [
      {
        path: '',
        name: 'MainVisualsList',
        component: () => import('./MainVisualsList.vue')
      },
      {
        path: 'detail',
        name: 'MainVisualsDetail',
        component: () => import('./MainVisualsDetail.vue')
      }
    ]
  }

]

export default routes
