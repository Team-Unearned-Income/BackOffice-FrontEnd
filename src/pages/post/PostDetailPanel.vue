<template>
  <q-card class="post-detail-panel column no-wrap">
    <!-- 헤더 -->
    <q-card-section class="row items-center justify-between bg-grey-2 q-py-md q-px-lg">
      <div class="text-h6 text-bold">게시글 상세 — #{{ post.id }}</div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <!-- 본문 (스크롤) -->
    <q-card-section class="col scroll q-gutter-y-lg q-px-lg">
      <!-- 1. 대표 이미지 -->
      <div>
        <div class="panel-section-title">대표 이미지</div>
        <div class="thumbnail-box flex flex-center text-grey-6">
          <q-img v-if="thumbnailUrl" :src="thumbnailUrl" class="fit" />
          <template v-else>대표 이미지 썸네일</template>
        </div>
      </div>

      <!-- 2. 게시글 정보 -->
      <div>
        <div class="panel-section-title">게시글 정보</div>
        <div v-for="row in info" :key="row.label" class="row q-py-xs">
          <div class="col-4 text-grey-7">{{ row.label }}</div>
          <div class="col text-right text-weight-medium">{{ row.value }}</div>
        </div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">노출 상태</div>
          <div class="col text-right">
            <q-chip dense size="sm" :style="{ backgroundColor: statusMeta.bg, color: statusMeta.text }">
              {{ statusMeta.label }}
            </q-chip>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator />
    <!-- 3. 액션 — 백엔드가 soft delete만 지원 (비공개/재노출 API 없음) -->
    <q-card-actions v-if="!post.isDeleted" align="left" class="q-px-lg q-py-md q-gutter-sm">
      <q-btn
        label="삭제"
        class="bg-red-1 text-bold"
        color="red"
        outline
        @click="showRemove = true"
      />
    </q-card-actions>

    <!-- 처리 확인 모달 -->
    <ProcessConfirmModal
      v-model:show="showRemove"
      title="게시글을 삭제할까요?"
      :message="`삭제 후 복구 불가.\n작성자에게 알림 전송.`"
      require-reason
      reason-label="삭제 사유 (필수)"
      confirm-label="삭제"
      confirm-color="red"
      @confirm="onRemoveConfirm"
    />
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { POST_STATUS_META } from './postMeta'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'remove'])

const statusMeta = computed(() => POST_STATUS_META[String(props.post.isDeleted)])

/** thumbnailImage는 저장 파일명만 내려옴 — 전체 URL 여부가 확실치 않은 값만 <img>로 렌더 */
const thumbnailUrl = computed(() =>
  props.post.thumbnailImage && /^https?:\/\//.test(props.post.thumbnailImage) ? props.post.thumbnailImage : ''
)

const info = computed(() => [
  { label: '제목', value: props.post.title },
  { label: '작성자', value: `${props.post.writer ?? '-'} (#${props.post.writerId ?? '-'})` },
  { label: '지역', value: props.post.region },
  { label: '보증금/월세', value: `${props.post.deposit ?? '-'} / ${props.post.monthlyRent ?? '-'}` },
  {
    label: '입주가능일',
    value: props.post.comeableDateNegotiable
      ? '협의 가능'
      : props.post.comeableDate
        ? dayjs(props.post.comeableDate).format('YYYY.MM.DD')
        : '-'
  },
  { label: '등록일', value: props.post.createdAt ? dayjs(props.post.createdAt).format('YYYY.MM.DD') : '-' },
  { label: '조회수', value: `${props.post.hits ?? 0}회` }
])

/** 모달 표시 상태 */
const showRemove = ref(false)

/** 확인 핸들러 */
const onRemoveConfirm = (reason) => emit('remove', reason)
</script>

<style scoped lang="scss">
.post-detail-panel {
  width: 460px;
  max-width: 90vw;
  height: 100vh;
}

.panel-section-title {
  font-weight: 700;
  font-size: 0.95rem;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.thumbnail-box {
  width: 100%;
  height: 160px;
  background: #f0f0f0;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.85rem;
}
</style>
