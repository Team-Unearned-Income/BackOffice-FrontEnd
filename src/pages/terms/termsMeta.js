/**
 * 약관 관리 공통 메타 (버전 상태 뱃지)
 */

/** 버전 상태 */
export const STATUS_META = {
  current: { label: '현행', bg: '#c8e6c9', text: '#1b5e20' },
  previous: { label: '이전', bg: '#eeeeee', text: '#616161' }
}

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
