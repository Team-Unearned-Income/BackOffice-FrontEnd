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
          <q-img v-if="post.thumbnail" :src="post.thumbnail" class="fit" />
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
    <!-- 3. 액션 (노출 상태에 따라 변경) -->
    <q-card-actions align="left" class="q-px-lg q-py-md q-gutter-sm">
      <q-btn
        v-if="post.status === 'visible'"
        label="비공개"
        class="bg-red-1 text-bold"
        color="red"
        outline
        @click="showHide = true"
      />
      <q-btn
        v-if="post.status === 'hidden'"
        label="재노출"
        color="dark"
        unelevated
        text-color="white"
        @click="showRepublish = true"
      />
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
      v-model:show="showHide"
      title="게시글을 비공개할까요?"
      message="작성자에게 사유가 알림으로 전송됩니다."
      require-reason
      reason-label="비공개 사유 (필수)"
      confirm-label="비공개"
      confirm-color="red"
      @confirm="onHideConfirm"
    />
    <ProcessConfirmModal
      v-model:show="showRepublish"
      title="게시글을 재노출할까요?"
      message="비공개 처리된 게시글을 다시 노출합니다."
      confirm-label="재노출"
      confirm-color="dark"
      @confirm="onRepublishConfirm"
    />
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
import ProcessConfirmModal from '@/components/modal/ProcessConfirmModal.vue'
import { POST_STATUS_META } from './postMeta'

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'hide', 'republish', 'remove'])

const statusMeta = computed(() => POST_STATUS_META[props.post.status])

const info = computed(() => [
  { label: '제목', value: props.post.title },
  { label: '작성자', value: `${props.post.author} (#${props.post.authorId})` },
  { label: '지역', value: props.post.region },
  { label: '보증금/월세', value: `${props.post.deposit} / ${props.post.rent}` },
  { label: '입주가능일', value: props.post.moveInLabel === '즉시' ? '즉시 입주' : props.post.moveInLabel },
  { label: '등록일', value: props.post.regDate },
  { label: '조회수', value: `${props.post.views}회` }
])

/** 모달 표시 상태 */
const showHide = ref(false)
const showRepublish = ref(false)
const showRemove = ref(false)

/** 확인 핸들러 (추후 API 호출 연결 지점) */
const onHideConfirm = (reason) => emit('hide', reason)
const onRepublishConfirm = () => emit('republish')
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
