const routes = [
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./NotFound.vue')
  }
]

export default routes
