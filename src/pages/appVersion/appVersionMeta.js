/**
 * 앱 버전 관리 공통 메타 (플랫폼/업데이트 유형 뱃지)
 */

/** 플랫폼 */
export const PLATFORM_META = {
  ios: { label: 'iOS', bg: '#e3f2fd', text: '#0d47a1' },
  android: { label: 'Android', bg: '#e8f5e9', text: '#1b5e20' }
}

/** 업데이트 유형 */
export const UPDATE_TYPE_META = {
  force: { label: '강제 업데이트', bg: '#ffcdd2', text: '#b71c1c' },
  optional: { label: '선택 업데이트', bg: '#e1bee7', text: '#4a148c' }
}

/** 최신 버전 뱃지 */
export const LATEST_META = { label: '최신', bg: '#bbdefb', text: '#0d47a1' }

/** 플랫폼 필터 옵션 */
export const PLATFORM_FILTER_OPTIONS = [
  { label: '전체 플랫폼', value: 'all' },
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' }
]

/** 업데이트 유형 필터 옵션 */
export const UPDATE_TYPE_FILTER_OPTIONS = [
  { label: '전체 유형', value: 'all' },
  { label: '강제 업데이트', value: 'force' },
  { label: '선택 업데이트', value: 'optional' }
]

/** 폼 선택용 플랫폼 옵션 */
export const PLATFORM_SELECT_OPTIONS = [
  { label: 'iOS', value: 'ios' },
  { label: 'Android', value: 'android' }
]

/** 폼 선택용 업데이트 유형 옵션 */
export const UPDATE_TYPE_SELECT_OPTIONS = [
  { label: '선택 업데이트', value: 'optional' },
  { label: '강제 업데이트', value: 'force' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
