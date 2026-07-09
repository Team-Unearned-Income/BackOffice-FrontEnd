/**
 * 약관 관리 API (BO) — 로컬 백엔드(`latest`) 스펙 기준
 *
 * 모델: 약관 유형(termType) → 그 아래 약관 버전(terms, `current` 플래그)
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 */
import api from '@/common/library/axios'

const BASE = '/bo/terms'
const TYPE_BASE = '/bo/type/terms'
const TYPE_ONE = '/bo/type/term'

const unwrap = (res) => res?.data

export const termsApi = {
  /* ── 약관 유형 ───────────────────────────── */

  /** 약관 유형 목록 → { termTypes: [{ id, title, createAt }] } */
  getTypeList: () => api.get(TYPE_BASE).then(unwrap),

  /** 약관 유형 저장 (title 은 쿼리 파라미터 바인딩) → { updatedAt } */
  saveType: (title) => api.post(TYPE_BASE, null, { params: { title } }).then(unwrap),

  /** 약관 유형 수정 — body { title } */
  modifyType: (termTypeId, body) => api.put(`${TYPE_ONE}/${termTypeId}`, body).then(unwrap),

  /** 약관 유형 삭제 */
  removeType: (termTypeId) => api.delete(`${TYPE_ONE}/${termTypeId}`).then(unwrap),

  /* ── 약관 ────────────────────────────────── */

  /**
   * 약관 목록 조회
   * @param {{ agreementTypeId: number, page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ terms: Array<{ id, title, createAt, current: boolean }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 약관 상세 조회 → { id, title, contents, createAt } */
  getDetail: (termsId) => api.get(`${BASE}/${termsId}`).then(unwrap),

  /**
   * 약관 저장(신규)
   * @param {{ agreementTypeId: number, title: string, contents: string, isRequired: boolean }} body
   */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 약관 수정 — 임시저장 (body: 저장과 동일) */
  saveDraft: (termsId, body) => api.put(`${BASE}/${termsId}/draft`, body).then(unwrap),

  /** 약관 수정 — 게시 (body: 저장과 동일) */
  publish: (termsId, body) => api.put(`${BASE}/${termsId}/publish`, body).then(unwrap),

  /** 약관 삭제 */
  remove: (termsId) => api.delete(`${BASE}/${termsId}`).then(unwrap)
}

export default termsApi
