/**
 * 생활패턴 관리 공통 메타 (유형 뱃지)
 */

/** 항목 유형 (백엔드 LifePatternType enum 값 그대로 key로 사용) */
export const TYPE_META = {
  SCALE: { label: '스케일', bg: '#e1bee7', text: '#4a148c' },
  BOOLEAN: { label: '예·아니오', bg: '#bbdefb', text: '#0d47a1' },
  SINGLE_CHOICE: { label: '단일 선택', bg: '#b2dfdb', text: '#004d40' }
}

/** 유형 필터 옵션 */
export const TYPE_FILTER_OPTIONS = [
  { label: '유형 전체', value: 'all' },
  { label: '스케일', value: 'SCALE' },
  { label: '예·아니오', value: 'BOOLEAN' },
  { label: '단일 선택', value: 'SINGLE_CHOICE' }
]

/** 폼 선택용 유형 옵션 */
export const TYPE_SELECT_OPTIONS = [
  { label: '스케일', value: 'SCALE' },
  { label: '예·아니오', value: 'BOOLEAN' },
  { label: '단일 선택', value: 'SINGLE_CHOICE' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
