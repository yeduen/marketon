# MarketOn Backend Setup Commands
# Windows PowerShell Script

Write-Host "🚀 MarketOn Backend Setup Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Create superuser
Write-Host "`n👤 Step 1: Create Superuser" -ForegroundColor Yellow
Write-Host "You will be prompted to enter username, email, and password." -ForegroundColor White
Write-Host "Press Enter to continue..." -ForegroundColor Gray
Read-Host
python manage.py createsuperuser

# 2. Collect static files
Write-Host "`n📁 Step 2: Collect Static Files" -ForegroundColor Yellow
python manage.py collectstatic --noinput

# 3. Check media and static directories
Write-Host "`n🔍 Step 3: Check Media and Static Directories" -ForegroundColor Yellow
Write-Host "Media directory:" -ForegroundColor White
if (Test-Path "media") { Get-ChildItem "media" -Recurse | Select-Object Name, FullName } else { Write-Host "media/ directory not found" -ForegroundColor Red }
Write-Host "`nStatic files directory:" -ForegroundColor White
if (Test-Path "staticfiles") { Get-ChildItem "staticfiles" -Recurse | Select-Object Name, FullName } else { Write-Host "staticfiles/ directory not found" -ForegroundColor Red }

Write-Host "`n✅ Setup completed!" -ForegroundColor Green
Write-Host "You can now test the upload endpoints:" -ForegroundColor Cyan
Write-Host "  - File upload: POST /api/upload/file/" -ForegroundColor White
Write-Host "  - Image upload: POST /api/upload/image/" -ForegroundColor White
Write-Host "  - Run server: python manage.py runserver 0.0.0.0:8000" -ForegroundColor White
