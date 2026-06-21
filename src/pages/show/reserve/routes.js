const routes = [
  {
    path: 'reserve-list',
    name: 'ShowReserveList',
    component: () => import('./ShowReserveList.vue')
  },
  {
    path: 'reserve-current',
    name: 'ShowReserveCurrent',
    component: () => import('./ShowReserveCurrent.vue')
  },
  {
    path: 'failed-showEvent',
    name: 'ShowFailedReserve',
    component: () => import('./ShowFailedReserve.vue')
  }
]

export default routes
