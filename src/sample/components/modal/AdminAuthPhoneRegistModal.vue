<template>
  <BasicConfirm
    v-model:show="showModal"
    :close-label="closeLabel"
    :style="style"
    :title="title"
    style="min-width: 80vw; max-width: 80vw"
  >
    <template #content>
      <div class="row justify-end q-mb-md">
        <q-btn color="primary" label="추가" @click="addRow" />
      </div>

      <q-table
            ref="tableRef"
            :columns="tableHeaders"
            :rows="rows"
            row-key="id"
            flat
            hide-pagination
            hide-no-data
            :key="tableRenderKey"
            separator="cell"
            :virtual-scroll="false"
            :rows-per-page-options="[0]"
            style="max-height: 50vh; height: 50vh"
          >
            <template v-slot:header="props">
              <q-tr>
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :style="getColumnWidth(col.name)"
                  :class="{
                'text-left': col.align === 'left',
                'text-center': col.align === 'center',
                'text-right': col.align === 'right'
              }"
                >
                  {{ col.label }}
                </q-th>
          </q-tr>
        </template>

        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td class="text-center">
              {{ props.rowIndex + 1 }}
            </q-td>
            <q-td>
              <q-input
                dense
                outlined
                v-model="props.row.name"
                placeholder="이름"
                class="full-width"
              />
            </q-td>
            <q-td>
              <div class="row items-center q-gutter-xs">
                <q-input
                  dense
                  outlined
                  v-model="props.row.phone"
                  placeholder="전화번호"
                  class="col"
                />
                <q-btn
                  dense
                  round
                  color="negative"
                  icon="remove"
                  @click="removeRow(props.row)"
                  flat
                  size="sm"
                />
              </div>
            </q-td>
          </q-tr>
        </template>
      </q-table>
    </template>

    <template #button>
      <q-btn label="저장" class="modal-btn-md" color="primary" @click="onSave" />
    </template>
  </BasicConfirm>
  <RegistToast
    v-if="showToast"
    :message="toastMessage"
    :status="toastStatus"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script setup>
import {ref, watch} from 'vue'
import BasicConfirm from './BasicConfirm.vue'
import RegistToast from "@/components/dialog/RegistToast.vue";

const tableRef = ref(null)
const showModal = defineModel('show', {
  type: Boolean,
  default: () => false,
  required: true
})

const props = defineProps({
  adminId: {
    type: String,
    required: true
  }
})
const closeLabel = ref('닫기')
const style = {}
const title = ref('관리자 전화번호 등록')
const emit = defineEmits(['hide', 'update:show'])

const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')

const tableHeaders = [
  { name: 'rowIndex', label: '번호', field: 'rowIndex', align: 'center', style: 'width: 8%;' },
  { name: 'name', label: '이름', field: 'name', align: 'center', style: 'width: 46%;' },
  { name: 'phone', label: '전화번호', field: 'phone', align: 'center', style: 'width: 46%;' }
]

const getColumnWidth = (name) => {
  const column = tableHeaders.find(h => h.name === name)
  return column ? column.style : ''
}

const rows = ref([])
const deletedRows = ref([])
const MAX_ROWS = 10
const tableRenderKey = ref(0)

watch(showModal, async(val) => {
  if (val) {
   await onRequest()
  }
})

watch(() => props.adminId, async (newId) => {
  if (showModal.value) {
    await onRequest()
  }
})

const onRequest = async () => {
  const res = await authApi.getAdminAuthPhone({adminId: props.adminId})
  // 서버에서 받은 데이터에 id 필드가 없으면 id 부여 (식별용)
  const data = Array.isArray(res.data) ? res.data : []
  rows.value = data.map(item => ({
    id: item.aapSeq || `temp_${Date.now()}_${Math.random()}`,
    aapSeq: item.aapSeq || '',
    name: item.name || '',
    phone: item.phone || ''
  }))
  tableRenderKey.value++
}

const openModal = () => {
  showModal.value = true
  onRequest()
}
defineExpose({ openModal })

function validateRows() {
  const seenPhones = new Set()
  for (const [index, row] of rows.value.entries()) {
    const name = row.name?.trim() || ''
    const phone = row.phone?.trim() || ''

    if (name.length < 2 || name.length > 5) {
      alert(`${index + 1}번 행: 이름은 2글자 이상 5글자 이하로 입력해주세요.`)
      return false
    }

    if (!/^\d{10,11}$/.test(phone)) {
      alert(`${index + 1}번 행: 전화번호는 숫자만 10~11자리로 입력해주세요.`)
      return false
    }

    if (seenPhones.has(phone)) {
      alert(`${index + 1}번 행: 전화번호가 중복되었습니다.`)
      return false
    }
    seenPhones.add(phone)
  }

  return true
}

function addRow() {
  if (rows.value.length >= MAX_ROWS) {
    alert(`최대 ${MAX_ROWS}개까지만 등록할 수 있습니다.`)
    return
  }

  const newRow = {
    id: `temp_${Date.now()}_${Math.random()}`,
    aapSeq: '',
    name: '',
    phone: ''
  }

  rows.value.push(newRow)
  tableRenderKey.value++
}

function removeRow(rowItem) {
  if (rowItem.aapSeq ) {
    deletedRows.value.push(rowItem)
  }
  rows.value = rows.value.filter(r => r.id !== rowItem.id)
  tableRenderKey.value++
}

async function onSave() {
  if (!validateRows()) return
  if (deletedRows.value.length > 0) {
    try {
      const deleteIds = deletedRows.value.map(item => item.aapSeq)
      await authApi.deleteAdminAuthPhone(deleteIds)
      deletedRows.value = []
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
      return
    }
  }

  // 추가 및 수정 데이터 처리
  try {
    const upsertPayload = rows.value.map(row => ({
      aapSeq: String(row.aapSeq)?.trim(),
      name: row.name?.trim(),
      phone: String(row.phone)?.trim()
    }))

    await authApi.regAdminAuthPhone(props.adminId, upsertPayload)

    toastMessage.value = '수정되었습니다.'
    toastStatus.value = 'success'
    showToast.value = true

    await onRequest()
  } catch (error) {
    console.log("에러가 발생하였습니다.")
  }

  await onRequest()
    // hideModal()
  }


function hideModal() {
  showModal.value = false
  emit('hide')
}

</script>
