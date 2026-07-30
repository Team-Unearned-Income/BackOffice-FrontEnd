/**
 * 메일 도메인 관리 공통 메타 (유형 뱃지)
 *
 * ⚠ 백엔드(`AuthEmail`)엔 type(STUDENT/COMPANY)만 있고 상태(활성/비활성) 필드가 없어
 * 상태 관련 메타는 제거했다.
 */

/** 도메인 유형 */
export const TYPE_META = {
  STUDENT: { label: '학교', bg: '#bbdefb', text: '#0d47a1' },
  COMPANY: { label: '회사', bg: '#c8e6c9', text: '#1b5e20' }
}

/** 탭 / 유형 필터 옵션 */
export const TYPE_FILTER_OPTIONS = [
  { label: '전체 유형', value: 'all' },
  { label: '학교', value: 'STUDENT' },
  { label: '회사', value: 'COMPANY' }
]

/** 폼 선택용 유형 옵션 */
export const TYPE_SELECT_OPTIONS = [
  { label: '학교', value: 'STUDENT' },
  { label: '회사', value: 'COMPANY' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
