import { useAuthStore } from '@/stores/auth'
import router from '@/router'

/**
 * Request Interceptor
 * Header Authorization 에 Access Token 추가
 * @param config
 * @returns
 */
export const authRequestInterceptor = async (config) => {
  const auth = useAuthStore()

  const _accessToken = await auth.getAccessToken()
  if (_accessToken) {
    config.headers.Authorization = _accessToken
  }

  return config
}

/**
 * Response Interceptor Success
 * @param res
 * @returns {Promise<*>}
 */
export const successResponseInterceptor = async (res) => {
  const auth = useAuthStore()
  /** header에서 사용할 경우 분기처리 필요 */
  if (res.headers.authorization) {
    await auth.initState(res)
  }

  if (res.headers['content-disposition']) {
    return res
  }

  // 백엔드 GlobalExceptionHandler가 @RestControllerAdvice에서 CommonResponse를 그대로 반환하고
  // ResponseEntity를 안 써서, 예외가 나도 실제 HTTP 상태 코드는 항상 200으로 내려온다
  // (JSON 바디의 "status" 필드에만 500 등 실제 상태가 담김). axios는 2xx라 성공으로 처리해버리므로
  // 여기서 body.error 유무를 직접 검사해서 있으면 reject 시켜야 각 서비스의 catch/showError가 동작한다.
  if (res.data?.error) {
    return Promise.reject(res.data)
  }

  return res.data
}

/**
 * Response Interceptor Error
 * @param err
 * @returns
 */
export const errorResponseInterceptor = async (err) => {
  const auth = useAuthStore()

  const { config, response } = err
  if (!response) {
    // 네트워크 API 에러
    return Promise.reject(err)
  }
  if (response.data.code === 401) {
    // response.data.data === 'E405' &&
    await auth.clearAccessToken()
    alert(response.data.message)

    await router.push({ name: 'Login' })
  } else if (response.data.data === 'E401' || response.data.data === 'E414') {
    alert(response.data.message)
    await router.replace({ name: 'Home' })
  }

  // 팝업은 나중에
  return Promise.reject(response.data)
}

export default { authRequestInterceptor, successResponseInterceptor, errorResponseInterceptor }
