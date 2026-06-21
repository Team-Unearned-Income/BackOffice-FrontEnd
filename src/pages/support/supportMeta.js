/**
 * 고객센터 공통 메타 (문의 유형/상태, 노출 상태, FAQ 카테고리)
 */

/** 1:1 문의 유형 */
export const INQUIRY_TYPE_META = {
  account: { label: '계정·인증', bg: '#e1bee7', text: '#4a148c' },
  matching: { label: '매칭·채팅', bg: '#bbdefb', text: '#0d47a1' },
  bug: { label: '버그·오류', bg: '#ffcdd2', text: '#b71c1c' },
  etc: { label: '기타', bg: '#eeeeee', text: '#616161' }
}

/** 1:1 문의 상태 */
export const INQUIRY_STATUS_META = {
  pending: { label: '미답변', bg: '#fff3cd', text: '#8a6d00' },
  answered: { label: '답변완료', bg: '#c8e6c9', text: '#1b5e20' }
}

/** 노출 상태 (공지/FAQ 공통) */
export const VISIBILITY_META = {
  visible: { label: '노출 중', bg: '#c8e6c9', text: '#1b5e20' },
  hidden: { label: '비노출', bg: '#eeeeee', text: '#616161' }
}

/** FAQ 카테고리 */
export const FAQ_CATEGORY_META = {
  account: { label: '계정·인증', bg: '#e1bee7', text: '#4a148c' },
  matching: { label: '매칭', bg: '#bbdefb', text: '#0d47a1' },
  chat: { label: '채팅', bg: '#b2dfdb', text: '#004d40' },
  etc: { label: '기타', bg: '#eeeeee', text: '#616161' }
}

/** 필터 옵션 */
export const INQUIRY_STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '미답변', value: 'pending' },
  { label: '답변완료', value: 'answered' }
]
export const INQUIRY_TYPE_OPTIONS = [
  { label: '유형 전체', value: 'all' },
  { label: '계정·인증', value: 'account' },
  { label: '매칭·채팅', value: 'matching' },
  { label: '버그·오류', value: 'bug' },
  { label: '기타', value: 'etc' }
]
export const FAQ_CATEGORY_FILTER_OPTIONS = [
  { label: '전체 카테고리', value: 'all' },
  { label: '계정·인증', value: 'account' },
  { label: '매칭', value: 'matching' },
  { label: '채팅', value: 'chat' },
  { label: '기타', value: 'etc' }
]
/** FAQ 작성 폼 카테고리 (전체 제외) */
export const FAQ_CATEGORY_SELECT_OPTIONS = [
  { label: '계정·인증', value: 'account' },
  { label: '매칭', value: 'matching' },
  { label: '채팅', value: 'chat' },
  { label: '기타', value: 'etc' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
