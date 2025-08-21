# MarketOn DOM Props Refactoring Script
# Windows PowerShell Script

Write-Host "🔧 MarketOn DOM Props Refactoring Tool" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 설정
$srcDir = "src"
$fileExtensions = @("*.tsx", "*.ts")
$customProps = @("isOpen", "isActive", "isVisible", "isLoading", "isExpanded", "isSelected", "isDisabled", "isHidden")

# 함수: 파일에서 커스텀 prop 사용 패턴 찾기
function Find-CustomPropUsage {
    param([string]$filePath)
    
    $content = Get-Content $filePath -Raw
    $issues = @()
    
    foreach ($prop in $customProps) {
        # JSX에서 커스텀 prop이 DOM 엘리먼트에 전달되는 패턴 찾기
        $pattern = "<(\w+)\s+[^>]*$prop\s*=\s*\{[^}]*\}[^>]*>"
        if ($content -match $pattern) {
            $issues += "Found $prop prop on DOM element in $filePath"
        }
        
        # spread operator와 함께 사용되는 패턴
        $pattern = "<(\w+)\s+[^>]*\{\.\.\.\w+\}[^>]*>"
        if ($content -match $pattern) {
            $issues += "Found spread operator usage in $filePath - check for custom props"
        }
    }
    
    return $issues
}

# 함수: 파일 리팩토링
function Refactor-File {
    param([string]$filePath)
    
    Write-Host "🔍 Processing: $filePath" -ForegroundColor Yellow
    
    $content = Get-Content $filePath -Raw
    $originalContent = $content
    $modified = $false
    
    # 패턴 1: 직접 prop 전달을 rest operator로 변경
    foreach ($prop in $customProps) {
        $pattern = "export const (\w+): React\.FC<(\w+)> = \(\{ ([^}]+) \}\) => \{"
        if ($content -match $pattern) {
            $componentName = $matches[1]
            $propsType = $matches[2]
            $propsList = $matches[3]
            
            # props에서 커스텀 prop 제거하고 ...rest 추가
            $newPropsList = ($propsList -split ',') | Where-Object { 
                $_.Trim() -notmatch "^$prop\s*:" -and $_.Trim() -notmatch "^\s*$"
            }
            $newPropsList += " ...rest"
            $newPropsList = $newPropsList -join ', '
            
            $newPattern = "export const $componentName: React.FC<$propsType> = ({ $newPropsList }) => {"
            $content = $content -replace $pattern, $newPattern
            $modified = $true
            
            Write-Host "  ✅ Added ...rest to $componentName" -ForegroundColor Green
        }
    }
    
    # 패턴 2: DOM 엘리먼트에 rest props 전달
    $pattern = "return \(\s*<(\w+)([^>]*)>"
    if ($content -match $pattern) {
        $tagName = $matches[1]
        $attributes = $matches[2]
        
        # 이미 {...rest}가 있는지 확인
        if ($attributes -notmatch "\.\.\.rest") {
            $newAttributes = $attributes + " {...rest}"
            $newPattern = "return (`n    <$tagName$newAttributes>"
            $content = $content -replace $pattern, $newPattern
            $modified = $true
            
            Write-Host "  ✅ Added {...rest} to $tagName" -ForegroundColor Green
        }
    }
    
    # 패턴 3: 커스텀 prop을 data-* 속성으로 변환
    foreach ($prop in $customProps) {
        $pattern = "$prop\s*=\s*\{([^}]+)\}"
        if ($content -match $pattern) {
            $value = $matches[1]
            $dataProp = "data-$($prop.ToLower())"
            $newPattern = "$dataProp={$value}"
            $content = $content -replace $pattern, $newPattern
            $modified = $true
            
            Write-Host "  ✅ Converted $prop to $dataProp" -ForegroundColor Green
        }
    }
    
    # 파일이 수정되었으면 저장
    if ($modified) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8
        Write-Host "  💾 File updated: $filePath" -ForegroundColor Cyan
        return $true
    }
    
    return $false
}

# 함수: 백업 생성
function Create-Backup {
    param([string]$filePath)
    
    $backupPath = "$filePath.backup"
    if (-not (Test-Path $backupPath)) {
        Copy-Item $filePath $backupPath
        Write-Host "  📋 Backup created: $backupPath" -ForegroundColor Gray
    }
}

# 메인 실행
Write-Host "`n🔍 Scanning for files to refactor..." -ForegroundColor Yellow

$filesToProcess = @()
foreach ($ext in $fileExtensions) {
    $files = Get-ChildItem -Path $srcDir -Recurse -Filter $ext
    $filesToProcess += $files
}

Write-Host "Found $($filesToProcess.Count) files to process" -ForegroundColor White

$totalModified = 0
$issues = @()

foreach ($file in $filesToProcess) {
    $fileIssues = Find-CustomPropUsage $file.FullName
    if ($fileIssues.Count -gt 0) {
        $issues += $fileIssues
        Write-Host "`n⚠️  Issues found in: $($file.Name)" -ForegroundColor Yellow
        foreach ($issue in $fileIssues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
        
        # 백업 생성
        Create-Backup $file.FullName
        
        # 리팩토링 실행
        $wasModified = Refactor-File $file.FullName
        if ($wasModified) {
            $totalModified++
        }
    }
}

# 결과 요약
Write-Host "`n📊 Refactoring Summary" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "Total files processed: $($filesToProcess.Count)" -ForegroundColor White
Write-Host "Files modified: $totalModified" -ForegroundColor Green
Write-Host "Total issues found: $($issues.Count)" -ForegroundColor Yellow

if ($issues.Count -gt 0) {
    Write-Host "`n🔧 Manual Review Required:" -ForegroundColor Yellow
    Write-Host "Some patterns may require manual adjustment:" -ForegroundColor White
    Write-Host "1. Check that all custom props are properly destructured" -ForegroundColor Gray
    Write-Host "2. Verify that {...rest} is passed to the correct DOM element" -ForegroundColor Gray
    Write-Host "3. Ensure data-* attributes are used for custom state" -ForegroundColor Gray
}

Write-Host "`n💡 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review modified files for correctness" -ForegroundColor White
Write-Host "2. Run ESLint to check for remaining issues" -ForegroundColor White
Write-Host "3. Test components to ensure functionality is preserved" -ForegroundColor White
Write-Host "4. Update TypeScript interfaces if needed" -ForegroundColor White

Write-Host "`n✅ Refactoring complete!" -ForegroundColor Green
