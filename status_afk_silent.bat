@echo off
echo ========================================================
echo   Discord 24/7 Voice AFK Worker - Status Check
echo ========================================================
echo.
powershell -Command "
$proc = Get-CimInstance Win32_Process -Filter \"CommandLine LIKE '%%afk_worker.py%%'\"
if ($proc) {
    Write-Host '🟢 STATUS: Running in Background! (PID: ' $proc.ProcessId ')' -ForegroundColor Green
    try {
        $res = Invoke-RestMethod -Uri 'http://localhost:10000' -TimeoutSec 2
        Write-Host ('📡 Health Check: ' + $res.status + ' | Uptime: ' + $res.uptime_seconds + 's') -ForegroundColor Cyan
    } catch {}
} else {
    Write-Host '⚪ STATUS: Offline (Not Running)' -ForegroundColor Yellow
}
"
echo.
pause
