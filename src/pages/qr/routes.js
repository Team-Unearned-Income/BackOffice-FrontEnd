const routes = [
  {
    path: 'scan',
    name: 'QRScanner',
    component: () => import('./QRScanner.vue')
  },
  {
    path: 'ticket/:id',
    name: 'QRTicket',
    component: () => import('./QRTicket.vue'),
  }

]

export default routes
