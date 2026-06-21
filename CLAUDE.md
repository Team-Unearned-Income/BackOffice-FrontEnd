# BackOffice-FrontEnd (Knock-in BO)

## 작업 규칙

백오피스 화면(로그인 · 목록 · 상세 패널 · 처리 모달 · 알림 · 운영 기한 · 데이터 처리)
작업 시 아래 공통 스펙을 **반드시 준수**한다.

@docs/knock-in-bo-common-spec.md

## 프론트엔드 개발 규칙

- **테이블은 공통 컴포넌트 `PageTable`(`src/components/table/PageTable.vue`)을 사용한다.** `q-table`을 사용하는 List 페이지(목록 화면)를 생성·수정할 때는 직접 `q-table`을 쓰지 말고 반드시 `PageTable`을 사용한다. 검색은 `TableSearch`(`src/components/table/TableSearch.vue`)를 사용한다.
  - 레퍼런스 패턴: `src/pages/operate/attraction/AttractionList.vue`
  - 컬럼은 `tableModel.header`에 정의하고, 뱃지/커스텀 셀은 `format`이 HTML 문자열을 반환하는 방식(`v-runtime-template` 렌더), 행 내 인터랙티브 버튼은 컬럼의 `slot` 옵션을 사용한다.
  - 데이터 로딩은 `tableRef.requestServerInteraction()` → `@request` 핸들러에서 `tableModel.rows`를 채운다.
  - `PageTable`에는 `class="q-pa-md"`를 주어 내부(필터 컨테이너 + 테이블) 패딩을 확보한다.
- **처리 확인 모달은 공통 컴포넌트 `ProcessConfirmModal`(`src/components/modal/ProcessConfirmModal.vue`)을 사용한다.** 정지/비공개/삭제/반려/권한 부여 등 처리 확인 모달을 화면별로 따로 만들지 말고, `$q.dialog({ component: ProcessConfirmModal, componentProps: {...} })`로 호출한다. props: `title`, `message`, `requireReason`(사유 필수 textarea), `reasonLabel`, `warning`(앰버 경고 박스), `confirmLabel`, `confirmColor`(`'red'`/`'dark'`/`'amber'`). 간단 확인은 `@/components/dialog/AlarmDialog.vue`를 사용한다.
- **페이지 루트 컨테이너는 `q-pa-lg` 패딩을 사용한다.** (목록/탭 화면 등 모든 페이지 최상위 `div`)
