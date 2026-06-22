const routes = [
  {
    path: 'group-ticket',
    children: [
      {
        path: '',
        name: 'GroupTicket',
        component: () => import('./MarketingGroupTicket.vue')
      },
      {
        path: '',
        name: 'GroupTicketList',
        component: () => import('./MarketingGroupTicketList.vue')
      },
      {
        path: 'detail',
        name: 'GroupTicketDetail',
        component: () => import('./MarketingGroupTicketDetail.vue')
      }
    ]
  }
]

export default routes
