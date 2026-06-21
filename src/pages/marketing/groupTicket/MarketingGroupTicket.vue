<template>
  <div class="row justify-between q-pt-lg">
    <div v-if="regShow">
      <q-btn style="background-color: #169bd5; color: white" label="등록" @click="goRegist" />
    </div>
  </div>
  <div v-if="ticketModel.qrValue === ''" style="margin-top: 30px;">
    <span style="color: gray">등록 된 QR이 없습니다.</span>
  </div>
  <div v-else id="printArea" class="bodyContainer">
    <div class="ticketContainer">
      <div class="ticket">
        <div class="ticketDetail q-gutter-y-md">
          <div class="qrWrapper" :style="{ opacity: 1 }"></div>
          <QrCode :value="ticketModel.qrValue" :width=120 />
        </div>
        <div class="ticketDate q-gutter-y-sm">
          <div style="align-items: center;">{{ `${ticketModel.useDate}` }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="ticketModel.qrValue !== ''" class="row justify-between q-pt-lg">
    <div>
      <q-btn label="프린트" @click="goPrint" />
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeMount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authApi, marketingApi } from '@/service/api'
import QrCode from '@/components/input/QRCode.vue'
import printJS from 'print-js'
import { useLayoutStore } from '@/stores/layout.js'

const layoutStore = useLayoutStore()

const router = useRouter()

const ticketModel = ref({
    useDate: '',
    qrValue: ''
  })

const regShow = ref(false)

onBeforeMount(async () => {
  // await apiSetting()
  await ticketSetting()
})


onMounted(async () => {
  await apiSetting()
  // await ticketSetting()
})
const apiSetting = async () => {
  await authApi.checkApiPermission({
    adminMenuSeq: layoutStore.selectedMenu.adminMenuSeq
  }).then((res) => {
    res.data.forEach(element => {
      if(element.apiEndpoint === "/api/v1/marketing/group-ticket-qr"){
        regShow.value = element.useYn === "Y" ? true : false
      }
    });
  }).catch(() => {
    console.log("실패")
  })
}

const ticketSetting = async () => {
  await marketingApi.getGroupTicketNewDetail().then((res) => {
    ticketModel.value.useDate = res.data.useStartDate + " ~ " + res.data.useEndDate
    ticketModel.value.qrValue = JSON.stringify({
      id: res.data?.qrNumber,
      type: res.data?.type
    })

  }).catch(() => {
    ticketModel.value.useDate = ''
    ticketModel.value.qrValue = ''
  })
}

const goRegist = () => {
  router.push({ name: 'GroupTicketDetail' })
}

const goPrint = () => {
  printJS({
    printable: 'printArea',
    type: 'html',
    targetStyles: ['*'],
    maxWidth: '100%'
  })
}

</script>
<style>
.bodyContainer{
      width: 300px;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: orange;
      margin-top: 20px;
      /* font-size: 1rem; */
  }
  .ticketContainer{
      width: 90%;
      height: 80%;
      background-color: 'orange';
      flex-direction: column;
      align-items: center;
  }
  .ticket{
      width: 100%;
      height: 100%;
      background-color: white;
      border-radius: 12px;
  }
  .ticketDetail{
      display:flex;
      height: 70%;
      margin-top: 0.5rem;
      font-weight: 500;
      font-weight: bold;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex-direction: column;
  }

  .ticketDetail{
      display:flex;
      height: 60%;
      margin-top: 0.5rem;
      font-weight: 500;
      font-weight: bold;
      align-items: center;
      justify-content: center;
      text-align: center;
      flex-direction: column;
  }

  .ticketDate{
      height: 20%;
      font-weight: 500;
      padding: 1.5rem;
      text-align: center;
      font-weight: bold;

  }
</style>
