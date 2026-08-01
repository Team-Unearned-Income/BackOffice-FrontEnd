/**
 * 생활패턴 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원하며 총 건수는 내려주지 않는다.
 * 삭제는 soft delete(isDeleted=true) — 유저 응답 데이터는 보존되고 앱에서만 비노출.
 */
import api from '@/common/library/axios'
import { toMultipart } from './common/toMultipart'

const BASE = '/bo/lifestyle-patterns'

const unwrap = (res) => res?.data

export const lifePatternApi = {
  /**
   * 생활패턴 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ patterns: Array<{ id, name, type, details: Array<{ values, description }> }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 생활패턴 상세 조회 → { id, name, image, type, details: [{ values, description }] } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /**
   * 생활패턴 저장 — multipart(request: { name, type, sort, details }, file?: 이미지) → { updatedAt }
   * @param {object} body
   * @param {File|null} [image]
   */
  save: (body, image) => api.post(BASE, toMultipart(body, image)).then(unwrap),

  /**
   * 생활패턴 수정 — multipart(request: { name, type, sort, details }, file?: 이미지) → { updatedAt }
   * 이미지 미첨부 시 기존 이미지가 유지된다(교체만 가능, 단독 삭제 불가 — 백엔드 정책).
   * @param {object} body
   * @param {File|null} [image]
   */
  modify: (id, body, image) => api.put(`${BASE}/${id}`, toMultipart(body, image)).then(unwrap),

  /** 생활패턴 삭제 (soft delete) → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default lifePatternApi
