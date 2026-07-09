/**
 * 신원 인증 공통 메타 (인증 유형 뱃지)
 */

/** 인증 유형 (백엔드 AuthenticationType enum 값 그대로 key로 사용) */
export const TYPE_META = {
  STUDENT: { label: '학교', bg: '#e1bee7', text: '#4a148c' }, // 보라
  COMPANY: { label: '회사', bg: '#bbdefb', text: '#0d47a1' } // 파랑
}

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`
