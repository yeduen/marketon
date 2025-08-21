import { httpClient } from './http'
import { Product } from './products'

// Types
export interface CartItem {
  id: number
  product: Product
  quantity: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface Cart {
  id: number
  items: CartItem[]
  total_items: number
  total_price: number
  created_at: string
  updated_at: string
}

export interface AddToCartRequest {
  product_id: number
  quantity: number
}

export interface UpdateCartItemRequest {
  quantity: number
}

// API Functions
export const cartsApi = {
  /**
   * 장바구니 조회
   */
  get: async (): Promise<Cart> => {
    try {
      const response = await httpClient.get<Cart>('/carts/')
      return response.data
    } catch (error) {
      console.error('Cart get API error:', error)
      throw error
    }
  },

  /**
   * 장바구니에 상품 추가
   */
  addItem: async (data: AddToCartRequest): Promise<CartItem> => {
    try {
      const response = await httpClient.post<CartItem>('/carts/items/', data)
      return response.data
    } catch (error) {
      console.error('Cart add item API error:', error)
      throw error
    }
  },

  /**
   * 장바구니 아이템 수량 변경
   */
  updateItem: async (itemId: number, data: UpdateCartItemRequest): Promise<CartItem> => {
    try {
      const response = await httpClient.patch<CartItem>(`/carts/items/${itemId}/`, data)
      return response.data
    } catch (error) {
      console.error('Cart update item API error:', error)
      throw error
    }
  },

  /**
   * 장바구니 아이템 삭제
   */
  removeItem: async (itemId: number): Promise<void> => {
    try {
      await httpClient.delete(`/carts/items/${itemId}/`)
    } catch (error) {
      console.error('Cart remove item API error:', error)
      throw error
    }
  },

  /**
   * 장바구니 전체 비우기
   */
  clear: async (): Promise<void> => {
    try {
      await httpClient.delete('/carts/clear/')
    } catch (error) {
      console.error('Cart clear API error:', error)
      throw error
    }
  },

  /**
   * 장바구니 아이템 수량 증가
   */
  increaseQuantity: async (itemId: number): Promise<CartItem> => {
    try {
      const response = await httpClient.post<CartItem>(`/carts/items/${itemId}/increase/`)
      return response.data
    } catch (error) {
      console.error('Cart increase quantity API error:', error)
      throw error
    }
  },

  /**
   * 장바구니 아이템 수량 감소
   */
  decreaseQuantity: async (itemId: number): Promise<CartItem> => {
    try {
      const response = await httpClient.post<CartItem>(`/carts/items/${itemId}/decrease/`)
      return response.data
    } catch (error) {
      console.error('Cart decrease quantity API error:', error)
      throw error
    }
  },

  /**
   * 여러 상품을 한번에 장바구니에 추가
   */
  addMultipleItems: async (items: AddToCartRequest[]): Promise<CartItem[]> => {
    try {
      const response = await httpClient.post<CartItem[]>('/carts/items/bulk/', { items })
      return response.data
    } catch (error) {
      console.error('Cart add multiple items API error:', error)
      throw error
    }
  },

  /**
   * 선택된 아이템들 삭제
   */
  removeMultipleItems: async (itemIds: number[]): Promise<void> => {
    try {
      await httpClient.delete('/carts/items/bulk/', { data: { item_ids: itemIds } })
    } catch (error) {
      console.error('Cart remove multiple items API error:', error)
      throw error
    }
  }
}

export default cartsApi
