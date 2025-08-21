import React from 'react'
import { excludeCustomProps, convertCustomPropsToData } from '@/utils/domProps'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  // DOM props
  className?: string
  id?: string
  style?: React.CSSProperties
  'data-testid'?: string
  [key: string]: any // 추가 props 허용
}

export const Button: React.FC<ButtonProps> = (props) => {
  const {
    variant = 'primary',
    size = 'medium',
    loading = false,
    disabled = false,
    children,
    onClick,
    ...rest
  } = props

  // 커스텀 props를 제거하고 DOM props만 남김
  const domProps = excludeCustomProps(rest, ['variant', 'size', 'loading', 'disabled', 'children', 'onClick'])
  
  // 또는 커스텀 props를 data-* 속성으로 변환
  const propsWithData = convertCustomPropsToData(rest, ['variant', 'size', 'loading'])

  const baseClasses = 'button'
  const variantClasses = {
    primary: 'button--primary',
    secondary: 'button--secondary',
    danger: 'button--danger'
  }
  const sizeClasses = {
    small: 'button--small',
    medium: 'button--medium',
    large: 'button--large'
  }

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    loading && 'button--loading',
    disabled && 'button--disabled'
  ].filter(Boolean).join(' ')

  return (
    <button
      {...domProps}
      {...propsWithData}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && <span className="button__spinner" />}
      {children}
    </button>
  )
}

export default Button
