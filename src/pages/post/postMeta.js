/**
 * 게시글 관리 공통 메타 (노출 상태 뱃지/필터)
 * 목록(PageTable HTML 셀)과 상세 패널(q-chip)이 공유한다.
 */

/** 노출 상태 */
export const POST_STATUS_META = {
  visible: { label: '노출 중', bg: '#c8e6c9', text: '#1b5e20' }, // 정상
  hidden: { label: '비노출', bg: '#eeeeee', text: '#616161' }, // 관리자 수동
  expired: { label: '만료', bg: '#fff3cd', text: '#8a6d00' } // 입주일+7일 자동
}

/** 노출 상태 필터 옵션 */
export const POST_STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '노출 중', value: 'visible' },
  { label: '비노출', value: 'hidden' },
  { label: '만료', value: 'expired' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
