import axios from 'axios'
import { authRequestInterceptor, errorResponseInterceptor, successResponseInterceptor } from './interceptor'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
  /** debugging 진행 시 해당 timeout 주석처리 요망 */
  // timeout: 2000
})


api.interceptors.request.use(authRequestInterceptor)
api.interceptors.response.use(successResponseInterceptor, errorResponseInterceptor)

export default api

