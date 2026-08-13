# Knock-in BO Front-End

Knock-in 백오피스(BO) 프론트엔드. 아래 순서대로 따라오면 **로컬 PC에서 BO 화면 + 로컬 백엔드(Docker)** 를 붙여서 카카오 로그인부터 실제 화면까지 테스트할 수 있다.

---

## 0. 사전 준비물

| 항목 | 비고 |
| --- | --- |
| Node.js 20.x | `node -v` 로 확인. (nvm 등으로 20 버전대 사용 권장) |
| npm | Node.js 설치 시 함께 설치됨 |
| Git | — |
| Docker Desktop | 로컬 백엔드(knockin-backend)를 컨테이너로 띄우는 데 필요. 설치 후 **켜둔 상태**여야 함 |
| PowerShell | 아래 `.ps1` 스크립트 실행용 (Windows 기본 제공) |
| 카카오 계정 | 로그인 테스트용 실제 카카오 계정 1개 (소셜 로그인만 지원, 별도 ID/PW 없음) |

---

## 1. 최초 셋업 (1회만)

```bash
git clone <이 저장소 URL>
cd BackOffice-FrontEnd
npm install
```

### 커밋 메시지 템플릿 적용 (선택)

```bash
git config commit.template .gitmessage
```

### 로컬 환경변수 파일(`.env`) 생성

`.env`는 `.gitignore`에 포함되어 있어 클론 직후에는 존재하지 않는다. 프로젝트 루트에 아래 내용으로 **직접 생성**한다 (로컬 백엔드가 `8080` 포트로 뜨는 걸 기준으로 함).

```
# .env — 로컬 전용, 커밋되지 않음
VITE_API_SERVER=http://127.0.0.1:8080
VITE_API_SERVER_GENERATE=
VITE_API_BASE_URL=
VITE_NAVER_CLIENT_ID=
```

> `VITE_API_SERVER`는 `vite.config.js`의 `/bo/*`, `/users/*`, `/auth/logout` 프록시 타깃으로 쓰인다. 실제 카카오 로그인은 프론트가 아니라 **백엔드가 처리**하므로(서버 사이드 OAuth), 이 단계에서 카카오 개발자 콘솔 키(JS 키/REST 키)는 필요 없다.

---

## 2. 로컬 백엔드(knockin-backend) 셋업

1. **Docker Desktop 실행**
   설치 후 Docker Desktop을 켜둔다 (백그라운드 실행 상태 확인).

2. **로컬 백엔드 컨테이너 셋업 — 최초 1회만**
   ```powershell
   .\scripts\setup-persistent-backend.ps1
   ```
   `knockin-backend` 컨테이너를 파일 기반 H2(볼륨 마운트) + `--restart unless-stopped`로 생성한다.
   이후로는 Docker Desktop을 껐다 켜거나 컴퓨터를 재부팅해도 데이터가 유지되므로 **다시 실행할 필요 없다** (컨테이너를 `docker rm`으로 지우고 새로 만들 때, 또는 스키마가 안 맞아 데이터를 초기화하고 싶을 때만 재실행 — `-Reset` 옵션 참고. 자세한 내용은 스크립트 상단 주석 참고).

   **평소엔 Docker Desktop만 켜두면 컨테이너가 자동으로 같이 뜬다** (`--restart unless-stopped`).
   단, `docker stop knockin-backend` 또는 Docker Desktop UI에서 **직접 컨테이너를 멈춘 적이 있다면** 다음번엔 자동으로 안 켜지므로 수동으로 한 번 켜줘야 한다.
   ```powershell
   docker start knockin-backend
   ```

---

## 3. 프론트엔드 실행 + 로그인 + 관리자 권한 부여

1. **F/E 실행**
   ```bash
   npm run dev
   ```
   `http://localhost:5173`로 뜬다 (백엔드 `app.client-url` 기본값과 맞춘 고정 포트).

2. **카카오 로그인으로 계정 생성**
   로그인 화면에서 "카카오로 로그인" 클릭 → 실제 카카오 계정으로 로그인한다. (최초 로그인 시 `role=user`로 계정이 생성되며, 이 상태로는 "권한 없음" 에러가 뜬다 — 정상.)

3. **어드민 role 부여 — 최초 1회만 (데이터 초기화 전까지 유지)**
   ```powershell
   .\scripts\grant-admin.ps1
   ```
   컨테이너가 파일 모드(persistent)인지 인메모리 모드인지 자동으로 감지해서 접속하므로 별도 옵션 없이 그냥 실행하면 된다.
   완료 후 브라우저에서 로그아웃 → 카카오로 재로그인하면 BO 접근 권한이 반영된다.
   (`setup-persistent-backend.ps1`을 안 쓰고 기본 인메모리 컨테이너를 그대로 쓰는 경우엔 컨테이너 재시작마다 매번 다시 실행해야 한다. 자동 감지가 안 맞으면 `-JdbcUrl File` / `-JdbcUrl Mem`으로 강제 지정 가능.)

---

## 4. 평소 개발/테스트 시작 절차 (2회차부터)

최초 셋업이 끝났다면, 이후로는 아래 두 가지만 하면 된다.

1. Docker Desktop 켜기 (컨테이너 자동 기동 — 직접 `docker stop`한 적 있으면 `docker start knockin-backend`)
2. `npm run dev`

계정/admin 권한은 데이터가 유지되는 한(볼륨을 지우지 않는 한) 다시 설정할 필요 없다.

---

## 5. 운영 도메인(bo.knock-in.com) 로그인 플로우 로컬 테스트 (선택, 고급)

BE를 운영 서버에 올리지 않고, 로컬 PC 한 대에서 `https://bo.knock-in.com` 실제 도메인으로 접속해서
카카오 로그인 전체 흐름(Referer 기반 BO 판별 → 리다이렉트 대상 → CORS)을 그대로 검증하는 방법.
**내 PC의 hosts 파일만 바꾸는 거라 다른 팀원 환경엔 영향 없고, 운영 서버(api.knock-in.com)도 전혀 안 건드린다.**

일반적인 화면/기능 테스트에는 필요 없고, **OAuth Referer 판별 로직 자체를 검증할 때만** 필요하다.

### 왜 필요한가

BO와 소비자 앱이 백엔드 인스턴스를 공유해서, `app.client-url` 하나로는 로그인 성공 후 리다이렉트 대상을
구분 못 한다 (자세한 배경은 git log의 `BoOAuth2OriginFilter` 관련 커밋 참고). 이 필터는 `/oauth2/authorization/kakao`
요청의 **Referer 헤더**로 BO에서 온 로그인인지 판별하는데, Referer는 브라우저 주소창의 실제 origin에 의존하므로
`localhost:5173`처럼 가짜 도메인으로는 이 로직을 제대로 검증할 수 없다. 그래서 hosts 파일로 실제 도메인 이름을
로컬로 돌려서 테스트한다.

### 준비물 (최초 1회)

- **Caddy** — 로컬에서 신뢰된 HTTPS 인증서를 자동 발급해주는 경량 웹서버. 설치:
  ```
  winget install --id CaddyServer.Caddy -e
  ```

### 설정 방법

1. **hosts 파일에 1줄 추가** (관리자 권한 필요) — `C:\Windows\System32\drivers\etc\hosts` 맨 아래에:
   ```
   127.0.0.1 bo.knock-in.com
   ```
   (편의상 `# BEGIN bo-domain-login-test` ~ `# END bo-domain-login-test` 주석으로 감싸두면 나중에 지우기 쉽다.)

2. **로컬 백엔드를 BO 도메인 기준으로 재기동** (기존 볼륨 데이터는 유지됨):
   ```powershell
   docker rm -f knockin-backend
   docker run -d `
     --name knockin-backend `
     --restart unless-stopped `
     -p 8080:8080 `
     -e TZ=Asia/Seoul `
     -e SPRING_DATASOURCE_URL="jdbc:h2:file:/data/testdb;MODE=PostgreSQL" `
     -e SPRING_JPA_HIBERNATE_DDL_AUTO=update `
     -e APP_BO_CLIENT_URL=https://bo.knock-in.com `
     -v knockin-h2-data:/data `
     knockin-be-local:latest
   ```
   (`knockin-be-local:latest`는 로컬 소스로 `./gradlew bootBuildImage --imageName=knockin-be-local:latest`로 미리 빌드해둔 이미지. 11th-1team-BE 레포에서 실행.)

3. **프론트를 테스트 전용 env로 빌드** (`.env.prod`는 건드리지 않음 — `.env.botest`는 gitignore됨):
   ```
   VITE_API_SERVER=https://localhost:8443
   VITE_API_BASE_URL=https://localhost:8443
   VITE_BACKEND_URL=https://localhost:8443
   ```
   ```
   npx vite build --mode botest
   npx serve -s dist -l 4173
   ```
   (`vite preview`는 자체 host 검증 때문에 `bo.knock-in.com`으로 접속하면 403이 나서, 대신 `serve` 사용.)

4. **Caddy로 HTTPS 감싸기** — `scripts/bo-domain-test/Caddyfile`:
   ```
   bo.knock-in.com {
       tls internal
       reverse_proxy 127.0.0.1:4173
   }
   localhost:8443 {
       tls internal
       reverse_proxy 127.0.0.1:8080
   }
   ```
   ```
   cd scripts/bo-domain-test
   caddy run --config Caddyfile
   ```
   (`localhost:8443`은 백엔드를 HTTPS로 감싸기 위한 것 — 프론트가 https인데 백엔드가 http면 브라우저가 보안상
   Referer 헤더 자체를 안 보내서 `BoOAuth2OriginFilter` 검증이 무의미해진다.)

5. 브라우저에서 `https://bo.knock-in.com/login` 접속 → 카카오로 로그인 → 실제 카카오 로그인 완료 후
   `https://bo.knock-in.com/auth/success`로 돌아와 대시보드까지 들어가지는지 확인.

### 원복 방법 (테스트 끝나고 반드시)

1. **hosts 파일**: `C:\Windows\System32\drivers\etc\hosts`에서 `bo.knock-in.com` 줄(과 감싸둔 주석) 삭제.
   관리자 권한 필요. (수정 전 백업이 필요하면 `hosts.bak-before-bo-test` 같은 이름으로 미리 복사해두면 되돌리기 편하다.)
2. **Caddy 종료**: 실행 중인 `caddy run` 프로세스를 `Ctrl+C` 또는 `Stop-Process`로 종료.
3. **serve 종료**: `npx serve` 프로세스 종료.
4. **로컬 백엔드 원복**: `APP_BO_CLIENT_URL` 없이 다시 생성.
   ```
   .\scripts\setup-persistent-backend.ps1
   ```
   (볼륨은 그대로라 데이터 안 날아감.)
5. **임시 파일 정리**: `.env.botest`, `dist/` 삭제 (둘 다 gitignore 대상이라 커밋 걱정은 없음).
6. **Caddy 자체를 지우고 싶으면**: `winget uninstall CaddyServer.Caddy` (안 지워도 무해하게 남아있을 뿐이라 필수는 아님).

---

## 6. 트러블슈팅

- **`docker info` 실패 / "Docker Desktop이 실행 중이지 않습니다"** → Docker Desktop 앱을 먼저 켜고 재시도.
- **카카오 로그인 후 "권한 없음" 에러** → 정상. 아직 `grant-admin.ps1`을 실행하지 않았거나, 실행 후 재로그인을 안 한 경우다. 로그아웃 후 다시 카카오로 로그인.
- **`grant-admin.ps1` 실행 시 "업데이트된 회원이 없습니다"** → 카카오 로그인으로 계정을 먼저 만든 뒤 다시 실행.
- **`grant-admin.ps1` 접속 실패 (File/Mem 둘 다 시도)** → `docker ps`로 `knockin-backend` 컨테이너가 떠 있는지 확인. `setup-persistent-backend.ps1`로 만든 컨테이너가 맞는지도 확인.
- **컨테이너를 지우고 다시 만들었더니 admin 권한이 풀림** → 정상 (데이터 초기화됨). `grant-admin.ps1`을 다시 실행.
- **`npm run dev` 후 API 요청이 404/CORS 에러** → 프로젝트 루트에 `.env` 파일이 있는지, `VITE_API_SERVER=http://127.0.0.1:8080`으로 설정돼 있는지 확인 (1단계 참고).
