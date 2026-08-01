/**
 * 앱 버전 API (BO) — 백엔드 실제 스펙(`BackOfficeController` 참조)
 *
 * 공통 응답 래퍼 { status, data, error }. 각 메서드는 payload(data)만 반환.
 * 플랫폼(iOS/Android)·업데이트 유형(강제/선택)·최소 지원 버전을 지원하는 이력형(row별 이력 보존)
 * 구조. 삭제 API는 없다(수정만 가능, 목록에서 항상 전체 이력 노출).
 */
import api from '@/common/library/axios'

const BASE = '/bo/app-version'

const unwrap = (res) => res?.data

export const appVersionApi = {
  /**
   * 앱 버전 전체 목록 조회 (플랫폼 무관)
   * @param {{ page?: number, size?: number }} params
   * @returns {Promise<{ versionInfo: Array<{ id, version, platformType, updateType, minVersion, createdAt }> }>}
   */
  getList: (params) => api.get(BASE, { params }).then(unwrap),

  /** 앱 버전 저장 — body { version, platformType, updateType, minVersion } → { updatedAt } */
  save: (body) => api.post(BASE, body).then(unwrap),

  /** 앱 버전 수정 — body { id, version, platformType, updateType, minVersion } → { updatedAt } */
  modify: (body) => api.put(BASE, body).then(unwrap)
}

export default appVersionApi
