const routes = [
  {
    path: 'stores',
    children: [
      {
        path: '',
        name: 'FacilitiesStoresList',
        component: () => import('./FacilitiesStoresList.vue')
      },
      {
        path: 'detail',
        name: 'FacilitiesStoresDetail',
        component: () => import('./FacilitiesStoresDetail.vue')
      }
    ]
  }
]
export default routes
