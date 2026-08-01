/**
 * 메일 도메인(인증 이메일) API (BO) — 백엔드 실제 스펙(`BackOfficeController`의 `/bo/auth-email`) 기준
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 *
 * ⚠ 백엔드 엔티티(`AuthEmail`)에 domain/name/type 세 필드만 있고, 목업 화면에 있던
 * 회원수·상태(활성/비활성)·등록일·메모는 백엔드에 없음 — UI에서도 뺐다.
 * - type enum 값은 STUDENT/COMPANY (school/company 아님)
 * - 도메인 중복(등록/수정)은 백엔드가 409(AUTH_EMAIL_DUPLICATE_DOMAIN)로 검증한다.
 * - 삭제는 소프트 삭제(isDeleted=true) — 목록 조회에서 자동 제외된다.
 * - BE 0952e6e 이후 PUT도 @RequestBody로 JSON 바디를 받도록 수정됨(과거엔 쿼리파라미터 바인딩이었음).
 */
import api from '@/common/library/axios'

const BASE = '/bo/auth-email'

const unwrap = (res) => res?.data

export const mailDomainApi = {
  /** 메일 도메인 목록 조회 → { authEmailInfoList: [{ id, domain, name, type }] } */
  getList: () => api.get(BASE).then(unwrap),

  /** 메일 도메인 저장 — body { domain, name, type } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 메일 도메인 수정 — body { id, domain, name, type } → { updatedAt } */
  modify: (body) => api.put(BASE, body).then(unwrap),

  /** 메일 도메인 삭제(소프트 삭제) → { updatedAt } */
  remove: (id) => api.delete(`${BASE}/${id}`).then(unwrap)
}

export default mailDomainApi
