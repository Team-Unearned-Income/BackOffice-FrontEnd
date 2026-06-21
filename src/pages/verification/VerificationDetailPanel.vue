<template>
  <q-card flat bordered class="q-pa-md">
    <!-- 3. 인증 요청 상세 -->
    <div class="panel-section-title">인증 요청 상세</div>
    <div class="row q-py-xs">
      <div class="col-4 text-grey-7">회원명</div>
      <div class="col text-right text-weight-medium">{{ request.member }} (#{{ request.memberId }})</div>
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
      <div class="col text-right">{{ request.requestDate }}</div>
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
      <q-btn label="승인" color="dark" unelevated text-color="white" @click="onApprove" />
      <q-btn label="반려" class="bg-red-1 text-bold" color="red" outline @click="onReject" />
    </div>
    <div class="text-caption text-grey-6 q-mt-sm">
      학교: .ac.kr / .edu 도메인 확인 · 회사: gmail / naver 등 개인 이메일 제외
    </div>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'
import { useQuasar } from 'quasar'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { TYPE_META } from './verificationMeta'

const props = defineProps({
  request: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['approve', 'reject'])

const $q = useQuasar()

const typeMeta = computed(() => TYPE_META[props.request.type])

/** 승인: 별도 입력 없이 즉시 처리 (간단 확인) */
const onApprove = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '인증을 승인할까요?',
      message: '인증 배지 부여 + 완료 알림이 발송됩니다.',
      requireReason: false,
      confirmLabel: '승인',
      confirmColor: 'dark'
    }
  }).onOk(() => emit('approve'))
}

/** 반려: 사유 필수 입력 모달 */
const onReject = () => {
  $q.dialog({
    component: ProcessConfirmModal,
    componentProps: {
      title: '반려 사유를 입력해주세요',
      message: `${props.request.member} (#${props.request.memberId}) ${typeMeta.value.label} 이메일 인증 요청을 반려합니다.\n사유는 유저에게 알림으로 전송됩니다.`,
      requireReason: true,
      reasonLabel: '반려 사유 (필수)',
      placeholder: '반려 사유를 입력해주세요 (예: 개인 이메일 형식입니다)',
      confirmLabel: '반려 처리',
      confirmColor: 'red'
    }
  }).onOk((reason) => emit('reject', reason))
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
</style>
