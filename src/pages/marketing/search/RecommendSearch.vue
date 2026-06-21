<template>
  <div class="q-pa-md">
    <div class="form">
      <div class="row">
        <div class="col-1 form-th" style="background-color: #d6d6d6">
          <span>키워드 설정</span>
        </div>
        <div class="col-11 form-td" style="display: flex; flex-direction: column; align-items: end">
          <q-input
            class="full-width"
            v-model="keywordRef.searchKeyword"
            placeholder="띄어쓰기 없이 입력해주세요."
            outlined
            center
            dense
          />
          <span style="color: gray">※ 띄어쓰기 없이 콤마로 구분하여 입력해주세요.</span>
        </div>
      </div>
    </div>
    <!-- 상세 하단 버튼 -->
    <div class="row justify-between q-pt-lg">
      <span style="color: gray">※ 수정/추가 후 등록 버튼을 클릭하여야 정상 저장됩니다.</span>
      <div>
        <q-btn label="등록" @click="onRegist" />
      </div>
    </div>
  </div>
  <RegistToast
    v-if="showToast"
    message="등록이 완료되었습니다!"
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
import { searchApi } from '@/service/api'
import RegistToast from '@/components/dialog/RegistToast.vue'

const showToast = ref(false)
const keywordRef = ref({
  searchKeyword: ''
})

onBeforeMount(async () => {
  await keywordSetting()
})

onMounted(async () => {})

const keywordSetting = async () => {
  const keywordList = await searchApi.recommendSearchFind().then((res) => res.data)
  keywordRef.value.searchKeyword = keywordList.join(',')
}

const onRegist = async () => {
  const keywordList = keywordRef.value.searchKeyword.split(',')
  if (keywordList.length > 10) {
    alert('추천 검색어는 10개까지만 가능합니다.')
    return
  }
  keywordRef.value.searchKeyword = keywordList.map((keyword) => keyword.trim()).join(',')
  console.log(keywordRef.value)
  await searchApi.recommendSearchSave(keywordRef.value)
  showToast.value = true
}
</script>
<style lang="scss" scoped>
p {
  color: gray;
}
</style>
