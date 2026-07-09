<#
로컬 knockin-backend를 "데이터가 재부팅/재시작에도 유지되는" 컨테이너로 다시 만든다.

왜 필요한가
  - 백엔드가 기본으로 쓰는 H2가 `jdbc:h2:mem:testdb` (인메모리) + `ddl-auto=create-drop`이라,
    컨테이너(=JVM)가 재시작될 때마다 데이터가 통째로 사라짐. 도커 볼륨 문제가 아니라
    애초에 메모리에만 저장하는 모드라서 그럼.
  - 이 스크립트는 컨테이너를 지우고, 아래 두 가지를 바꿔서 다시 만듦:
      1) SPRING_DATASOURCE_URL 환경변수로 h2를 파일 모드(jdbc:h2:file:/data/testdb)로 덮어씀
      2) SPRING_JPA_HIBERNATE_DDL_AUTO=update 로 덮어써서 기동할 때마다 스키마를 밀지 않게 함
      3) /data 경로를 도커 볼륨(knockin-h2-data)에 마운트해서 컨테이너를 지워도 데이터가 남게 함
      4) --restart unless-stopped 를 줘서 컴퓨터 재부팅 후 Docker Desktop이 뜨면 컨테이너도 자동 기동되게 함
  - 백엔드 저장소(application-test.properties)는 건드리지 않음. 환경변수 오버라이드라
    이미지를 다시 빌드할 필요도 없음 (Spring Boot 우선순위: 환경변수 > application-{profile}.properties).

===================================================================================
언제 다시 실행해야 하는가 (다음에 참고용)
===================================================================================
  다시 실행할 필요 없음 (그냥 Docker Desktop 켜고 끄기만 하면 됨):
    - 컴퓨터를 재부팅한 경우            → --restart unless-stopped 덕분에 Docker Desktop이
                                          켜지면 컨테이너도 알아서 같이 켜짐
    - Docker Desktop만 껐다 켠 경우      → 컨테이너/볼륨 그대로 남아있음
    - `docker stop knockin-backend` /
      `docker start knockin-backend`     → 볼륨은 컨테이너와 분리된 별도 리소스라 안 지워짐

  이 스크립트를 다시 실행해야 하는 경우 (컨테이너 자체를 새로 만드는 경우):
    - `docker rm knockin-backend` 로 컨테이너를 지운 뒤 다시 만들 때
      (볼륨(knockin-h2-data)만 살아있으면 -Reset 없이 재실행 시 데이터 그대로 이어짐)
    - 백엔드 이미지(cjy951213/knockin-be)가 새 버전으로 올라와서 새로 pull 받아 교체할 때

  일부러 데이터를 초기화하고 싶을 때 (예: 팀원이 엔티티/스키마를 바꿔서 기존 데이터와 안 맞을 때):
    .\scripts\setup-persistent-backend.ps1 -Reset
    → 볼륨(knockin-h2-data)까지 지우고 완전히 빈 상태로 다시 만듦.
      이후 grant-admin.ps1로 admin 승격을 다시 해줘야 함.

사용법:
  .\scripts\setup-persistent-backend.ps1            # 최초 1회 설정 (또는 컨테이너 재생성)
  .\scripts\setup-persistent-backend.ps1 -Reset      # 볼륨까지 지우고 완전 초기화
#>
param(
    [string]$Container = 'knockin-backend',
    [string]$Image = 'cjy951213/knockin-be:latest',
    [string]$Volume = 'knockin-h2-data',
    [switch]$Reset
)

$dockerInfo = docker info 2>$null
if (-not $?) {
    Write-Error "Docker Desktop이 실행 중이지 않습니다. 먼저 Docker Desktop을 켜주세요."
    exit 1
}

$existing = docker ps -a --filter "name=^/$Container$" --format '{{.Names}}'
if ($existing) {
    Write-Host "기존 컨테이너 '$Container'를 제거합니다 (볼륨 데이터는 유지됨)..." -ForegroundColor Yellow
    docker rm -f $Container | Out-Null
}

if ($Reset) {
    Write-Host "-Reset 지정됨: 볼륨 '$Volume'을 삭제하고 데이터를 완전히 초기화합니다..." -ForegroundColor Yellow
    docker volume rm $Volume 2>$null | Out-Null
}

docker volume create $Volume | Out-Null

Write-Host "컨테이너 '$Container'를 파일 기반 H2 + 볼륨 마운트로 새로 만듭니다..." -ForegroundColor Cyan
docker run -d `
    --name $Container `
    --restart unless-stopped `
    -p 8080:8080 `
    -e TZ=Asia/Seoul `
    -e SPRING_DATASOURCE_URL="jdbc:h2:file:/data/testdb;MODE=PostgreSQL;AUTO_SERVER=TRUE" `
    -e SPRING_JPA_HIBERNATE_DDL_AUTO=update `
    -v "${Volume}:/data" `
    $Image | Out-Null

if ($?) {
    Write-Host "완료. 컨테이너가 백그라운드로 기동 중입니다 (몇 초 후 http://localhost:8080 확인)." -ForegroundColor Green
    Write-Host "카카오 로그인 후 admin 권한이 필요하면 .\scripts\grant-admin.ps1 을 한 번 실행하세요." -ForegroundColor Green
    Write-Host "이후로는 Docker Desktop을 껐다 켜거나 컴퓨터를 재부팅해도 이 스크립트를 다시 실행할 필요 없습니다." -ForegroundColor Green
} else {
    Write-Error "컨테이너 기동에 실패했습니다. 'docker logs $Container' 로 원인을 확인하세요."
}
