<template>
  <q-card flat bordered class="q-pa-md">
    <!-- 3. 인증 요청 상세 -->
    <div class="panel-section-title">인증 요청 상세</div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">회원명</div>
      <div class="col text-right text-weight-medium">{{ request.name }}</div>
    </div>
    <div class="row items-center q-py-xs">
      <div class="col-4 text-grey-7">인증 유형</div>
      <div class="col text-right">
        <q-chip dense size="sm" :style="{ backgroundColor: typeMeta.bg, color: typeMeta.text }">
          {{ typeMeta.label }} 이메일
        </q-chip>
      </div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">제출 이메일</div>
      <div class="col text-right text-weight-medium">{{ request.email }}</div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">요청일</div>
      <div class="col text-right">{{ requestDate }}</div>
    </div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">경과일</div>
      <div class="col text-right" :class="request.overdue ? 'text-red text-weight-medium' : ''">
        {{ request.elapsedText }}
      </div>
    </div>

    <!-- 4. 처리 액션 -->
    <div class="panel-section-title q-mt-md">처리 액션</div>
    <div class="q-gutter-sm">
      <q-btn label="승인" color="dark" unelevated text-color="white" @click="showApprove = true" />
      <q-btn label="반려" class="bg-red-1 text-bold" color="red" outline @click="showReject = true" />
    </div>
    <div class="text-caption text-grey-6 q-mt-sm">
      학교: .ac.kr / .edu 도메인 확인 · 회사: gmail / naver 등 개인 이메일 제외
    </div>

    <!-- 처리 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showApprove"
      title="인증을 승인할까요?"
      message="인증 배지 부여 + 완료 알림이 발송됩니다."
      confirm-label="승인"
      confirm-color="dark"
      @confirm="onApproveConfirm"
    />
    <ProcessConfirmModal
      v-model:show="showReject"
      title="반려 사유를 입력해주세요"
      :message="`${request.name} ${typeMeta.label} 이메일 인증 요청을 반려합니다.\n사유는 유저에게 알림으로 전송됩니다.`"
      require-reason
      reason-label="반려 사유 (필수)"
      placeholder="반려 사유를 입력해주세요 (예: 개인 이메일 형식입니다)"
      confirm-label="반려 처리"
      confirm-color="red"
      @confirm="onRejectConfirm"
    />
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { TYPE_META } from './verificationMeta'

const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['approve', 'reject'])

const typeMeta = computed(() => TYPE_META[props.request.type])
const requestDate = computed(() =>
  props.request.createAt ? dayjs(props.request.createAt).format('YYYY.MM.DD') : '-'
)

/** 모달 표시 상태 */
const showApprove = ref(false)
const showReject = ref(false)

/** 확인 핸들러 (추후 API 호출 연결 지점) */
const onApproveConfirm = () => emit('approve')
const onRejectConfirm = (reason) => emit('reject', reason)
</script>

<style scoped lang="scss">
.panel-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}
</style>
