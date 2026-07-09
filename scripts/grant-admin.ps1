<#
로컬 knockin-backend의 MEMBER 테이블 role을 ADMIN으로 승격.

컨테이너가 파일 기반 H2(setup-persistent-backend.ps1)인지 기본 인메모리(mem) 상태인지
자동으로 감지해서 맞는 쪽으로 접속한다 (File 우선 시도 → 실패 시 Mem으로 재시도).
-JdbcUrl 로 강제 지정도 가능하지만 보통은 그냥 인자 없이 실행하면 된다.

기본(H2 인메모리, jdbc:h2:mem:testdb)인 경우: 컨테이너가 재시작되면 데이터가 초기화되므로,
카카오 로그인으로 계정을 다시 만든 뒤 이 스크립트를 재실행해야 함.

setup-persistent-backend.ps1로 파일 기반 H2(jdbc:h2:file:/data/testdb)로 전환했다면
데이터가 유지되므로 보통 최초 1회만 실행하면 됨.

사용법:
  .\scripts\grant-admin.ps1                       # 자동 감지 — 전체 MEMBER를 ADMIN으로 승격
  .\scripts\grant-admin.ps1 -Select                # 승격 없이 MEMBER 테이블만 조회
  .\scripts\grant-admin.ps1 -JdbcUrl File          # 파일 모드로 강제 지정 (자동 감지 안 미더울 때)
  .\scripts\grant-admin.ps1 -JdbcUrl Mem           # 인메모리 모드로 강제 지정
#>
param(
    [string]$Container = 'knockin-backend',
    [switch]$Select,
    [ValidateSet('Auto', 'Mem', 'File')]
    [string]$JdbcUrl = 'Auto'
)

function Get-H2Url([string]$mode) {
    if ($mode -eq 'File') { 'jdbc:h2:file:/data/testdb;MODE=PostgreSQL' } else { 'jdbc:h2:mem:testdb' }
}

# docker exec 인자로 넘기면 Windows 쪽 따옴표/개행 이스케이프가 깨지고,
# PowerShell 파이프(|)로 넘기면 BOM+CRLF가 섞여 sh가 첫 줄을 못 읽으므로
# LF/ASCII 임시 파일을 만들어 cmd 리다이렉션(<)으로 stdin에 흘려보낸다.
function Invoke-H2Query([string]$container, [string]$h2Url, [string]$sql) {
    $h2UrlEncoded = [uri]::EscapeDataString($h2Url)
    $shScript = @"
JID=`$(wget -qO- http://localhost:8080/h2-console/ | grep -oE 'jsessionid=[a-zA-Z0-9]+' | head -1 | cut -d= -f2)
wget -qO- "http://localhost:8080/h2-console/login.do?jsessionid=`$JID&driver=org.h2.Driver&url=$h2UrlEncoded&user=sa&password=" > /dev/null
wget -qO- "http://localhost:8080/h2-console/query.do?jsessionid=`$JID&$sql"
"@
    $tmpFile = New-TemporaryFile
    try {
        $lfScript = $shScript -replace "`r`n", "`n"
        [System.IO.File]::WriteAllText($tmpFile.FullName, $lfScript, [System.Text.Encoding]::ASCII)
        (cmd /c "docker exec -i $container sh < `"$($tmpFile.FullName)`"") -join "`n"
    }
    finally {
        Remove-Item $tmpFile.FullName -ErrorAction SilentlyContinue
    }
}

# H2 콘솔이 접속 대상 DB를 못 찾으면 "class=""error""" / NPE가 섞인 HTML을 돌려준다 (성공 시엔 없음).
function Test-H2Success([string]$output) {
    $output -notmatch 'class="error"' -and $output -notmatch 'NullPointerException'
}

$running = docker ps --filter "name=$Container" --format '{{.Names}}'
if (-not $running) {
    Write-Error "컨테이너 '$Container'가 실행 중이지 않습니다. 'docker start $Container' 먼저 실행하세요."
    exit 1
}

$sql = if ($Select) { 'sql=SELECT+%2A+FROM+MEMBER' } else { 'sql=UPDATE+MEMBER+SET+ROLE%3D%27ADMIN%27' }

$modesToTry = switch ($JdbcUrl) {
    'File' { @('File') }
    'Mem' { @('Mem') }
    default { @('File', 'Mem') }  # Auto: 최근 셋업 기준으로 File을 먼저 시도
}

$output = $null
$usedMode = $null
foreach ($mode in $modesToTry) {
    $result = Invoke-H2Query -container $Container -h2Url (Get-H2Url $mode) -sql $sql
    if (Test-H2Success $result) {
        $output = $result
        $usedMode = $mode
        break
    }
}

if (-not $output) {
    Write-Error "H2 콘솔 접속에 실패했습니다 (File/Mem 둘 다 시도함). 컨테이너가 기동 중인지, setup-persistent-backend.ps1로 만든 컨테이너가 맞는지 확인하세요."
    exit 1
}

if ($JdbcUrl -eq 'Auto') {
    Write-Host "[$usedMode 모드로 접속됨]" -ForegroundColor DarkGray
}

if ($Select) {
    $output
    exit 0
}

if ($output -match 'Update count: (\d+)') {
    $count = $Matches[1]
    if ($count -eq '0') {
        Write-Warning "업데이트된 회원이 없습니다. 먼저 카카오 로그인으로 계정을 생성한 뒤 다시 실행하세요."
    }
    else {
        Write-Host "MEMBER $count건을 ADMIN으로 승격했습니다. 브라우저에서 로그아웃 후 카카오로 재로그인하세요." -ForegroundColor Green
    }
}
else {
    $output
}
