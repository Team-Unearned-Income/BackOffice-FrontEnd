/**
 * 방 추가 옵션 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원하며 총 건수는 내려주지 않는다.
 * 삭제는 soft delete(isDeleted=true)이지만, 목록 조회 쿼리가 isDeleted를 필터링하지 않아
 * 삭제 후에도 목록에 남아있을 수 있음(백엔드 이슈, roomType과 동일한 패턴) — 확인 필요.
 */
import api from '@/common/library/axios'
import { toMultipart } from './common/toMultipart'

const BASE = '/bo/room-add-options'

const unwrap = (res) => res?.data

export const roomAddOptionApi = {
  /**
   * 방 추가 옵션 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[] }} params
   * @returns {Promise<{ roomAddOptionItem: Array<{ id, name }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 방 추가 옵션 상세 조회 → { id, name, image } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /**
   * 방 추가 옵션 저장 — multipart(request: { name }, file?: 이미지) → { updatedAt }
   * @param {{ name: string }} body
   * @param {File|null} [image]
   */
  save: (body, image) => api.post(BASE, toMultipart(body, image)).then(unwrap),

  /**
   * 방 추가 옵션 수정 — multipart(request: { name }, file?: 이미지) → { updatedAt }
   * 이미지 미첨부 시 기존 이미지가 유지된다(교체만 가능, 단독 삭제 불가 — 백엔드 정책).
   * @param {{ name: string }} body
   * @param {File|null} [image]
   */
  modify: (id, body, image) => api.put(`${BASE}/${id}`, toMultipart(body, image)).then(unwrap),

  /** 방 추가 옵션 삭제 (soft delete) → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default roomAddOptionApi
