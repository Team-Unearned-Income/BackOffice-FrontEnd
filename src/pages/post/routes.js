const routes = [
  {
    path: 'posts',
    name: 'PostList',
    component: () => import('./PostList.vue')
  }
]

export default routes
