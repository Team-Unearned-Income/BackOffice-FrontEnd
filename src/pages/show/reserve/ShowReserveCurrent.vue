<template>
  <div>
    <CurrentReserve
      v-model="model"
      :request-function="dataSetting"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import CurrentReserve from '@/components/current/CurrentReserve.vue'

const model = ref({
  filter: {},
  today: [
    {
      label: '총 등록수',
      value: 0
    },
    {
      label: '예약',
      value: 0
    },
    {
      label: '탑승',
      value: 0
    },
    {
      label: '취소',
      value: 0
    }
  ],
  total: [
    {
      label: '총 등록수',
      value: 0
    },
    {
      label: '예약',
      value: 0
    },
    {
      label: '탑승',
      value: 0
    },
    {
      label: '취소',
      value: 0
    }
  ],
  table: {
    title: '실시간 공연',
    columns: [],
    rows: []
  },
  chart: {
    labels: [],
    datasets: []
  }
})

const dataSetting = async (dateTime) => {
  const { 0: year, 1: month, 2: day } = new Date().toISOString().split('T')[0].split('-')
  const date = dateTime ? dateTime : {
    searchStartDate: `${year}-${month}-01`,
    searchEndDate: `${year}-${month}-${(day <= 2 ? 1 : day - 1).toString().padStart(2, '0')}`
  }
  await showeventApi.getShowEventResvStatus(date).then((res) => {
    model.value = {
      today: [
        {
          label: '총 등록수',
          value: res.data.todayResv.todayTotalRegCnt
        },
        {
          label: '예약',
          value: res.data.todayResv.todayResvCnt
        },
        {
          label: '관람',
          value: res.data.todayResv.todayViewingCnt,
          option: {
            label: '이용률',
            value: res.data.todayResv.todayUsingRate
          }
        },
        {
          label: '취소',
          value: res.data.todayResv.todayCancelCnt
        }
      ],
      total: [
        {
          label: '총 등록수',
          value: res.data.allStatus.totalRegCnt
        },
        {
          label: '예약',
          value: res.data.allStatus.totalResvCnt
        },
        {
          label: '관람',
          value: res.data.allStatus.totalViewingCnt,
          option: {
            label: '이용률',
            value: res.data.allStatus.totalUsingRate
          }
        },
        {
          label: '취소',
          value: res.data.allStatus.totalCancelCnt
        }
      ],
      chart: {
        labels: res.data.allStatus.totalResvTimerange.map((item) => item.timeRange),
        datasets: [
          {
            label: '예약',
            backgroundColor: 'purple',
            data: res.data.allStatus.totalResvTimerange.map((item) => item.totalResv)
          },
          {
            label: '관람',
            backgroundColor: 'yellow',
            data: res.data.allStatus.totalResvTimerange.map((item) => item.totalViewing)
          },
          {
            label: '취소',
            backgroundColor: 'orange',
            data: res.data.allStatus.totalResvTimerange.map((item) => item.totalCancel)
          }
        ]
      },
      table: {
        title: '실시간 공연',
        columns: [
          { name: 'title', label: '공연명', align: 'left', field: 'title', headerStyle: 'min-width: 5rem' },
          { name: 'bookingStartTime', label: '공연시작시간', align: 'center', field: 'bookingStartTime', headerStyle: 'max-width: 1rem' },
          { name: 'resvCnt', label: '예약수 / 예약자수', align: 'center', field: 'resvCnt', headerStyle: 'max-width: 3rem' }
        ],
        rows: res.data.allStatus.showEventRanking.map((item) => ({
          title: item.showEventName,
          bookingStartTime: item.bookingStartTime,
          resvCnt: item.resvCnt + ' / ' + item.resvPeopleCnt
        }))
      }
    }
  })
}

onMounted(async () => {
  await dataSetting()
})
</script>


<style scoped></style>
