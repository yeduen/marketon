# MarketOn File Consistency Guide

## 개요
이 문서는 MarketOn 프로젝트에서 파일명과 import 경로의 일관성을 유지하기 위한 가이드입니다.

## 📁 파일명 규칙

### 1. 컴포넌트 파일 (PascalCase)
```
✅ 올바른 예시
- UserProfile.tsx
- ProductCard.tsx
- NavigationBar.tsx
- LoginForm.tsx

❌ 잘못된 예시
- userProfile.tsx
- product-card.tsx
- navigation_bar.tsx
- loginform.tsx
```

### 2. 훅 파일 (camelCase)
```
✅ 올바른 예시
- useUserData.ts
- useProductList.ts
- useAuth.ts
- useLocalStorage.ts

❌ 잘못된 예시
- UseUserData.ts
- use_user_data.ts
- useuserdata.ts
- UserDataHook.ts
```

### 3. 유틸리티/타입 파일 (camelCase)
```
✅ 올바른 예시
- apiClient.ts
- domProps.ts
- types.ts
- constants.ts

❌ 잘못된 예시
- ApiClient.ts
- dom-props.ts
- Types.ts
- CONSTANTS.ts
```

### 4. 페이지 컴포넌트 (PascalCase)
```
✅ 올바른 예시
- HomePage.tsx
- ProductDetailPage.tsx
- UserProfilePage.tsx
- CheckoutPage.tsx

❌ 잘못된 예시
- homePage.tsx
- product-detail-page.tsx
- user_profile_page.tsx
- checkoutpage.tsx
```

## 🔧 확장자 규칙

### 1. React 컴포넌트
- **`.tsx`**: JSX를 포함하는 React 컴포넌트
- **`.ts`**: JSX가 없는 React 컴포넌트 (드물게 사용)

### 2. 유틸리티 및 훅
- **`.ts`**: TypeScript 파일 (훅, 유틸리티, 타입 정의)
- **`.js`**: JavaScript 파일 (레거시 코드)

### 3. 확장자 결정 로직
```typescript
// React 컴포넌트 감지
if (content.includes('export') && 
    (content.includes('React.FC') || 
     content.includes('function') || 
     content.includes('class'))) {
    return '.tsx'
}

// React 훅 감지
if (content.includes('export') && 
    content.includes('use') && 
    /use[A-Z]/.test(content)) {
    return '.ts'
}

// 타입 정의 감지
if (content.includes('export') && 
    (content.includes('interface') || 
     content.includes('type') || 
     content.includes('enum'))) {
    return '.ts'
}
```

## 📍 Import 경로 규칙

### 1. 절대 경로 사용 (권장)
```typescript
// ✅ 권장
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'
import { apiClient } from '@/utils/apiClient'

// ❌ 비권장
import { Button } from '../../../components/Button'
import { useAuth } from '../../hooks/useAuth'
```

### 2. 확장자 생략
```typescript
// ✅ 권장
import { Button } from '@/components/Button'
import { useAuth } from '@/hooks/useAuth'

// ❌ 비권장
import { Button } from '@/components/Button.tsx'
import { useAuth } from '@/hooks/useAuth.ts'
```

### 3. Index 파일 사용
```typescript
// ✅ 권장
import { Button, Card, Input } from '@/components'

// ❌ 비권장
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Input } from '@/components/Input'
```

## 🚀 자동 검사 및 수정

### 1. PowerShell 스크립트 (Windows)
```powershell
# frontend 디렉토리에서 실행
.\check_file_consistency.ps1
```

### 2. Bash 스크립트 (Linux/macOS)
```bash
# frontend 디렉토리에서 실행
chmod +x check_file_consistency.sh
./check_file_consistency.sh
```

### 3. 검사 항목
- [ ] 파일명 대소문자 일관성
- [ ] 확장자 적합성
- [ ] Import 경로 유효성
- [ ] 절대 경로 사용 여부

## 🔄 리네임 작업 계획

### 1. 자동 리네임 대상
```typescript
// 파일명 대소문자 정규화
loginform.tsx → LoginForm.tsx
userprofile.tsx → UserProfile.tsx
productcard.tsx → ProductCard.tsx

// 확장자 정규화
Button.js → Button.tsx
useAuth.js → useAuth.ts
types.js → types.ts
```

### 2. Import 경로 자동 수정
```typescript
// 확장자 불일치 수정
import { Button } from './Button.tsx' → import { Button } from './Button'
import { useAuth } from '../hooks/useAuth.js' → import { useAuth } from '../hooks/useAuth'

// 경로 불일치 수정
import { Button } from './button' → import { Button } from './Button'
import { useAuth } from '../hooks/useAuth' → import { useAuth } from '../hooks/useAuth'
```

### 3. 백업 및 복구
```bash
# 백업 파일 생성
Button.tsx → Button.tsx.backup
useAuth.ts → useAuth.ts.backup

# 복구 방법
cp Button.tsx.backup Button.tsx
cp useAuth.ts.backup useAuth.ts
```

## 📋 수동 검사 체크리스트

### 1. 파일명 검사
- [ ] 컴포넌트 파일이 PascalCase인가?
- [ ] 훅 파일이 camelCase인가?
- [ ] 유틸리티 파일이 camelCase인가?
- [ ] 파일명에 공백이나 특수문자가 없는가?

### 2. 확장자 검사
- [ ] React 컴포넌트가 `.tsx`인가?
- [ ] 훅과 유틸리티가 `.ts`인가?
- [ ] JavaScript 파일이 `.js`인가?

### 3. Import 경로 검사
- [ ] 절대 경로(`@/`)를 사용하고 있는가?
- [ ] 확장자를 생략하고 있는가?
- [ ] 실제 파일 경로와 일치하는가?

### 4. 폴더 구조 검사
- [ ] `src/components/`에 컴포넌트 파일이 있는가?
- [ ] `src/pages/`에 페이지 컴포넌트가 있는가?
- [ ] `src/hooks/`에 훅 파일이 있는가?
- [ ] `src/utils/`에 유틸리티 파일이 있는가?

## 🛠️ 문제 해결

### 1. Import 경로 오류
```typescript
// ❌ 오류: Module not found
import { Button } from '@/components/Button'

// ✅ 해결: 파일명 확인
// Button.tsx 파일이 src/components/ 디렉토리에 있는지 확인
// 파일명 대소문자가 정확한지 확인
```

### 2. 확장자 오류
```typescript
// ❌ 오류: Cannot resolve module
import { Button } from './Button.tsx'

// ✅ 해결: 확장자 생략
import { Button } from './Button'
```

### 3. 대소문자 오류
```typescript
// ❌ 오류: File not found
import { Button } from './button'

// ✅ 해결: 파일명을 Button.tsx로 변경하거나
// import 경로를 './Button'으로 수정
```

## 📚 ESLint 규칙

### 1. Import 경로 검사
```javascript
{
  "rules": {
    "import/no-unresolved": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "": "never",
        "ts": "never",
        "tsx": "never"
      }
    ],
    "import/no-extensions": "error"
  }
}
```

### 2. 파일명 규칙
```javascript
{
  "rules": {
    "filename-rules/match": [
      "error",
      {
        "components": "^[A-Z][a-zA-Z]*\\.tsx$",
        "hooks": "^use[A-Z][a-zA-Z]*\\.ts$",
        "utils": "^[a-z][a-zA-Z]*\\.ts$"
      }
    ]
  }
}
```

## 🔍 정기 검사 방법

### 1. 개발 전 검사
```bash
# 프로젝트 시작 전
./check_file_consistency.sh

# 또는 Windows에서
.\check_file_consistency.ps1
```

### 2. 커밋 전 검사
```bash
# Git hooks에 추가
#!/bin/bash
cd frontend
./check_file_consistency.sh
```

### 3. CI/CD 파이프라인
```yaml
# GitHub Actions
- name: Check file consistency
  run: |
    cd frontend
    chmod +x check_file_consistency.sh
    ./check_file_consistency.sh
```

## 💡 모범 사례

### 1. 컴포넌트 구조
```
src/components/
├── Button/
│   ├── Button.tsx          # 메인 컴포넌트
│   ├── Button.test.tsx     # 테스트 파일
│   ├── Button.stories.tsx  # Storybook
│   └── index.ts            # 재export
├── Card/
│   ├── Card.tsx
│   └── index.ts
└── index.ts                 # 모든 컴포넌트 export
```

### 2. 훅 구조
```
src/hooks/
├── useAuth.ts              # 인증 관련 훅
├── useLocalStorage.ts      # 로컬 스토리지 훅
├── useApi.ts               # API 호출 훅
└── index.ts                # 모든 훅 export
```

### 3. 유틸리티 구조
```
src/utils/
├── apiClient.ts            # API 클라이언트
├── domProps.ts             # DOM props 유틸리티
├── validation.ts           # 검증 유틸리티
└── index.ts                # 모든 유틸리티 export
```

## ⚠️ 주의사항

### 1. 백업 생성
- 리네임 작업 전 반드시 백업 생성
- Git 커밋으로 변경사항 추적
- 팀원과 변경사항 공유

### 2. 점진적 적용
- 한 번에 모든 파일을 수정하지 말 것
- 컴포넌트별로 단계적 적용
- 테스트 후 다음 단계 진행

### 3. 팀 동기화
- 파일명 규칙을 팀원과 공유
- ESLint 규칙을 프로젝트에 적용
- 정기적인 코드 리뷰 진행

## 📞 지원 및 문의

### 1. 문제 해결
- 스크립트 실행 오류: 권한 확인 및 실행 정책 설정
- Import 경로 오류: 파일명과 경로 일치성 확인
- 확장자 오류: 파일 내용과 확장자 적합성 확인

### 2. 추가 도구
- VSCode ESLint 확장 프로그램
- TypeScript 경로 매핑 설정
- Git hooks를 통한 자동 검사

이 가이드를 따라 파일 일관성을 유지하면 프로젝트의 유지보수성과 개발 효율성이 크게 향상됩니다!
