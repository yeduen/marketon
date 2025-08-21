#!/bin/bash

# MarketOn File Consistency Check Script
# Linux/macOS Bash Script

echo "🔍 MarketOn File Consistency Check Tool"
echo "====================================="

# 설정
SRC_DIRS=("src/components" "src/pages" "src/hooks")
FILE_EXTENSIONS=("*.ts" "*.tsx" "*.js" "*.jsx")

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# 함수: 파일 확장자 결정
get_preferred_extension() {
    local file_path="$1"
    local content="$2"
    
    local file_name=$(basename "$file_path" | sed 's/\.[^.]*$//')
    local current_ext=$(echo "$file_path" | sed 's/.*\.//')
    
    # React 컴포넌트인지 확인
    if echo "$content" | grep -qE "export.*React\.FC|export.*function.*\(.*\)|export.*const.*=.*React\.|export.*class.*extends.*Component"; then
        echo ".tsx"
        return
    fi
    
    # React Hook인지 확인
    if echo "$content" | grep -qE "export.*function.*use[A-Z]|export.*const.*use[A-Z]"; then
        echo ".ts"
        return
    fi
    
    # TypeScript 타입/인터페이스인지 확인
    if echo "$content" | grep -qE "export.*interface|export.*type|export.*enum"; then
        echo ".ts"
        return
    fi
    
    # 기본값
    echo ".ts"
}

# 함수: 파일명 대소문자 정규화
normalize_filename() {
    local file_name="$1"
    
    # PascalCase로 변환 (컴포넌트용)
    if [[ "$file_name" =~ ^[a-z] ]]; then
        echo "$file_name" | sed 's/\b\w/\U&/g'
        return
    fi
    
    # camelCase 유지 (훅용)
    if [[ "$file_name" =~ ^use[A-Z] ]]; then
        echo "$file_name"
        return
    fi
    
    echo "$file_name"
}

# 함수: import 경로에서 파일명 추출
extract_import_paths() {
    local content="$1"
    local file_path="$2"
    
    local base_dir=$(dirname "$file_path")
    local imports=()
    
    # 다양한 import 패턴 매칭
    while IFS= read -r line; do
        if [[ "$line" =~ import.*from[[:space:]]+[\'\"]([^\'\"]+)[\'\"] ]]; then
            local import_path="${BASH_REMATCH[1]}"
            
            # 절대 경로 (@/) 처리
            if [[ "$import_path" =~ ^@/ ]]; then
                local relative_path="${import_path#@/}"
                local full_path="src/$relative_path"
            else
                local full_path="$base_dir/$import_path"
            fi
            
            # 확장자 추가
            if [[ ! "$full_path" =~ \.[^.]*$ ]]; then
                full_path="$full_path.ts"
            fi
            
            imports+=("$import_path|$full_path|$line")
        fi
    done <<< "$content"
    
    echo "${imports[@]}"
}

# 함수: 파일 존재 여부 확인
test_file_exists() {
    local file_path="$1"
    
    # 정확한 경로 확인
    if [[ -f "$file_path" ]]; then
        echo "true"
        return
    fi
    
    # 확장자 없이 확인
    local dir=$(dirname "$file_path")
    local name=$(basename "$file_path" | sed 's/\.[^.]*$//')
    
    for ext in "${FILE_EXTENSIONS[@]}"; do
        local test_path="$dir/$name$ext"
        if [[ -f "$test_path" ]]; then
            echo "exists|$test_path|$file_path"
            return
        fi
    done
    
    echo "false"
}

# 함수: 파일 일관성 검사
test_file_consistency() {
    local file_path="$1"
    local issues=()
    
    if [[ ! -f "$file_path" ]]; then
        return
    fi
    
    local content=$(cat "$file_path")
    local file_name=$(basename "$file_path" | sed 's/\.[^.]*$//')
    local normalized_name=$(normalize_filename "$file_name")
    local current_ext=$(echo "$file_path" | sed 's/.*\.//')
    local preferred_ext=$(get_preferred_extension "$file_path" "$content")
    
    # 1. 파일명 대소문자 검사
    if [[ "$file_name" != "$normalized_name" ]]; then
        issues+=("Case Mismatch|File name should be: $normalized_name|Warning")
    fi
    
    # 2. 확장자 검사
    if [[ "$current_ext" != "$preferred_ext" ]]; then
        issues+=("Extension Mismatch|Preferred extension: $preferred_ext (current: $current_ext)|Info")
    fi
    
    # 3. Import 경로 검사
    local imports=$(extract_import_paths "$content" "$file_path")
    for import in $imports; do
        IFS='|' read -r import_path full_path line <<< "$import"
        local file_exists=$(test_file_exists "$full_path")
        
        if [[ "$file_exists" == "false" ]]; then
            issues+=("Import Path Mismatch|Import path not found: $import_path|Error|$import_path|$full_path|$line")
        elif [[ "$file_exists" =~ exists\|(.+)\|(.+) ]]; then
            local actual_path="${BASH_REMATCH[1]}"
            local suggested_path="${BASH_REMATCH[2]}"
            if [[ "$actual_path" != "$full_path" ]]; then
                issues+=("Import Extension Mismatch|Import path extension mismatch: $import_path|Warning|$import_path|$full_path|$line|$actual_path")
            fi
        fi
    done
    
    echo "${issues[@]}"
}

# 함수: 파일 리네임
rename_file() {
    local old_path="$1"
    local new_path="$2"
    
    # 백업 생성
    local backup_path="$old_path.backup"
    if [[ ! -f "$backup_path" ]]; then
        cp "$old_path" "$backup_path"
        echo -e "  📋 Backup created: $backup_path" | sed "s/📋/📋/g"
    fi
    
    # 파일 리네임
    local new_dir=$(dirname "$new_path")
    mkdir -p "$new_dir"
    
    if mv "$old_path" "$new_path"; then
        echo -e "  ✅ Renamed: $old_path → $new_path" | sed "s/✅/✅/g"
        return 0
    else
        echo -e "  ❌ Failed to rename: $old_path" | sed "s/❌/❌/g"
        return 1
    fi
}

# 함수: Import 경로 수정
fix_import_paths() {
    local file_path="$1"
    local issues="$2"
    
    local content=$(cat "$file_path")
    local modified=false
    
    while IFS='|' read -r type message severity import_path full_path line actual_path; do
        if [[ "$type" == "Import Extension Mismatch" && -n "$actual_path" ]]; then
            local old_import="from '$import_path'"
            local new_import="from '$actual_path'"
            content=$(echo "$content" | sed "s|$old_import|$new_import|g")
            modified=true
            
            echo -e "  🔧 Fixed import: $import_path → $actual_path" | sed "s/🔧/🔧/g"
        fi
    done <<< "$issues"
    
    if [[ "$modified" == true ]]; then
        echo "$content" > "$file_path"
        echo -e "  💾 Updated imports in: $file_path" | sed "s/💾/💾/g"
    fi
    
    echo "$modified"
}

# 메인 실행
echo -e "\n🔍 Scanning for consistency issues..." | sed "s/🔍/🔍/g"

all_files=()
for dir in "${SRC_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        for ext in "${FILE_EXTENSIONS[@]}"; do
            while IFS= read -r -d '' file; do
                all_files+=("$file")
            done < <(find "$dir" -type f -name "$ext" -print0)
        done
    fi
done

echo "Found ${#all_files[@]} files to check"

total_issues=0
files_with_issues=()
rename_plan=()

for file in "${all_files[@]}"; do
    issues=$(test_file_consistency "$file")
    
    if [[ -n "$issues" ]]; then
        files_with_issues+=("$file|$issues")
        
        echo -e "\n⚠️  Issues in: $(basename "$file")" | sed "s/⚠️/⚠️/g"
        
        while IFS='|' read -r type message severity rest; do
            local color=""
            case "$severity" in
                "Error") color="$RED" ;;
                "Warning") color="$YELLOW" ;;
                "Info") color="$BLUE" ;;
                *) color="$WHITE" ;;
            esac
            
            echo -e "  - [$type] $message" | sed "s/\[/\[/g" | sed "s/\]/\]/g"
        done <<< "$issues"
        
        # 리네임 계획 생성
        local file_name=$(basename "$file" | sed 's/\.[^.]*$//')
        local normalized_name=$(normalize_filename "$file_name")
        local current_ext=$(echo "$file" | sed 's/.*\.//')
        local preferred_ext=$(get_preferred_extension "$file" "$(cat "$file")")
        
        if [[ "$file_name" != "$normalized_name" || "$current_ext" != "$preferred_ext" ]]; then
            local new_name="$normalized_name$preferred_ext"
            local new_path="$(dirname "$file")/$new_name"
            
            rename_plan+=("$file|$new_path|$(basename "$file")|$new_name|Normalize naming and extension")
        fi
    fi
done

# 결과 요약
echo -e "\n📊 Consistency Check Summary" | sed "s/📊/📊/g"
echo "============================"
echo "Total files checked: ${#all_files[@]}"
echo -e "Files with issues: ${#files_with_issues[@]}" | sed "s/⚠️/⚠️/g"
echo -e "Total issues found: $total_issues" | sed "s/❌/❌/g"

# 리네임 계획 표시
if [[ ${#rename_plan[@]} -gt 0 ]]; then
    echo -e "\n🔄 Rename Plan:" | sed "s/🔄/🔄/g"
    echo "==============="
    
    for plan in "${rename_plan[@]}"; do
        IFS='|' read -r old_path new_path old_name new_name reason <<< "$plan"
        echo "  $old_name → $new_name"
        echo "    Reason: $reason"
        echo "    Path: $old_path → $new_path"
        echo ""
    done
    
    # 사용자 확인
    read -p "Do you want to proceed with the rename operations? (y/N): " response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "\n🚀 Executing rename operations..." | sed "s/🚀/🚀/g"
        
        success_count=0
        for plan in "${rename_plan[@]}"; do
            IFS='|' read -r old_path new_path old_name new_name reason <<< "$plan"
            if rename_file "$old_path" "$new_path"; then
                ((success_count++))
            fi
        done
        
        echo -e "\n✅ Rename operations completed: $success_count/${#rename_plan[@]} successful" | sed "s/✅/✅/g"
        
        # Import 경로 수정
        echo -e "\n🔧 Fixing import paths..." | sed "s/🔧/🔧/g"
        import_fix_count=0
        
        for file_with_issues in "${files_with_issues[@]}"; do
            IFS='|' read -r file_path issues <<< "$file_with_issues"
            if [[ "$(fix_import_paths "$file_path" "$issues")" == "true" ]]; then
                ((import_fix_count++))
            fi
        done
        
        echo -e "✅ Import paths fixed in $import_fix_count files" | sed "s/✅/✅/g"
    else
        echo -e "\n⏸️  Rename operations cancelled by user" | sed "s/⏸️/⏸️/g"
    fi
else
    echo -e "\n✅ No rename operations needed!" | sed "s/✅/✅/g"
fi

# 권장사항
echo -e "\n💡 Recommendations:" | sed "s/💡/💡/g"
echo "1. Use PascalCase for component files (e.g., UserProfile.tsx)"
echo "2. Use camelCase for hook files (e.g., useUserData.ts)"
echo "3. Use .tsx for React components, .ts for utilities and hooks"
echo "4. Keep import paths consistent with actual file names"
echo "5. Use @/ alias for absolute imports from src directory"

echo -e "\n✅ Consistency check complete!" | sed "s/✅/✅/g"
