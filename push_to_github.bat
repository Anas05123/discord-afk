@echo off
title Push Discord AFK to GitHub
echo ========================================================
echo   Pushing to https://github.com/Anas05123/discord-afk
echo ========================================================
echo.
cd /d "C:\Users\ayari\Desktop\discord-presence-afk"

git remote remove origin 2>nul
git remote add origin https://github.com/Anas05123/discord-afk.git
git branch -M main

echo Starting git push... If prompted, sign in via your browser.
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================================
    echo   [SUCCESS] Code successfully pushed to GitHub!
    echo   You can now go to https://dashboard.render.com
    echo   and deploy your service in 1 click!
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   [NOTICE] If GitHub requested authentication, please
    echo   sign in or paste your Personal Access Token.
    echo ========================================================
)

echo.
pause
