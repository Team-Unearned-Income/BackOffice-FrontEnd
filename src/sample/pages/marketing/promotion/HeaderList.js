export const userScreenHeader = [
  {
    name: 'appHomePostYn',
    label: '홈 화면',
    field: 'appHomePostYn',
    align: 'center',
    type: 'checkbox',
    tooltip: false,
    headerStyle: 'max-width: 2.5rem'
  },
  {
    name: 'appPostYn',
    label: '앱 노출',
    field: 'appPostYn',
    align: 'center',
    type: 'checkbox',
    tooltip: false,
    headerStyle: 'max-width: 2.5rem'
  },
  {
    name: 'postYn',
    label: '게시상태',
    field: 'postYn',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    },
    headerStyle: 'max-width: 3rem'
  },
  {
    name: 'detailTypeName',
    label: '상세 구분',
    field: 'detailTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'reservationTypeName',
    label: '예매 방식',
    field: 'reservationTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 8rem'
  },
  {
    name: 'postDateRange',
    label: '게시기간',
    field: 'postDateRange',
    align: 'center',
    format: (value, row) => {
      return row.postStartDate == null && row.postEndDate == null
        ? value
        : row.postStartDate == null
          ? ` ~ ${row.postEndDate}`
          : row.postEndDate == null
            ? `${row.postStartDate} ~ `
            : `${row.postStartDate} ~ ${row.postEndDate}`
    },
    style: 'white-space: normal'
  },
  {
    name: 'regDate',
    label: '등록일시',
    field: 'regDate',
    align: 'center'
  },
  {
    name: 'userNm',
    label: '등록자',
    field: 'userNm',
    align: 'center',
    headerStyle: 'max-width: 3rem'
  },
  {
    name: 'orderSeq',
    label: '순서',
    field: 'orderSeq',
    align: 'center',
    headerStyle: 'max-width: 3rem',
    swap: true
  }
]

export const cmsPromotionHeader = [
  {
    name: 'appPostYn',
    label: '앱노출',
    field: 'appPostYn',
    align: 'center',
    type: 'checkbox',
    tooltip: false,
    headerStyle: 'max-width: 2.5rem'
  },
  {
    name: 'postYn',
    label: '게시상태',
    field: 'postYn',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    },
    headerStyle: 'max-width: 3rem'
  },
  {
    name: 'detailTypeName',
    label: '상세 구분',
    field: 'detailTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'reservationTypeName',
    label: '예매 방식',
    field: 'reservationTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 8rem'
  },
  {
    name: 'postDateRange',
    label: '게시기간',
    field: 'postDateRange',
    align: 'center',
    format: (value, row) => {
      return row.postStartDate !== null && row.postStartDate.length !== 0
        ? `${row.postStartDate} ~ ${row.postEndDate}`
        : value
    },
    style: 'white-space: normal'
  },
  {
    name: 'regDate',
    label: '등록일시',
    field: 'regDate',
    align: 'center'
  },
  {
    name: 'userNm',
    label: '등록자',
    field: 'userNm',
    align: 'center',
    headerStyle: 'max-width: 3rem'
  }
]

export const appPromotionHeader = [
  {
    name: 'postYn',
    label: '게시상태',
    field: 'postYn',
    align: 'center',
    headerStyle: 'width: 4rem',
    format: (value) => (value === 'Y' ? '게시' : '미게시')
  },
  {
    name: 'detailTypeName',
    label: '상세 구분',
    field: 'detailTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'reservationTypeName',
    label: '예매 방식',
    field: 'reservationTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 8rem'
  },
  {
    name: 'postDateRange',
    label: '게시기간',
    field: 'postDateRange',
    align: 'center',
    format: (value, row) => {
      return row.postStartDate == null && row.postEndDate == null
        ? value
        : row.postStartDate == null ? ` ~ ${row.postEndDate}`
          : row.postEndDate == null ? `${row.postStartDate} ~ `
            : `${row.postStartDate} ~ ${row.postEndDate}`
    },
    style: 'white-space: normal'
  },
  {
    name: 'regDate',
    label: '등록일시',
    field: 'regDate',
    align: 'center'
  }
]

export const cardHeader = [
  {
    name: 'postYn',
    label: '게시상태',
    field: 'postYn',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    },
    headerStyle: 'max-width: 3rem'
  },
  {
    name: 'typeName',
    label: '구분',
    field: 'typeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'detailTypeName',
    label: '상세 구분',
    field: 'detailTypeName',
    align: 'center',
    headerStyle: 'max-width: 4rem'
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 8rem'
  },
  {
    name: 'regDate',
    label: '등록일시',
    field: 'regDate',
    align: 'center'
  },
  {
    name: 'userNm',
    label: '등록자',
    field: 'userNm',
    align: 'center',
    headerStyle: 'max-width: 3rem'
  }
]
