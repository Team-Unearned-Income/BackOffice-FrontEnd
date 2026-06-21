<template>
  <div class="row items-end justify-between q-pa-lg">
    <span class="text-h5 text-bold text-dark"> {{ pageTitle }} </span>
    <div class="row items-center">
      <template v-for="(item, index) in breadcrumb" key="`bc_${index}`">
        <q-icon v-show="index > 0" name="chevron_right" size="24px" class="q-mx-xs" color="grey" />
        <span
          class="text-dark text-bold"
          :class="breadCrumbClass(item)"
          @click="onClickBreadcrumb(item)"
        >
          {{ item.label }}
        </span>
      </template>
    </div>
  </div>
  <div class="main-content q-pa-md scroll-y" style="calc(100% - 62px)">
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'

const props = defineProps({
  title: {
    type: String
  }
})

const router = useRouter()
const layoutStore = useLayoutStore()

const breadcrumb = computed(() =>
  layoutStore.breadcrumb.map((item) => ({
    label: item.menuName,
    parantMenuName: item.parentMenuName,
    route: item.url
  }))
)

const pageTitle = computed(() => {
  return props.title ?? breadcrumb.value.slice(-1).pop()?.label
})

const breadCrumbClass = (item) => {
  return {
    'cursor-pointer': item.route
  }
}

const onClickBreadcrumb = (item) => {
  if (!item.route) return

  router.push(item.route)
}
</script>
