<template>
  <div class="q-pa-md">
    <p v-if="!!adminSeq" class="text-negative text-bold">
      • 마스터 권한이 아닌 경우, 본인의 계정만 수정 가능합니다.
    </p>
    <div class="form">
      <div class="row">
        <div class="col-1 form-th">사용여부</div>
        <div class="col-11 form-td">
          <q-radio
            v-model="dataModel.adminStatus"
            val="DISUSE"
            label="미사용"
            :disable="isReadonlyAll"
          ></q-radio>
          <q-radio
            v-model="dataModel.adminStatus"
            val="USE"
            label="사용"
            :disable="isReadonlyAll"
          ></q-radio>
          <q-checkbox
            v-model="computeSetDataYn"
            label="사용기간"
            size="sm"
            style="max-width: 120px; justify-self: flex-end"
            :disable="isReadonlyAll || dataModel.adminStatus === 'DISUSE'"
          />
          <DoubleDateInput v-model="useDate" :disable="!computeSetDataYn || isReadonlyAll" />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">소속</div>
        <div class="col-3 form-td">
          <q-select
            v-model="computeOrganization"
            :options="filterOptions.sosokList"
            class="full-width"
            dense
            outlined
            :readonly="isReadonlyAll"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">아이디</div>
        <div class="col-3 form-td">
          <q-input
            v-model="dataModel.adminId"
            class="full-width"
            outlined
            center
            dense
            placeholder="아이디"
            :readonly="!!adminSeq"
            @update:model-value="idOk = dataModel.adminId === originalDataModel.adminId"
          />
          <q-tooltip v-if="!!adminSeq"> 아이디는 변경이 불가합니다.</q-tooltip>
        </div>
        <div class="col-1 form-td">
          <q-btn
            class="full-width"
            outline
            center
            unelevated
            label="중복확인"
            :disable="idOk"
            @click="isValidId"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">이름</div>
        <div class="col-3 form-td">
          <q-input
            v-model="dataModel.name"
            class="full-width"
            autocomplete="off"
            outlined
            center
            dense
            placeholder="이름"
            :readonly="isReadonlyAll"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">비밀번호</div>
        <div class="row col-10" style="gap: 0.5rem">
          <div class="col-4 form-td">
            <q-input
              v-model="dataModel.pw"
              class="full-width"
              :type="isPwd ? 'password' : 'text'"
              outlined
              center
              dense
              placeholder="비밀번호"
              :rules="[isValidPw]"
              autocomplete="new-password"
              :readonly="isReadonlyAll"
            >
              <template #append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </div>
          <div class="col-4 form-td">
            <q-input
              v-model="dataModel.pwCheck"
              class="full-width"
              :type="seePwdCheck ? 'password' : 'text'"
              outlined
              center
              dense
              placeholder="비밀번호 확인"
              :rules="[pwCheckCorrect]"
              :readonly="isReadonlyAll"
            >
              <template #append>
                <q-icon
                  :name="seePwdCheck ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="seePwdCheck = !seePwdCheck"
                />
              </template>
            </q-input>
          </div>
          <p>
            • 영문 대/소문자 + 숫자+특수문자 중 3가지 조합, 8자리 이상 입력하여야 합니다.<br />•
            나란히 있는 숫자(3자리 이상)는 사용할 수 없습니다. (예: 123)
          </p>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">연락처</div>
        <div class="col-3 form-td">
          <q-input
            v-model="dataModel.phone"
            class="full-width"
            type="tel"
            outlined
            center
            dense
            placeholder="연락처"
            :readonly="isReadonlyAll"
            @update:model-value="formatPhoneNumber"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">이메일</div>
        <div class="col-3 form-td">
          <q-input
            v-model="dataModel.email"
            class="full-width"
            type="email"
            outlined
            center
            dense
            placeholder="이메일"
            :rules="[isValidEmail]"
            :readonly="isReadonlyAll"
          />
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">로그인 실패 수</div>
        <div class="row col-10 justify-between">
          <div class="col-3 form-td">{{ dataModel.loginFailCnt }}회</div>
          <div>
            <q-btn
              label="로그인 실패 수 초기화"
              unelevated
              outline
              dense
              :disable="!isSuperAdmin || !adminSeq"
              @click="handleLoginFailCnt"
            />
            <q-tooltip v-if="!isSuperAdmin"> 마스터 관리자만 초기화 가능합니다.</q-tooltip>
            <q-tooltip v-if="!adminSeq">최초 등록 완료 후, 사용 가능합니다.</q-tooltip>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">관리자 인증 전화번호</div>
        <div class="row col-10">
          <div>
            <p class="text-negative text-bold">* 개인정보 마스킹 해제 열람 필요 시, 등록 필수</p>
            <q-btn
              label="관리자 인증 전화번호 관리"
              unelevated
              outline
              dense
              :disable="!isSuperAdmin || !adminSeq"
              @click="adminPhoneShowModal = true"
            />
            <q-tooltip v-if="!isSuperAdmin"> 마스터 관리자만 수정 가능합니다.</q-tooltip>
            <q-tooltip v-if="!adminSeq">
              관리자 기본 정보 먼저 등록 완료 후, 추가 가능합니다.
            </q-tooltip>
          </div>
        </div>
      </div>
    </div>

    <!-- 관리 메뉴 지정 테이블 : only for Super Admin-->
    <br /><br /><br />
    <div v-if="true">
      <div class="form-th row justify-between">
        <div class="text-h5 text-bold">관리 메뉴 지정</div>
        <div>
          <q-checkbox
            v-model="computeAllCheck"
            size="sm"
            :label="'전체선택'"
            :disable="!isSuperAdmin"
          />
          <q-tooltip v-if="!isSuperAdmin"> 마스터 관리자만 수정 가능합니다.</q-tooltip>
        </div>
      </div>
      <div class="form">
        <q-table
          :columns="tableHeaders"
          :rows="filterOptions.adminMenuList"
          flat
          hide-no-data
          hide-pagination
          :rows-per-page-options="[0]"
          separator="cell"
        >
          <template #body="props">
            <q-tr>
              <q-td class="text-center">
                {{ props.row.menuName }}
              </q-td>
              <q-td style="padding: 0; width: 80%">
                <q-table
                  table-style="border-radius: 0; border: 0"
                  hide-header
                  :rows="props.row.childrenList"
                  hide-pagination
                  :rows-per-page-options="[0]"
                >
                  <template #body="childProps">
                    <q-tr>
                      <q-td>
                        <q-checkbox
                          size="sm"
                          :label="childProps.row.menuName"
                          :model-value="isChecked(childProps.row.adminMenuSeq)"
                          :disable="!isSuperAdmin"
                          @update:model-value="
                            (checked) => toggleUseYn(childProps.row.adminMenuSeq, checked)
                          "
                        />
                        <q-tooltip v-if="!isSuperAdmin">
                          마스터 관리자만 수정 가능합니다.
                        </q-tooltip>
                      </q-td>
                    </q-tr>
                  </template>
                </q-table>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <div style="display: flex; gap: 1rem">
        <div>
          <q-btn label="목록" @click="router.push(previousQueryUrl ?? { name: 'AdminsList' })" />
        </div>
        <div>
          <q-btn
            label="삭제"
            :disable="!adminSeq || !isSuperAdmin"
            :readonly="!adminSeq || !isSuperAdmin"
            @click="onDelete"
          />
          <q-tooltip v-if="!isSuperAdmin"> 마스터 관리자만 삭제 가능합니다.</q-tooltip>
        </div>
      </div>
      <div>
        <q-btn
          style="background-color: #169bd5; color: white"
          label="등록"
          :disable="isReadonlyAll"
          :readonly="isReadonlyAll"
          @click="onRegist"
        />
        <q-tooltip v-if="isReadonlyAll"> 본인 혹은 마스터 관리자만 수정 가능합니다.</q-tooltip>
      </div>
    </div>
  </div>

  <AdminPhoneRegist v-model:show="adminPhoneShowModal" :admin-id="dataModel.adminId" />
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
import { useRouter } from 'vue-router'
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import FilterUtils from '@/utils/FilterUtils.js'
import DoubleDateInput from '@/components/input/DoubleDateInput.vue'
import RegistToast from '@/components/dialog/RegistToast.vue'
import AdminPhoneRegist from '@/components/modal/AdminAuthPhoneRegistModal.vue'
import { previousQueryUrl } from '@/router'
import { cloneDeep } from 'lodash-es'
import { useUserStore } from '@/stores/user.js'

const router = useRouter()

const userStore = useUserStore()
const curAdminId = ref(null)
const adminSeq = ref(null)
const isSuperAdmin = ref(false)
const isPwd = ref(true)
const seePwdCheck = ref(true)
const showToast = ref(false)
const toastMessage = ref(null)
const toastStatus = ref('success')
const adminPhoneShowModal = ref(false)
const idOk = ref(true)
const adminButton = ref(false)

const tableBtnHeaders = ref([
  {
    name: 'adminMenu',
    label: '메뉴',
    field: 'adminMenu',
    align: 'center'
  },
  {
    name: 'childrenMenu',
    label: '권한여부',
    field: 'childrenMenu',
    align: 'center'
  }
])

const tableAdmPhoneHeaders = ref([
  {
    name: 'name',
    label: '이름',
    field: 'name',
    align: 'center'
  },
  {
    name: 'phone',
    label: '전화번호',
    field: 'phone',
    align: 'center'
  }
])

const tableHeaders = ref([
  {
    name: 'adminMenu',
    label: 'Depth1',
    field: 'adminMenu',
    align: 'center'
  },
  {
    name: 'childrenMenu',
    label: 'Depth2',
    field: 'childrenMenu',
    align: 'center'
  }
])

const filterOptions = ref({
  sosokList: [],
  adminMenuList: []
})

const adminFilter = ref({
  organization: {}
})

const originalDataModel = ref({})

const dataModel = ref({
  adminStatus: null,
  setDateYn: 'N',
  masterYn: 'N',
  useStartDate: null,
  useEndDate: null,
  organization: 'NONE',
  organizationName: '선택하세요',
  adminId: null,
  name: null,
  pw: null,
  pwCheck: null,
  phone: null,
  email: null,
  loginFailCnt: 0,
  adminAuthMenuList: []
})

const useDate = ref({
  from: null,
  to: null
})

const allCheck = ref(false)

const isReadonlyAll = computed(() => {
  // 신규 등록(URL의 adminSeq가 null)인 경우 전체 수정 가능
  if (!adminSeq.value) {
    return false
  }

  // 마스터 관리자는 항상 false (수정 제한 없음)
  if (isSuperAdmin.value) return false

  // 아직 adminId 정보가 로드되지 않았으면 제한하지 않음
  if (!dataModel.value.adminId || !curAdminId.value) return false

  // 현재 조회 중인 adminId과 로그인한 adminId가 다르면 수정 제한
  return dataModel.value.adminId !== curAdminId.value
})

const computeSetDataYn = computed({
  get: () =>
    dataModel.value.setDateYn !== null ? (dataModel.value.setDateYn === 'Y' ? true : false) : false,
  set: (value) => {
    dataModel.value.setDateYn = value ? 'Y' : 'N'
  }
})

const computeAllCheck = computed({
  get: () => allCheck.value,
  set: (value) => {
    allCheck.value = value
    dataModel.value.adminAuthMenuList.forEach((item, idx) => {
      dataModel.value.adminAuthMenuList[idx].useYn = value ? 'Y' : 'N'
    })
  }
})

const computeOrganization = computed({
  get: () => dataModel.value.organizationName,
  set: (value) => {
    dataModel.value.organization = value.value
    dataModel.value.organizationName = value.label
  }
})

const isChecked = (menuSeq) => {
  const menu = dataModel.value.adminAuthMenuList.find((item) => item.adminMenuSeq === menuSeq)
  return menu?.useYn === 'Y'
}

// 체크박스 상태 변경 핸들러
const toggleUseYn = (menuSeq, checked) => {
  const menu = dataModel.value.adminAuthMenuList.find((item) => item.adminMenuSeq === menuSeq)
  if (menu) menu.useYn = checked ? 'Y' : 'N'
}

onBeforeMount(async () => {
  adminSeq.value = new URLSearchParams(window.location.search).get('adminSeq')
})

onMounted(async () => {
  // 현재 로그인된 관리자 아이디
  curAdminId.value = userStore.adminId

  await filterSetting()
  await nextTick(async () => {
    await onRequest()
    menuSetting()
    isSuperAdmin.value = await authApi.checkSuperAdmin().then((res) => res.data)
  })
})

const filterSetting = async () => {
  const response = await authApi.getAuthCodeList().then((res) => {
    const apiData = res.data

    return apiData
  })

  filterOptions.value = FilterUtils.parseFilterArray(response)
  adminFilter.value.organization = filterOptions.value.sosokList[0]
}

const menuSetting = () => {
  const existingList = dataModel.value.adminAuthMenuList
  dataModel.value.adminAuthMenuList = []

  filterOptions.value.adminMenuList.forEach((adminMenu) => {
    const existingItem = existingList.find((item) => item.adminMenuSeq === adminMenu.adminMenuSeq)
    dataModel.value.adminAuthMenuList.push({
      adminMenuSeq: adminMenu.adminMenuSeq,
      useYn: existingItem ? existingItem.useYn : 'N'
    })
    adminMenu.childrenList.forEach((childMenu) => {
      const existingItem = existingList.find((item) => item.adminMenuSeq === childMenu.adminMenuSeq)

      dataModel.value.adminAuthMenuList.push({
        adminMenuSeq: childMenu.adminMenuSeq,
        useYn: existingItem ? existingItem.useYn : 'N'
      })
    })
  })
}

const parentMenuSetting = () => {
  filterOptions.value.adminMenuList.forEach((adminMenu) => {
    const parent = dataModel.value.adminAuthMenuList.find(
      (item) => item.adminMenuSeq === adminMenu.adminMenuSeq
    )
    adminMenu.childrenList.forEach((childMenu) => {
      const menu = dataModel.value.adminAuthMenuList.find(
        (item) => item.adminMenuSeq === childMenu.adminMenuSeq
      )
      if (menu.useYn === 'Y') {
        parent.useYn = 'Y'
      }
    })
  })
}

const onRequest = async () => {
  if (!adminSeq.value) {
    return
  }

  const mainVisualResponse = await authApi
    .getAdminAuthInfoGet(adminSeq.value)
    .then((res) => res.data)

  originalDataModel.value = JSON.parse(JSON.stringify(mainVisualResponse))

  dataModel.value = cloneDeep(originalDataModel.value)

  useDate.value.from = dataModel.value.useStartDate
  useDate.value.to = dataModel.value.useEndDate
}

const registAvail = () => {
  // 만약 신규 등록의 경우 조건 살짝 달라짐
  if (!adminSeq.value) {
    if (!dataModel.value.pw && !dataModel.value.adminId) return false
  }

  if (
    idOk.value &&
    typeof isValidPw(dataModel.value.pw) !== 'string' &&
    pwCheckCorrect(dataModel.value.pwCheck) &&
    typeof isValidEmail(dataModel.value.email) !== 'string' &&
    dataModel.value.organization !== 'NONE'
  )
    return true
  else {
    return false
  }
}

const onRegist = async () => {
  if (!registAvail()) {
    alert('잘못된 값이 있습니다. 다시 확인해주세요.')
    return
  }

  if (typeof pwCheckCorrect(dataModel.value.pwCheck) === 'string') {
    alert('비밀번호 확인이 일치하지 않습니다.')
    return
  }

  dataModel.value.useStartDate = useDate.value.from
  dataModel.value.useEndDate = useDate.value.to

  parentMenuSetting()

  if (adminSeq.value) {
    // 관리자관리 수정
    await authApi
      .updateAdminAuthInfo(adminSeq.value, dataModel.value)
      .then(() => {
        toastMessage.value = '수정되었습니다.'
        toastStatus.value = 'success'
        showToast.value = true

        setTimeout(() => {
          router.replace(previousQueryUrl.value ?? { name: 'AdminsList' })
        }, 1000)
      })
      .catch((err) => {
        toastMessage.value = err.message
        toastStatus.value = 'failed'
        showToast.value = true
      })
  } else {
    // 관리자관리 등록
    await authApi.regAdmin(dataModel.value).then((res) => {
      toastMessage.value = '등록되었습니다.'
      toastStatus.value = 'success'
      showToast.value = true

      setTimeout(() => {
        router.replace(previousQueryUrl.value ?? { name: 'AdminsList' })
      }, 1000)
    })
  }
}

const onDelete = async () => {
  const isDelete = confirm('정말 삭제하시겠습니까?')
  if (isDelete) {
    await authApi.deleteMainVisual1(adminSeq.value)
    alert('성공적으로 삭제되었습니다.')
    router.replace(previousQueryUrl.value ?? { name: 'AdminsList' })
  }
}

const isValidId = async () => {
  if (!dataModel.value.adminId || dataModel.value.adminId === '') {
    alert('아이디를 입력해주세요.')
    return
  }

  if (dataModel.value.adminId === originalDataModel.value.adminId) return

  // id 중복검사 API
  idOk.value = await authApi.checkAdminId(dataModel.value.adminId).then((res) => res.data)
  if (idOk.value) alert('사용 가능한 아이디입니다.')
  else alert('중복된 아이디입니다.')
}

const isValidPw = (pw) => {
  if (!pw) return true

  // 조건 1: 길이가 8자리 이상인지 확인
  if (pw.length < 8) return '비밀번호는 8자리 이상이어야 합니다.'

  // 조건 2: 영문 대문자, 소문자, 숫자, 특수문자 중 3가지 조합 확인
  const hasUpperCase = /[A-Z]/.test(pw)
  const hasLowerCase = /[a-z]/.test(pw)
  const hasNumber = /\d/.test(pw)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pw)

  const validCategoryCount = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(
    Boolean
  ).length
  if (validCategoryCount < 3)
    return '영문 대문자, 소문자, 숫자, 특수문자 중 3가지 이상 조합해야 합니다'

  // 조건 3: 나란히 있는 숫자 3자리 이상 확인
  if (/012|123|234|345|456|567|678|789|890/.test(pw))
    return '연속된 숫자는 3자리 이상 사용할 수 없습니다'

  return true
}

const pwCheckCorrect = (pwCheck) => {
  if (dataModel.value.pw !== pwCheck) return '비밀번호와 일치해야 합니다.'
  else return true
}

const formatPhoneNumber = () => {
  // 숫자만 남기기
  let rawValue = dataModel.value.phone.replace(/\D/g, '')

  // 형식에 맞게 변환
  if (rawValue.length <= 3) {
    dataModel.value.phone = rawValue // 3자리 이하 그대로
  } else if (rawValue.length <= 7) {
    dataModel.value.phone = rawValue.replace(/(\d{3})(\d{1,4})/, '$1-$2') // 000-0000
  } else {
    dataModel.value.phone = rawValue.replace(/(\d{3})(\d{4})(\d{1,4})/, '$1-$2-$3') // 000-0000-0000
  }
}

const isValidEmail = (email) => {
  // 이메일 형식 정규식
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailPattern.test(email)) return '이메일 형식이 올바르지 않습니다.'
  else return true
}

const handleLoginFailCnt = async () => {
  await authApi.updateLoginFailCountReset(adminSeq.value).then((res) => {
    if (res.success) {
      toastMessage.value = '로그인 실패 횟수를 초기화했습니다.'
      toastStatus.value = 'success'
      showToast.value = true

      dataModel.value.loginFailCnt = 0
    }
  })
}
</script>
<style lang="scss" scoped>
p {
  color: gray;
  margin: 0;
}
</style>
