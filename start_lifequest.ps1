# LifeQuest All-in-One Launcher
Write-Host "⚔️ Launching LifeQuest Gamified Productivity Stack..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"

# Launch Backend
Write-Host "🚀 Starting FastAPI Backend on http://0.0.0.0:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000"

# Launch Frontend
Write-Host "⚡ Starting Vite React Frontend on http://localhost:5173..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; cd '$frontendPath'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "`n✨ LifeQuest services are starting up!" -ForegroundColor Yellow
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "📚 Backend Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
