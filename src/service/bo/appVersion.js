/**
 * 앱 버전 API (BO) — 로컬 백엔드(`latest`) 스펙 기준 (`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 *
 * ⚠ 백엔드가 플랫폼별/이력 관리가 아니라 "현재 앱 버전 문자열 1개"만 관리하는 구조 (`AppVersionServiceImpl` 참조).
 * - GET: `appVersionRepository.findAll().getFirst()` — 테이블의 첫 레코드 하나만 반환 (목록 API 없음)
 * - POST(save): 기존 레코드를 전부 지우고 새 레코드 1개만 저장 — 사실상 "덮어쓰기"
 * - PUT(modify): { id, version }으로 해당 레코드만 수정
 * - 필드는 { id, version } 뿐. 플랫폼(iOS/Android), 강제/선택 업데이트, 최소 지원 버전,
 *   출시일, 업데이트 메시지는 백엔드에 없음 — UI의 해당 필드들은 목업 그대로 유지되고 저장되지 않음.
 */
import api from '@/common/library/axios'

const BASE = '/bo/app-version'

const unwrap = (res) => res?.data

export const appVersionApi = {
  /** 현재 앱 버전 조회 → { id, version } */
  getCurrent: () => api.get(BASE).then(unwrap),

  /** 앱 버전 저장 — body { version } → { updatedAt } (기존 레코드 전체 삭제 후 새로 저장됨에 주의) */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 앱 버전 수정 — body { id, version } → { updatedAt } */
  modify: (body) => api.put(BASE, body).then(unwrap)
}

export default appVersionApi
