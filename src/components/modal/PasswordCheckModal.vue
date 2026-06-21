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
          <div class="col-2 form-th">비밀번호</div>
          <div class="col-10 form-td">
            <q-input
              v-model.trim="dataModel.password"
              class="full-width"
              :type="'password'"
              outlined
              center
              dense
              hide-bottom-space
              placeholder="현재 비밀번호"
              autocomplete="new-password"
              :rules="[(val) => !!val || '비밀번호를 입력해주세요.']"
            ></q-input>
          </div>
        </div>
      </div>
    </template>
    <template #button>
      <q-btn :label="confirmLabel" class="modal-btn-md" color="black" outline :disable="!dataModel.password" @click="onEdit" />
    </template>
  </BasicConfirm>
  <RegistToast
    v-if="showToast"
    message="비밀번호 확인이 일치하지 않습니다."
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script setup>
import { inject, onBeforeUpdate, ref } from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import { cloneDeep } from 'lodash-es'
import { sitemanagementApi } from '@/service/api'
import COMMON from '@/constants/commonConstatns.js'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { useAuthStore } from '@/stores/auth'

const showToast = ref(false)
const emitter = inject('emitter')
const emit = defineEmits(['hide', 'maskingUpdate'])
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
    default: () => {
    }
  },
  reserveDayCode: {
    type: String,
    required: false,
    default: () => 'unSet'
  },
  type: {
    type: String,
    required: true,
    default: null
  }
})

const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const originDataModel = defineModel('dataModel', {
  type: Object,
  default: () => {
  },
  required: true
})

const optionsModel = defineModel('optionsModel', {
  type: Object,
  default: () => {
  },
  required: true
})

const dataModel = ref({
  password: ''
})

const closeLabel = ref('닫기')
const confirmLabel = ref('확인')

onBeforeUpdate(async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
})

const onEdit = async () => {
  emitter.emit(COMMON.LOADING.SHOW)

  await sitemanagementApi.verifyAdminPasswordToken({
    nowPassword: dataModel.value.password
  }).then((res) => {
    res.data ? hide(res.data) : alert('비밀번호가 일치하지 않습니다.')
  }).catch((err) => {
    alert(err.message)
  })

  emitter.emit(COMMON.LOADING.HIDE)
}

const authStore = useAuthStore()

const hide = (token) => {
  authStore.setToken(token)

  emit('maskingUpdate', true)
  showModal.value = false
}

const hideModal = () => {
  emit('maskingUpdate', false)
  emit('hide')
}
</script>
