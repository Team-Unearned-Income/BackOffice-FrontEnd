const routes = [
  {
    path: 'attraction',
    children: [
      {
        path: '',
        name: 'AttractionList',
        component: () => import('./AttractionList.vue')
      },
      {
        path: 'detail',
        name: 'AttractionDetail',
        component: () => import('./AttractionDetail.vue')
      }
    ]
  },
  {
    path: 'attraction-reserve',
    name: 'AttractionReserve',
    component: () => import('./AttractionReserve.vue')
  },
  {
    path: 'attraction-current',
    name: 'AttractionCurrent',
    component: () => import('./AttractionCurrent.vue')
  },
  {
    path: 'attraction-failed-reserve',
    name: 'AttractionFailedReserve',
    component: () => import('./AttractionFailedReserve.vue')
  },
]

export default routes
