<template>
  <template v-if='onlyDisplay'>
    {{ dateValue }}
  </template>
  <template v-else>
    <q-input
      ref='dateInputRef'
      v-model.trim='dateValue'
      :disable='disable'
      :lazy-rules='lazyRules'
      :mask='mask'
      :placeholder='placeholder'
      :readonly='readonly'
      :rules='[checkDate, ...rules]'
      dense
      hide-bottom-space
      no-error-icon
      outlined
    >
      <template #append>
        <q-icon class='cursor-pointer' name='event'>
          <q-popup-proxy cover transition-hide='scale' transition-show='scale'>
            <q-date
              ref='dateRef'
              v-model.trim='dateValue'
              :options='options'
              :today-btn='showTodayBtn'
              mask='YYYY-MM-DD'
              @update:model-value='updateQdate'
            >
              <div class='row items-center justify-end'>
                <q-btn
                  class="q-mr-sm"
                  color="primary"
                  flat
                  label="초기화"
                  @click="clearDate"
                />
                <q-btn
                  v-if='showTodayBtn'
                  class='q-mr-sm'
                  color='primary'
                  flat
                  label='오늘'
                  @click='dateRef.setToday()'
                />
                <q-btn v-close-popup color='primary' flat label='선택' />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </template>
</template>

<script setup>
import { computed, ref } from 'vue'
import { date } from 'quasar'
import { isEmpty } from 'lodash-es'
import DateUtils from '@/utils/DateUtils.js'

const emit = defineEmits(['update:model-value'])
const props = defineProps({
  modelValue: {
    type: [String, null],
    required: true,
    default: () => ''
  },
  rules: {
    type: Array,
    default: () => []
  },
  lazyRules: {
    type: Boolean,
    default: () => false
  },
  disable: {
    type: Boolean,
    default: () => false
  },
  readonly: {
    type: Boolean,
    default: () => true
  },
  // 단순 text 표시 여부
  onlyDisplay: {
    type: Boolean,
    default: () => false
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
  },
  periodDisable: {
    type: Array,
    default: () => []
  }
})

const dateValue = computed({
  get() {
    return props.modelValue
  },
  set(newValue) {
    if (newValue === null) {
      emit('update:model-value', '')
    } else {
      emit('update:model-value', newValue)
    }
  }
})

const showTodayBtn = computed(() => {
  const today = DateUtils.convertDateFormat(DateUtils.getToday())
  return isValidDate(props.beforeDisable, props.afterDisable, today)
})

const dateInputRef = ref(null)
const dateRef = ref(null)
const periodObj = {
  CYC_HALF_1: {
    from: '01/01',
    to: '06/30'
  },
  CYC_HALF_2: {
    from: '07/01',
    to: '12/31'
  }
}

const options = (date) => {
  if (props.periodDisable.length) return periodOptions(date)
  if (props.beforeTodayDisable || props.afterDisable || props.beforeDisable)
    return beforeAndAfterDisable(date)

  return true
}

const periodOptions = (date) => {
  const periodDisable = props.periodDisable
  return convertPeriod(date, periodDisable)
}

const convertPeriod = (date, periodDisable) => {
  const customPeriod = periodDisable.map((item) => {
    return {
      from: `${item.year}/${periodObj[item.cycHalfSe].from}`,
      to: `${item.year}/${periodObj[item.cycHalfSe].to}`
    }
  })
  return isValidPeriod(date, customPeriod)
}

const isValidPeriod = (date, customPeriod) => {
  const isDisabled = customPeriod.some((period) => {
    return date >= period.from && date <= period.to
  })

  return !isDisabled
}

const beforeAndAfterDisable = (date) => {
  let beforeDisable = props.beforeDisable
  const afterDisable = props.afterDisable
  if (props.beforeTodayDisable) {
    beforeDisable = DateUtils.convertDateFormat(DateUtils.getToday())
  }

  return isValidDate(beforeDisable, afterDisable, date)
}

const isValidDate = (beforeDisable, afterDisable, targetDate) => {
  if (beforeDisable && afterDisable) {
    return targetDate >= beforeDisable && targetDate <= afterDisable
  } else if (beforeDisable) {
    return targetDate >= beforeDisable
  } else if (afterDisable) {
    return targetDate <= afterDisable
  } else {
    return true
  }
}

const resetValidation = () => {
  dateInputRef.value.resetValidation()
}

const validate = () => {
  dateInputRef.value.validate()
}

// date 기본 valid
const checkDate = (val) => {
  if (isEmpty(val)) {
    return true
  }
  const today = DateUtils.convertDateFormat(DateUtils.getToday(), 'YYYY-MM-DD', 'YYYY-MM-DD')

  // 이전날짜 입력 불가
  if (props.beforeTodayDisable) {
    return val >= today || 'Invalid date.'
  }
    return (date.isValid(val) ) || 'Invalid date.'

  // return (date.isValid(val) && validDateFormat(val)) || 'Invalid date.'
}
// 'YYYY-MM-DD' 형식, 1970-01-01 ~ 9999-12-31 범위 Valid
const validDateFormat = (val) => {
  // return REGEX.DATE_FORMAT.test(val)
}
const updateQdate = async () => {
  await dateInputRef.value.resetValidation()
  await dateInputRef.value.validate()
  await dateInputRef.value.blur()
}

const clearDate = () => {
  dateValue.value = ''
  resetValidation()
}

defineExpose({
  resetValidation,
  validate
})
</script>
<style lang='scss' scoped>
::v-deep(.q-btn) {
  min-height: auto;
}
</style>
