@echo off
echo Stopping Discord 24/7 Voice Worker...
powershell -Command "Get-CimInstance Win32_Process -Filter \"CommandLine LIKE '%%afk_worker.py%%'\" | ForEach-Object { Stop-Process -Id $_.ProcessId -Force; Write-Host 'Stopped Worker PID:' $_.ProcessId }"
echo Done.
timeout /t 2 >nul
