<template>
  <div class="qrcode-container">
    <qrcode-stream
      :constraints="constraints"
      :single-detection="false"
      :paused="paused"
      @detect="onDetect"
      @error="onError"
    >
      <q-btn class="qr-btn" style="position: absolute" color="white" text-color="black" @click="switchCamera">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          fill="#5f6368"
        >
          <path
            d="M320-280q-33 0-56.5-23.5T240-360v-240q0-33 23.5-56.5T320-680h40l40-40h160l40 40h40q33 0 56.5 23.5T720-600v240q0 33-23.5 56.5T640-280H320Zm0-80h320v-240H320v240Zm160-40q33 0 56.5-23.5T560-480q0-33-23.5-56.5T480-560q-33 0-56.5 23.5T400-480q0 33 23.5 56.5T480-400ZM342-940q34-11 68.5-15.5T480-960q94 0 177.5 33.5t148 93Q870-774 911-693.5T960-520h-80q-7-72-38-134.5t-79.5-110Q714-812 651-842t-135-36l62 62-56 56-180-180ZM618-20Q584-9 549.5-4.5T480 0q-94 0-177.5-33.5t-148-93Q90-186 49-266.5T0-440h80q8 72 38.5 134.5t79 110Q246-148 309-118t135 36l-62-62 56-56L618-20ZM480-480Z"
          />
        </svg>
      </q-btn>
      <div class="camera-container">
        <div class="camera-frame">
          <div class="corner top-left"></div>
          <div class="empty-cell center-space"></div>
          <div class="corner top-right"></div>

          <div class="empty-cell"></div>
          <div class="empty-cell"></div>
          <div class="empty-cell"></div>

          <div class="corner bottom-left"></div>
          <div class="empty-cell center-space"></div>
          <div class="corner bottom-right"></div>
        </div>
      </div>
    </qrcode-stream>
  </div>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :status="toastStatus"
  />
</template>

<script setup>
import { ref } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import RegistToast from '@/components/dialog/RegistToast.vue'

const constraints = ref({ facingMode: 'environment' })
const qrList = ref([])
const showToast = ref(false)
const toastMessage = ref('')
const toastStatus = ref('success')
const paused = ref(false)

const switchCamera = () => {
  constraints.value.facingMode =
    constraints.value.facingMode === 'environment' ? 'user' : 'environment'
}

const onDetect = (result) => {
  let qrInfo
  qrList.value = result
  try {
    qrInfo = JSON.parse(result[0].rawValue)
  } catch (e) {
    qrInfo = { id: result[0].rawValue, type: 'groupTicket' }
  }
  qrcodeApi
    .updateQrCodeInfo(qrInfo.id, { type: qrInfo.type })
    .then(() => {
      toastStatus.value = 'success'
      showToast.value = true
      toastMessage.value = '사용 완료했습니다.'
    })
    .catch((error) => {
      console.error(error)
      toastStatus.value = 'failed'
      showToast.value = true
      toastMessage.value = error.message ?? '유효하지 않은 QR 코드입니다.'
    })
  paused.value = true
  setTimeout(() => {
    paused.value = false
    showToast.value = false
  }, 1500)
}

const onError = (error) => {
  console.error(error)
  toastStatus.value = 'failed'
  showToast.value = true
  toastMessage.value = 'QR 인식에 실패했습니다.'
}
</script>

<style scoped>
.qrcode-container {
  height: 100svh;
  width: 100svw;
  position: relative;
  display: flex;
  justify-self: center;
  align-self: center;
}

.camera-container {
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-frame {
  width: min(70vw, 70vh);
  height: min(70vw, 70vh);
  padding: 10%;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr auto;
}

.corner {
  width: 30px;
  height: 30px;
  border: 7px solid #ffffff;
}

.top-left {
  border-right: none;
  border-bottom: none;
}

.top-right {
  border-left: none;
  border-bottom: none;
}

.bottom-left {
  border-right: none;
  border-top: none;
}

.bottom-right {
  border-left: none;
  border-top: none;
}

.empty-cell {
  border: none;
}

.center-space {
  max-width: 60vw;
  min-width: 20vw;
  max-height: 40vh;
}

.qr-btn{
  z-index: 100;
}
</style>
