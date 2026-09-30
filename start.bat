@echo off
echo ========================================
echo Starting LeetCode Clone (Backend + Frontend)
echo ========================================

:: Start Backend
start "LeetCode Backend (Port 3000)" cmd /k "cd /d "%~dp0backend" && npm run dev"

:: Start Frontend
start "LeetCode Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo Servers starting... Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul

:: Open Browser
start http://localhost:5173

echo Done! Both servers are running.
