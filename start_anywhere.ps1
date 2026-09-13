# LifeQuest - Run From Anywhere Launcher (Works on Mobile Data / Any Wi-Fi)
Write-Host "⚔️ Launching LifeQuest with Global Cloudflare Tunnel..." -ForegroundColor Cyan

$backendPath = Join-Path $PSScriptRoot "backend"
$frontendPath = Join-Path $PSScriptRoot "frontend"
$cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"

# 1. Launch Backend
Write-Host "`n🚀 1. Starting FastAPI Backend on port 8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; .\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

# 2. Launch Frontend
Write-Host "⚡ 2. Starting Vite React Frontend on port 5173..." -ForegroundColor Cyan
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "`$env:Path = 'C:\Program Files\nodejs;' + `$env:Path; cd '$frontendPath'; & 'C:\Program Files\nodejs\npm.cmd' run dev"

# 3. Launch Cloudflare Tunnel
Write-Host "🌐 3. Opening Global Encrypted Tunnel to the Internet..." -ForegroundColor Yellow
Write-Host "   (Your public HTTPS link will appear in the Cloudflare window below!)`n" -ForegroundColor White

Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Connecting to Cloudflare Global Edge Network...`n' -ForegroundColor Cyan; .\cloudflared.exe tunnel --url http://localhost:5173"
