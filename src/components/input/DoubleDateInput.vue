<template>
  <div class="row items-center">
    <div class="col">
      <q-input
        ref="dateFromInputRef"
        v-model.trim="dateValue.from"
        :disable="disable"
        :mask="mask"
        :placeholder="placeholder"
        :readonly="readonly"
        :rules="rules"
        dense
        hide-bottom-space
        outlined
      >
        <template #append>
          <q-icon class="cursor-pointer" name="event">
            <q-popup-proxy cover transition-hide="scale" transition-show="scale">
              <q-date
                ref="dateFromRef"
                v-model.trim="dateValue"
                :options="options"
                mask="YYYY-MM-DD"
                range
                today-btn
              >
                <div class="row items-center justify-end">
                  <q-btn
                    class="q-mr-sm"
                    color="primary"
                    flat
                    label="오늘"
                    @click="dateFromRef.setToday()"
                  />
                  <q-btn v-close-popup color="primary" flat label="선택" />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div class="col-1 text-center">~</div>
    <div class="col">
      <q-input
        ref="dateToInputRef"
        v-model.trim="dateValue.to"
        :disable="disable"
        :mask="mask"
        :placeholder="placeholder"
        :readonly="readonly"
        :rules="rules"
        dense
        hide-bottom-space
        outlined
      >
        <template #append>
          <q-icon class="cursor-pointer" name="event">
            <q-popup-proxy cover transition-hide="scale" transition-show="scale">
              <q-date
                ref="dateToRef"
                v-model.trim="dateValue"
                :options="options"
                mask="YYYY-MM-DD"
                range
                today-btn
              >
                <div class="row items-center justify-end">
                  <q-btn
                    class="q-mr-sm"
                    color="primary"
                    flat
                    label="오늘"
                    @click="dateToRef.setToday()"
                  />
                  <q-btn v-close-popup color="primary" flat label="선택" />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import DateUtils from '@/utils/DateUtils.js'

const emit = defineEmits(['update:model-value'])
const props = defineProps({
  modelValue: {
    type: [Object, String, null],
    required: true,
    default: () => null
  },
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
    default: () => true
  },
  mask: {
    type: String,
    default: () => '####-##-##'
  },
  placeholder: {
    type: String,
    default: () => 'YYYY-MM-DD'
  },
  beforeDisable: {
    type: [String],
    default: () => ''
  },
  afterDisable: {
    type: [String],
    default: () => ''
  },
  beforeTodayDisable: {
    type: Boolean,
    default: () => false
  }
})

const dateValue = computed({
  get() {
    return convertDoubleCalendar(props.modelValue)
  },
  set(newValue) {
    let value
    if (typeof newValue === 'object') {
      value = newValue
    } else if (typeof newValue === 'string') {
      value = { from: newValue, to: newValue }
    }
    emit('update:model-value', value ?? { from: null, to: null })
  }
})

const options = (date) => {
  let beforeDisable = props.beforeDisable
  const afterDisable = props.afterDisable

  if (props.beforeTodayDisable) {
    beforeDisable = DateUtils.convertDateFormat(DateUtils.getToday())
  }

  if (beforeDisable && afterDisable) {
    return date >= beforeDisable && date <= afterDisable
  } else if (beforeDisable) {
    return date >= beforeDisable
  } else if (afterDisable) {
    return date <= afterDisable
  } else {
    return true
  }
}

const dateFromInputRef = ref(null)
const dateFromRef = ref(null)
const dateToInputRef = ref(null)
const dateToRef = ref(null)

const convertDoubleCalendar = (value) => {
  if (Array.isArray(value)) {
    value = _.cloneDeep({ from: value[0], to: value[1] })
  }
  return value ?? { from: null, to: null }
}

const resetValidation = () => {
  dateFromInputRef.value.resetValidation()
  dateToInputRef.value.resetValidation()
}

const validate = () => {
  dateFromInputRef.value.validate()
  dateToInputRef.value.validate()
}

defineExpose({
  resetValidation,
  validate
})
</script>
<style lang="scss" scoped>
::v-deep(.q-btn) {
  min-height: auto;
}
</style>
