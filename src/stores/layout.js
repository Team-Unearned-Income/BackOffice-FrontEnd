import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const usePrivateState = defineStore('layout-private', () => {
  const isShowGnb = ref(true)
  const isShowLnb = ref(true)
  const breadcrumb = ref([])
  const lnbInfo = ref([])
  const selectedMenu = ref({})

  return { isShowGnb, isShowLnb, breadcrumb, lnbInfo, selectedMenu }
})

export const useLayoutStore = defineStore('layout', () => {
    const _state = usePrivateState()

    const isShowGnb = computed({
      get: () => _state.isShowGnb,
      set: (v) => (_state.isShowGnb = v)
    })

    const isShowLnb = computed({
      get: () => _state.isShowLnb,
      set: (v) => {
        _state.isShowLnb = v
      }
    })

    const breadcrumb = computed({
      get: () => _state.breadcrumb,
      set: (v) => {
        _state.breadcrumb = v
      }
    })

    const lnbInfo = computed({
      get: () => _state.lnbInfo,
      set: (v) => {
        _state.lnbInfo = v
      }
    })

    const selectedMenu = computed({
      get: () => _state.selectedMenu,
      set: (v) => {
        _state.selectedMenu = v
      }
    })

    const pageMap = computed(() => {
      return getPageMap(lnbInfo.value)
    })

    const getPageMap = (items, map = new Map()) => {
      items.forEach(item => {
        if (item.url) {
          map.set(item.url, item)
        }

        if (item.childrenList) {
          getPageMap(item.childrenList, map)
        }
      })
      return map
    }


    const showGnb = () => {
      _state.isShowGnb = true
    }

    const hideGnb = () => {
      _state.isShowGnb = false
    }

    const showLnb = () => {
      _state.isShowLnb = true
    }

    const hideLnb = () => {
      _state.isShowLnb = false
    }

    const toggleLnb = () => {
      _state.isShowLnb = !_state.isShowLnb
    }

    // resetStore 메서드 추가
    const resetStore = () => {
      _state.isShowGnb = true
      _state.isShowLnb = true
      _state.breadcrumb = []
      _state.lnbInfo = []
      _state.selectedMenu = {}
    }

    return {
      isShowGnb,
      showGnb,
      hideGnb,

    isShowLnb,
    showLnb,
    hideLnb,
    toggleLnb,

      breadcrumb,
      lnbInfo,
      selectedMenu,
      pageMap,

      resetStore
    }
  }
)

