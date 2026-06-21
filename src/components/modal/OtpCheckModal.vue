<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="sendStatus ? '인증번호 검증' : title"
    style="width: 200vh"
    @hide="hideModal"
  >
    <template #content>
      <template v-if="!sendStatus">
        <q-table
          ref="tableRef"
          :columns="tableHeaders"
          :rows="rows"
          row-key="id"
          flat
          hide-pagination
          hide-no-data
          separator="cell"
          :virtual-scroll="false"
          :rows-per-page-options="[0]"
          style="max-height: 50vh; height: 50vh"
        >
          <template v-slot:header="props">
            <q-tr>
              <q-th
                v-for="col in props.cols"
                :key="col.name"
                :class="{
                  'text-left': col.align === 'left',
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right'
                }"
              >
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td class="text-center">
                <q-radio
                  v-model="selectedRowId"
                  :val="props.row.aapSeq"
                  :id="props.row.aapSeq"
                />
              </q-td>
              <q-td class="text-center">
                {{ props.row.name }}
              </q-td>
              <q-td>
                <div class="text-center">
                  {{ props.row.phone }}
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </template>

      <template v-if="sendStatus">
        <div class="form">
          <div class="row items-center">
            <div
              class="col-1 form-th"
              style="font-weight: 600; line-height: 56px;"
            >
              인증번호
            </div>
            <div class="col-11 flex form-td">
                <q-input
                  ref="verificationInputRef"
                  v-model="verificationCode"
                  type="text"
                  maxlength="6"
                  outlined
                  placeholder="인증번호를 입력하세요"
                  class="col q-pr-md"
                  style="height: 56px"
                  :rules="[validateVerificationCode]"
                />
                <q-btn
                  :label="timer > 0 ? `재발송 (${formatTimer(timer)})` : '재발송'"
                  :disable="timer > 0"
                  color="black"
                  outline
                  style="height: 56px; min-width: 100px;"
                  @click="handleResend"
                />
              </div>
          </div>
        </div>
      </template>
    </template>
    <template #button>
      <q-btn
        v-if="!sendStatus"
        :label="confirmLabel"
        class="modal-btn-md"
        color="black"
        outline
        :disable="!selectedRowId"
        @click="sendVerificationCode"
      />

      <q-btn v-if="sendStatus"
             :label="'확인'"
             class="modal-btn-md"
             color="black"
             outline
             :disable="!verificationCode || timer <= 0"
             @click="checkVerificationCode"
              />
    </template>
  </BasicConfirm>

  <RegistToast
    v-if="showToast"
    message="인증 완료되었습니다."
    :duration="3000"
    @hidden="() => { showToast = false }"
  />
</template>

<script setup>
import { ref, watch, onBeforeUpdate, onUnmounted, inject } from 'vue'
import { cloneDeep } from 'lodash-es'
import BasicConfirm from './BasicConfirm.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { authApi } from '@/service/api'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const messageId = ref(null)
const selectedRowId = ref(null)
const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')
const sendStatus = ref(false)
const verificationCode = ref('')
const verificationInputRef = ref(null)

const timer = ref(0)
let timerInterval = null

const emitter = inject('emitter')
const emit = defineEmits(['hide', 'maskingUpdate'])

const props = defineProps({
  title: { type: String, default: '' },
  size: { type: String, default: 'sm' },
  style: { type: Object, default: () => ({}) },
  reserveDayCode: { type: String, default: 'unSet' },
  type: { type: String, required: true }
})

const tableHeaders = [
  { name: 'check', label: '선택', field: 'check', align: 'center', style: 'width: 8%;' },
  { name: 'name', label: '이름', field: 'name', align: 'center', style: 'width: 46%;' },
  { name: 'phone', label: '전화번호', align: 'center', style: 'width: 46%;' }
]
const rows = ref([])

const showModal = defineModel('show', { type: Boolean, required: true, default: false })
const originDataModel = defineModel('dataModel', { type: Object, required: true, default: () => ({}) })
const optionsModel = defineModel('optionsModel', { type: Object, required: true, default: () => ({}) })

const dataModel = ref({ password: '' })
const closeLabel = ref('닫기')
const confirmLabel = ref('확인')

onBeforeUpdate(async () => {
  dataModel.value = await cloneDeep(originDataModel.value)
})

function startTimer(seconds = 180) {
  timer.value = seconds
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(timerInterval)
    }
  }, 1000)
}

const sendVerificationCode = async () => {
  const selectedRow = rows.value.find(row => row.aapSeq === selectedRowId.value)
  if (!selectedRow) {
    alert('선택된 행이 없습니다.')
    return
  }

  try {
    const res = await authApi.sendVerificationCode({
      name: selectedRow.name,
      phone: selectedRow.phone
    })
    alert('인증번호가 발송되었습니다.')
    messageId.value = res.data
    sendStatus.value = true
    verificationCode.value = ''
    startTimer()
  } catch (err) {
    alert(err.message)
  }
}

const handleResend = () => {
  if (timer.value === 0) {
    sendVerificationCode()
  }
}

const checkVerificationCode = async () => {
  const isInputValid = await verificationInputRef.value.validate()
  if (!isInputValid) {
    return
  }
  try {
    const res = await authApi.checkVerificationCode(
      messageId.value,
    {authCode: verificationCode.value},
    )
    if (res.success) {

      sendStatus.value = false

      if(timerInterval) clearInterval(timerInterval)

      toastMessage.value = '인증완료되었습니다.'
      toastStatus.value = 'success'
      showToast.value = true

      hide(res.data)
    } else {
      alert('인증번호가 일치하지 않습니다.')
    }
  } catch (err) {
    alert(err.message)
  }
}

const onRequest = async () => {
  const res = await authApi.getAdminAuthPhone({adminId:''})
  rows.value = res.data

  if (rows.value.length > 0) {
    selectedRowId.value = rows.value[0].aapSeq
  }
}

const validateVerificationCode = (val) => {
  if (!val) {
    return '인증번호를 입력해주세요.';
  }
  if (!/^\d{6}$/.test(val)) {
    return '인증번호는 숫자 6자리여야 합니다.';
  }
  return true;
};

watch(showModal, (newVal) => {
  if (newVal) {
    onRequest()
    sendStatus.value = false
    verificationCode.value = ''
    if(timerInterval) clearInterval(timerInterval)
    timer.value = 0
  }
})

onUnmounted(() => {
  if(timerInterval) clearInterval(timerInterval)
})

const hide = (token) => {
  sendStatus.value = false
  authStore.setToken(token)
  emit('maskingUpdate', true)
  showModal.value = false
}

const hideModal = () => {
  sendStatus.value = false
  emit('maskingUpdate', false)
  emit('hide')
}

const formatTimer = (seconds) => {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}
</script>
