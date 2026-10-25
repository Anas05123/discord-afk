@echo off
title Deploy Web Version to Cloudflare
cd /d "%~dp0cloudflare"
echo ========================================================
echo   Deploying Discord Studio PRO Web Version to Cloudflare
echo ========================================================
echo.
echo Step 1: Checking Cloudflare authentication...
call npx wrangler whoami
if %errorlevel% neq 0 (
    echo.
    echo Please log in to Cloudflare in the browser window that opens...
    call npx wrangler login
)

echo.
echo Step 2: Deploying worker.js to discord-afk-keepalive...
call npx wrangler deploy

echo.
echo ========================================================
echo Deployment complete!
echo Live at: https://discord-afk-keepalive.anas05123.workers.dev
echo ========================================================
pause
