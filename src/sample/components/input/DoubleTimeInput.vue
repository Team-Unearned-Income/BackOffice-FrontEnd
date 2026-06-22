<template>
  <div class="row items-center full-width">
    <div class="col-5">
      <q-input
        v-model.trim="time.startTime"
        type="time"
        dense
        outlined
        @update:model-value="handleTimeChanged"
        :disable="disable"
      />
    </div>
    <div class="col-1 text-center">~</div>
    <div class="col-5">
      <q-input
        v-model.trim="time.endTime"
        type="time"
        dense
        outlined
        @update:model-value="handleTimeChanged"
        :disable="disable"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, watch } from 'vue'

const props = defineProps({
  startTime: {
    type: String,
    default: () => null
  },
  endTime: {
    type: String,
    default: () => null
  },
  disable: {
    type: Boolean,
    default: () => false
  }
})

const emit = defineEmits(['update:model-value'])

const time = ref({
  startTime: null,
  endTime: null
})

// props 값이 변경되면 time을 업데이트
watch(
  () => [props.startTime, props.endTime],
  ([newStartTime, newEndTime]) => {
    time.value.startTime = newStartTime
    time.value.endTime = newEndTime
  }
)

const resetTime = () => {
  time.value.startTime = null
  time.value.endTime = null
}

defineExpose({ resetTime })

onBeforeMount(() => {
  time.value.startTime = props.startTime
  time.value.endTime = props.endTime
})

const handleTimeChanged = () => {
  emit('update:model-value', time.value)
}
</script>
