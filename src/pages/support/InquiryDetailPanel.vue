<template>
  <q-card class="inquiry-detail-panel column no-wrap">
    <!-- 헤더 -->
    <q-card-section class="row items-center justify-between bg-grey-2 q-py-md q-px-lg">
      <div class="text-h6 text-bold">문의 상세 — #{{ inquiry.id }}</div>
      <q-btn flat round dense icon="close" @click="$emit('close')" />
    </q-card-section>
    <q-separator />

    <!-- 본문 (스크롤) -->
    <q-card-section class="col scroll q-gutter-y-lg q-px-lg">
      <!-- 1. 문의 정보 -->
      <div>
        <div class="panel-section-title">문의 정보</div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-7">회원명</div>
          <div class="col text-right text-weight-medium">{{ inquiry.writer }}</div>
        </div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">유형</div>
          <div class="col text-right">
            <q-chip dense size="sm" :style="{ backgroundColor: typeStyle.bg, color: typeStyle.text }">
              {{ inquiry.type }}
            </q-chip>
          </div>
        </div>
        <div class="row q-py-xs">
          <div class="col-4 text-grey-7">접수일</div>
          <div class="col text-right">{{ receivedDate }}</div>
        </div>
        <div class="row items-center q-py-xs">
          <div class="col-4 text-grey-7">상태</div>
          <div class="col text-right">
            <q-chip dense size="sm" :style="{ backgroundColor: statusMeta.bg, color: statusMeta.text }">
              {{ statusMeta.label }}
            </q-chip>
          </div>
        </div>
      </div>

      <!-- 2. 문의 내용 -->
      <div>
        <div class="panel-section-title">문의 내용</div>
        <div class="content-box">{{ inquiry.contents }}</div>
      </div>

      <!-- 3. 답변 작성 / 조회 -->
      <div>
        <div class="panel-section-title">{{ isAnswered ? '답변 내용' : '답변 작성' }}</div>
        <template v-if="isAnswered">
          <div v-for="r in inquiry.reply" :key="r.id" class="content-box q-mb-sm">
            <div class="text-caption text-grey-7 q-mb-xs">
              {{ r.writer }} · {{ r.createAt ? dayjs(r.createAt).format('YYYY.MM.DD HH:mm') : '-' }}
            </div>
            {{ r.contents }}
          </div>
        </template>
        <q-input
          v-else
          v-model="answer"
          type="textarea"
          outlined
          rows="5"
          placeholder="답변 내용을 입력해주세요"
        />
      </div>
    </q-card-section>

    <!-- 전송 (미답변일 때만) -->
    <template v-if="!isAnswered">
      <q-separator />
      <q-card-actions align="right" class="q-px-lg q-py-md">
        <q-btn
          label="답변 전송"
          color="dark"
          unelevated
          text-color="white"
          :disable="!answer.trim()"
          @click="onSend"
        />
      </q-card-actions>
    </template>
  </q-card>
</template>

<script setup>
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { INQUIRY_STATUS_META, INQUIRY_TYPE_BADGE_STYLE } from './supportMeta'

const props = defineProps({
  inquiry: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'answer'])

const answer = ref('')

const typeStyle = computed(() => INQUIRY_TYPE_BADGE_STYLE)
const statusMeta = computed(() => INQUIRY_STATUS_META[props.inquiry.status])
const isAnswered = computed(() => props.inquiry.status === '답변 완료')
const receivedDate = computed(() =>
  props.inquiry.createAt ? dayjs(props.inquiry.createAt).format('YYYY.MM.DD') : '-'
)

const onSend = () => {
  if (!answer.value.trim()) return
  emit('answer', answer.value.trim())
}
</script>

<style scoped lang="scss">
.inquiry-detail-panel {
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

.content-box {
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.5;
  white-space: pre-line;
}
</style>
