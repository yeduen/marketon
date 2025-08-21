import { httpClient } from './http'
import { Product } from './products'

// Types
export interface OrderItem {
  id: number
  product: Product
  quantity: number
  unit_price: number
  total_price: number
}

export interface Order {
  id: number
  order_number: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  total_items: number
  total_amount: number
  shipping_address: string
  payment_method: string
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  created_at: string
  updated_at: string
  estimated_delivery_date?: string
}

export interface CreateOrderRequest {
  items: Array<{
    product_id: number
    quantity: number
  }>
  shipping_address: string
  payment_method: string
  notes?: string
}

export interface OrderListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Order[]
}

export interface OrderListParams {
  page?: number
  page_size?: number
  status?: Order['status']
  ordering?: string
  date_from?: string
  date_to?: string
}

export interface OrderStatusUpdateRequest {
  status: Order['status']
}

// API Functions
export const ordersApi = {
  /**
   * 주문 생성
   */
  create: async (data: CreateOrderRequest): Promise<Order> => {
    try {
      const response = await httpClient.post<Order>('/orders/', data)
      return response.data
    } catch (error) {
      console.error('Order create API error:', error)
      throw error
    }
  },

  /**
   * 장바구니에서 주문 생성
   */
  createFromCart: async (data: Omit<CreateOrderRequest, 'items'>): Promise<Order> => {
    try {
      const response = await httpClient.post<Order>('/orders/from-cart/', data)
      return response.data
    } catch (error) {
      console.error('Order create from cart API error:', error)
      throw error
    }
  },

  /**
   * 주문 목록 조회 (주문 내역)
   */
  list: async (params?: OrderListParams): Promise<OrderListResponse> => {
    try {
      const searchParams = new URLSearchParams()
      
      if (params?.page) searchParams.append('page', params.page.toString())
      if (params?.page_size) searchParams.append('page_size', params.page_size.toString())
      if (params?.status) searchParams.append('status', params.status)
      if (params?.ordering) searchParams.append('ordering', params.ordering)
      if (params?.date_from) searchParams.append('date_from', params.date_from)
      if (params?.date_to) searchParams.append('date_to', params.date_to)

      const queryString = searchParams.toString()
      const url = `/orders/${queryString ? `?${queryString}` : ''}`
      
      const response = await httpClient.get<OrderListResponse>(url)
      return response.data
    } catch (error) {
      console.error('Orders list API error:', error)
      throw error
    }
  },

  /**
   * 주문 상세 조회
   */
  detail: async (id: number): Promise<Order> => {
    try {
      const response = await httpClient.get<Order>(`/orders/${id}/`)
      return response.data
    } catch (error) {
      console.error('Order detail API error:', error)
      throw error
    }
  },

  /**
   * 주문 번호로 조회
   */
  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    try {
      const response = await httpClient.get<Order>(`/orders/by-number/${orderNumber}/`)
      return response.data
    } catch (error) {
      console.error('Order get by number API error:', error)
      throw error
    }
  },

  /**
   * 주문 상태 변경
   */
  updateStatus: async (id: number, data: OrderStatusUpdateRequest): Promise<Order> => {
    try {
      const response = await httpClient.patch<Order>(`/orders/${id}/status/`, data)
      return response.data
    } catch (error) {
      console.error('Order update status API error:', error)
      throw error
    }
  },

  /**
   * 주문 취소
   */
  cancel: async (id: number, reason?: string): Promise<Order> => {
    try {
      const response = await httpClient.post<Order>(`/orders/${id}/cancel/`, { reason })
      return response.data
    } catch (error) {
      console.error('Order cancel API error:', error)
      throw error
    }
  },

  /**
   * 최근 주문 조회
   */
  recent: async (limit: number = 5): Promise<Order[]> => {
    try {
      const response = await httpClient.get<Order[]>(`/orders/recent/?limit=${limit}`)
      return response.data
    } catch (error) {
      console.error('Recent orders API error:', error)
      throw error
    }
  },

  /**
   * 주문 통계
   */
  statistics: async (period?: 'week' | 'month' | 'year'): Promise<{
    total_orders: number
    total_amount: number
    status_breakdown: Record<Order['status'], number>
    recent_orders: Order[]
  }> => {
    try {
      const url = `/orders/statistics/${period ? `?period=${period}` : ''}`
      const response = await httpClient.get(url)
      return response.data
    } catch (error) {
      console.error('Order statistics API error:', error)
      throw error
    }
  }
}

export default ordersApi
