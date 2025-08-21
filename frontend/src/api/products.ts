import { httpClient } from './http'

// Types
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url?: string
  created_at: string
  updated_at: string
}

export interface ProductCreateRequest {
  name: string
  description: string
  price: number
  category: string
  stock: number
  image_url?: string
}

export interface ProductUpdateRequest extends Partial<ProductCreateRequest> {}

export interface ProductListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Product[]
}

export interface ProductListParams {
  page?: number
  page_size?: number
  search?: string
  category?: string
  ordering?: string
}

// API Functions
export const productsApi = {
  /**
   * 상품 목록 조회
   */
  list: async (params?: ProductListParams): Promise<ProductListResponse> => {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
      if (params?.search) searchParams.append('search', params.search)
      if (params?.category) searchParams.append('category', params.category)
      if (params?.ordering) searchParams.append('ordering', params.ordering)

      const queryString = searchParams.toString()
      const url = `/products/${queryString ? `?${queryString}` : ''}`
      
      const response = await httpClient.get<ProductListResponse>(url)
      return response.data
    } catch (error) {
      console.error('Products list API error:', error)
      throw error
    }
  },

  /**
   * 상품 상세 조회
   */
  detail: async (id: number): Promise<Product> => {
    try {
      const response = await httpClient.get<Product>(`/products/${id}/`)
      return response.data
    } catch (error) {
      console.error('Product detail API error:', error)
      throw error
    }
  },

  /**
   * 상품 생성
   */
  create: async (data: ProductCreateRequest): Promise<Product> => {
    try {
      const response = await httpClient.post<Product>('/products/', data)
      return response.data
    } catch (error) {
      console.error('Product create API error:', error)
      throw error
    }
  },

  /**
   * 상품 수정
   */
  update: async (id: number, data: ProductUpdateRequest): Promise<Product> => {
    try {
      const response = await httpClient.patch<Product>(`/products/${id}/`, data)
      return response.data
    } catch (error) {
      console.error('Product update API error:', error)
      throw error
    }
  },

  /**
   * 상품 삭제
   */
  delete: async (id: number): Promise<void> => {
    try {
      await httpClient.delete(`/products/${id}/`)
    } catch (error) {
      console.error('Product delete API error:', error)
      throw error
    }
  },

  /**
   * 상품 검색
   */
  search: async (query: string, params?: Omit<ProductListParams, 'search'>): Promise<ProductListResponse> => {
    return productsApi.list({ ...params, search: query })
  },

  /**
   * 카테고리별 상품 목록
   */
  byCategory: async (category: string, params?: Omit<ProductListParams, 'category'>): Promise<ProductListResponse> => {
    return productsApi.list({ ...params, category })
  }
}

export default productsApi
