/**
 * 생활패턴 관리 공통 메타 (유형/노출 뱃지)
 */

/** 항목 유형 */
export const TYPE_META = {
  slider: { label: '슬라이더', bg: '#e1bee7', text: '#4a148c' },
  chip: { label: '칩 선택', bg: '#b2dfdb', text: '#004d40' }
}

/** 노출 상태 */
export const VISIBLE_META = { label: '노출', bg: '#c8e6c9', text: '#1b5e20' }
export const HIDDEN_META = { label: '비노출', bg: '#eeeeee', text: '#616161' }

/** 유형 필터 옵션 */
export const TYPE_FILTER_OPTIONS = [
  { label: '유형 전체', value: 'all' },
  { label: '슬라이더', value: 'slider' },
  { label: '칩 선택', value: 'chip' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
