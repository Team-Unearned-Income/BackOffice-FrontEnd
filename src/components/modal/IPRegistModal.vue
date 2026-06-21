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
          <div class="col-1 form-th required">사용여부</div>
          <div class="col-10 form-td">
            <q-radio v-model="dataModel.useYn" val="Y" label="사용"></q-radio>
            <q-radio v-model="dataModel.useYn" val="N" label="미사용"></q-radio>
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th required">IP</div>
          <div class="col-10 form-td">
            <q-input v-model.trim="dataModel.ip" class="full-width" outlined dense />
          </div>
        </div>
        <div class="row">
          <div class="col-1 form-th">내용</div>
          <div class="col-10 form-td">
            <q-input v-model.trim="dataModel.content" class="full-width" outlined dense />
          </div>
        </div>
      </div>
    </template>
    <template #button class="space-between">
      <q-btn :label="reserveLabel" class="modal-btn-md" color="black" outline @click="onEdit" />
    </template>
  </BasicConfirm>
  <RegistToast
    v-if="showToast"
    message="등록이 완료되었습니다!"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>
<script setup>
import { inject, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)

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

const dataModel = ref({
  useYn: 'Y',
  ip: null,
  content: null
})

const closeLabel = ref('취소')
const reserveLabel = ref('확인')

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  emit('update:model-value', dataModel.value)
  showToast.value = true

  emitter.emit(COMMON.LOADING.HIDE)
  hide()
}

const hide = () => {
  showModal.value = false
}

const hideModal = () => {
  emit('hide')
}
</script>
