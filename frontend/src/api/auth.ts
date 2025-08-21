import { httpClient } from './http'

// Types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  password_confirm: string
}

export interface AuthResponse {
  token: string
  refresh_token?: string
  user: {
    id: number
    username: string
    email: string
  }
}

export interface RefreshRequest {
  refresh_token: string
}

// Auth API functions
export const authApi = {
  /**
   * User login
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post('/auth/login/', credentials)
      const data = response.data
      
      // Store tokens
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
      
      return data
    } catch (error: any) {
      console.error('🔐 Login failed:', error.response?.data || error.message)
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        throw new Error('Invalid credentials. Please check your username and password.')
      } else if (error.response?.status === 404) {
        throw new Error('Login endpoint not found. Please check backend configuration.')
      } else if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.')
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.')
      } else {
        throw new Error(error.response?.data?.message || 'Login failed. Please try again.')
      }
    }
  },

  /**
   * User registration
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await httpClient.post('/auth/register/', userData)
      const data = response.data
      
      // Store tokens if auto-login is enabled
      if (data.token) {
        localStorage.setItem('auth_token', data.token)
      }
      if (data.refresh_token) {
        localStorage.setItem('refresh_token', data.refresh_token)
      }
      
      return data
    } catch (error: any) {
      console.error('📝 Registration failed:', error.response?.data || error.message)
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errors = error.response.data
        if (errors.username) {
          throw new Error(`Username: ${errors.username.join(', ')}`)
        } else if (errors.email) {
          throw new Error(`Email: ${errors.email.join(', ')}`)
        } else if (errors.password) {
          throw new Error(`Password: ${errors.password.join(', ')}`)
        } else if (errors.non_field_errors) {
          throw new Error(errors.non_field_errors.join(', '))
        } else {
          throw new Error('Please check your input and try again.')
        }
      } else if (error.response?.status === 404) {
        throw new Error('Registration endpoint not found. Please check backend configuration.')
      } else if (!error.response) {
        throw new Error('Network error. Please check your connection.')
      } else {
        throw new Error(error.response?.data?.message || 'Registration failed. Please try again.')
      }
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ token: string }> {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await httpClient.post('/auth/token/refresh/', {
        refresh_token: refreshToken
      })
      
      const { token } = response.data
      localStorage.setItem('auth_token', token)
      
      return { token }
    } catch (error: any) {
      console.error('🔄 Token refresh failed:', error.response?.data || error.message)
      
      // Clear invalid tokens
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      
      throw new Error('Token refresh failed. Please login again.')
    }
  },

  /**
   * Get user profile
   */
  async getProfile(): Promise<any> {
    try {
      const response = await httpClient.get('/auth/profile/')
      return response.data
    } catch (error: any) {
      console.error('👤 Profile fetch failed:', error.response?.data || error.message)
      throw error
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    console.log('👋 User logged out')
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }
}

// Export default for convenience
export default authApi
