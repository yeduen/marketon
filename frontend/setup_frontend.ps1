# MarketOn Frontend Setup Script
# Windows PowerShell Script

Write-Host "🚀 MarketOn Frontend Setup Script" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if we're in the frontend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the frontend directory." -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green

Write-Host "`n🔧 Creating/updating configuration files..." -ForegroundColor Yellow

# Create src directory if it doesn't exist
if (-not (Test-Path "src")) {
    New-Item -ItemType Directory -Path "src" -Force
    Write-Host "📁 Created src/ directory" -ForegroundColor Green
}

# Create basic src structure
$srcDirs = @("components", "pages", "hooks", "api", "utils", "types", "assets")
foreach ($dir in $srcDirs) {
    $path = "src\$dir"
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force
        Write-Host "📁 Created $path/" -ForegroundColor Green
    }
}

Write-Host "`n🚀 Starting development server..." -ForegroundColor Yellow
Write-Host "The server will start with --host flag for external access." -ForegroundColor White
Write-Host "Press Ctrl+C to stop the server." -ForegroundColor Gray
Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "  - Local: http://localhost:5173" -ForegroundColor White
Write-Host "  - Network: http://[your-ip]:5173" -ForegroundColor White

# Start development server
npm run dev -- --host
