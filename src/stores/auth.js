import { jwtDecode } from 'jwt-decode'
import { defineStore } from 'pinia'
import { meApi } from '@/service/bo/me'

const STORE_KEY = 'auth'

const authEmpty = {
  accessToken: '',
  userName: '',
  loggedIn: false,
  // ADMIN role 확인 여부. accessToken이 httpOnly 쿠키인 경우 JWT를 디코드할 수 없어
  // `/bo/me` 응답으로만 판단 가능하므로 null(미확인)/true/false 로 캐싱한다.
  isAdmin: null
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

    // 로그인 계정의 실제 role을 `/bo/me`로 확인해 isAdmin에 캐싱한다.
    // 인증 자체가 무효한 경우(401)는 axios 인터셉터(errorResponseInterceptor)가 이미
    // 로그아웃 처리 + 로그인 페이지 이동을 담당하므로, 여기서는 "로그인은 유효하지만
    // ADMIN이 아님(403 ACCESS_DENIED)" 케이스만 isAdmin=false로 캐싱해 로그인 상태는 유지한다.
    async checkRole() {
      try {
        const me = await meApi.getMe()
        const isAdmin = me?.role === 'ADMIN'
        this.$patch({ isAdmin })
        return isAdmin
      } catch (err) {
        this.$patch({ isAdmin: false })
        return false
      }
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
  // isAdmin은 persist 대상에서 제외한다. localStorage에 남아있으면 devtools로 값을 조작해
  // 라우터 가드(ADMIN 아닌 계정의 dashboard 진입 차단)를 우회할 수 있기 때문에,
  // 새로고침/재접속 시엔 항상 null로 시작해 `/bo/me`로 다시 검증하게 한다.
  persist: {
    paths: ['accessToken', 'userName', 'loggedIn']
  }
})
