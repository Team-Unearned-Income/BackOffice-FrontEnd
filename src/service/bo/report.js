/**
 * 신고 관리 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 목록 조회는 검색 파라미터 없이 pageable(page, size, sort)만 지원.
 *
 * ⚠ 백엔드 확인된 이슈 (2026-07 기준, `MemberDeclarationRepositoryImpl`/`RoommateBoardDeclarationRepositoryImpl` 참조)
 * - `GET /bo/report/done` 응답의 `declarationType`(처리결과) 필드가 쿼리에서 아예 select 되지 않아 항상 null로 내려옴.
 * - `POST /bo/report/hidden`의 `reason`은 저장되지 않음 (`changeDeclarationType(HIDDEN)`만 호출, reason 미포함 오버로드).
 *   `suspended`만 reason이 실제로 저장됨.
 * - hidden/no-action/suspended 처리는 신고(Declaration) 레코드의 상태값만 바꿀 뿐, 실제 게시글 비공개나
 *   회원 정지 같은 실제 조치는 별도로 일어나지 않음 (RoommateBoard/Member 엔티티 변경 없음).
 */
import api from '@/common/library/axios'

const BASE = '/bo/report'

const unwrap = (res) => res?.data

export const reportApi = {
  /** 처리 대기 목록 조회 → { reportInfoList: [{ id, type, reporter, reporterId, reportedId, createdAt, reason }] } */
  getWaitList: (params) => api.get(`${BASE}/wait`, { params }).then(unwrap),

  /** 처리 완료 목록 조회 → { reportInfoList: [{ id, type, reporter, declarationType, createdAt }] } (declarationType 항상 null, 위 주석 참조) */
  getDoneList: (params) => api.get(`${BASE}/done`, { params }).then(unwrap),

  /** 게시글 비공개 처리 — body { id, type, reason } → { updatedAt } (reason 미저장, 위 주석 참조) */
  hidden: (body) => api.post(`${BASE}/hidden`, body).then(unwrap),

  /** 무혐의 처리 — body { id, type } → { updatedAt } */
  noAction: (body) => api.post(`${BASE}/no-action`, body).then(unwrap),

  /** 정지 처리 — body { id, type, reason } → { updatedAt } */
  suspended: (body) => api.post(`${BASE}/suspended`, body).then(unwrap)
}

export default reportApi
