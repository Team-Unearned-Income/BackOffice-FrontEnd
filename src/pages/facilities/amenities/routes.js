const routes = [
  {
    path: 'amenities',
    children: [
      {
        path: '',
        name: 'FacilitiesAmenitiesList',
        component: () => import('./FacilitiesAmenitiesList.vue')
      },
      {
        path: 'detail',
        name: 'FacilitiesAmenitiesDetail',
        component: () => import('./FacilitiesAmenitiesDetail.vue')
      }
    ]
  }
]
export default routes
