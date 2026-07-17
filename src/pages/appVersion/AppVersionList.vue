<template>
  <div class="q-pa-lg">
    <div class="text-h5 text-bold q-mb-md">앱 버전 관리</div>

    <!-- 백엔드는 플랫폼 구분 없이 "현재 앱 버전 문자열 1개"만 관리함 -->
    <q-card flat bordered class="q-pa-md">
      <div class="row items-center justify-between">
        <div>
          <div class="text-caption text-grey-7">실제 서버에 등록된 앱 버전</div>
          <div v-if="!editingServerVersion" class="text-h6 text-bold">
            {{ serverVersion?.version ?? '-' }}
            <span v-if="serverVersion?.id" class="text-caption text-grey-6">(#{{ serverVersion.id }})</span>
          </div>
          <q-input
            v-else
            v-model="serverVersionInput"
            dense
            outlined
            placeholder="예: 2.1.0"
            style="width: 200px"
            class="q-mt-xs"
          />
        </div>
        <div>
          <template v-if="editingServerVersion">
            <q-btn label="취소" color="grey-7" outline dense class="q-mr-sm" @click="editingServerVersion = false" />
            <q-btn
              label="저장"
              color="dark"
              unelevated
              text-color="white"
              dense
              :disable="!serverVersionInput.trim()"
              @click="onSaveServerVersion"
            />
          </template>
          <q-btn v-else label="수정" color="primary" outline dense @click="openEditServerVersion" />
        </div>
      </div>
      <div class="text-caption text-grey-6 q-mt-sm">
        백엔드에 플랫폼 구분·강제/선택 업데이트·최소 지원 버전 등의 필드가 없어 버전 문자열만 연동됩니다.
      </div>
    </q-card>
  </div>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import COMMON from '@/constants/commonConstatns'
import AlarmDialog from '@/components/dialog/AlarmDialog.vue'
import { appVersionApi } from '@/service/bo/appVersion'

const emitter = inject('emitter')
const $q = useQuasar()

const showError = (e) => {
  const message = e?.error?.message || e?.message || '처리 중 오류가 발생했습니다.'
  $q.dialog({ component: AlarmDialog, componentProps: { title: '오류', message } })
}

const serverVersion = ref(null)
const editingServerVersion = ref(false)
const serverVersionInput = ref('')

const loadServerVersion = async () => {
  try {
    serverVersion.value = await appVersionApi.getCurrent()
  } catch (e) {
    showError(e)
  }
}

const openEditServerVersion = () => {
  serverVersionInput.value = serverVersion.value?.version ?? ''
  editingServerVersion.value = true
}

const onSaveServerVersion = async () => {
  const version = serverVersionInput.value.trim()
  if (!version) return
  emitter.emit(COMMON.LOADING.SHOW)
  try {
    if (serverVersion.value?.id) await appVersionApi.modify({ id: serverVersion.value.id, version })
    else await appVersionApi.save({ version })
    editingServerVersion.value = false
    await loadServerVersion()
  } catch (e) {
    showError(e)
  } finally {
    emitter.emit(COMMON.LOADING.HIDE)
  }
}

onMounted(() => {
  emitter.emit(COMMON.LOADING.HIDE)
  loadServerVersion()
})
</script>
