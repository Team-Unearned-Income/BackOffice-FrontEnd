<template>
  <div>
    <div class="map-view-placeholder column items-center justify-center text-grey">
      <q-icon name="map" size="40px" />
      <div class="q-mt-sm">지도 기능 비활성화</div>
      <div class="text-caption">위도 {{ latitude }}, 경도 {{ longitude }}</div>
    </div>
  </div>
</template>

<script setup>
/**
 * 네이버맵(vue3-naver-maps) 제거에 따른 비활성 placeholder.
 * 기존 seoulland 상세 페이지들이 import 하므로 props/emit 시그니처는 유지한다.
 */
defineEmits(['update:model-value'])

defineProps({
  latitude: {
    type: Number,
    default: () => 37.4337808
  },
  longitude: {
    type: Number,
    default: () => 127.0190432
  },
  zoom: {
    type: Number,
    default: () => 18
  }
})
</script>

<style lang="scss" scoped>
.map-view-placeholder {
  width: 400px;
  height: 400px;
  border: 1px dashed #ccc;
  border-radius: 8px;
}
</style>
