import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'

const STORE_KEY = 'auth'

const authEmpty = {
  accessToken: '',
  userName: ''
}

export const useAuthStore = defineStore(STORE_KEY, {
  state: () => ({
    ...authEmpty
  }),

  getters: {
    isLoggedin(state) {
      return !!state.accessToken
    },

    jwtPayload(state) {
      let payload
      try {
        payload = jwtDecode(state.accessToken)
      } catch (e) {
        payload = {} // 오류 시 빈 객체 반환
      }
      return payload
    }
  },

  actions: {
    setToken(accessToken) {
      this.$patch({
        accessToken
      })
    },

    // isMasking(){
    //   try {
    //     const decoded = jwtDecode(this.accessToken)
    //     return decoded.validPassword
    //   } catch (err) {
    //     return false
    //   }
    // },

    isMasking(){
      try {
        const decoded = jwtDecode(this.accessToken)
        return decoded.validAuth
      } catch (err) {
        return false
      }
    },

    initState(res) {
      const accessToken = res.headers.authorization
      const { userName } = res.data

      this.$patch({
        accessToken,
        userName
      })
    },

    logout() {
      this.$patch(authEmpty)
    },

    async getAccessToken() {
      if (!this.isLoggedin) {
        return null
      }

      return `Bearer ${this.$state.accessToken}`
    },

    async clearAccessToken() {
      this.$patch(authEmpty)
    }
  },
  persist: true
})
