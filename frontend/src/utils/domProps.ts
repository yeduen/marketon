import React from 'react'

/**
 * DOM 엘리먼트에 전달할 수 있는 prop을 필터링하는 유틸리티
 */

// HTML 표준 속성들 (React에서 지원하는 것들)
const DOM_ATTRIBUTES = new Set([
  // Global attributes
  'id', 'class', 'style', 'title', 'lang', 'dir', 'tabindex', 'accesskey',
  'contenteditable', 'contextmenu', 'draggable', 'dropzone', 'hidden', 'spellcheck',
  
  // Event handlers
  'onclick', 'onmouseover', 'onmouseout', 'onkeydown', 'onkeyup', 'onsubmit',
  'onchange', 'onfocus', 'onblur', 'onload', 'onerror',
  
  // Form attributes
  'name', 'value', 'type', 'placeholder', 'required', 'disabled', 'readonly',
  'maxlength', 'minlength', 'pattern', 'autocomplete', 'autofocus',
  
  // Input specific
  'accept', 'multiple', 'step', 'min', 'max', 'size', 'checked', 'selected',
  
  // Link attributes
  'href', 'target', 'rel', 'download',
  
  // Image attributes
  'src', 'alt', 'width', 'height', 'loading', 'decoding',
  
  // Table attributes
  'colspan', 'rowspan', 'headers', 'scope',
  
  // Accessibility
  'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'aria-expanded',
  'role', 'data-*'
])

/**
 * DOM 엘리먼트에 전달할 수 있는 prop만 필터링
 * @param props - 모든 props
 * @returns DOM 엘리먼트에 전달할 수 있는 props만 포함된 객체
 */
export function filterDOMProps<T extends Record<string, any>>(props: T): Partial<T> {
  const domProps: Partial<T> = {}
  
  for (const [key, value] of Object.entries(props)) {
    // data-* 속성은 모두 허용
    if (key.startsWith('data-')) {
      domProps[key as keyof T] = value
      continue
    }
    
    // aria-* 속성은 모두 허용
    if (key.startsWith('aria-')) {
      domProps[key as keyof T] = value
      continue
    }
    
    // HTML 표준 속성만 허용
    if (DOM_ATTRIBUTES.has(key.toLowerCase())) {
      domProps[key as keyof T] = value
    }
  }
  
  return domProps
}

/**
 * 커스텀 prop을 제거하고 DOM props만 반환
 * @param props - 모든 props
 * @param customProps - 제거할 커스텀 prop 키들
 * @returns DOM props만 포함된 객체
 */
export function excludeCustomProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  customProps: K[]
): Omit<T, K> {
  const { ...rest } = props
  customProps.forEach(prop => delete rest[prop])
  return rest
}

/**
 * 커스텀 prop을 data-* 속성으로 변환
 * @param props - 모든 props
 * @param customProps - 변환할 커스텀 prop 키들
 * @returns data-* 속성이 추가된 props
 */
export function convertCustomPropsToData<T extends Record<string, any>, K extends keyof T>(
  props: T,
  customProps: K[]
): T & Record<string, any> {
  const result = { ...props } as T & Record<string, any>
  
  customProps.forEach(prop => {
    if (props[prop] !== undefined) {
      const dataKey = `data-${String(prop).toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()}`
      ;(result as any)[dataKey] = props[prop]
    }
  })
  
  return result
}

/**
 * React 컴포넌트에서 사용할 수 있는 고차 함수
 * DOM props만 전달하는 컴포넌트 래퍼
 */
export function withDOMProps<P extends Record<string, any>>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return (props: P) => {
    const domProps = filterDOMProps(props)
    return React.createElement(Component, domProps as any)
  }
}

// TypeScript 타입 정의
export type DOMProps<T> = {
  [K in keyof T as K extends string ? 
    (K extends `data-${string}` | `aria-${string}` ? K : 
     K extends keyof HTMLElementEventMap ? `on${Capitalize<K>}` : 
     K extends keyof HTMLElement ? K : never) : never
  ]: T[K]
}

export type ExcludeCustomProps<T, K extends keyof T> = Omit<T, K>
