/**
 * 메일 도메인(인증 이메일) API (BO) — 백엔드 실제 스펙(`BackOfficeController`의 `/bo/auth-email`) 기준
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 *
 * ⚠ 백엔드 엔티티(`AuthEmail`)에 domain/name/type 세 필드만 있고, 목업 화면에 있던
 * 회원수·상태(활성/비활성)·등록일·메모·삭제는 백엔드에 없음 — UI에서도 뺐다.
 * - type enum 값은 STUDENT/COMPANY (school/company 아님)
 * - PUT(modify)는 컨트롤러에 @RequestBody가 없어 JSON 바디가 아니라 쿼리파라미터로 바인딩됨
 */
import api from '@/common/library/axios'

const BASE = '/bo/auth-email'

const unwrap = (res) => res?.data

export const mailDomainApi = {
  /** 메일 도메인 목록 조회 → { authEmailInfoList: [{ id, domain, name, type }] } */
  getList: () => api.get(BASE).then(unwrap),

  /** 메일 도메인 저장 — body { domain, name, type } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 메일 도메인 수정 — 쿼리파라미터 { id, domain, name, type } → { updatedAt } */
  modify: (params) => api.put(BASE, null, { params }).then(unwrap)
}

export default mailDomainApi
