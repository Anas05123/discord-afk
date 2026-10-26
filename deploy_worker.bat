@echo off
title Deploy Web Version to Cloudflare
cd /d "%~dp0cloudflare"
echo ========================================================
echo   Deploying Discord Studio PRO Web Version to Cloudflare
echo ========================================================
echo.
echo Connecting to Cloudflare...
call npx wrangler login
echo.
echo Deploying clean worker.js to Cloudflare...
call npx wrangler deploy
echo.
echo ========================================================
echo Deployment complete!
echo Live at: https://discord-afk-keepalive.anas05123.workers.dev
echo ========================================================
pause
