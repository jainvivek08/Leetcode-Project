Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting LeetCode Clone (Backend + Frontend)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Start-Sleep -Seconds 3
Start-Process "http://localhost:5173"

Write-Host "Both servers started in separate windows!" -ForegroundColor Green

