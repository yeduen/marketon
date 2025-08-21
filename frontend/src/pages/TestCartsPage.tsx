import React, { useState, useEffect } from 'react'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonInput,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonSpinner,
  IonIcon,
  IonCheckbox,
  IonNote,
} from '@ionic/react'
import { add, remove, trash, refresh } from 'ionicons/icons'
import { cartsApi, productsApi, Cart, CartItem, Product } from '@/api'

const TestCartsPage: React.FC = () => {
  const [cart, setCart] = useState<Cart | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Add to cart form
  const [productId, setProductId] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)

  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  const showMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // 장바구니 조회
  const fetchCart = async () => {
    setLoading(true)
    try {
      const cartData = await cartsApi.get()
      setCart(cartData)
      showMessage('장바구니를 조회했습니다.')
    } catch (error) {
      showMessage('장바구니 조회에 실패했습니다.')
      console.error('Fetch cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상품 목록 조회 (장바구니에 추가할 상품 선택용)
  const fetchProducts = async () => {
    try {
      const response = await productsApi.list({ page_size: 10 })
      setProducts(response.results)
    } catch (error) {
      console.error('Fetch products error:', error)
    }
  }

  // 장바구니에 상품 추가
  const addToCart = async () => {
    if (!productId || quantity <= 0) {
      showMessage('상품과 수량을 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      await cartsApi.addItem({ product_id: productId, quantity })
      await fetchCart() // 장바구니 새로고침
      setProductId(0)
      setQuantity(1)
      showMessage('상품이 장바구니에 추가되었습니다.')
    } catch (error) {
      showMessage('장바구니 추가에 실패했습니다.')
      console.error('Add to cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 수량 직접 변경
  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(itemId)
      return
    }

    setLoading(true)
    try {
      await cartsApi.updateItem(itemId, { quantity: newQuantity })
      await fetchCart()
      showMessage('수량이 변경되었습니다.')
    } catch (error) {
      showMessage('수량 변경에 실패했습니다.')
      console.error('Update quantity error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 수량 증가
  const increaseQuantity = async (itemId: number) => {
    setLoading(true)
    try {
      await cartsApi.increaseQuantity(itemId)
      await fetchCart()
      showMessage('수량이 증가되었습니다.')
    } catch (error) {
      showMessage('수량 증가에 실패했습니다.')
      console.error('Increase quantity error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 수량 감소
  const decreaseQuantity = async (itemId: number) => {
    setLoading(true)
    try {
      await cartsApi.decreaseQuantity(itemId)
      await fetchCart()
      showMessage('수량이 감소되었습니다.')
    } catch (error) {
      showMessage('수량 감소에 실패했습니다.')
      console.error('Decrease quantity error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 장바구니에서 상품 제거
  const removeFromCart = async (itemId: number) => {
    setLoading(true)
    try {
      await cartsApi.removeItem(itemId)
      await fetchCart()
      showMessage('상품이 장바구니에서 제거되었습니다.')
    } catch (error) {
      showMessage('상품 제거에 실패했습니다.')
      console.error('Remove from cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 장바구니 전체 비우기
  const clearCart = async () => {
    setLoading(true)
    try {
      await cartsApi.clear()
      await fetchCart()
      showMessage('장바구니가 비워졌습니다.')
    } catch (error) {
      showMessage('장바구니 비우기에 실패했습니다.')
      console.error('Clear cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 선택된 상품들 삭제
  const removeSelectedItems = async () => {
    if (selectedItems.size === 0) {
      showMessage('삭제할 상품을 선택해주세요.')
      return
    }

    setLoading(true)
    try {
      await cartsApi.removeMultipleItems(Array.from(selectedItems))
      await fetchCart()
      setSelectedItems(new Set())
      showMessage(`${selectedItems.size}개 상품이 삭제되었습니다.`)
    } catch (error) {
      showMessage('선택 상품 삭제에 실패했습니다.')
      console.error('Remove selected items error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 체크박스 토글
  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (!cart) return
    
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cart.items.map(item => item.id)))
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchCart()
    fetchProducts()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carts API Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {/* 상품 추가 폼 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>장바구니에 상품 추가</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel>상품 선택</IonLabel>
                    <select 
                      value={productId} 
                      onChange={(e) => setProductId(Number(e.target.value))}
                      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                      <option value={0}>상품을 선택하세요</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (₩{product.price.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </IonItem>
                  <IonItem>
                    <IonInput
                      type="number"
                      label="수량"
                      value={quantity}
                      min={1}
                      onIonInput={(e) => setQuantity(Number(e.detail.value!))}
                    />
                  </IonItem>
                  <IonButton expand="block" onClick={addToCart} disabled={loading}>
                    {loading ? <IonSpinner /> : '장바구니에 추가'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 장바구니 현황 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>
                    장바구니 현황 
                    <IonButton 
                      fill="clear" 
                      size="small" 
                      onClick={fetchCart}
                      style={{ float: 'right' }}
                    >
                      <IonIcon icon={refresh} />
                    </IonButton>
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {cart ? (
                    <>
                      <IonNote>
                        총 {cart.total_items}개 상품 | 합계: ₩{cart.total_price.toLocaleString()}
                      </IonNote>
                      
                      {cart.items.length > 0 && (
                        <div style={{ margin: '10px 0' }}>
                          <IonButton 
                            size="small" 
                            fill="outline" 
                            onClick={toggleSelectAll}
                          >
                            {selectedItems.size === cart.items.length ? '전체 해제' : '전체 선택'}
                          </IonButton>
                          <IonButton 
                            size="small" 
                            color="danger" 
                            onClick={removeSelectedItems}
                            disabled={selectedItems.size === 0}
                            style={{ marginLeft: '8px' }}
                          >
                            선택 삭제
                          </IonButton>
                          <IonButton 
                            size="small" 
                            color="danger" 
                            fill="outline"
                            onClick={clearCart}
                            style={{ marginLeft: '8px' }}
                          >
                            전체 비우기
                          </IonButton>
                        </div>
                      )}
                    </>
                  ) : (
                    <IonNote>장바구니를 불러오는 중...</IonNote>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 장바구니 상품 목록 */}
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>장바구니 상품</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  {cart && cart.items.length > 0 ? (
                    <IonList>
                      {cart.items.map((item: CartItem) => (
                        <IonItem key={item.id}>
                          <IonCheckbox
                            checked={selectedItems.has(item.id)}
                            onIonChange={() => toggleItemSelection(item.id)}
                            style={{ marginRight: '10px' }}
                          />
                          <IonLabel>
                            <h3>{item.product.name}</h3>
                            <p>단가: ₩{item.product.price.toLocaleString()}</p>
                            <p>총액: ₩{item.total_price.toLocaleString()}</p>
                          </IonLabel>
                          
                          <div slot="end" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <IonButton 
                              size="small" 
                              fill="clear"
                              onClick={() => decreaseQuantity(item.id)}
                            >
                              <IonIcon icon={remove} />
                            </IonButton>
                            
                            <IonInput
                              type="number"
                              value={item.quantity}
                              min={1}
                              style={{ width: '60px', textAlign: 'center' }}
                              onIonBlur={(e) => {
                                const newQuantity = Number(e.target.value)
                                if (newQuantity !== item.quantity) {
                                  updateQuantity(item.id, newQuantity)
                                }
                              }}
                            />
                            
                            <IonButton 
                              size="small" 
                              fill="clear"
                              onClick={() => increaseQuantity(item.id)}
                            >
                              <IonIcon icon={add} />
                            </IonButton>
                            
                            <IonButton 
                              size="small" 
                              color="danger"
                              fill="clear"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <IonIcon icon={trash} />
                            </IonButton>
                          </div>
                        </IonItem>
                      ))}
                    </IonList>
                  ) : (
                    <IonNote>장바구니가 비어있습니다.</IonNote>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
        />
      </IonContent>
    </IonPage>
  )
}

export default TestCartsPage
