/**
 * 게시글 관리 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort) + searchKeyword/isDeleted만 지원.
 *
 * ⚠ 백엔드 확인된 이슈 (2026-07 기준, `RoommateBoardRepositoryImpl.findBackOfficeBoardList` 참조)
 * - `searchKeyword`를 안 보내면(null) `searchTitle(null).or(...)` 호출부에서 NPE가 나서 500 에러가 남.
 *   → 항상 빈 문자열이라도 `searchKeyword`를 같이 보내야 함 (getList가 기본값 처리).
 * - "게시글 비공개"에 해당하는 별도 API가 없음. `/bo/board/{id}` DELETE는 soft delete(삭제)만 지원하고
 *   재노출/비공개 토글 기능은 없음 (비공개는 신고 관리(`/bo/report/hidden`) 쪽에서만 처리됨).
 */
import api from '@/common/library/axios'

const LIST_BASE = '/bo/boards'
const BASE = '/bo/board'

const unwrap = (res) => res?.data

export const boardApi = {
  /**
   * 게시글 목록 조회
   * @param {{ page?: number, size?: number, sort?: string[], searchKeyword?: string, isDeleted?: boolean }} params
   * @returns {Promise<{ boardInfoList: Array<{ id, title, writer, region, comeableDate, isDeleted, createdAt, comeableDateNegotiable }> }>}
   */
  getList: (params) => api.get(LIST_BASE, { params: { searchKeyword: '', ...params } }).then(unwrap),

  /** 게시글 상세 조회 → { thumbnailImage, title, writer, writerId, region, deposit, monthlyRent, comeableDateNegotiable, comeableDate, createdAt, hits, isDeleted } */
  getDetail: (id) => api.get(`${BASE}/${id}`).then(unwrap),

  /** 게시글 삭제 (soft delete) — body { rejectReason } → { updatedAt } */
  remove: (id, rejectReason) => api.delete(`${BASE}/${id}`, { data: { rejectReason } }).then(unwrap)
}

export default boardApi
