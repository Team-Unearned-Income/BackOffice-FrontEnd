/**
 * 생활패턴 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원하며 총 건수는 내려주지 않는다.
 * 삭제는 soft delete(isDeleted=true) — 유저 응답 데이터는 보존되고 앱에서만 비노출.
 */
import api from '@/common/library/axios'

const BASE = '/bo/lifestyle-patterns'

const unwrap = (res) => res?.data

export const lifePatternApi = {
  /**
   * 생활패턴 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ patterns: Array<{ id, name, type, details: Array<{ values, description }> }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 생활패턴 상세 조회 → { id, name, type, details: [{ values, description }] } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 생활패턴 저장 — body { name, type, sort, details } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 생활패턴 수정 — body { name, type, sort, details } → { updatedAt } */
  modify: (id, body) => api.put(`${BASE}/${id}`, body).then(unwrap),

  /** 생활패턴 삭제 (soft delete) → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default lifePatternApi
