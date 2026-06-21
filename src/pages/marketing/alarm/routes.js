const routes = [
  {
    path: 'alarm',
    children: [
      {
        path: '',
        name: 'AlarmList',
        component: () => import('./MarketingAlarmList.vue')
      },
      {
        path: 'edit',
        name: 'AlarmEdit',
        component: () => import('./MarketingAlarmEdit.vue')
      }
    ]
  },
  {
    path: 'alarm-detail',
    name: 'AlarmDetail',
    component: () => import('./MarketingAlarmDetail.vue')
  }
]

export default routes
