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
