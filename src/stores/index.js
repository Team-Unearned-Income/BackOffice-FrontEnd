import { createPinia } from 'pinia'
import piniaPluginPersist from 'pinia-plugin-persistedstate'

// Pinia 인스턴스를 생성
const pinia = createPinia()

// Pinia 플러그인 적용
pinia.use(piniaPluginPersist)

// Pinia 인스턴스를 기본으로 export
export default pinia
