# MarketOn 404 Error Check Script
# Windows PowerShell Script

Write-Host "🔍 MarketOn 404 Error Diagnostic Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to check if backend is running
function Test-BackendConnection {
    Write-Host "`n🌐 Checking Backend Connection..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is running and accessible" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ Backend connection failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check environment variables
function Test-EnvironmentVariables {
    Write-Host "`n🔧 Checking Environment Variables..." -ForegroundColor Yellow
    
    $envFile = ".env"
    if (Test-Path $envFile) {
        $envContent = Get-Content $envFile
        $apiUrl = $envContent | Where-Object { $_ -match "VITE_API_BASE_URL" }
        
        if ($apiUrl) {
            Write-Host "✅ Environment file found: $apiUrl" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ VITE_API_BASE_URL not found in .env" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "❌ .env file not found" -ForegroundColor Red
        return $false
    }
}

# Function to check API endpoints
function Test-APIEndpoints {
    Write-Host "`n🔗 Testing API Endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        "/api/auth/login/",
        "/api/auth/register/",
        "/api/products/",
        "/api/orders/"
    )
    
    $allWorking = $true
    
    foreach ($endpoint in $endpoints) {
        try {
            $url = "http://localhost:8000$endpoint"
            $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 5
            Write-Host "✅ $endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $endpoint - Error: $($_.Exception.Message)" -ForegroundColor Red
            $allWorking = $false
        }
    }
    
    return $allWorking
}

# Function to check CORS settings
function Test-CORSConfiguration {
    Write-Host "`n🌍 Checking CORS Configuration..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Origin" = "http://localhost:5173"
        }
        
        $response = Invoke-WebRequest -Uri "http://localhost:8000/api/" -Method OPTIONS -Headers $headers -TimeoutSec 5
        
        if ($response.Headers["Access-Control-Allow-Origin"]) {
            Write-Host "✅ CORS is properly configured" -ForegroundColor Green
            Write-Host "   Allow-Origin: $($response.Headers["Access-Control-Allow-Origin"])" -ForegroundColor Gray
            return $true
        } else {
            Write-Host "⚠️  CORS headers not found in response" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to check frontend configuration
function Test-FrontendConfig {
    Write-Host "`n⚙️  Checking Frontend Configuration..." -ForegroundColor Yellow
    
    $issues = @()
    
    # Check vite.config.ts
    if (Test-Path "vite.config.ts") {
        $viteConfig = Get-Content "vite.config.ts" -Raw
        if ($viteConfig -match "localhost:8000") {
            Write-Host "✅ Vite config has correct backend URL" -ForegroundColor Green
        } else {
            $issues += "Vite config may not have correct backend URL"
        }
    } else {
        $issues += "vite.config.ts not found"
    }
    
    # Check tsconfig.json
    if (Test-Path "tsconfig.json") {
        Write-Host "✅ TypeScript config found" -ForegroundColor Green
    } else {
        $issues += "tsconfig.json not found"
    }
    
    # Check src/api directory
    if (Test-Path "src/api") {
        Write-Host "✅ API directory structure exists" -ForegroundColor Green
    } else {
        $issues += "src/api directory not found"
    }
    
    if ($issues.Count -gt 0) {
        Write-Host "⚠️  Frontend configuration issues:" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "   - $issue" -ForegroundColor Yellow
        }
        return $false
    }
    
    return $true
}

# Function to generate diagnostic report
function Generate-DiagnosticReport {
    Write-Host "`n📋 Diagnostic Report" -ForegroundColor Cyan
    Write-Host "===================" -ForegroundColor Cyan
    
    $backendOk = Test-BackendConnection
    $envOk = Test-EnvironmentVariables
    $apiOk = Test-APIEndpoints
    $corsOk = Test-CORSConfiguration
    $frontendOk = Test-FrontendConfig
    
    Write-Host "`n📊 Summary:" -ForegroundColor Yellow
    Write-Host "Backend Connection: $(if ($backendOk) { '✅ OK' } else { '❌ FAILED' })" -ForegroundColor $(if ($backendOk) { 'Green' } else { 'Red' })
    Write-Host "Environment Variables: $(if ($envOk) { '✅ OK' } else { '❌ FAILED' })" -ForegroundColor $(if ($envOk) { 'Green' } else { 'Red' })
    Write-Host "API Endpoints: $(if ($apiOk) { '✅ OK' } else { '❌ FAILED' })" -ForegroundColor $(if ($apiOk) { 'Green' } else { 'Red' })
    Write-Host "CORS Configuration: $(if ($corsOk) { '✅ OK' } else { '❌ FAILED' })" -ForegroundColor $(if ($corsOk) { 'Green' } else { 'Red' })
    Write-Host "Frontend Config: $(if ($frontendOk) { '✅ OK' } else { '❌ FAILED' })" -ForegroundColor $(if ($frontendOk) { 'Green' } else { 'Red' })
    
    # Provide solutions based on issues
    Write-Host "`n🔧 Solutions:" -ForegroundColor Cyan
    
    if (-not $backendOk) {
        Write-Host "1. Start Django backend: cd ../backend && python manage.py runserver 0.0.0.0:8000" -ForegroundColor White
    }
    
    if (-not $envOk) {
        Write-Host "2. Create/update .env file with VITE_API_BASE_URL=http://localhost:8000/api/" -ForegroundColor White
    }
    
    if (-not $apiOk) {
        Write-Host "3. Check Django URLs configuration in backend/marketon/urls.py" -ForegroundColor White
        Write-Host "4. Verify Django apps are properly installed in INSTALLED_APPS" -ForegroundColor White
    }
    
    if (-not $corsOk) {
        Write-Host "5. Check Django CORS settings in backend/marketon/settings.py" -ForegroundColor White
        Write-Host "6. Ensure 'corsheaders.middleware.CorsMiddleware' is in MIDDLEWARE" -ForegroundColor White
    }
    
    if (-not $frontendOk) {
        Write-Host "7. Run frontend setup: .\setup_frontend.ps1" -ForegroundColor White
    }
    
    Write-Host "`n💡 Quick Fix Commands:" -ForegroundColor Cyan
    Write-Host "Backend: cd ../backend && python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
    Write-Host "Frontend: npm run dev -- --host" -ForegroundColor Gray
    Write-Host "Check URLs: curl http://localhost:8000/api/" -ForegroundColor Gray
}

# Main execution
try {
    Generate-DiagnosticReport
} catch {
    Write-Host "❌ Script execution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Diagnostic complete!" -ForegroundColor Green
