/**
 * 신고 관리 공통 메타 (유형/상태/처리결과 뱃지)
 */

/** 신고 유형 (백엔드 ReportType enum 값 그대로 key로 사용) */
export const TYPE_META = {
  BOARD: { label: '게시글', bg: '#bbdefb', text: '#0d47a1' },
  MEMBER: { label: '프로필', bg: '#e1bee7', text: '#4a148c' }
}

/** 처리 대기 상태 */
export const STATUS_PENDING_META = { label: '대기', bg: '#fff3cd', text: '#8a6d00' }

/** 처리 결과 (처리 완료 탭, 백엔드 DeclarationType enum 값 그대로 key로 사용) */
export const RESULT_META = {
  HIDDEN: { label: '비공개 처리', bg: '#ffcdd2', text: '#b71c1c' },
  NOACTION: { label: '무혐의', bg: '#c8e6c9', text: '#1b5e20' },
  SUSPENDED: { label: '정지', bg: '#fff3cd', text: '#8a6d00' }
}
/** declarationType이 없을 때(백엔드 이슈로 항상 null) 표시할 기본값 */
export const RESULT_UNKNOWN_META = { label: '-', bg: '#eeeeee', text: '#616161' }

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
