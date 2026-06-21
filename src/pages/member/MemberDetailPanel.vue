<template>
  <q-card class="member-detail-panel column no-wrap">
    <!-- 헤더 -->
    <q-card-section class="row items-center justify-between bg-grey-2 q-py-md q-px-lg">
      <div class="text-h6 text-bold">회원 상세 — {{ member.name }} (#{{ member.id }})</div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <!-- 본문 (스크롤) -->
    <q-card-section class="col scroll q-gutter-y-lg q-px-lg">
      <!-- 1. 기본 정보 -->
      <div>
        <div class="panel-section-title">기본 정보</div>
        <div v-for="row in basicInfo" :key="row.label" class="row q-py-xs">
          <div class="col-4 text-grey-7">{{ row.label }}</div>
          <div class="col">{{ row.value }}</div>
        </div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">계정 상태</div>
          <div class="col">
            <q-chip dense size="sm" :style="{ backgroundColor: statusMeta.bg, color: statusMeta.text }">
              {{ statusMeta.label }}
            </q-chip>
          </div>
        </div>
      </div>

      <!-- 2. 신원 인증 현황 -->
      <div>
        <div class="panel-section-title">신원 인증 현황</div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">신원 인증</div>
          <div class="col">
            <q-chip dense size="sm" :style="{ backgroundColor: verifyMeta.bg, color: verifyMeta.text }">
              {{ verifyMeta.label }}
            </q-chip>
          </div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-7">학교 이메일</div>
          <div class="col">{{ member.schoolEmail || '미인증' }}</div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-7">회사 이메일</div>
          <div class="col">{{ member.companyEmail || '미인증' }}</div>
        </div>
      </div>

      <!-- 3. 권한 관리 -->
      <div>
        <div class="panel-section-title">권한 관리</div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">현재 권한</div>
          <div class="col">
            <q-chip dense size="sm" :style="{ backgroundColor: roleMeta.bg, color: roleMeta.text }">
              {{ roleMeta.label }}
            </q-chip>
          </div>
        </div>
        <div class="q-mt-sm">
          <q-btn
            v-if="canGrant"
            label="admin 권한 부여"
            class="bg-amber-1 text-bold"
            color="amber-8"
            outline
            @click="showGrant = true"
          />
          <q-btn
            v-else-if="member.role === 'admin' && !isSelf"
            label="admin 권한 회수"
            color="grey-8"
            outline
            @click="showRevoke = true"
          />
          <div v-if="member.role === 'admin' && isSelf" class="text-caption text-grey-6">
            본인 계정은 권한을 회수할 수 없습니다.
          </div>
        </div>
      </div>

      <!-- 4. 신고 이력 -->
      <div>
        <div class="panel-section-title">신고 이력</div>
        <div class="text-body2">신고 받은 횟수: {{ member.reportCount }}건</div>
      </div>
    </q-card-section>

    <q-separator />
    <!-- 5. 액션 (상태에 따라 변경) -->
    <q-card-actions align="right" class="q-px-lg q-py-md">
      <q-btn
        v-if="member.status === 'active'"
        label="정지"
        class="bg-red-1 text-bold"
        color="red"
        outline
        @click="showSuspend = true"
      />
      <q-btn
        v-else-if="member.status === 'suspended'"
        label="정지 해제"
        color="primary"
        outline
        @click="showUnsuspend = true"
      />
    </q-card-actions>

    <!-- 처리 확인 모달 (BasicConfirm 기반 공통 모달) -->
    <ProcessConfirmModal
      v-model:show="showSuspend"
      title="회원을 정지하시겠어요?"
      :message="`${member.name} (#${member.id})을 무기한 정지합니다.\n정지 즉시 앱 로그인이 불가합니다.`"
      require-reason
      reason-label="정지 사유 (필수)"
      confirm-label="정지 처리"
      confirm-color="red"
      @confirm="onSuspendConfirm"
    />
    <ProcessConfirmModal
      v-model:show="showUnsuspend"
      title="정지 해제"
      :message="`${member.name} (#${member.id}) 회원의 정지를 해제하시겠어요?`"
      confirm-label="정지 해제"
      confirm-color="dark"
      @confirm="onUnsuspendConfirm"
    />
    <ProcessConfirmModal
      v-model:show="showGrant"
      title="admin 권한을 부여할까요?"
      :message="`${member.name} (#${member.id})에게 관리자 권한을 부여합니다.\n해당 계정은 BO에 접근할 수 있게 됩니다.`"
      :warning="`⚠ 관리자 권한은 신중하게 부여해주세요.\nBO의 모든 기능에 접근 가능합니다.`"
      confirm-label="권한 부여"
      confirm-color="amber"
      @confirm="onGrantConfirm"
    />
    <ProcessConfirmModal
      v-model:show="showRevoke"
      title="admin 권한 회수"
      :message="`${member.name} (#${member.id}) 회원의 admin 권한을 회수하시겠어요?`"
      confirm-label="회수"
      confirm-color="dark"
      @confirm="onRevokeConfirm"
    />
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { STATUS_META, VERIFY_META, ROLE_META } from './memberMeta'

/** 현재 로그인 관리자(목업) — 본인 셀프 권한 회수 방지 데모용 */
const CURRENT_ADMIN_ID = 1015

const props = defineProps({
  member: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'suspend', 'unsuspend', 'grant', 'revoke'])

const statusMeta = computed(() => STATUS_META[props.member.status])
const verifyMeta = computed(() => VERIFY_META[props.member.verify])
const roleMeta = computed(() => ROLE_META[props.member.role])

const isSelf = computed(() => props.member.id === CURRENT_ADMIN_ID)
const canGrant = computed(() => props.member.role === 'user' && props.member.status !== 'withdrawn')

const basicInfo = computed(() => [
  { label: '이름', value: props.member.name },
  { label: '이메일', value: props.member.email },
  { label: '생년월일', value: props.member.birth },
  { label: '성별', value: props.member.gender },
  { label: '가입일', value: props.member.joinDate }
])

/** 모달 표시 상태 */
const showSuspend = ref(false)
const showUnsuspend = ref(false)
const showGrant = ref(false)
const showRevoke = ref(false)

/** 확인 핸들러 (추후 API 호출 연결 지점) */
const onSuspendConfirm = (reason) => emit('suspend', reason)
const onUnsuspendConfirm = () => emit('unsuspend')
const onGrantConfirm = () => emit('grant')
const onRevokeConfirm = () => emit('revoke')
</script>

<style scoped lang="scss">
.member-detail-panel {
  width: 460px;
  max-width: 90vw;
  height: 100vh;
}

.panel-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #e0e0e0;
}
</style>
