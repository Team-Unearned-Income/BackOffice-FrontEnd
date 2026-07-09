/**
 * 방 유형 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원하며 총 건수는 내려주지 않는다.
 * 삭제는 soft delete(isDeleted=true)이지만, 목록 조회 쿼리가 isDeleted를 필터링하지 않아
 * 삭제 후에도 목록에 남아있을 수 있음(백엔드 이슈) — 확인 필요.
 */
import api from '@/common/library/axios'

const BASE = '/bo/room-types'

const unwrap = (res) => res?.data

export const roomTypeApi = {
  /**
   * 방 유형 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ roomType: Array<{ id, name }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 방 유형 상세 조회 → { id, name } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 방 유형 저장 — body { name } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 방 유형 수정 — body { name } → { updatedAt } */
  modify: (id, body) => api.put(`${BASE}/${id}`, body).then(unwrap),

  /** 방 유형 삭제 (soft delete) → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default roomTypeApi
