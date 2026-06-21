<template>
  <div class="q-pa-lg">
    <!-- 타이틀 + 기준일 -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-bold">대시보드</div>
      <div class="text-grey-6">{{ baseDate }} 기준</div>
    </div>

    <div class="q-gutter-y-md">
      <!-- 1. 핵심 지표 카드 -->
      <div class="row q-col-gutter-md">
        <div v-for="card in kpiCards" :key="card.key" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="dashboard-card q-pa-md full-height">
            <div class="text-grey-7 text-body2">{{ card.label }}</div>
            <div class="text-h4 text-bold q-mt-sm" :class="{ 'text-red': card.danger }">
              {{ card.value }}
            </div>
            <div class="text-caption q-mt-sm" :class="card.danger ? 'text-red' : 'text-grey-6'">
              {{ card.sub }}
            </div>
          </q-card>
        </div>
      </div>

      <!-- 2. 신규 가입 추이 그래프 -->
      <q-card flat bordered class="q-pa-md">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-bold">최근 7일 신규 가입 추이</div>
          <div class="text-caption text-grey-6">일별 신규 가입자 수</div>
        </div>
        <div class="dashboard-chart">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </q-card>

      <!-- 3. 처리 대기 빠른 현황 -->
      <div class="row q-col-gutter-md items-stretch">
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md full-height">
            <div class="text-subtitle2 text-bold q-mb-sm">신고 처리 대기</div>
            <div
              v-for="item in reportPending"
              :key="item.label"
              class="row items-center justify-between q-py-sm"
            >
              <div>{{ item.label }}</div>
              <q-chip
                outline
                color="red"
                clickable
                class="text-bold"
                @click="goTo(item.to)"
              >
                {{ item.count }}건 → 바로가기
              </q-chip>
            </div>
          </q-card>
        </div>
        <div class="col-12 col-md-6">
          <q-card flat bordered class="q-pa-md full-height">
            <div class="text-subtitle2 text-bold q-mb-sm">신원 인증 대기</div>
            <div
              v-for="item in verifyPending"
              :key="item.label"
              class="row items-center justify-between q-py-sm"
            >
              <div>{{ item.label }}</div>
              <q-chip
                outline
                color="amber-8"
                clickable
                class="text-bold"
                @click="goTo(item.to)"
              >
                {{ item.count }}건 → 바로가기
              </q-chip>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'
import COMMON from '@/constants/commonConstatns'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const emitter = inject('emitter')
const router = useRouter()

/** 기준일 (목업) */
const baseDate = '2025.06.08'

/** 1. 핵심 지표 카드 (목업) */
const kpiCards = [
  { key: 'newSignup', label: '오늘 신규 가입', value: '24', sub: '↑ 어제 대비 +6명' },
  { key: 'totalMembers', label: '누적 회원 수', value: '1,248', sub: '전체 가입자' },
  { key: 'roommate', label: '룸메이트 확정', value: '312', sub: '채팅 내 확정 누적' },
  { key: 'pending', label: '처리 대기', value: '7', sub: '신고 4건 + 인증 3건', danger: true }
]

/** 2. 최근 7일 신규 가입 추이 (목업) */
const signupTrend = [
  { label: '6/2', value: 14 },
  { label: '6/3', value: 18 },
  { label: '6/4', value: 16 },
  { label: '6/5', value: 22 },
  { label: '6/6', value: 19 },
  { label: '6/7', value: 21 },
  { label: '오늘', value: 24 }
]

const chartData = {
  labels: signupTrend.map((d) => d.label),
  datasets: [
    {
      data: signupTrend.map((d) => d.value),
      // 오늘 막대만 진하게 강조
      backgroundColor: signupTrend.map((d, i) =>
        i === signupTrend.length - 1 ? '#6b6b6b' : '#cfcfcf'
      ),
      borderRadius: 4,
      maxBarThickness: 64
    }
  ]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true }
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false }
    },
    y: {
      display: false,
      beginAtZero: true,
      grid: { display: false }
    }
  }
}

/** 3. 처리 대기 빠른 현황 (목업) */
const reportPending = [
  { label: '게시글 신고', count: 3, to: '/reports' },
  { label: '프로필 신고', count: 1, to: '/reports' }
]
const verifyPending = [{ label: '학교 이메일 인증', count: 3, to: '/verification' }]

const goTo = (path) => {
  router.push(path)
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
})
</script>

<style scoped lang="scss">
.dashboard-card {
  border-radius: 8px;
}

.dashboard-chart {
  height: 260px;
}
</style>
