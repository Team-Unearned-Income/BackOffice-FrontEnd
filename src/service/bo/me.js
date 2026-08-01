/**
 * 로그인 계정 정보 API — role(ADMIN) 확인용
 *
 * accessToken이 httpOnly 쿠키로 내려와 프론트에서 role을 직접 읽을 수 없어
 * `GET /users/me/account`로 실제 role을 확인한다. (BE dede0a64: 계정 권한 조회 API)
 */
import api from '@/common/library/axios'

const unwrap = (res) => res?.data

export const meApi = {
  /** 로그인 계정 권한 조회 → { role } */
  getMe: () => api.get('/users/me/account').then(unwrap)
}

export default meApi
