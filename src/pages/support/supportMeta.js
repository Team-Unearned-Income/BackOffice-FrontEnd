/**
 * 고객센터 공통 메타 (문의 유형/상태)
 */

/** 1:1 문의 유형 (카테고리는 서버 `/inquiries/categorys`에서 동적으로 조회되므로 고정 뱃지 스타일만 공용으로 사용) */
export const INQUIRY_TYPE_BADGE_STYLE = { bg: '#e1e5f2', text: '#2a3363' }

/** 1:1 문의 상태 (백엔드가 내려주는 텍스트 그대로 key로 사용) */
export const INQUIRY_STATUS_META = {
  '답변 대기중': { label: '미답변', bg: '#fff3cd', text: '#8a6d00' },
  '답변 완료': { label: '답변완료', bg: '#c8e6c9', text: '#1b5e20' }
}

/** 필터 옵션 */
export const INQUIRY_STATUS_OPTIONS = [
  { label: '전체 상태', value: 'all' },
  { label: '미답변', value: '답변 대기중' },
  { label: '답변완료', value: '답변 완료' }
]

/** PageTable 셀용 소프트 뱃지 HTML (v-runtime-template 렌더) */
export const badgeHtml = (meta) =>
  `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:10px;font-size:0.72rem;font-weight:600;line-height:1.3;background:${meta.bg};color:${meta.text}">${meta.label}</span>`

/** 동적 카테고리(문의 유형)용 뱃지 HTML — 라벨만 서버 값 그대로 사용 */
export const typeBadgeHtml = (label) => badgeHtml({ ...INQUIRY_TYPE_BADGE_STYLE, label: label ?? '-' })
