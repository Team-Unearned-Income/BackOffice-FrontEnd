const routes = [
  {
    path: 'change-password',
    name: 'ChangePassword',
    component: () => import('../authManagement/ChangePassword.vue')
  },
  {
    path: 'login-logs',
    name: 'LoginLogs',
    component: () => import('../authManagement/LoginLogs.vue')
  },
  {
    path: 'auth-logs',
    name: 'AuthLogs',
    component: () => import('../authManagement/AuthApiLogs.vue')
  }
]

export default routes
