/**
 * 1:1 문의 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController`, `InquirieController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원.
 */
import api from '@/common/library/axios'

const BASE = '/bo/inquiries'
const CATEGORY_BASE = '/inquiries/categorys'

const unwrap = (res) => res?.data

export const inquiryApi = {
  /**
   * 문의 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ inquiries: Array<{ id, title, writer, status, createAt, type }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 문의 상세 조회 → { inquirie: { id, title, contents, writer, status, createAt, type, reply: [] } } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 문의 답변 저장 — body { inquirieId, contents } → { updatedAt } */
  reply: (body) => api.post(BASE, body).then(unwrap),

  /** 문의 카테고리 목록 조회 → { inquirieCategorys: [{ id, name }] } */
  getCategoryList: () => api.get(CATEGORY_BASE).then(unwrap)
}

export default inquiryApi
