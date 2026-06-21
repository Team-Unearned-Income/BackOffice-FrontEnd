<template>
  <q-badge
    ref='badgeRef'
    :label='label'
    :color='color'
    :text-color='textColor'
    class='q-ml-sm'
  />
</template>

<script setup>
import { ref } from 'vue'

const badgeRef = ref(null)

defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  label: {
    type: String,
    default: ''
  },
  textColor: {
    type: String,
    default: undefined
  }
})

/** TODO: 추가 처리할 로직 있으면 추가 */
</script>
