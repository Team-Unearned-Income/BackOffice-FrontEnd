/**
 * 공지사항 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원.
 */
import api from '@/common/library/axios'

const BASE = '/bo/notices'

const unwrap = (res) => res?.data

export const noticeApi = {
  /**
   * 공지사항 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ notices: Array<{ id, title, writer, createAt }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 공지사항 상세 조회 → { notice: { id, title, contents, writer, createAt } } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 공지사항 저장 — body { title, contents } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 공지사항 수정 — body { title, contents } → { updatedAt } */
  modify: (id, body) => api.put(`${BASE}/${id}`, body).then(unwrap),

  /** 공지사항 삭제 → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default noticeApi
