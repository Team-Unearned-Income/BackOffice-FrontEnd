/**
 * 앱 버전 관리 공통 메타 (플랫폼/업데이트 유형 뱃지)
 */

/** 플랫폼 */
export const PLATFORM_META = {
  IOS: { label: 'iOS', bg: '#bbdefb', text: '#0d47a1' },
  ANDROID: { label: 'Android', bg: '#c8e6c9', text: '#1b5e20' }
}

/** 업데이트 유형 */
export const UPDATE_TYPE_META = {
  FORCE: { label: '강제 업데이트', bg: '#ffcdd2', text: '#b71c1c' },
  SELECT: { label: '선택 업데이트', bg: '#e1bee7', text: '#4a148c' }
}

/** 탭 옵션 */
export const PLATFORM_TAB_OPTIONS = [
  { name: 'all', label: '전체' },
  { name: 'IOS', label: 'iOS' },
  { name: 'ANDROID', label: 'Android' }
]

/** 폼 선택용 플랫폼 옵션 */
export const PLATFORM_SELECT_OPTIONS = [
  { label: 'iOS', value: 'IOS' },
  { label: 'Android', value: 'ANDROID' }
]

/** 폼 선택용 업데이트 유형 옵션 */
export const UPDATE_TYPE_SELECT_OPTIONS = [
  { label: '선택 업데이트', value: 'SELECT' },
  { label: '강제 업데이트', value: 'FORCE' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`

/** "최신" 뱃지 HTML */
export const latestBadgeHtml = () =>
  '<span style="display:inline-flex;align-items:center;margin-left:6px;padding:2px 8px;border-radius:10px;font-size:0.7rem;font-weight:700;line-height:1.3;background:#263238;color:#fff">최신</span>'
