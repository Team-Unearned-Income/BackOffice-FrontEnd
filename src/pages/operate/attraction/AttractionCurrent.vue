<template>
  <div>
    <CurrentReserve v-model="model" :request-function="dataSetting" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
    },
    {
      label: '이용률',
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
    },
    {
      label: '이용률',
      value: 0
    }
  ],
  table: {
    title: '인기 어트랙션',
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
  const date = dateTime
    ? dateTime
    : {
        searchStartDate: `${year}-${month}-01`,
        searchEndDate: `${year}-${month}-${(day <= 2 ? 1 : day - 1).toString().padStart(2, '0')}`
      }
  await operatingApi.getAttractionResvStatus(date).then((res) => {
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
          label: '탑승',
          value: res.data.todayResv.todayBoardingCnt,
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
          label: '탑승',
          value: res.data.allStatus.totalBoardingCnt,
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
            label: '탑승',
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
        title: '인기 어트랙션',
        columns: [
          { name: 'rank', label: 'No.', align: 'center', field: 'rank' },
          { name: 'title', label: '어트랙션명', align: 'left', field: 'title' },
          { name: 'resvCnt', label: '예약수 / 예약자수', align: 'center', field: 'resvCnt' }
        ],
        rows: res.data.allStatus.attractionRanking.map((item) => ({
          rank: item.rank,
          title: item.attractionName,
          resvCnt: item.resvCnt + ' / '+ item.resvPeopleCnt
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
