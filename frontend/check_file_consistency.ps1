# MarketOn File Consistency Check Script
# Windows PowerShell Script

Write-Host "🔍 MarketOn File Consistency Check Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 설정
$srcDirs = @("src/components", "src/pages", "src/hooks")
$fileExtensions = @("*.ts", "*.tsx", "*.js", "*.jsx")
$preferredExtensions = @{
    "React Component" = ".tsx"
    "React Hook" = ".ts"
    "Utility/Type" = ".ts"
    "Page Component" = ".tsx"
}

# 함수: 파일 확장자 결정
function Get-PreferredExtension {
    param([string]$filePath, [string]$content)
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $currentExt = [System.IO.Path]::GetExtension($filePath)
    
    # React 컴포넌트인지 확인
    if ($content -match "export.*React\.FC|export.*function.*\(.*\)|export.*const.*=.*React\.|export.*class.*extends.*Component") {
        return ".tsx"
    }
    
    # React Hook인지 확인
    if ($content -match "export.*function.*use[A-Z]|export.*const.*use[A-Z]") {
        return ".ts"
    }
    
    # TypeScript 타입/인터페이스인지 확인
    if ($content -match "export.*interface|export.*type|export.*enum") {
        return ".ts"
    }
    
    # 기본값
    return ".ts"
}

# 함수: 파일명 대소문자 정규화
function Normalize-FileName {
    param([string]$fileName)
    
    # PascalCase로 변환 (컴포넌트용)
    if ($fileName -match "^[a-z]") {
        return [System.Globalization.CultureInfo]::CurrentCulture.TextInfo.ToTitleCase($fileName.ToLower())
    }
    
    # camelCase 유지 (훅용)
    if ($fileName -match "^use[A-Z]") {
        return $fileName
    }
    
    return $fileName
}

# 함수: import 경로에서 파일명 추출
function Extract-ImportPaths {
    param([string]$content, [string]$filePath)
    
    $imports = @()
    $baseDir = Split-Path $filePath -Parent
    
    # 다양한 import 패턴 매칭
    $patterns = @(
        "import.*from\s+['""]([^'""]+)['""]",           # from 'path'
        "import.*from\s+['""]\./([^'""]+)['""]",        # from './path'
        "import.*from\s+['""]\.\./([^'""]+)['""]",      # from '../path'
        "import.*from\s+['""]@/([^'""]+)['""]"          # from '@/path'
    )
    
    foreach ($pattern in $patterns) {
        if ($content -match $pattern) {
            $matches = [regex]::Matches($content, $pattern)
            foreach ($match in $matches) {
                $importPath = $match.Groups[1].Value
                
                # 절대 경로 (@/) 처리
                if ($importPath.StartsWith("@/")) {
                    $relativePath = $importPath.Substring(2)
                    $fullPath = Join-Path "src" $relativePath
                } else {
                    $fullPath = Join-Path $baseDir $importPath
                }
                
                # 확장자 추가
                if (-not [System.IO.Path]::HasExtension($fullPath)) {
                    $fullPath += ".ts"  # 기본값
                }
                
                $imports += @{
                    Original = $match.Value
                    Path = $importPath
                    FullPath = $fullPath
                    Line = $match.Value
                }
            }
        }
    }
    
    return $imports
}

# 함수: 파일 존재 여부 확인
function Test-FileExists {
    param([string]$filePath)
    
    # 정확한 경로 확인
    if (Test-Path $filePath) {
        return $true
    }
    
    # 확장자 없이 확인
    $dir = Split-Path $filePath -Parent
    $name = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    
    foreach ($ext in $fileExtensions) {
        $testPath = Join-Path $dir "$name$ext"
        if (Test-Path $testPath) {
            return @{
                Exists = $true
                ActualPath = $testPath
                SuggestedPath = $filePath
            }
        }
    }
    
    return @{
        Exists = $false
        ActualPath = $null
        SuggestedPath = $filePath
    }
}

# 함수: 파일 일관성 검사
function Test-FileConsistency {
    param([string]$filePath)
    
    $issues = @()
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    
    if (-not $content) {
        return $issues
    }
    
    # 1. 파일명 대소문자 검사
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($filePath)
    $normalizedName = Normalize-FileName $fileName
    if ($fileName -ne $normalizedName) {
        $issues += @{
            Type = "Case Mismatch"
            Message = "File name should be: $normalizedName"
            Severity = "Warning"
        }
    }
    
    # 2. 확장자 검사
    $currentExt = [System.IO.Path]::GetExtension($filePath)
    $preferredExt = Get-PreferredExtension $filePath $content
    if ($currentExt -ne $preferredExt) {
        $issues += @{
            Type = "Extension Mismatch"
            Message = "Preferred extension: $preferredExt (current: $currentExt)"
            Severity = "Info"
        }
    }
    
    # 3. Import 경로 검사
    $imports = Extract-ImportPaths $content $filePath
    foreach ($import in $imports) {
        $fileExists = Test-FileExists $import.FullPath
        if (-not $fileExists.Exists) {
            $issues += @{
                Type = "Import Path Mismatch"
                Message = "Import path not found: $($import.Path)"
                Severity = "Error"
                Import = $import
            }
        } elseif ($fileExists.ActualPath -and $fileExists.ActualPath -ne $import.FullPath) {
            $issues += @{
                Type = "Import Extension Mismatch"
                Message = "Import path extension mismatch: $($import.Path)"
                Severity = "Warning"
                Import = $import
                ActualPath = $fileExists.ActualPath
            }
        }
    }
    
    return $issues
}

# 함수: 파일 리네임
function Rename-File {
    param([string]$oldPath, [string]$newPath)
    
    try {
        # 백업 생성
        $backupPath = "$oldPath.backup"
        if (-not (Test-Path $backupPath)) {
            Copy-Item $oldPath $backupPath
            Write-Host "  📋 Backup created: $backupPath" -ForegroundColor Gray
        }
        
        # 파일 리네임
        $newDir = Split-Path $newPath -Parent
        if (-not (Test-Path $newDir)) {
            New-Item -ItemType Directory -Path $newDir -Force | Out-Null
        }
        
        Move-Item $oldPath $newPath -Force
        Write-Host "  ✅ Renamed: $oldPath → $newPath" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "  ❌ Failed to rename: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 함수: Import 경로 수정
function Fix-ImportPaths {
    param([string]$filePath, [array]$issues)
    
    $content = Get-Content $filePath -Raw
    $modified = $false
    
    foreach ($issue in $issues) {
        if ($issue.Type -eq "Import Extension Mismatch" -and $issue.ActualPath) {
            $oldImport = $issue.Import.Original
            $newImport = $oldImport -replace $issue.Import.Path, $issue.ActualPath
            
            $content = $content -replace [regex]::Escape($oldImport), $newImport
            $modified = $true
            
            Write-Host "  🔧 Fixed import: $($issue.Import.Path) → $($issue.ActualPath)" -ForegroundColor Yellow
        }
    }
    
    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  💾 Updated imports in: $filePath" -ForegroundColor Cyan
    }
    
    return $modified
}

# 메인 실행
Write-Host "`n🔍 Scanning for consistency issues..." -ForegroundColor Yellow

$allFiles = @()
foreach ($dir in $srcDirs) {
    if (Test-Path $dir) {
        foreach ($ext in $fileExtensions) {
            $files = Get-ChildItem -Path $dir -Recurse -Filter $ext
            $allFiles += $files
        }
    }
}

Write-Host "Found $($allFiles.Count) files to check" -ForegroundColor White

$totalIssues = 0
$filesWithIssues = @()
$renamePlan = @()

foreach ($file in $allFiles) {
    $issues = Test-FileConsistency $file.FullName
    
    if ($issues.Count -gt 0) {
        $filesWithIssues += @{
            File = $file
            Issues = $issues
        }
        $totalIssues += $issues.Count
        
        Write-Host "`n⚠️  Issues in: $($file.Name)" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            $color = switch ($issue.Severity) {
                "Error" { "Red" }
                "Warning" { "Yellow" }
                "Info" { "Blue" }
                default { "White" }
            }
            Write-Host "  - [$($issue.Type)] $($issue.Message)" -ForegroundColor $color
        }
        
        # 리네임 계획 생성
        $fileName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
        $normalizedName = Normalize-FileName $fileName
        $currentExt = [System.IO.Path]::GetExtension($file.Name)
        $preferredExt = Get-PreferredExtension $file.FullName (Get-Content $file.FullName -Raw)
        
        if ($fileName -ne $normalizedName -or $currentExt -ne $preferredExt) {
            $newName = "$normalizedName$preferredExt"
            $newPath = Join-Path (Split-Path $file.FullName -Parent) $newName
            
            $renamePlan += @{
                OldPath = $file.FullName
                NewPath = $newPath
                OldName = $file.Name
                NewName = $newName
                Reason = "Normalize naming and extension"
            }
        }
    }
}

# 결과 요약
Write-Host "`n📊 Consistency Check Summary" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Total files checked: $($allFiles.Count)" -ForegroundColor White
Write-Host "Files with issues: $($filesWithIssues.Count)" -ForegroundColor Yellow
Write-Host "Total issues found: $totalIssues" -ForegroundColor Red

# 리네임 계획 표시
if ($renamePlan.Count -gt 0) {
    Write-Host "`n🔄 Rename Plan:" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    
    foreach ($plan in $renamePlan) {
        Write-Host "  $($plan.OldName) → $($plan.NewName)" -ForegroundColor White
        Write-Host "    Reason: $($plan.Reason)" -ForegroundColor Gray
        Write-Host "    Path: $($plan.OldPath) → $($plan.NewPath)" -ForegroundColor Gray
        Write-Host ""
    }
    
    # 사용자 확인
    $response = Read-Host "Do you want to proceed with the rename operations? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "`n🚀 Executing rename operations..." -ForegroundColor Green
        
        $successCount = 0
        foreach ($plan in $renamePlan) {
            if (Rename-File $plan.OldPath $plan.NewPath) {
                $successCount++
            }
        }
        
        Write-Host "`n✅ Rename operations completed: $successCount/$($renamePlan.Count) successful" -ForegroundColor Green
        
        # Import 경로 수정
        Write-Host "`n🔧 Fixing import paths..." -ForegroundColor Yellow
        $importFixCount = 0
        
        foreach ($fileWithIssues in $filesWithIssues) {
            if (Fix-ImportPaths $fileWithIssues.File.FullName $fileWithIssues.Issues) {
                $importFixCount++
            }
        }
        
        Write-Host "✅ Import paths fixed in $importFixCount files" -ForegroundColor Green
    } else {
        Write-Host "`n⏸️  Rename operations cancelled by user" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ No rename operations needed!" -ForegroundColor Green
}

# 권장사항
Write-Host "`n💡 Recommendations:" -ForegroundColor Cyan
Write-Host "1. Use PascalCase for component files (e.g., UserProfile.tsx)" -ForegroundColor White
Write-Host "2. Use camelCase for hook files (e.g., useUserData.ts)" -ForegroundColor White
Write-Host "3. Use .tsx for React components, .ts for utilities and hooks" -ForegroundColor White
Write-Host "4. Keep import paths consistent with actual file names" -ForegroundColor White
Write-Host "5. Use @/ alias for absolute imports from src directory" -ForegroundColor White

Write-Host "`n✅ Consistency check complete!" -ForegroundColor Green
