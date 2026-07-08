<#
로컬 knockin-backend(H2 인메모리)의 MEMBER 테이블 role을 ADMIN으로 승격.
H2는 인메모리 DB라 컨테이너가 재시작되면 데이터가 초기화되므로,
카카오 로그인으로 계정을 다시 만든 뒤 이 스크립트를 재실행해야 함.

사용법:
  .\scripts\grant-admin.ps1            # 전체 MEMBER를 ADMIN으로 승격
  .\scripts\grant-admin.ps1 -Select    # 승격 없이 MEMBER 테이블만 조회
#>
param(
    [string]$Container = 'knockin-backend',
    [switch]$Select
)

$running = docker ps --filter "name=$Container" --format '{{.Names}}'
if (-not $running) {
    Write-Error "컨테이너 '$Container'가 실행 중이지 않습니다. 'docker start $Container' 먼저 실행하세요."
    exit 1
}

$sql = if ($Select) { 'sql=SELECT+%2A+FROM+MEMBER' } else { 'sql=UPDATE+MEMBER+SET+ROLE%3D%27ADMIN%27' }

$shScript = @"
JID=`$(wget -qO- http://localhost:8080/h2-console/ | grep -oE 'jsessionid=[a-zA-Z0-9]+' | head -1 | cut -d= -f2)
wget -qO- "http://localhost:8080/h2-console/login.do?jsessionid=`$JID&driver=org.h2.Driver&url=jdbc%3Ah2%3Amem%3Atestdb&user=sa&password=" > /dev/null
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

