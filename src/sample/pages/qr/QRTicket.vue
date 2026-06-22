<template>
  <div class="bodyContainer">
    <div class="ticketContainer">
    <div class="ticket">
      <div class="ticketHeader q-gutter-y-sm">
        <div style="font-size: large">{{ticketModel.issuer}}</div>
        <div>{{`단체명: ${ticketModel.groupName}`}}</div>
        <div>{{`유효일자: ${ticketModel.useDate}`}}</div>
      </div>
      <div class="ticketRip">
        <div class="circleLeft"></div>
        <div class="ripLine"></div>
        <div class="circleRight"></div>
      </div>
      <div class="ticketDetail q-gutter-y-md">
        <div class="qrWrapper" :style="{ opacity: qrWrapperOpacity }">
          <div style="font-size: 1.5rem">{{ticketModel.ticketName}}</div>
          <QrCode :value="qrValue" :width="qrWidth" />
          <div style="font-weight: 100; font-size: 1.2rem">{{ticketModel.id}}</div>
        </div>
        <div style="font-size: 1.3rem">{{ticketStatus}}</div>
      </div>
    </div>
  </div>
  </div>
  </template>

  <script setup>
  import { onMounted, ref, onBeforeUnmount, inject, computed} from 'vue'
  import { useRoute } from 'vue-router'
  import QrCode from '@/components/input/QRCode.vue'
  import COMMON from '@/constants/commonConstatns.js'


  const emitter = inject('emitter')
  const route = useRoute()
  const qrWidth = ref(0)
  const qrValue = ref('')
  const ticketStatus = computed(() => {
    if(ticketModel.value.status === 'USE_SUCCESS') {
      return '사용완료'
    }
    else if(ticketModel.value.validDateYn === 'N'){
      return '만료됨'
    }
    else {
      return ''
    }
  })

  const qrWrapperOpacity = computed(() => {
    if(ticketModel.value.status === 'USE_SUCCESS' || ticketModel.value.validDateYn === 'N') {
      return 0.1
    }
    else {
      return 1
    }
  });

  const ticketModel = ref({
    issuer: '과천 서울랜드',
    groupName: '',
    useDate: '',
    validDateYn: '',
    status: '',
  })

  const sizingQRArea = () => {
    const qrWrapper = document.querySelector('.ticketDetail')
    const size = qrWrapper.clientWidth > qrWrapper.clientHeight ? qrWrapper.clientHeight : qrWrapper.clientWidth
    if (qrWrapper) {
      qrWidth.value = size * 0.7

    }
  }

  const initQrCode = () => {
    qrValue.value = route.params.id
  }

  const initData = async () => {
    await marketingApi.getGroupTicketQrInfo(route.params.id)
      .then((res) => {
        ticketModel.value.groupName = res.data.groupName,
        ticketModel.value.useDate = res.data.useDate,
        ticketModel.value.validDateYn = res.data.validDateYn,
        ticketModel.value.status = res.data.status
      })

  }

  onMounted(async () => {
    emitter.emit(COMMON.LOADING.SHOW)
    initQrCode()
    sizingQRArea()
    await initData()
    window.addEventListener('resize', sizingQRArea)
    emitter.emit(COMMON.LOADING.HIDE)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', sizingQRArea)
  })

  </script>

  <style scoped>

  .bodyContainer{
      width: 100%;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: orange;
      /* font-size: 1rem; */
  }

  /* Main Ticket Style */
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

  .ticketHeader{
      height: 20%;
      font-weight: 500;
      padding: 1.5rem;
      text-align: left;
      font-weight: bold;

  }

  /* Ticket Ripper */
  .ticketRip{
      display: flex;
      justify-content: space-between;
      align-items: center;
  }
  .circleLeft{
      width: 12px;
      height: 24px;
      background-color: orange;
      border-radius: 0 12px 12px 0;
  }
  .ripLine{
      width: 100%;
      border-top: 3px solid orange;
      border-top-style: dashed ;
  }
  .circleRight{
    width: 12px;
      height: 24px;
      background-color: orange;
      border-radius: 12px 0 0 12px;
  }

  .qrWrapper{
    opacity: 1;
  }

  .blur {
      filter: blur(25px);
      -webkit-filter: blur(25px);
  }
  </style>
