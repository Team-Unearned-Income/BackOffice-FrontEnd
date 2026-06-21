import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

const STORE_KEY = 'user'

const userEmpty = {
  name: undefined,
  nickName: undefined,
  email: undefined,
  profileImage: undefined,
  snsId: undefined,
  joinRoute: undefined,
  isNewMember: false,
  isIdentity: false,
  isAuthEmail: false
}

export const useUserStore = defineStore(STORE_KEY, {
  state: () => ({
    ...userEmpty
  }),
  getters: {
    /** 사용자 ID */
    id() {
      const auth = useAuthStore()
      return auth.jwtPayload.userId
    },
    /** 사용자 권한 */
    role() {
      return useAuthStore().jwtPayload.role
    },
    adminId(){
      return useAuthStore().jwtPayload.adminId
    }
  },
  actions: {
    $reset() {
      this.$patch(userEmpty)
    },
    get emptyState() {
      return userEmpty
    }
  },
  persist: true
})
