/**
 * 회원 관리 공통 메타 (뱃지 라벨/색상, 필터 옵션)
 * 목록 화면(PageTable HTML 셀)과 상세 패널(q-chip)이 공유한다.
 */

/** 계정 상태 */
export const STATUS_META = {
  active: { label: '정상', bg: '#c8e6c9', text: '#1b5e20' },
  suspended: { label: '정지', bg: '#ffcdd2', text: '#b71c1c' },
  withdrawn: { label: '탈퇴', bg: '#e0e0e0', text: '#424242' }
}

/** 신원 인증 */
export const VERIFY_META = {
  school: { label: '학교 인증', bg: '#bbdefb', text: '#0d47a1' },
  company: { label: '회사 인증', bg: '#e1bee7', text: '#4a148c' },
  none: { label: '미인증', bg: '#eeeeee', text: '#616161' }
}

/** 권한 */
export const ROLE_META = {
  admin: { label: 'admin', bg: '#ffe082', text: '#e65100' },
  user: { label: 'user', bg: '#eeeeee', text: '#616161' }
}

/** 상태 필터 옵션 */
export const STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '정상', value: 'active' },
  { label: '정지', value: 'suspended' },
  { label: '탈퇴', value: 'withdrawn' }
]

/** 신원인증 필터 옵션 */
export const VERIFY_OPTIONS = [
  { label: '신원인증 전체', value: 'all' },
  { label: '학교 인증', value: 'school' },
  { label: '회사 인증', value: 'company' },
  { label: '미인증', value: 'none' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
