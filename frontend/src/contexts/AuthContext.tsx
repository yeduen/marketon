import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { authApi } from '@/api/auth'

// 타입 정의
export interface User {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  profile_image?: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthAction {
  type: 'LOGIN_START' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'REFRESH_START' | 'REFRESH_SUCCESS' | 'REFRESH_FAILURE' | 'SET_LOADING' | 'CLEAR_ERROR' | 'RESTORE_AUTH'
  payload?: any
}

// 초기 상태
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.access_token,
        refreshToken: action.payload.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case 'REFRESH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'REFRESH_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.access_token,
        isLoading: false,
        error: null
      }
    
    case 'REFRESH_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Token refresh failed'
      }
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    case 'RESTORE_AUTH':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false
      }
    
    default:
      return state
  }
}

// Context 생성
interface AuthContextType {
  state: AuthState
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider 컴포넌트
interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // 로컬 스토리지에서 토큰 복구
  useEffect(() => {
    const restoreAuth = async () => {
      try {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        
        if (accessToken && refreshToken) {
          // 토큰 유효성 검증
          try {
            const user = await authApi.getProfile()
            dispatch({
              type: 'RESTORE_AUTH',
              payload: {
                user,
                accessToken,
                refreshToken
              }
            })
          } catch (error) {
            // 프로필 가져오기 실패 시 토큰 제거
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            dispatch({ type: 'LOGOUT' })
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth restoration failed:', error)
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    restoreAuth()
  }, [])

  // 토큰 자동 refresh
  useEffect(() => {
    if (!state.refreshToken) return

    const refreshInterval = setInterval(async () => {
      try {
        await refreshToken()
      } catch (error) {
        console.error('Auto refresh failed:', error)
        // 자동 refresh 실패 시 로그아웃
        logout()
      }
    }, 14 * 60 * 1000) // 14분마다 refresh (토큰 만료 1분 전)

    return () => clearInterval(refreshInterval)
  }, [state.refreshToken])

  // 로그인 함수
  const login = async (username: string, password: string) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      
      const response = await authApi.login({ username, password })
      
      // 로컬 스토리지에 토큰 저장
      localStorage.setItem('access_token', response.token)
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token)
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          ...response,
          access_token: response.token
        }
      })
    } catch (error: any) {
      const errorMessage = error.message || 'Login failed'
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage
      })
      throw error
    }
  }

  // 로그아웃 함수
  const logout = () => {
    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    
    // API 호출하여 서버 측 토큰 무효화 (선택사항)
    try {
      authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
    
    dispatch({ type: 'LOGOUT' })
  }

  // 토큰 refresh 함수
  const refreshToken = async () => {
    try {
      dispatch({ type: 'REFRESH_START' })
      
      const response = await authApi.refreshToken()
      
              // 새로운 access token 저장
        localStorage.setItem('access_token', response.token)
        
        dispatch({
          type: 'REFRESH_SUCCESS',
          payload: {
            ...response,
            access_token: response.token
          }
        })
    } catch (error: any) {
      console.error('Token refresh failed:', error)
      dispatch({ type: 'REFRESH_FAILURE' })
      throw error
    }
  }

  // 에러 클리어 함수
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    state,
    login,
    logout,
    refreshToken,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
