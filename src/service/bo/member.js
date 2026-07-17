/**
 * 회원 관리 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort) + searchName/searchState/searchApproveType만 지원.
 *
 * ⚠ 백엔드 확인된 이슈 (2026-07 기준, `MemberRepositoryImpl` 참조) — 실제 admin JWT로 직접 호출해서 재현 확인함
 * - `GET /bo/member/{id}` 상세 조회는 **항상 500**. `BoMemberDetailDto.Response.state` 필드가
 *   `MemberState`(enum)가 아니라 `State`(엔티티) 타입으로 잘못 선언돼 있어, 쿼리가 enum 값을
 *   그 필드에 매핑하려다 리플렉션에서 타입 불일치로 예외가 남.
 * - `GET /bo/member` 목록의 `authenticationType` 필드도 실제로는 `authenticationApprove.status`
 *   (`ApproveType`: PENDING/ACCEPTED/REJECT)를 매핑하고 있어 필드명(`AuthenticationType`: STUDENT/COMPANY)과
 *   타입·의미가 다름. 인증 이력이 없는 회원은 null이라 안 죽지만, 인증을 제출한 회원을 조회하면
 *   상세와 동일하게 500이 날 가능성이 높음.
 * - `PATCH /bo/member/cancel/{id}`(정지) 상응하는 "정지 해제" API가 없음 — 한번 정지시키면 BO로는 되돌릴 방법이 없음.
 */
import api from '@/common/library/axios'

const BASE = '/bo/member'

const unwrap = (res) => res?.data

export const memberApi = {
  /** 회원 목록 조회 → { memberInfoList: [{ id, name, email, createdAt, authenticationType, role, state }] } */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 회원 상세 조회 → { id, name, email, createdAt, authenticationInfoList, role, state, gender, birth, reportCount } (현재 백엔드 버그로 항상 500, 위 주석 참조) */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 회원 정지 (INACTIVE로 변경, 되돌리는 API 없음) → { updatedAt } */
  suspend: (id) => api.patch(`${BASE}/cancel/${id}`).then(unwrap),

  /** 회원 권한 수정 — body { memberRole: 'ADMIN' | 'USER' } → { updatedAt } */
  setAuth: (id, memberRole) => api.patch(`${BASE}/auth/${id}`, { memberRole }).then(unwrap)
}

export default memberApi
