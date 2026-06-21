<template>
  <q-card flat bordered class="q-pa-md">
    <!-- 3. 신고 상세 -->
    <div class="panel-section-title">신고 상세</div>
    <div class="row items-center q-py-xs">
      <div class="col-4 text-grey-7">신고 유형</div>
      <div class="col text-right">
        <q-chip dense size="sm" :style="{ backgroundColor: typeMeta.bg, color: typeMeta.text }">
          {{ typeMeta.label }} 신고
        </q-chip>
      </div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">신고자</div>
      <div class="col text-right text-weight-medium">{{ report.reporter }} (#{{ report.reporterId }})</div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">피신고 대상</div>
      <div class="col text-right text-weight-medium">{{ report.target }}</div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">접수일</div>
      <div class="col text-right">{{ report.receivedDate }}</div>
    </div>

    <!-- 4. 신고 사유 -->
    <div class="panel-section-title q-mt-md">신고 사유</div>
    <div class="reason-box">{{ report.reason }}</div>

    <!-- 5. 처리 액션 (유형별) -->
    <div class="panel-section-title q-mt-md">처리 액션</div>
    <div class="q-gutter-sm">
      <template v-if="report.type === 'post'">
        <q-btn label="게시글 비공개 + 통보" color="dark" unelevated text-color="white" @click="onHidePost" />
        <q-btn label="무혐의" color="grey-7" outline @click="onDismiss" />
        <q-btn label="작성자 정지" class="bg-red-1 text-bold" color="red" outline @click="onSuspendAuthor" />
      </template>
      <template v-else>
        <q-btn label="회원 정지" class="bg-red-1 text-bold" color="red" outline @click="onSuspendMember" />
        <q-btn label="무혐의" color="grey-7" outline @click="onDismiss" />
      </template>
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { TYPE_META } from './reportMeta'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['process'])

const $q = useQuasar()

const typeMeta = computed(() => TYPE_META[props.report.type])

/** 게시글 비공개 + 통보 (사유 필수) */
const onHidePost = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '게시글을 비공개 처리할까요?',
      message: '작성자에게 처리 결과가 통보됩니다.',
      requireReason: true,
      reasonLabel: '비공개 사유 (필수)',
      confirmLabel: '비공개 처리',
      confirmColor: 'red'
    }
  }).onOk((reason) => emit('process', { result: '비공개 처리', reason }))
}

/** 무혐의 (간단 확인) */
const onDismiss = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '무혐의로 처리할까요?',
      message: '신고를 무혐의 처리합니다.',
      requireReason: false,
      confirmLabel: '무혐의',
      confirmColor: 'dark'
    }
  }).onOk(() => emit('process', { result: '무혐의' }))
}

/** 작성자 정지 (사유 필수) */
const onSuspendAuthor = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '작성자를 정지할까요?',
      message: '작성자에게 정지 사유가 통보됩니다.',
      requireReason: true,
      reasonLabel: '정지 사유 (필수)',
      confirmLabel: '작성자 정지',
      confirmColor: 'red'
    }
  }).onOk((reason) => emit('process', { result: '회원 정지', reason }))
}

/** 회원 정지 (프로필 신고, 사유 필수) */
const onSuspendMember = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '회원을 정지할까요?',
      message: '회원에게 정지 사유가 통보됩니다.',
      requireReason: true,
      reasonLabel: '정지 사유 (필수)',
      confirmLabel: '회원 정지',
      confirmColor: 'red'
    }
  }).onOk((reason) => emit('process', { result: '회원 정지', reason }))
}
</script>

<style scoped lang="scss">
.panel-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.reason-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
