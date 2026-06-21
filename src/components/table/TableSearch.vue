<template>
  <div>
    <q-input
      v-model.trim='searchText'
      :placeholder='placeholder'
      dense
      outlined
      @keyup.enter='onSearchItem'
    >
      <template #append>
        <q-icon v-if='searchText' class='cursor-pointer' name='close' @click='onClearItem' />
        <q-icon class='cursor-pointer' name='search' @click='onSearchItem' />
      </template>
    </q-input>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'

const emit = defineEmits(['update:model-value', 'clearItem', 'select-search-item'])
const props = defineProps({
  // 검색어
  modelValue: {
    type: String,
    required: true,
    default: () => ''
  },
  initFlag: {
    type: Boolean,
    default: () => false
  },
  placeholder: {
    type: String,
    default: () => '검색어를 입력 하신 후 엔터를 누르세요.'
  }
})
const searchText = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    emit('update:model-value', newValue)
  }
})


const onSearchItem = () => {
  emit('select-search-item')
}

const onClearItem = () => {
  emit('clearItem')
}

watch(
  () => props.initFlag,
  (newValue) => {
    if (newValue) {
      console.log(newValue)
    }
  },
  { immediate: true }
)
</script>
