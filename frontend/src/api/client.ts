// This file is deprecated. Use http.ts instead.
// Import from the new location:
// import { httpClient } from '@/api/http'

import { httpClient } from './http'

// Re-export for backward compatibility
export const apiClient = httpClient

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const apiEndpoints = {
  auth: {
    login: '/auth/login/',
    register: '/auth/register/',
    profile: '/auth/profile/',
    refresh: '/auth/token/refresh/',
  },
  products: {
    list: '/products/',
    detail: (id: number) => `/products/${id}/`,
    search: '/products/search/',
  },
  orders: {
    list: '/orders/',
    detail: (id: number) => `/orders/${id}/`,
    create: '/orders/create/',
  },
  carts: {
    view: '/carts/',
    add: '/carts/add/',
    remove: (id: number) => `/carts/remove/${id}/`,
  },
  addresses: {
    list: '/addresses/',
    detail: (id: number) => `/addresses/${id}/`,
    create: '/addresses/create/',
  },
  upload: {
    file: '/upload/file/',
    image: '/upload/image/',
    files: '/upload/files/',
    images: '/upload/images/',
    info: '/upload/info/',
  },
}

export default apiClient
