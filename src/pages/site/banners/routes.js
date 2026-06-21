const routes = [
  {
    path: 'banners',
    children: [
      {
        path: '',
        name: 'BannersList',
        component: () => import('./BannersList.vue')
      },
      {
        path: 'detail',
        name: 'BannersDetail',
        component: () => import('./BannersDetail.vue')
      }
    ]
  }
]

export default routes
