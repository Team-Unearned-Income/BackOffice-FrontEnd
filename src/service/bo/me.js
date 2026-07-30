/**
 * 로그인 계정 정보 API (BO) — role(ADMIN) 확인용
 *
 * accessToken이 httpOnly 쿠키로 내려와 프론트에서 role을 직접 읽을 수 없는 경우가 있어
 * `/bo/me`를 호출해 실제 role을 확인한다. `/bo/**`는 백엔드에서 ADMIN 권한만 허용하므로
 * admin이 아니면 403(ACCESS_DENIED)이 내려온다.
 */
import api from '@/common/library/axios'

const unwrap = (res) => res?.data

export const meApi = {
  /** 로그인 계정 정보 조회 → { memberId, role } */
  getMe: () => api.get('/bo/me').then(unwrap)
}

export default meApi
