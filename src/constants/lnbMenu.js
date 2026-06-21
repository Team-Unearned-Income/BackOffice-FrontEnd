/**
 * Knock-in BO LNB 메뉴 구성 (로컬 정적)
 *
 * 기존 seoulland 백엔드 메뉴 API(`commonApi.adminMenuInfoGet`)를 대체하는
 * 프론트 로컬 메뉴 정의. 백오피스 LNB 최상위 6개 메뉴를 구성한다.
 *
 * 각 항목 필드
 * - key         : v-for 키
 * - menuName    : LNB 표기명
 * - icon        : Quasar(Material) 아이콘명
 * - url         : 라우트 절대 경로 (leaf)
 * - childrenList: 하위 메뉴 (그룹일 경우)
 */
const lnbMenu = [
  { key: 'dashboard', menuName: '대시보드', icon: 'dashboard', url: '/dashboard' },
  { key: 'members', menuName: '회원 관리', icon: 'group', url: '/members' },
  { key: 'posts', menuName: '게시글 관리', icon: 'article', url: '/posts' },
  { key: 'reports', menuName: '신고 관리', icon: 'report', url: '/reports' },
  { key: 'verification', menuName: '신원 인증', icon: 'verified_user', url: '/verification' },
  { key: 'support', menuName: '고객센터', icon: 'support_agent', url: '/support' }
]

export default lnbMenu
