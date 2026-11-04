@echo off
echo ========================================
echo Starting LeetCode Clone (Backend + Frontend)
echo ========================================

:: Start Backend
start "LeetCode Backend (Port 3000)" /d "%~dp0backend" cmd /k npm run dev

:: Start Frontend
start "LeetCode Frontend (Port 5173)" /d "%~dp0frontend" cmd /k npm run dev

echo Servers starting... Opening browser in 3 seconds...
ping 127.0.0.1 -n 4 >nul

:: Open Browser
start http://localhost:5173

echo Done! Both servers are running.
