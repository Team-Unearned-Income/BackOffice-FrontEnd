# seoulland_admin_web

# 환경구성

## 커밋 메시지 템플릿 적용

서울랜드 커밋 메시지 가이드라인 파일을 기본 커밋 메시지 템플릿으로 사용할 수 있도록 아래 명령을 실행.

```
git config commit.template .gitmessage
```

## F/E 실행

npm run dev


## 개발 중 어드민 role 적용방법
```
경로 맞추고 .\scripts\grant-admin.ps1 <-- PowerShell 에서 실행
```

## 로컬 백엔드(knockin-backend) 최초 셋업

프로젝트에 처음 들어왔을 때(또는 컨테이너를 새로 만들 때) 아래 순서대로 진행한다.

1. **Docker Desktop 실행**
   설치 후 Docker Desktop을 켜둔다 (백그라운드 실행 상태 확인).

2. **로컬 백엔드 컨테이너 셋업 — 최초 1회만**
   ```
   .\scripts\setup-persistent-backend.ps1
   ```
   `knockin-backend` 컨테이너를 파일 기반 H2(볼륨 마운트) + `--restart unless-stopped`로 생성한다.
   이후로는 Docker Desktop을 껐다 켜거나 컴퓨터를 재부팅해도 데이터가 유지되므로 **다시 실행할 필요 없다** (컨테이너를 `docker rm`으로 지우고 새로 만들 때, 또는 스키마가 안 맞아 데이터를 초기화하고 싶을 때만 재실행 — `-Reset` 옵션 참고. 자세한 내용은 스크립트 상단 주석 참고).

   **평소엔 Docker Desktop만 켜두면 컨테이너가 자동으로 같이 뜬다** (`--restart unless-stopped`).
   단, `docker stop knockin-backend` 또는 Docker Desktop UI에서 **직접 컨테이너를 멈춘 적이 있다면** 다음번엔 자동으로 안 켜지므로 수동으로 한 번 켜줘야 한다.
   ```
   docker start knockin-backend
   ```

3. **카카오 로그인**
   `npm run dev`로 프런트엔드를 띄우고, 로그인 화면에서 카카오 소셜 로그인으로 계정을 생성한다.

4. **어드민 role 부여 — 최초 1회만 (데이터 초기화 전까지 유지)**
   ```
   .\scripts\grant-admin.ps1 -JdbcUrl File
   ```
   완료 후 브라우저에서 로그아웃 → 카카오로 재로그인하면 BO 접근 권한이 반영된다.
   (`setup-persistent-backend.ps1`을 안 쓰고 기본 인메모리 컨테이너를 그대로 쓰는 경우엔 `-JdbcUrl File` 없이 `.\scripts\grant-admin.ps1`만 실행하되, 컨테이너 재시작마다 매번 다시 실행해야 한다.)