/**
 * 게시글 관리 공통 메타 (노출 상태 뱃지/필터)
 * 목록(PageTable HTML 셀)과 상세 패널(q-chip)이 공유한다.
 *
 * 백엔드(RoommateBoard)에는 isDeleted(boolean)만 있고 '비노출'/'만료' 같은 중간 상태가 없어
 * key를 'false'(노출 중)/'true'(삭제됨) 두 가지로 단순화한다.
 */

/** 노출 상태 (isDeleted를 문자열 키로 사용) */
export const POST_STATUS_META = {
  false: { label: '노출 중', bg: '#c8e6c9', text: '#1b5e20' },
  true: { label: '삭제됨', bg: '#eeeeee', text: '#616161' }
}

/** 노출 상태 필터 옵션 */
export const POST_STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '노출 중', value: 'false' },
  { label: '삭제됨', value: 'true' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
