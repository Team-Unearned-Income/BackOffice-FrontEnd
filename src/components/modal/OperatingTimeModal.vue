<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="width: 200vh"
    @hide="hideModal"
  >
    <template #content>
      <div class="form">
        <div class="row">
          <div class="col-1 form-th">운영시간</div>
          <div class="col-10 form-td">
            <DoubleTimeInput
              @update:model-value="
                (value) => {
                  dataModel.operatingStartTime = value.startTime
                  dataModel.operatingEndTime = value.endTime
                }
              "
            />
          </div>
        </div>
      </div>
    </template>
    <template #button class="space-between">
      <q-btn :label="reserveLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
</template>
<script setup>
import { inject, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'
import { cloneDeep } from 'lodash-es'
import DoubleTimeInput from '../input/DoubleTimeInput.vue'

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'modal-data-model', 'update:model-value'])
const props = defineProps({
  title: {
    type: String,
    default: () => ''
  },
  size: {
    type: String,
    default: () => 'sm'
  },
  style: {
    type: Object,
    default: () => {}
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = ref({})
const dataModel = ref({
  operatingStartTime: null,
  operatingEndTime: null
})

const closeLabel = ref('취소')
const reserveLabel = ref('확인')

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  emit('update:model-value', dataModel.value)

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  dataModel.value = cloneDeep(originDataModel.value)
  emit('hide')
}
</script>
