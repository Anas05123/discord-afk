@echo off
echo ========================================================
echo   Stopping Discord Cloud Voice Daemon...
echo ========================================================
powershell -NoProfile -Command "$p = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*voice_daemon.mjs*' }; if ($p) { $p | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host ('  [OK] Stopped PID: ' + $_.ProcessId) -ForegroundColor Yellow } } else { Write-Host '  [INFO] Voice Daemon is not running.' -ForegroundColor Gray }"
echo ========================================================
echo Done!
timeout /t 2 >nul
