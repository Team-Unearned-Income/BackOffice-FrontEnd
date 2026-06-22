<template>
  <div class="q-pa-md">
    <div class="form">
      <div class="row">
        <div class="col-1 form-th" style="background-color: #d6d6d6">
          <span>현재 비밀번호</span>
        </div>
        <div class="col-5 form-td">
          <q-input
            class="full-width"
            v-model="dataModel.nowPassword"
            :type="'password'"
            outlined
            center
            dense
            placeholder="현재 비밀번호"
            autocomplete="new-password"
          ></q-input>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th" style="background-color: #d6d6d6">
          <span>새 비밀번호</span>
        </div>
        <div class="col-5 form-td">
          <q-input
            class="full-width"
            v-model="dataModel.newPassword"
            :type="seePwd ? 'password' : 'text'"
            outlined
            center
            dense
            placeholder="새 비밀번호"
            :rules="[isValidPw]"
            autocomplete="new-password"
          >
            <template v-slot:append>
              <q-icon
                :name="seePwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="seePwd = !seePwd"
              />
            </template>
          </q-input>
        </div>
      </div>
      <div class="row">
        <div class="col-1 form-th" style="background-color: #d6d6d6">
          <span>새 비밀번호 확인</span>
        </div>
        <div class="col-5 form-td">
          <q-input
            class="full-width"
            v-model="dataModel.newPasswordConfirm"
            :type="seePwdCheck ? 'password' : 'text'"
            outlined
            center
            dense
            placeholder="비밀번호 확인"
            :rules="[pwCheckCorrect]"
          >
            <template v-slot:append>
              <q-icon
                :name="seePwdCheck ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="seePwdCheck = !seePwdCheck"
              />
            </template>
          </q-input>
        </div>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <p>
        • 영문 대/소문자 + 숫자+특수문자 중 3가지 조합, 8자리 이상 입력하여야 합니다.<br />• 나란히
        있는 숫자(3자리 이상)는 사용할 수 없습니다. (예: 123)
      </p>
      <div>
        <q-btn label="비밀번호 변경" @click="onRegist" />
      </div>
    </div>
  </div>
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
import { ref, onBeforeMount, onMounted } from 'vue'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)

const toastMessage = ref(null)
const toastStatus = ref('success')

const seePwd = ref(true)
const seePwdCheck = ref(true)

const dataModel = ref({
  nowPassword: null,
  newPassword: null,
  newPasswordConfirm: null
})

onBeforeMount(async () => {})

onMounted(async () => {})

const onRegist = async () => {
  console.log(typeof isValidPw(dataModel.value.newPassword))
  if (typeof isValidPw(dataModel.value.newPassword) === 'string' || !dataModel.value.newPassword) {
    alert('비밀번호 형식이 올바르지 않습니다.')
    return
  }

  if (typeof pwCheckCorrect(dataModel.value.newPasswordConfirm) === 'string') {
    alert('비밀번호 확인이 일치하지 않습니다.')
    return
  }

  await sitemanagementApi
    .updateAdminPassword({
      nowPassword: dataModel.value.nowPassword,
      newPassword: dataModel.value.newPassword,
      newPasswordConfirm: dataModel.value.newPasswordConfirm
    })
    .then((res) => {
      if (res.success) {
        toastMessage.value = '비밀번호가 변경되었습니다.'
        toastStatus.value = 'success'
        showToast.value = true

        dataModel.value = {
          nowPassword: null,
          newPassword: null,
          newPasswordConfirm: null
        }
      }
    })
    .catch((err) => {
      toastMessage.value = err.message
      toastStatus.value = 'failed'
      showToast.value = true
    })
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
  if (dataModel.value.newPassword !== pwCheck) return '비밀번호와 일치해야 합니다.'
  else return true
}
</script>
<style lang="scss" scoped>
p {
  color: gray;
}
</style>
