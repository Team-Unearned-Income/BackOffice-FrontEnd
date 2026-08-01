/**
 * BO 등록/수정 API 공통 multipart 빌더.
 * `request` 파트(JSON Blob) + `file` 파트(선택, 이미지) 로 구성한다.
 * @param {object} body
 * @param {File|null} [image]
 * @returns {FormData}
 */
export const toMultipart = (body, image) => {
  const formData = new FormData()
  formData.append('request', new Blob([JSON.stringify(body)], { type: 'application/json' }))
  if (image) formData.append('file', image)
  return formData
}

export default toMultipart
