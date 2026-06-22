<template>
  <q-input
    ref='timeInputRef'
    v-model.trim='timeValue'
    :disable='disable'
    :lazy-rules='lazyRules'
    :mask='inputMask'
    :placeholder='placeholder'
    :readonly='readonly'
    :rules='rules'
    dense
    hide-bottom-space
    outlined
  >
    <template #append>
      <q-icon class='cursor-pointer' name='access_time'>
        <q-popup-proxy
          cover
          transition-hide='scale'
          transition-show='scale'
          @hide="emit('time-selected')"
        >
          <q-time ref='timeRef' v-model.trim='timeValue' :mask='placeholder' now-btn>
            <div class='row items-center justify-end'>
              <q-btn
                class='q-mr-sm q-pa-none'
                color='primary'
                flat
                label='현재 시간'
                @click='timeRef.setNow()'
              />
              <q-btn v-close-popup class='q-pa-none' color='primary' flat label='선택' />
            </div>
          </q-time>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { computed, ref } from 'vue'

const emit = defineEmits(['time-selected'])
const props = defineProps({
  rules: {
    type: Array,
    default: () => []
  },
  disable: {
    type: Boolean,
    default: () => false
  },
  readonly: {
    type: Boolean,
    default: () => false
  },
  placeholder: {
    type: String,
    default: () => 'HH:mm'
  },
  beforeDisable: {
    type: String,
    default: () => ''
  },
  afterDisable: {
    type: String,
    default: () => ''
  },
  lazyRules: {
    type: Boolean,
    default: () => false
  }
})

const timeValue = defineModel({
  type: [String, null],
  required: true,
  default: () => ''
})

const inputMask = computed(() =>
  props.placeholder
    ?.replaceAll('H', '#')
    .replaceAll('m', '#')
    .replaceAll('s', '#')
)

const timeInputRef = ref(null)
const timeRef = ref(null)

const validate = () => {
  timeInputRef.value.validate()
}

defineExpose({
  validate
})
</script>
<style lang='scss' scoped>
::v-deep(.q-btn) {
  min-height: auto;
}

::v-deep(.q-btn--round) {
  min-height: 3em;
}
</style>
