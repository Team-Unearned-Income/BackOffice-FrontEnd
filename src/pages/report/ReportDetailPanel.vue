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
      <div class="col text-right text-weight-medium">{{ targetLabel }}</div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">접수일</div>
      <div class="col text-right">{{ receivedDate }}</div>
    </div>

    <!-- 4. 신고 사유 -->
    <div class="panel-section-title q-mt-md">신고 사유</div>
    <div class="reason-box">{{ report.reason }}</div>

    <!-- 5. 처리 액션 (유형별) -->
    <div class="panel-section-title q-mt-md">처리 액션</div>
    <div class="q-gutter-sm">
      <template v-if="report.type === 'BOARD'">
        <q-btn label="게시글 비공개 + 통보" color="dark" unelevated text-color="white" @click="showHidePost = true" />
        <q-btn label="무혐의" color="grey-7" outline @click="showDismiss = true" />
        <q-btn label="작성자 정지" class="bg-red-1 text-bold" color="red" outline @click="showSuspendAuthor = true" />
      </template>
      <template v-else>
        <q-btn label="회원 정지" class="bg-red-1 text-bold" color="red" outline @click="showSuspendMember = true" />
        <q-btn label="무혐의" color="grey-7" outline @click="showDismiss = true" />
      </template>
    </div>

    <!-- 처리 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showHidePost"
      title="게시글을 비공개 처리할까요?"
      message="작성자에게 처리 결과가 통보됩니다."
      require-reason
      reason-label="비공개 사유 (필수)"
      confirm-label="비공개 처리"
      confirm-color="red"
      @confirm="(reason) => emitProcess('hidden', reason)"
    />
    <ProcessConfirmModal
      v-model:show="showDismiss"
      title="무혐의로 처리할까요?"
      message="신고를 무혐의 처리합니다."
      confirm-label="무혐의"
      confirm-color="dark"
      @confirm="() => emitProcess('noAction')"
    />
    <ProcessConfirmModal
      v-model:show="showSuspendAuthor"
      title="작성자를 정지할까요?"
      message="작성자에게 정지 사유가 통보됩니다."
      require-reason
      reason-label="정지 사유 (필수)"
      confirm-label="작성자 정지"
      confirm-color="red"
      @confirm="(reason) => emitProcess('suspended', reason)"
    />
    <ProcessConfirmModal
      v-model:show="showSuspendMember"
      title="회원을 정지할까요?"
      message="회원에게 정지 사유가 통보됩니다."
      require-reason
      reason-label="정지 사유 (필수)"
      confirm-label="회원 정지"
      confirm-color="red"
      @confirm="(reason) => emitProcess('suspended', reason)"
    />
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { TYPE_META } from './reportMeta'

const props = defineProps({
  report: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['process'])

const typeMeta = computed(() => TYPE_META[props.report.type])
const targetLabel = computed(() =>
  props.report.type === 'BOARD' ? `게시글 #${props.report.reportedId}` : `회원 #${props.report.reportedId}`
)
const receivedDate = computed(() =>
  props.report.createdAt ? dayjs(props.report.createdAt).format('YYYY.MM.DD') : '-'
)

/** 모달 표시 상태 */
const showHidePost = ref(false)
const showDismiss = ref(false)
const showSuspendAuthor = ref(false)
const showSuspendMember = ref(false)

/** action: 'hidden' | 'noAction' | 'suspended' — reportApi 메서드명과 동일하게 맞춤 */
const emitProcess = (action, reason) => emit('process', { action, reason })
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
