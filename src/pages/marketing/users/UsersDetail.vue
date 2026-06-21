<template>
  <div class="q-pa-md">
    <div class="form">
      <div class="row">
        <div class="col-1 form-th required">구분</div>
        <div class="col-11 form-td">
          <div class="q-mr-md">
            <q-radio
              v-model="dataModel.type"
              val="정상회원"
              :label="`정상회원${computeNormalUser}`"
              disable
            ></q-radio>
            <q-radio
              v-model="dataModel.type"
              val="탈퇴회원"
              :label="`탈퇴회원${computeWithdrawUser}`"
              disable
            ></q-radio>
          </div>
          <q-btn
            label="회원 탈퇴"
            outline
            unelevated
            :disable="dataModel.type === '탈퇴회원'"
            @click="onUserWithdraw"
          />
          <div class="col-auto form-td q-ml-xl">
            <span>* 회원탈퇴 전 해당 회원의 모든 기기에서 로그아웃이 필요합니다.</span>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-1 form-th required">닉네임</div>
        <div class="col-11 form-td" style="gap: 1rem">
          <div class="col-5 form-td">
            <q-input
              v-model="dataModel.nickName"
              class="full-width"
              outlined
              center
              dense
              @update:model-value="() => (canChange = false)"
              :disable="dataModel.type === '탈퇴회원'"
            />
          </div>
          <div class="col-1 form-td">
            <q-btn
              label="중복확인"
              outline
              unelevated
              @click="checkDuplicated"
              :disable="dataModel.type === '탈퇴회원'"
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">아이디</div>
        <div class="col">
          <div class="row flex-center" v-for:="(id, index) in dataModel.channelIdList" :key="index">
            <q-badge
              class="col-1 text-bold id-badge"
              style="/* black border around the text */"
              :label="id.snsType"
              :color="getBadgeColor(id.snsType)"
              :text-color="id.snsType === 'KAKAO' ? 'black' : 'white'"
            />
            <div class="col form-td q-pl-md">{{ id.snsEmail ?? '-' }}</div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">이름</div>
        <div class="col-11 form-td">{{ dataModel.name ?? '-' }}</div>
      </div>
      <div class="row">
        <div class="col-1 form-th">휴대폰번호</div>
        <div class="col-11 form-td">
          {{
            dataModel.phoneNumber !== null
              ? dataModel.phoneNumber.replace(REGEX.PHONE_NUM, '$1-$2-$3')
              : '-'
          }}
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">프로모션 활용동의</div>
        <div class="col-11 form-td">
          <q-radio
            v-model="dataModel.marketingAgreeYn"
            val="Y"
            :label="`동의${computeMarketingAgree}`"
            disable
          ></q-radio>
          <q-radio
            v-model="dataModel.marketingAgreeYn"
            val="N"
            :label="`미동의${computeMarketingDisagree}`"
            disable
          ></q-radio>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th">14세 미만</div>
        <div class="col-11 form-td">{{ computeDeputyCertYn }}</div>
      </div>
      <div class="row">
        <div class="col-1 form-th">당월 생일여부</div>
        <div class="col-11 form-td">{{ dataModel.thisMonthBirthYn }}</div>
      </div>
      <div class="row">
        <div class="col-1 form-th">방문 횟수</div>
        <div class="col-2 form-td">
          <q-select
            v-model="visitYear"
            :options="yearList"
            class="full-width"
            hide-bottom-space
            outlined
            dense
            @update:model-value="onRequestVisitCount"
          />
        </div>
        <div class="col-4 form-td">
          : {{ dataModel.visitCount ? `${dataModel.visitCount}회` : '방문기록 없음' }}
        </div>
      </div>

      <div class="row">
        <div class="col-1 form-th">직원 여부</div>
        <div class="col-11 form-td">
          <div class="q-mr-md">
            <q-radio
              v-model="dataModel.staffYn"
              val="Y"
              :label="`예`"
            ></q-radio>
            <q-radio
              v-model="dataModel.staffYn"
              val="N"
              :label="`아니오`"
            ></q-radio>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-1 form-th">관리메모</div>
        <div class="col-11 form-td">
          <q-input
            v-model="dataModel.adminMemo"
            class="full-width"
            outlined
            center
            type="textarea"
            counter
            maxlength="300"
            @blur="dataModel.adminMemo = dataModel.adminMemo.trim()"
          />
        </div>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <q-btn label="목록" @click="() => goList()" />
      <q-btn style="background-color: #169bd5; color: white" label="수정" @click="onRegist" />
    </div>
  </div>
  <RegistToast
    v-if="showToast"
    message="수정이 완료되었습니다!"
    :duration="3000"
    @hidden="
      () => {
        showToast = false
      }
    "
  />
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, nextTick, onBeforeMount, onMounted, ref } from 'vue'
import { marketingApi } from '@/service/api'
import DateUtils from '@/utils/DateUtils'
import { REGEX } from '@/constants/regualExpression'
import RegistToast from '@/components/dialog/RegistToast.vue'
import { previousQueryUrl } from '@/router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const route = useRoute()

const userId = ref(null)
const id = ref(null)
const withdrawYn = ref(null)
const canChange = ref(true)
const showToast = ref(false)
const authStore = useAuthStore()

const dataModel = ref({
  type: null,
  createdAt: null,
  nickName: null,
  channelIdList: null,
  name: null,
  phoneNumber: null,
  marketingAgreeYn: null,
  marketingAgreeYnCreatedAt: null,
  deputyCertYn: null,
  adminMemo: null,
  visitCount: null,
  thisMonthBirthYn: null,
  staffYn: null
})

const visitYear = ref({})
const yearList = ref([])

const updateDataModel = ref({
  nickName: null,
  marketingAgreeYn: null,
  adminMemo: null,
  staffYn: null
})

const computeNormalUser = computed({
  get: () =>
    dataModel.value.type === '정상회원'
      ? dataModel.value.createdAt
        ? `(${dataModel.value.createdAt})`
        : ''
      : ''
})
const computeWithdrawUser = computed({
  get: () =>
    dataModel.value.type === '탈퇴회원'
      ? dataModel.value.withdrawAt
        ? `(${dataModel.value.withdrawAt})`
        : ''
      : ''
})

const computeMarketingAgree = computed({
  get: () =>
    dataModel.value.marketingAgreeYn === 'Y'
      ? `(${dataModel.value.marketingAgreeYnCreatedAt})`
      : '',
  set: () => {
    dataModel.value.marketingAgreeYnCreatedAt = DateUtils.convertStandardDate(new Date())
  }
})
const computeMarketingDisagree = computed({
  get: () => (dataModel.value.marketingAgreeYn === 'N' ? `` : ''),
  set: () => {
    dataModel.value.marketingAgreeYnCreatedAt = null
  }
})
const computeDeputyCertYn = computed({
  get: () =>
    dataModel.value.deputyCertYn === 'Y'
      ? `보호자 동의(${dataModel.value.createdAt})`
      : '해당사항 없음'
})
const computeStaffYn = computed({
  get() {
    return dataModel.value.staffYn
  },
  set(value) {
    dataModel.value.staffYn = value
  }
})

const getBadgeColor = (snsType) => {
  console.log(snsType)
  const colors = {
    GOOGLE: 'blue',
    KAKAO: 'yellow',
    NAVER: 'green',
    APPLE: 'grey'
  }
  return colors[snsType.toUpperCase()] || 'primary' // 기본값
}

const goList = () => {
  router.push(previousQueryUrl.value ?? { name: 'UsersList' })
}

onBeforeMount(async () => {
  userId.value = new URLSearchParams(window.location.search).get('userId')
  withdrawYn.value = new URLSearchParams(window.location.search).get('withdrawYn')
  await yearSetting()
  await onRequestUserInfo()
  await onRequestVisitCount()
})

onMounted(async () => {
  await yearSetting()
  await nextTick(async () => {
    await onRequestUserInfo()
    await onRequestVisitCount()
  })
})

const yearSetting = async () => {
  yearList.value = Array(4)
    .fill(new Date().getFullYear())
    .map((year, i) => ({
      label: `${year - i}년`,
      value: `${year - i}`
    }))

  visitYear.value = yearList.value[0]
}

const onRequestVisitCount = async () => {
  const response = await marketingApi
    .getMemberYearVisitInfo(userId.value, id.value, {
      year: visitYear.value.value
    })
    .then((res) => res.data)

  dataModel.value.visitCount = response
}

const onRequestUserInfo = async () => {
  const userResponse = await marketingApi
    .getMemberInfoGet(userId.value,
      {
        withdrawYn: withdrawYn.value,
        maskingRemovalYn: authStore.isMasking()
      })
    .then((res) => res.data)

  dataModel.value = JSON.parse(JSON.stringify(userResponse))
}

const checkDuplicated = async () => {
  const response = await marketingApi
    .getMemberNicknameDupCheck(dataModel.value.nickName)
    .then((res) => res.data)

  response ? alert('사용 가능합니다.') : alert('이미 존재하는 닉네임입니다.')

  if (!response) canChange.value = false
  else canChange.value = true
}

const onRegist = async () => {
  if (!canChange.value) {
    alert('닉네임 중복검사를 해주세요.')
    return
  }

  Object.keys(updateDataModel.value).forEach((key) => {
    if (dataModel.value.hasOwnProperty(key)) {
      updateDataModel.value[key] = dataModel.value[key]
    }
  })

  await marketingApi.updateMemberInfo(userId.value, updateDataModel.value).then((res) => res.data)

  await onRequestUserInfo()

  showToast.value = true
}

const onUserWithdraw = async () => {
  const check = confirm('해당 회원을 탈퇴하시겠습니까?')

  if (check) {
    await marketingApi.withdrawUser(userId.value)
      .then(() => {
        alert('탈퇴가 완료되었습니다!')
        router.replace(previousQueryUrl.value ?? { name: 'UsersList' })
      })
      .catch((err) => {
        alert(err.message)
      })
  }
}
</script>

<style scoped>
.id-badge {
  min-width: 4rem;
  min-height: 2rem;
  text-shadow: 0.5px 0.5px 0 gray,
  -0.5px -0.5px 0 gray,
  0.5px -0.5px 0 gray,
  -0.5px 0.5px 0 gray;
  border: 0.5px solid rgb(207, 201, 201);
}
</style>
