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
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonSpinner,
  IonSelect,
  IonSelectOption,
  IonNote,
  IonChip,
  IonIcon,
  IonBadge,
} from '@ionic/react'
import { calendar, card, location, checkmark, close, time } from 'ionicons/icons'
import { ordersApi, Order } from '@/api'

const TestOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Form states for manual order creation - currently unused
  // const [orderForm, setOrderForm] = useState<CreateOrderRequest>({
  //   items: [],
  //   shipping_address: '',
  //   payment_method: 'card',
  //   notes: '',
  // })

  // Quick order from cart form
  const [cartOrderForm, setCartOrderForm] = useState({
    shipping_address: '',
    payment_method: 'card',
    notes: '',
  })

  // Filter states
  const [statusFilter, setStatusFilter] = useState<Order['status'] | ''>('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const showMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // 주문 목록 조회
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await ordersApi.list({
        page: 1,
        page_size: 20,
        status: statusFilter || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
        ordering: '-created_at',
      })
      setOrders(response.results)
      showMessage(`${response.count}개의 주문을 조회했습니다.`)
    } catch (error) {
      showMessage('주문 목록 조회에 실패했습니다.')
      console.error('Fetch orders error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 주문 상세 조회
  const fetchOrderDetail = async (id: number) => {
    setLoading(true)
    try {
      const order = await ordersApi.detail(id)
      setSelectedOrder(order)
      showMessage('주문 상세 정보를 조회했습니다.')
    } catch (error) {
      showMessage('주문 상세 조회에 실패했습니다.')
      console.error('Fetch order detail error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 장바구니에서 주문 생성
  const createOrderFromCart = async () => {
    if (!cartOrderForm.shipping_address) {
      showMessage('배송 주소를 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const newOrder = await ordersApi.createFromCart(cartOrderForm)
      setOrders(prev => [newOrder, ...prev])
      setCartOrderForm({
        shipping_address: '',
        payment_method: 'card',
        notes: '',
      })
      showMessage('주문이 생성되었습니다.')
    } catch (error) {
      showMessage('주문 생성에 실패했습니다.')
      console.error('Create order from cart error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 주문 상태 변경
  const updateOrderStatus = async (id: number, status: Order['status']) => {
    setLoading(true)
    try {
      const updatedOrder = await ordersApi.updateStatus(id, { status })
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o))
      if (selectedOrder?.id === id) {
        setSelectedOrder(updatedOrder)
      }
      showMessage('주문 상태가 변경되었습니다.')
    } catch (error) {
      showMessage('주문 상태 변경에 실패했습니다.')
      console.error('Update order status error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 주문 취소
  const cancelOrder = async (id: number) => {
    setLoading(true)
    try {
      const cancelledOrder = await ordersApi.cancel(id, '고객 요청')
      setOrders(prev => prev.map(o => o.id === id ? cancelledOrder : o))
      if (selectedOrder?.id === id) {
        setSelectedOrder(cancelledOrder)
      }
      showMessage('주문이 취소되었습니다.')
    } catch (error) {
      showMessage('주문 취소에 실패했습니다.')
      console.error('Cancel order error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 주문 상태별 색상
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'confirmed': return 'primary'
      case 'processing': return 'secondary'
      case 'shipped': return 'tertiary'
      case 'delivered': return 'success'
      case 'cancelled': return 'danger'
      default: return 'medium'
    }
  }

  // 주문 상태별 한글명
  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return '대기중'
      case 'confirmed': return '주문확인'
      case 'processing': return '처리중'
      case 'shipped': return '배송중'
      case 'delivered': return '배송완료'
      case 'cancelled': return '취소됨'
      default: return status
    }
  }

  // 결제 상태별 색상
  const getPaymentStatusColor = (status: Order['payment_status']) => {
    switch (status) {
      case 'pending': return 'warning'
      case 'paid': return 'success'
      case 'failed': return 'danger'
      case 'refunded': return 'medium'
      default: return 'medium'
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchOrders()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Orders API Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {/* 필터 및 검색 */}
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>주문 검색 및 필터</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="12" sizeMd="4">
                        <IonItem>
                          <IonSelect
                            label="주문 상태"
                            value={statusFilter}
                            onIonChange={(e) => setStatusFilter(e.detail.value)}
                            placeholder="전체"
                          >
                            <IonSelectOption value="">전체</IonSelectOption>
                            <IonSelectOption value="pending">대기중</IonSelectOption>
                            <IonSelectOption value="confirmed">주문확인</IonSelectOption>
                            <IonSelectOption value="processing">처리중</IonSelectOption>
                            <IonSelectOption value="shipped">배송중</IonSelectOption>
                            <IonSelectOption value="delivered">배송완료</IonSelectOption>
                            <IonSelectOption value="cancelled">취소됨</IonSelectOption>
                          </IonSelect>
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="3">
                        <IonItem>
                          <IonInput
                            type="date"
                            label="시작일"
                            value={dateFrom}
                            onIonInput={(e) => setDateFrom(e.detail.value!)}
                          />
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="3">
                        <IonItem>
                          <IonInput
                            type="date"
                            label="종료일"
                            value={dateTo}
                            onIonInput={(e) => setDateTo(e.detail.value!)}
                          />
                        </IonItem>
                      </IonCol>
                      <IonCol size="12" sizeMd="2">
                        <IonButton expand="block" onClick={fetchOrders} disabled={loading}>
                          {loading ? <IonSpinner /> : '검색'}
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 장바구니에서 주문 생성 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>장바구니에서 주문 생성</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonTextarea
                      label="배송 주소"
                      value={cartOrderForm.shipping_address}
                      onIonInput={(e) => setCartOrderForm(prev => ({ ...prev, shipping_address: e.detail.value! }))}
                      placeholder="배송 주소를 입력하세요"
                      rows={2}
                    />
                  </IonItem>
                  <IonItem>
                    <IonSelect
                      label="결제 방법"
                      value={cartOrderForm.payment_method}
                      onIonChange={(e) => setCartOrderForm(prev => ({ ...prev, payment_method: e.detail.value }))}
                    >
                      <IonSelectOption value="card">신용카드</IonSelectOption>
                      <IonSelectOption value="bank_transfer">계좌이체</IonSelectOption>
                      <IonSelectOption value="cash">무통장입금</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonItem>
                    <IonTextarea
                      label="주문 메모"
                      value={cartOrderForm.notes}
                      onIonInput={(e) => setCartOrderForm(prev => ({ ...prev, notes: e.detail.value! }))}
                      placeholder="배송 요청사항 등"
                      rows={2}
                    />
                  </IonItem>
                  <IonButton expand="block" onClick={createOrderFromCart} disabled={loading}>
                    {loading ? <IonSpinner /> : '장바구니에서 주문하기'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 주문 목록 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>주문 목록</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {orders.map((order) => (
                      <IonItem key={order.id} button onClick={() => fetchOrderDetail(order.id)}>
                        <IonLabel>
                          <h3>
                            #{order.order_number}
                            <IonChip 
                              color={getStatusColor(order.status)} 
                              style={{ marginLeft: '8px' }}
                            >
                              {getStatusText(order.status)}
                            </IonChip>
                          </h3>
                          <p>
                            <IonIcon icon={calendar} style={{ marginRight: '4px' }} />
                            {new Date(order.created_at).toLocaleDateString('ko-KR')}
                          </p>
                          <p>
                            <IonIcon icon={card} style={{ marginRight: '4px' }} />
                            ₩{order.total_amount.toLocaleString()}
                            <IonBadge 
                              color={getPaymentStatusColor(order.payment_status)}
                              style={{ marginLeft: '8px' }}
                            >
                              {order.payment_status}
                            </IonBadge>
                          </p>
                          <p>
                            <IonIcon icon={location} style={{ marginRight: '4px' }} />
                            {order.shipping_address.slice(0, 30)}...
                          </p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                  {orders.length === 0 && (
                    <IonNote>주문 내역이 없습니다.</IonNote>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 선택된 주문 상세 */}
            {selectedOrder && (
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      주문 상세 정보 - #{selectedOrder.order_number}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <h4>주문 정보</h4>
                          <IonItem>
                            <IonLabel>
                              <h3>주문 상태</h3>
                              <IonChip color={getStatusColor(selectedOrder.status)}>
                                {getStatusText(selectedOrder.status)}
                              </IonChip>
                            </IonLabel>
                          </IonItem>
                          <IonItem>
                            <IonLabel>
                              <h3>결제 상태</h3>
                              <IonBadge color={getPaymentStatusColor(selectedOrder.payment_status)}>
                                {selectedOrder.payment_status}
                              </IonBadge>
                            </IonLabel>
                          </IonItem>
                          <IonItem>
                            <IonLabel>
                              <h3>주문일시</h3>
                              <p>{new Date(selectedOrder.created_at).toLocaleString('ko-KR')}</p>
                            </IonLabel>
                          </IonItem>
                          <IonItem>
                            <IonLabel>
                              <h3>총 금액</h3>
                              <p>₩{selectedOrder.total_amount.toLocaleString()}</p>
                            </IonLabel>
                          </IonItem>
                          <IonItem>
                            <IonLabel>
                              <h3>배송 주소</h3>
                              <p>{selectedOrder.shipping_address}</p>
                            </IonLabel>
                          </IonItem>
                        </IonCol>
                        
                        <IonCol size="12" sizeMd="6">
                          <h4>상태 변경</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <IonButton
                              size="small"
                              color="primary"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'confirmed')}
                              disabled={selectedOrder.status === 'confirmed'}
                            >
                              <IonIcon icon={checkmark} slot="start" />
                              주문 확인
                            </IonButton>
                            <IonButton
                              size="small"
                              color="secondary"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                              disabled={selectedOrder.status === 'processing'}
                            >
                              <IonIcon icon={time} slot="start" />
                              처리중으로 변경
                            </IonButton>
                            <IonButton
                              size="small"
                              color="tertiary"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                              disabled={selectedOrder.status === 'shipped'}
                            >
                              배송 시작
                            </IonButton>
                            <IonButton
                              size="small"
                              color="success"
                              onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                              disabled={selectedOrder.status === 'delivered'}
                            >
                              배송 완료
                            </IonButton>
                            <IonButton
                              size="small"
                              color="danger"
                              fill="outline"
                              onClick={() => cancelOrder(selectedOrder.id)}
                              disabled={selectedOrder.status === 'cancelled'}
                            >
                              <IonIcon icon={close} slot="start" />
                              주문 취소
                            </IonButton>
                          </div>
                        </IonCol>
                      </IonRow>
                      
                      <IonRow>
                        <IonCol size="12">
                          <h4>주문 상품</h4>
                          <IonList>
                            {selectedOrder.items.map((item) => (
                              <IonItem key={item.id}>
                                <IonLabel>
                                  <h3>{item.product.name}</h3>
                                  <p>수량: {item.quantity}개</p>
                                  <p>단가: ₩{item.unit_price.toLocaleString()}</p>
                                  <p>소계: ₩{item.total_price.toLocaleString()}</p>
                                </IonLabel>
                              </IonItem>
                            ))}
                          </IonList>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            )}
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

export default TestOrdersPage
