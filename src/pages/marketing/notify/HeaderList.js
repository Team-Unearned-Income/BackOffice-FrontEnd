export const userScreenNoticeHeader = [
  {
    name: 'postStatus',
    label: '게시상태',
    field: 'postStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'appPostYn',
    label: '앱 노출',
    field: 'appPostYn',
    align: 'center',
    type: 'checkbox',
    tooltip: false
  },
  {
    name: 'noticeStatus',
    label: '공지상태',
    field: 'noticeStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 200px'
  },
  {
    name: 'createdAt',
    label: '등록일',
    field: 'createdAt',
    align: 'center'
  },
  {
    name: 'regUserId',
    label: '등록자',
    field: 'regUserId',
    align: 'center'
  },
  {
    name: 'viewCnt',
    label: '조회수',
    field: 'viewCnt',
    align: 'center'
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
export const cmsNoticeHeader = [
  {
    name: 'postStatus',
    label: '게시상태',
    field: 'postStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'appPostYn',
    label: '앱 노출',
    field: 'appPostYn',
    align: 'center',
    type: 'checkbox',
    tooltip: false
  },
  {
    name: 'noticeStatus',
    label: '공지상태',
    field: 'noticeStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 200px'
  },
  {
    name: 'createdAt',
    label: '등록일',
    field: 'createdAt',
    align: 'center'
  },
  {
    name: 'regUserId',
    label: '등록자',
    field: 'regUserId',
    align: 'center'
  },
  {
    name: 'viewCnt',
    label: '조회수',
    field: 'viewCnt',
    align: 'center'
  }
]

export const appNoticeHeader = [
  {
    name: 'postStatus',
    label: '게시상태',
    field: 'postStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'noticeStatus',
    label: '공지상태',
    field: 'noticeStatus',
    align: 'center',
    format: (value) => {
      return value === 'Y' ? '게시' : '미게시'
    }
  },
  {
    name: 'title',
    label: '제목',
    field: 'title',
    align: 'center',
    headerStyle: 'min-width: 200px'
  },
  {
    name: 'createdAt',
    label: '등록일',
    field: 'createdAt',
    align: 'center'
  },
  {
    name: 'regUserId',
    label: '등록자',
    field: 'regUserId',
    align: 'center'
  },
  {
    name: 'viewCnt',
    label: '조회수',
    field: 'viewCnt',
    align: 'center'
  }
]
