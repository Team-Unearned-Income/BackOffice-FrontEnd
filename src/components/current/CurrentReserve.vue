<template>
  <div class="q-gutter-y-md">
    <div class="q-gutter-y-md bg-grey-3 q-pa-md">
      <div class="row justify-between">
        <div class="col text-h5 text-bold">오늘예약</div>
        <div class="col justify-end text-right">
          {{ new Date().toISOString().slice(0, 10).replace(/-/g, '.') }}
        </div>
      </div>
      <div class="row q-gutter-x-md">
        <div
          v-for="(item, index) in model.today"
          :key="index"
          class="col q-gutter-y-sm border border-black bg-white q-pa-md rounded-borders"
        >
          <div class="text-center">{{ item.label }}</div>
          <div class="text-center text-h5 text-weight-bold">{{ formatNumber(item.value, 1) }}</div>
          <div v-if="item.option !== undefined" class="text-center usage-percent-text">
            {{ item.option.value + '% 이용' }}
          </div>
        </div>
      </div>
    </div>
    <q-separator />
    <div class="q-gutter-y-md">
      <div class="row border-top border-black justify-content-between">
        <div class="col-2 text-h6 text-bold">전체현황</div>
        <div class="col row q-gutter-md justify-end">
          <DoubleDateInput
            v-model="requestParams"
            class="col-5"
            @update:model-value="setDateFilter('custom')"
          />
          <q-btn
            label="이번달"
            :color="buttonColor === 'default' ? 'orange' : undefined"
            @click="setDateFilter('default')"
          />
          <q-btn
            label="최근 3개월"
            :color="buttonColor === 'threeMonths' ? 'orange' : undefined"
            @click="setDateFilter('threeMonths')"
          />
          <q-btn
            label="최근 6개월"
            :color="buttonColor === 'sixMonths' ? 'orange' : undefined"
            @click="setDateFilter('sixMonths')"
          />
          <q-btn
            label="올해"
            :color="buttonColor === 'thisYear' ? 'orange' : undefined"
            @click="setDateFilter('thisYear')"
          />
        </div>
      </div>
      <div class="row border border-black q-pa-md bg-white">
        <div
          v-for="(item, index) in model.total"
          :key="index"
          class="col q-gutter-y-md bg-white q-pa-md rounded-borders"
        >
          <div class="text-center">{{ item.label }}</div>
          <div class="text-center text-h4 text-weight-bold">{{ formatWithSuffix(item.value) }}</div>
          <div v-if="item.option !== undefined" class="text-center usage-percent-text">
            {{ item.option.value + '% 이용' }}
          </div>
        </div>
      </div>
      <div class="row q-gutter-md">
        <div class="col border border-black bg-white q-pa-md">
          <div class="row justify-between">
            <div class="text-h6 text-bold">예약시간대별</div>
            <div>{{ 'Total ' + formatNumber(model.total[0].value, 1) }}</div>
          </div>
          <div class="row chart-container" style="overflow-x: auto;">
            <div :style="{ width: chartWidth }">
              <Bar ref="dataChart" :data="model.chart" :options="options" :style="{ width: chartWidth, height: '25vh' }" />
            </div>
          </div>
        </div>
        <div class="col-8 border border-black bg-white q-pa-md">
          <div class="text-h6 text-bold">{{ model.table.title }}</div>
          <div>
            <q-table
              :rows="model.table.rows"
              :columns="model.table.columns"
              :hide-pagination="true"
              :rows-per-page-options="[5]"
              row-key="id"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import { Bar } from 'vue-chartjs'
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js'

const model = defineModel()
const dataChart = ref(null)

const requestParams = ref({
  from: '',
  to: ''
})
const buttonColor = ref('orange')

const props = defineProps({
  requestFunction: {
    type: Function,
    required: true,
    default: () => {
    }
  }
})

const options = {
  responsive: true,
  maintainAspectRatio: false,
  intersection: {
    mode: 'index'
  },
  scales: {
    x: {
      stacked: true,
      ticks: {
        autoSkip: false
      }
    },
    y: {
      stacked: true,
      ticks: {
        stepSize: 2
      }
    }
  },
  plugins: {
    legend: {
      position: 'right',
      align: 'start'
    },
    tooltip: {
      mode: 'index',
      callbacks: {
        footer: function(tooltipItem) {
          let sum = 0
          tooltipItem.forEach(function(tooltipItem) {
            sum += tooltipItem.parsed.y
          })
          return '총등록: ' + sum
        }
      }
    }
  }
}
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const chartWidth = computed(() => {
  const labelCount = model.value.chart?.labels?.length || 0
  if (labelCount === 0) {
    return '100%'
  }
  const requiredWidth = labelCount * 35
  return `${requiredWidth}px`
})

const setDateFilter = async (type) => {
  buttonColor.value = type
  const today = new Date()
  const yesterday = new Date(today.setDate(today.getDate() - 1))
  switch (type) {
    case 'threeMonths':
      requestParams.value = {
        from: new Date(new Date().setMonth(today.getMonth() - 3))
          .toLocaleDateString('en-CA')
          .slice(0, 10),
        to: yesterday.toLocaleDateString('en-CA').slice(0, 10)
      }
      break
    case 'sixMonths':
      requestParams.value = {
        from: new Date(new Date().setMonth(today.getMonth() - 6))
          .toLocaleDateString('en-CA')
          .slice(0, 10),
        to: yesterday.toLocaleDateString('en-CA').slice(0, 10)
      }
      break
    case 'thisYear':
      requestParams.value = {
        from: new Date(today.getFullYear(), 0, 1).toLocaleDateString('en-CA').slice(0, 10),
        to: yesterday.toLocaleDateString('en-CA').slice(0, 10)
      }
      break
    case 'custom':
      break
    default:
      initDateInput()
      break // 기본 값은 이번 달
  }
  await props.requestFunction({
    searchStartDate: requestParams.value.from,
    searchEndDate: requestParams.value.to
  })
}

const formatNumber = (num, digits = 4) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumIntegerDigits: digits,
    useGrouping: true
  }).format(num)

  return formatted
}

const formatWithSuffix = (num, decimalPlaces = 2) => {
  if (num >= 1_000_000_000_000_000) {
    return parseFloat((num / 1_000_000_000_000_000).toFixed(decimalPlaces)) + 'Q'
  } else if (num >= 1_000_000_000) {
    return parseFloat((num / 1_000_000_000).toFixed(decimalPlaces)) + 'B'
  } else if (num >= 1_000_000) {
    return parseFloat((num / 1_000_000).toFixed(decimalPlaces)) + 'M'
  } else if (num >= 1_000) {
    return parseFloat((num / 1_000).toFixed(decimalPlaces)) + 'K'
  } else {
    return parseFloat(num.toFixed(decimalPlaces)).toString()
  }
}

const initDateInput = async () => {
  const { 0: year, 1: month, 2: day } = new Date().toISOString().split('T')[0].split('-')
  requestParams.value = {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${(day <= 2 ? 1 : day - 1).toString().padStart(2, '0')}`
  }
}
onMounted(async () => {
  await initDateInput()
})
</script>

<style scoped>
.usage-percent-text {
  font-size: 0.65rem;
  font-weight: bold;
  color: #e57627;
}

.chart-container {
  min-height: 25vh;
}

::v-deep(.q-table tbody tr) {
  height: 3rem;
}

.rounded-borders {
  border-radius: 20px;
}
</style>
