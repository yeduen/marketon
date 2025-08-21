# DOM Props Refactoring Examples

## 개요
이 문서는 React 컴포넌트에서 DOM 엘리먼트로 불필요한 커스텀 prop이 전달되지 않도록 리팩토링하는 방법을 보여줍니다.

## 패턴 1: Rest Operator 사용

### Before (❌ 잘못된 패턴)
```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  
  return (
    <div isOpen={isOpen} onClick={onClose}>  {/* ❌ isOpen이 DOM에 전달됨 */}
      {children}
    </div>
  )
}
```

### After (✅ 올바른 패턴)
```tsx
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, ...rest }) => {
  if (!isOpen) return null
  
  return (
    <div {...rest} onClick={onClose}>  {/* ✅ 커스텀 prop 제거됨 */}
      {children}
    </div>
  )
}
```

## 패턴 2: Data Attributes 사용

### Before (❌ 잘못된 패턴)
```tsx
export const Button: React.FC<ButtonProps> = ({ isActive, variant, children }) => {
  return (
    <button isActive={isActive} variant={variant}>  {/* ❌ 커스텀 prop이 DOM에 전달됨 */}
      {children}
    </button>
  )
}
```

### After (✅ 올바른 패턴)
```tsx
export const Button: React.FC<ButtonProps> = ({ isActive, variant, children, ...rest }) => {
  return (
    <button 
      {...rest}
      data-active={isActive}  {/* ✅ data-* 속성으로 변환 */}
      data-variant={variant}
    >
      {children}
    </button>
  )
}
```

## 패턴 3: Styled Components

### Before (❌ 잘못된 패턴)
```tsx
const StyledButton = styled.button<{ isOpen: boolean }>`
  background: ${props => props.isOpen ? 'blue' : 'gray'};
  /* isOpen이 DOM에 전달되어 경고 발생 */
`
```

### After (✅ 올바른 패턴)
```tsx
const StyledButton = styled.button<{ isOpen: boolean }>`
  background: ${props => props.isOpen ? 'blue' : 'gray'};
`

// 사용할 때
export const Button: React.FC<ButtonProps> = ({ isOpen, children, ...rest }) => {
  return (
    <StyledButton isOpen={isOpen} {...rest}>
      {children}
    </StyledButton>
  )
}
```

## 패턴 4: 복잡한 컴포넌트

### Before (❌ 잘못된 패턴)
```tsx
interface CardProps {
  isExpanded: boolean
  isLoading: boolean
  variant: 'default' | 'highlighted'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ 
  isExpanded, 
  isLoading, 
  variant, 
  children 
}) => {
  return (
    <div 
      isExpanded={isExpanded}      {/* ❌ 커스텀 prop이 DOM에 전달됨 */}
      isLoading={isLoading}        {/* ❌ 커스텀 prop이 DOM에 전달됨 */}
      variant={variant}            {/* ❌ 커스텀 prop이 DOM에 전달됨 */}
      className={`card card--${variant}`}
    >
      {children}
    </div>
  )
}
```

### After (✅ 올바른 패턴)
```tsx
interface CardProps {
  isExpanded: boolean
  isLoading: boolean
  variant: 'default' | 'highlighted'
  children: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ 
  isExpanded, 
  isLoading, 
  variant, 
  children,
  ...rest 
}) => {
  return (
    <div 
      {...rest}
      data-expanded={isExpanded}    {/* ✅ data-* 속성으로 변환 */}
      data-loading={isLoading}      {/* ✅ data-* 속성으로 변환 */}
      data-variant={variant}        {/* ✅ data-* 속성으로 변환 */}
      className={`card card--${variant}`}
    >
      {children}
    </div>
  )
}
```

## 패턴 5: 유틸리티 함수 사용

### Before (❌ 수동 처리)
```tsx
export const Input: React.FC<InputProps> = ({ 
  isFocused, 
  hasError, 
  size, 
  ...rest 
}) => {
  // 수동으로 DOM props만 필터링
  const domProps = {
    className: rest.className,
    id: rest.id,
    style: rest.style,
    // ... 기타 DOM props
  }
  
  return (
    <input 
      {...domProps}
      data-focused={isFocused}
      data-error={hasError}
      data-size={size}
    />
  )
}
```

### After (✅ 유틸리티 함수 사용)
```tsx
import { excludeCustomProps } from '@/utils/domProps'

export const Input: React.FC<InputProps> = ({ 
  isFocused, 
  hasError, 
  size, 
  ...rest 
}) => {
  // 유틸리티 함수로 자동 필터링
  const domProps = excludeCustomProps(rest, ['isFocused', 'hasError', 'size'])
  
  return (
    <input 
      {...domProps}
      data-focused={isFocused}
      data-error={hasError}
      data-size={size}
    />
  )
}
```

## 자동 리팩토링 실행

### PowerShell 스크립트 실행
```powershell
# frontend 디렉토리에서 실행
.\refactor_dom_props.ps1
```

### 수동 리팩토링 단계
1. **Props 구조분해에 `...rest` 추가**
   ```tsx
   // Before
   const Component = ({ prop1, prop2 }) => {
   
   // After  
   const Component = ({ prop1, prop2, ...rest }) => {
   ```

2. **커스텀 props를 data-* 속성으로 변환**
   ```tsx
   // Before
   <div isOpen={isOpen}>
   
   // After
   <div data-open={isOpen}>
   ```

3. **DOM 엘리먼트에 `{...rest}` 전달**
   ```tsx
   // Before
   <div>
   
   // After
   <div {...rest}>
   ```

## ESLint 규칙

프로젝트에 다음 ESLint 규칙을 추가하여 자동으로 체크:

```js
{
  "rules": {
    "react/forbid-dom-props": [
      "error",
      {
        "forbid": [
          {
            "propName": "isOpen",
            "message": "Use data-is-open instead of isOpen for DOM elements"
          }
        ]
      }
    ]
  }
}
```

## TypeScript 타입 안전성

```tsx
// 커스텀 props와 DOM props를 분리
interface ComponentProps {
  // 커스텀 props
  isOpen: boolean
  variant: 'primary' | 'secondary'
  
  // DOM props (상속)
  className?: string
  id?: string
  style?: React.CSSProperties
  onClick?: () => void
}

// DOM props만 전달하는 타입
type DOMProps = Pick<ComponentProps, 'className' | 'id' | 'style' | 'onClick'>
```

## 테스트 방법

1. **브라우저 개발자 도구에서 확인**
   - DOM 엘리먼트에 커스텀 prop이 전달되지 않는지 확인
   - data-* 속성이 올바르게 설정되었는지 확인

2. **ESLint 실행**
   ```bash
   npm run lint
   ```

3. **TypeScript 컴파일 확인**
   ```bash
   npm run build
   ```

## 주의사항

- **백업 생성**: 리팩토링 전 반드시 백업 생성
- **테스트 실행**: 리팩토링 후 컴포넌트 기능 테스트
- **점진적 적용**: 한 번에 모든 파일을 수정하지 말고 단계적으로 적용
- **팀 동기화**: 팀원들과 리팩토링 패턴 공유 및 동기화
