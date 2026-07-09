<#
로컬 knockin-backend의 MEMBER 테이블 role을 ADMIN으로 승격.

기본(H2 인메모리, jdbc:h2:mem:testdb)인 경우: 컨테이너가 재시작되면 데이터가 초기화되므로,
카카오 로그인으로 계정을 다시 만든 뒤 이 스크립트를 재실행해야 함.

setup-persistent-backend.ps1로 파일 기반 H2(jdbc:h2:file:/data/testdb)로 전환했다면
-JdbcUrl File 을 넘겨야 접속 대상이 맞음 (데이터가 유지되므로 보통 최초 1회만 실행하면 됨).

사용법:
  .\scripts\grant-admin.ps1                       # 기본(mem) — 전체 MEMBER를 ADMIN으로 승격
  .\scripts\grant-admin.ps1 -Select                # 승격 없이 MEMBER 테이블만 조회
  .\scripts\grant-admin.ps1 -JdbcUrl File          # setup-persistent-backend.ps1 사용 중일 때
#>
param(
    [string]$Container = 'knockin-backend',
    [switch]$Select,
    [ValidateSet('Mem', 'File')]
    [string]$JdbcUrl = 'Mem'
)

$h2Url = if ($JdbcUrl -eq 'File') {
    'jdbc:h2:file:/data/testdb;MODE=PostgreSQL'
} else {
    'jdbc:h2:mem:testdb'
}
$h2UrlEncoded = [uri]::EscapeDataString($h2Url)

$running = docker ps --filter "name=$Container" --format '{{.Names}}'
if (-not $running) {
    Write-Error "컨테이너 '$Container'가 실행 중이지 않습니다. 'docker start $Container' 먼저 실행하세요."
    exit 1
}

$sql = if ($Select) { 'sql=SELECT+%2A+FROM+MEMBER' } else { 'sql=UPDATE+MEMBER+SET+ROLE%3D%27ADMIN%27' }

$shScript = @"
JID=`$(wget -qO- http://localhost:8080/h2-console/ | grep -oE 'jsessionid=[a-zA-Z0-9]+' | head -1 | cut -d= -f2)
wget -qO- "http://localhost:8080/h2-console/login.do?jsessionid=`$JID&driver=org.h2.Driver&url=$h2UrlEncoded&user=sa&password=" > /dev/null
wget -qO- "http://localhost:8080/h2-console/query.do?jsessionid=`$JID&$sql"
"@

# docker exec 인자로 넘기면 Windows 쪽 따옴표/개행 이스케이프가 깨지고,
# PowerShell 파이프(|)로 넘기면 BOM+CRLF가 섞여 sh가 첫 줄을 못 읽으므로
# LF/ASCII 임시 파일을 만들어 cmd 리다이렉션(<)으로 stdin에 흘려보낸다.
$tmpFile = New-TemporaryFile
try {
    $lfScript = $shScript -replace "`r`n", "`n"
    [System.IO.File]::WriteAllText($tmpFile.FullName, $lfScript, [System.Text.Encoding]::ASCII)
    $output = cmd /c "docker exec -i $Container sh < `"$($tmpFile.FullName)`""
}
finally {
    Remove-Item $tmpFile.FullName -ErrorAction SilentlyContinue
}

if ($Select) {
    $output
    exit 0
}

$outputText = $output -join "`n"
if ($outputText -match 'Update count: (\d+)') {
    $count = $Matches[1]
    if ($count -eq '0') {
        Write-Warning "업데이트된 회원이 없습니다. 먼저 카카오 로그인으로 계정을 생성한 뒤 다시 실행하세요."
    }
    else {
        Write-Host "MEMBER $count건을 ADMIN으로 승격했습니다. 브라우저에서 로그아웃 후 카카오로 재로그인하세요." -ForegroundColor Green
    }
}
else {
    Write-Host $outputText
}

