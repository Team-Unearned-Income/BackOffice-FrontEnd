/**
 * FAQ API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원하며 { id, title, sort }만 내려온다.
 * 카테고리/노출 상태 개념은 백엔드에 없음 — title/contents/sort만 존재.
 */
import api from '@/common/library/axios'

const BASE = '/bo/faq'

const unwrap = (res) => res?.data

export const faqApi = {
  /**
   * FAQ 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ faqInfoList: Array<{ id, title, sort }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** FAQ 상세 조회 → { id, title, contents, sort, createAt, updatedAt } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** FAQ 저장 — body { title, contents, sort } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** FAQ 수정 — body { id, title, contents, sort } → { updatedAt } */
  modify: (body) => api.put(BASE, body).then(unwrap),

  /** FAQ 삭제 → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default faqApi
