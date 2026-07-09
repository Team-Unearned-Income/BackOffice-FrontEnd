/**
 * 신원 인증 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원.
 *
 * ⚠ 백엔드 확인된 이슈 (2026-07 기준, `AuthenticationRepositoryImpl` 참조)
 * - `GET /bo/verifications/wait` 응답 DTO(`BoVerificationWaitingListDto.Response.EmployeeAuthItem`)에
 *   `id` 필드가 없어 목록 행에서 상세/승인/반려로 연결할 id를 받을 수 없음.
 * - `findVerificationsList`/`findVerifications`의 조회 조건이 반려(`REJECT`) 목록과 동일하게 걸려 있어
 *   실제 "대기" 건이 아니라 반려된 건이 내려올 수 있음.
 * 즉 검토 대기 탭은 API 계약대로 연동은 하되, 백엔드 수정 전까지 상세 진입·승인·반려가
 * 정상 동작하지 않을 수 있음.
 */
import api from '@/common/library/axios'

const BASE = '/bo/verifications'

const unwrap = (res) => res?.data

export const verificationApi = {
  /** 승인 완료 목록 조회 → { employeeAuth: [{ name, type, isAccepted, email, createAt, accepter }] } */
  getApproveList: (params) => api.get(`${BASE}/approve`, { params }).then(unwrap),

  /** 반려 목록 조회 → { employeeAuth: [{ name, type, isAccepted, email, createAt, description }] } */
  getCancelList: (params) => api.get(`${BASE}/cancel`, { params }).then(unwrap),

  /** 검토 대기 목록 조회 → { employeeAuth: [{ name, type, isAccepted, email, createAt }] } (id 없음, 위 주석 참조) */
  getWaitList: (params) => api.get(`${BASE}/wait`, { params }).then(unwrap),

  /** 검토 대기 상세 조회 → { id, name, type, isAccepted, email, createAt, elapsedAt } */
  getWaitDetail: (id) => api.get(`${BASE}/wait/${id}`).then(unwrap),

  /** 인증 승인 → { updatedAt } */
  approve: (id) => api.patch(`${BASE}/wait/${id}/approve`).then(unwrap),

  /** 인증 반려 → { updatedAt } */
  reject: (id) => api.patch(`${BASE}/wait/${id}/cancel`).then(unwrap)
}

export default verificationApi
