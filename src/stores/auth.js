import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'

const STORE_KEY = 'auth'

const authEmpty = {
  accessToken: '',
  userName: '',
  loggedIn: false
}

export const useAuthStore = defineStore(STORE_KEY, {
  state: () => ({
    ...authEmpty
  }),

  getters: {
    // 백엔드가 accessToken을 httpOnly 쿠키로 내려주기 때문에 JS에서 값을 읽을 수 없다.
    // 로그인 여부는 accessToken(SDK/헤더 로그인 시 채워짐) 또는 loggedIn 플래그(쿠키 로그인 시
    // /auth/success 도달로 설정)로 판단한다. 실제 API 인증은 axios withCredentials로 쿠키가 처리한다.
    isLoggedin(state) {
      return !!state.accessToken || state.loggedIn
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

    // httpOnly 쿠키라 토큰 값을 읽을 수 없는 경우, 쿠키 로그인 성공 사실만 표시
    markLoggedIn() {
      this.$patch({
        loggedIn: true
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
      this.$patch({ ...authEmpty })
    },

    // accessToken이 실제로 있을 때만 Authorization 헤더를 실어보낸다.
    // 쿠키 로그인(loggedIn=true, accessToken='')인 경우 빈 "Bearer " 헤더를 보내면
    // 백엔드가 쿠키를 확인하기도 전에 그 헤더만 보고 TOKEN_INVALID로 401을 내려버리므로
    // 헤더 자체를 생략해서 axios withCredentials로 실리는 httpOnly 쿠키가 인증되게 한다.
    async getAccessToken() {
      if (!this.$state.accessToken) {
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
