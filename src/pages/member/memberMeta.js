/**
 * 회원 관리 공통 메타 (뱃지 라벨/색상, 필터 옵션)
 * 목록 화면(PageTable HTML 셀)과 상세 패널(q-chip)이 공유한다.
 *
 * 백엔드 MemberState는 ACTIVE/INACTIVE 2단계뿐이라 mock에 있던 '탈퇴' 상태는 제거함
 * (회원 탈퇴는 소프트 삭제로 별도 관리되고 BO 목록/상세 응답에 노출되지 않음).
 */

/** 계정 상태 (MemberState enum 값 그대로 key로 사용) */
export const STATUS_META = {
  ACTIVE: { label: '정상', bg: '#c8e6c9', text: '#1b5e20' },
  INACTIVE: { label: '정지', bg: '#ffcdd2', text: '#b71c1c' }
}
/** state가 없거나(State row 미존재) 알 수 없는 값일 때 표시할 기본값 */
export const STATUS_UNKNOWN_META = { label: '-', bg: '#eeeeee', text: '#616161' }

/** 신원 인증 유형 (상세 패널의 authenticationInfoList용, AuthenticationType enum) */
export const VERIFY_TYPE_META = {
  STUDENT: { label: '학교 인증', bg: '#bbdefb', text: '#0d47a1' },
  COMPANY: { label: '회사 인증', bg: '#e1bee7', text: '#4a148c' }
}

/**
 * 목록의 '신원인증' 컬럼 — 백엔드 쿼리가 실제로는 AuthenticationType이 아니라
 * ApproveType(PENDING/ACCEPTED/REJECT)을 내려주는 버그가 있어 이 값 기준으로 표기함
 * (member.js 서비스 파일 상단 주석 참고). 백엔드 수정되면 VERIFY_TYPE_META로 교체 필요.
 */
export const APPROVE_META = {
  PENDING: { label: '인증 대기', bg: '#fff3cd', text: '#8a6d00' },
  ACCEPTED: { label: '인증 완료', bg: '#c8e6c9', text: '#1b5e20' },
  REJECT: { label: '인증 반려', bg: '#ffcdd2', text: '#b71c1c' }
}
export const APPROVE_UNKNOWN_META = { label: '미인증', bg: '#eeeeee', text: '#616161' }

/** 권한 (MemberRole enum 값 그대로 key로 사용) */
export const ROLE_META = {
  ADMIN: { label: 'admin', bg: '#ffe082', text: '#e65100' },
  USER: { label: 'user', bg: '#eeeeee', text: '#616161' }
}
/** role이 없거나 알 수 없는 값일 때 표시할 기본값 */
export const ROLE_UNKNOWN_META = { label: '-', bg: '#eeeeee', text: '#616161' }

/** 상태 필터 옵션 */
export const STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '정상', value: 'ACTIVE' },
  { label: '정지', value: 'INACTIVE' }
]

/** 신원인증 필터 옵션 (searchApproveType 기준) */
export const VERIFY_OPTIONS = [
  { label: '신원인증 전체', value: 'all' },
  { label: '인증 대기', value: 'PENDING' },
  { label: '인증 완료', value: 'ACCEPTED' },
  { label: '인증 반려', value: 'REJECT' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
