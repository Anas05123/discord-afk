@echo off
echo ========================================================
echo   Discord 24/7 Cloud Voice Daemon - Status Check
echo ========================================================
echo.
powershell -NoProfile -Command "$proc = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*voice_daemon.mjs*' }; if ($proc) { Write-Host '  STATUS: [ONLINE] Running silently in background (PID: ' $proc.ProcessId ')' -ForegroundColor Green; try { $res = Invoke-RestMethod -Uri 'https://discord-afk-keepalive.anas05123.workers.dev/health' -TimeoutSec 3; Write-Host ('  Account: ' + $res.account) -ForegroundColor Cyan; Write-Host ('  Voice Room: ' + $res.active_channel_id) -ForegroundColor Cyan; Write-Host ('  Activity: ' + $res.activity.name + ' - ' + $res.activity.details) -ForegroundColor Cyan } catch {} } else { Write-Host '  STATUS: [OFFLINE] Not running' -ForegroundColor Red }"
echo.
echo ========================================================
pause
