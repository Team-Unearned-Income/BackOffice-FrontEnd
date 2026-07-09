/**
 * 메일 도메인 관리 공통 메타 (유형/상태 뱃지)
 */

/** 도메인 유형 */
export const TYPE_META = {
  school: { label: '학교', bg: '#bbdefb', text: '#0d47a1' },
  company: { label: '회사', bg: '#c8e6c9', text: '#1b5e20' }
}

/** 도메인 상태 */
export const STATUS_META = {
  active: { label: '활성', bg: '#c8e6c9', text: '#1b5e20' },
  inactive: { label: '비활성', bg: '#eeeeee', text: '#616161' }
}

/** 탭 / 유형 필터 옵션 */
export const TYPE_FILTER_OPTIONS = [
  { label: '전체 유형', value: 'all' },
  { label: '학교', value: 'school' },
  { label: '회사', value: 'company' }
]

/** 상태 필터 옵션 */
export const STATUS_FILTER_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '활성', value: 'active' },
  { label: '비활성', value: 'inactive' }
]

/** 폼 선택용 유형 옵션 */
export const TYPE_SELECT_OPTIONS = [
  { label: '학교', value: 'school' },
  { label: '회사', value: 'company' }
]

/** 폼 선택용 상태 옵션 */
export const STATUS_SELECT_OPTIONS = [
  { label: '활성', value: 'active' },
  { label: '비활성', value: 'inactive' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
