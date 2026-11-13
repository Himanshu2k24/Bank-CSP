@echo off
title CSP Daily Balance Manager
cd /d "%~dp0"

echo ================================================================
echo    CSP Daily Balance Manager
echo ================================================================
echo.

:: Start Node.js server in the background
start "CSP Server" /min node server.js

:: Wait 1.5 seconds for server to bind
timeout /t 2 /nobreak >nul

:: Open in default browser
start http://localhost:3000

echo.
echo Server is running!
echo  - Open: http://localhost:3000
echo.
echo (Keep this window open or minimized while using the app)
pause
