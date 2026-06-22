const routes = [
  {
    path: 'restroom',
    children: [
      {
        path: '',
        name: 'FacilitiesRestroomList',
        component: () => import('./FacilitiesRestroomList.vue')
      },
      {
        path: 'detail',
        name: 'FacilitiesRestroomDetail',
        component: () => import('./FacilitiesRestroomDetail.vue')
      }
    ]
  }
]
export default routes
