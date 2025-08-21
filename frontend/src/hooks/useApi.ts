import { useState, useEffect } from 'react'
import { httpClient } from '@/api/http'

interface ApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): ApiState<T> & {
  refetch: () => Promise<void>
  mutate: (data: T) => void
} {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const { immediate = true, onSuccess, onError } = options

  const fetchData = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await httpClient.get(endpoint)
      const newData = response.data
      
      setState({
        data: newData,
        loading: false,
        error: null,
      })
      
      onSuccess?.(newData)
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      
      setState({
        data: null,
        loading: false,
        error: errorObj,
      })
      
      onError?.(errorObj)
    }
  }

  const mutate = (newData: T) => {
    setState(prev => ({ ...prev, data: newData }))
  }

  useEffect(() => {
    if (immediate) {
      fetchData()
    }
  }, [endpoint, immediate])

  return {
    ...state,
    refetch: fetchData,
    mutate,
  }
}

// Specialized hooks for common operations
export function useProducts() {
  return useApi('/products/')
}

export function useProduct(id: number) {
  return useApi(`/products/${id}/`)
}

export function useOrders() {
  return useApi('/orders/')
}

export function useCart() {
  return useApi('/carts/')
}
