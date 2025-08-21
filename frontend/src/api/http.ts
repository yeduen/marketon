import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'

// API Base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

// Create axios instance
export const httpClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data)
    }
    
    return response
  },
  async (error: AxiosError) => {
    // Log error details
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data,
      message: error.message,
    })
    
    // Handle common errors
    if (error.response?.status === 401) {
      // 토큰 만료 시 자동 갱신 시도
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          // refresh token으로 새로운 access token 요청
          const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh: refreshToken }),
          })
          
          if (response.ok) {
            const data = await response.json()
            localStorage.setItem('access_token', data.access)
            
            // 원래 요청 재시도
            if (error.config) {
              error.config.headers.Authorization = `Bearer ${data.access}`
              return httpClient.request(error.config)
            }
          } else {
            // refresh 실패 시 로그아웃
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            if (typeof window !== 'undefined') {
              console.warn('🔒 Token refresh failed. Please login again.')
              if (window.location.pathname !== '/login') {
                window.location.href = '/login'
              }
            }
          }
        } catch (refreshError) {
          console.error('❌ Token refresh error:', refreshError)
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          if (typeof window !== 'undefined') {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
        }
      } else {
        // refresh token이 없으면 바로 로그아웃
        localStorage.removeItem('access_token')
        if (typeof window !== 'undefined') {
          console.warn('🔒 No refresh token. Please login again.')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

// Export default instance
export default httpClient

// Export types for convenience
export type { AxiosInstance, AxiosResponse, AxiosError }
