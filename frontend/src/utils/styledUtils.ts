import React from 'react'
import { filterDOMProps, excludeCustomProps } from './domProps'

/**
 * styled-components에서 사용할 수 있는 DOM prop 필터링
 */

/**
 * 커스텀 props를 제거하고 DOM props만 전달하는 styled-component 래퍼
 * @param customProps - 제거할 커스텀 prop 키들
 * @returns DOM props만 전달하는 함수
 */
export function withStyledProps<T extends Record<string, any>, K extends keyof T>(
  customProps: K[]
) {
  return (props: T) => {
    const domProps = excludeCustomProps(props, customProps)
    return domProps
  }
}

/**
 * 모든 커스텀 props를 자동으로 필터링하는 styled-component 래퍼
 * @returns DOM props만 전달하는 함수
 */
export function withAutoDOMProps<T extends Record<string, any>>() {
  return (props: T) => {
    return filterDOMProps(props)
  }
}

/**
 * styled-components에서 사용할 수 있는 고차 함수
 * @param Component - styled-component
 * @param customProps - 제거할 커스텀 prop 키들
 * @returns DOM props만 전달하는 styled-component
 */
export function createStyledComponent<P extends Record<string, any>, K extends keyof P>(
  Component: React.ComponentType<P>,
  customProps: K[]
) {
  return (props: P) => {
    const domProps = excludeCustomProps(props, customProps)
    return React.createElement(Component, domProps as any)
  }
}

// 사용 예시를 위한 타입 정의
export interface StyledComponentProps {
  // 커스텀 props
  variant?: 'primary' | 'secondary'
  size?: 'small' | 'medium' | 'large'
  isOpen?: boolean
  isActive?: boolean
  
  // DOM props
  className?: string
  id?: string
  style?: React.CSSProperties
  onClick?: () => void
  children?: React.ReactNode
}

// styled-components에서 사용할 때
export const styledPropsFilter = withStyledProps<StyledComponentProps, 'variant' | 'size' | 'isOpen' | 'isActive'>([
  'variant',
  'size', 
  'isOpen',
  'isActive'
])
