<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">앱 버전 관리</div>

    <q-card flat bordered class="q-pa-lg" style="max-width: 480px">
      <template v-if="current">
        <div class="text-caption text-grey-6">현재 앱 버전</div>
        <div class="text-h4 text-bold q-mt-xs q-mb-md">{{ current.version }}</div>
        <q-btn label="수정" color="dark" unelevated @click="openEdit" />
      </template>
      <template v-else>
        <div class="text-body1 text-grey-7 q-mb-md">등록된 앱 버전 정보가 없습니다.</div>
        <q-btn label="+ 버전 등록" color="primary" unelevated @click="openCreate" />
      </template>
    </q-card>

    <div class="info-banner row items-start no-wrap q-mt-md">
      <q-icon name="info" size="18px" class="q-mr-sm q-mt-xs" />
      <span>
현재 API는 플랫폼(iOS/Android) 구분, 최소 지원 버전, 강제 업데이트 여부 등을 지원하지 않으며 버전 문자열 1개만
        관리됩니다. 저장 시 기존 버전은 대체됩니다.
</span>
    </div>

    <!-- 등록/수정 폼 모달 -->
    <BasicConfirm
      v-model:show="showForm"
      :title="isEdit ? '앱 버전 수정' : '앱 버전 등록'"
      close-label="취소"
      :draggable="false"
      :style="{ width: '400px', maxWidth: '90vw' }"
    >
      <template #content>
        <div class="field-label">버전 <span class="text-red">*</span></div>
        <q-input v-model="versionInput" dense outlined placeholder="예: 2.1.0" autofocus />
      </template>
      <template #button>
        <q-btn
          label="저장"
          class="modal-btn-md text-bold"
          color="dark"
          unelevated
          text-color="white"
          :disable="!versionInput.trim()"
          @click="onSave"
        />
      </template>
    </BasicConfirm>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import BasicConfirm from '@/components/modal/BasicConfirm.vue'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import { appVersionApi } from '@/service/bo/appVersion'

const emitter = inject('emitter')
const $q = useQuasar()

/** 백엔드가 { id, version } 단건만 관리 — 목록/플랫폼 구분 없음 */
const current = ref(null)

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const fetchCurrent = async () => {
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    current.value = await appVersionApi.getCurrent()
  } catch {
    current.value = null
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

const showForm = ref(false)
const isEdit = ref(false)
const versionInput = ref('')

const openCreate = () => {
  isEdit.value = false
  versionInput.value = ''
  showForm.value = true
}
const openEdit = () => {
  isEdit.value = true
  versionInput.value = current.value?.version ?? ''
  showForm.value = true
}

const onSave = async () => {
  const version = versionInput.value.trim()
  if (!version) return
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (isEdit.value && current.value) {
      await appVersionApi.modify({ id: current.value.id, version })
    } else {
      await appVersionApi.save({ version })
    }
    showForm.value = false
    await fetchCurrent()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  fetchCurrent()
})
</script>

<style scoped>
.field-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.35rem;
}
.info-banner {
  background: #ede7f6;
  border: 1px solid #d1c4e9;
  border-radius: 6px;
  color: #4527a0;
  font-size: 0.82rem;
  line-height: 1.4;
  padding: 0.6rem 0.85rem;
  max-width: 480px;
}
</style>
