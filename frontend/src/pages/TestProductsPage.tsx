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
} from '@ionic/react'
import { productsApi, Product, ProductCreateRequest } from '@/api'
import ImageUpload, { ImageFile } from '@/components/ImageUpload'

const TestProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  
  // Form states
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    image_url: '',
  })

  // Image upload state
  const [images, setImages] = useState<ImageFile[]>([])

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const showMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  // 상품 목록 조회
  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await productsApi.list({
        page: 1,
        page_size: 20,
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
      })
      setProducts(response.results)
      showMessage(`${response.count}개의 상품을 조회했습니다.`)
    } catch (error) {
      showMessage('상품 목록 조회에 실패했습니다.')
      console.error('Fetch products error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상품 상세 조회
  const fetchProductDetail = async (id: number) => {
    setLoading(true)
    try {
      const product = await productsApi.detail(id)
      setSelectedProduct(product)
      showMessage('상품 상세 정보를 조회했습니다.')
    } catch (error) {
      showMessage('상품 상세 조회에 실패했습니다.')
      console.error('Fetch product detail error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상품 생성
  const createProduct = async () => {
    if (!formData.name || !formData.description || formData.price <= 0) {
      showMessage('필수 정보를 입력해주세요.')
      return
    }

    if (images.length === 0) {
      showMessage('최소 1개의 이미지를 업로드해주세요.')
      return
    }

    setLoading(true)
    try {
      // FormData 생성
      const formDataToSend = new FormData()
      
      // 기본 상품 정보
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('category', formData.category)
      formDataToSend.append('stock', formData.stock.toString())
      formDataToSend.append('is_active', 'true')
      
      // 이미지들 추가
      images.forEach((image, index) => {
        formDataToSend.append(`images[${index}][image]`, image.file)
        formDataToSend.append(`images[${index}][alt_text]`, image.altText)
        formDataToSend.append(`images[${index}][order]`, image.order.toString())
        formDataToSend.append(`images[${index}][is_main]`, image.isMain.toString())
      })

      // API 호출 (FormData 사용)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newProduct = await response.json()
      setProducts(prev => [newProduct, ...prev])
      
      // 폼 초기화
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        image_url: '',
      })
      setImages([])
      
      showMessage('상품이 생성되었습니다.')
    } catch (error) {
      showMessage('상품 생성에 실패했습니다.')
      console.error('Create product error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상품 수정
  const updateProduct = async (id: number) => {
    if (!selectedProduct) return

    setLoading(true)
    try {
      const updatedProduct = await productsApi.update(id, {
        name: selectedProduct.name,
        description: selectedProduct.description,
        price: selectedProduct.price,
        category: selectedProduct.category,
        stock: selectedProduct.stock,
      })
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      showMessage('상품이 수정되었습니다.')
    } catch (error) {
      showMessage('상품 수정에 실패했습니다.')
      console.error('Update product error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 상품 삭제
  const deleteProduct = async (id: number) => {
    setLoading(true)
    try {
      await productsApi.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
      if (selectedProduct?.id === id) {
        setSelectedProduct(null)
      }
      showMessage('상품이 삭제되었습니다.')
    } catch (error) {
      showMessage('상품 삭제에 실패했습니다.')
      console.error('Delete product error:', error)
    } finally {
      setLoading(false)
    }
  }

  // 초기 로드
  useEffect(() => {
    fetchProducts()
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Products API Test</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {/* 검색 및 필터 */}
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>검색 및 필터</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonInput
                      label="검색어"
                      value={searchQuery}
                      onIonInput={(e) => setSearchQuery(e.detail.value!)}
                      placeholder="상품명으로 검색"
                    />
                  </IonItem>
                  <IonItem>
                    <IonSelect
                      label="카테고리"
                      value={selectedCategory}
                      onIonChange={(e) => setSelectedCategory(e.detail.value)}
                      placeholder="카테고리 선택"
                    >
                      <IonSelectOption value="">전체</IonSelectOption>
                      <IonSelectOption value="electronics">전자제품</IonSelectOption>
                      <IonSelectOption value="clothing">의류</IonSelectOption>
                      <IonSelectOption value="books">도서</IonSelectOption>
                    </IonSelect>
                  </IonItem>
                  <IonButton expand="block" onClick={fetchProducts} disabled={loading}>
                    {loading ? <IonSpinner /> : '검색'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 상품 생성 폼 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>상품 생성</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonInput
                      label="상품명"
                      value={formData.name}
                      onIonInput={(e) => setFormData(prev => ({ ...prev, name: e.detail.value! }))}
                      placeholder="상품명 입력"
                    />
                  </IonItem>
                  <IonItem>
                    <IonTextarea
                      label="상품 설명"
                      value={formData.description}
                      onIonInput={(e) => setFormData(prev => ({ ...prev, description: e.detail.value! }))}
                      placeholder="상품 설명 입력"
                      rows={3}
                    />
                  </IonItem>
                  <IonItem>
                    <IonInput
                      type="number"
                      label="가격"
                      value={formData.price}
                      onIonInput={(e) => setFormData(prev => ({ ...prev, price: Number(e.detail.value!) }))}
                      placeholder="가격 입력"
                    />
                  </IonItem>
                  <IonItem>
                    <IonInput
                      label="카테고리"
                      value={formData.category}
                      onIonInput={(e) => setFormData(prev => ({ ...prev, category: e.detail.value! }))}
                      placeholder="카테고리 입력"
                    />
                  </IonItem>
                  <IonItem>
                    <IonInput
                      type="number"
                      label="재고"
                      value={formData.stock}
                      onIonInput={(e) => setFormData(prev => ({ ...prev, stock: Number(e.detail.value!) }))}
                      placeholder="재고 수량"
                    />
                  </IonItem>
                  
                  {/* 이미지 업로드 컴포넌트 */}
                  <ImageUpload
                    images={images}
                    onImagesChange={setImages}
                    maxImages={10}
                    loading={loading}
                  />
                  
                  <IonButton expand="block" onClick={createProduct} disabled={loading}>
                    {loading ? <IonSpinner /> : '상품 생성'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 상품 목록 */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>상품 목록</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {products.map((product) => (
                      <IonItem key={product.id}>
                        <IonLabel>
                          <h3>{product.name}</h3>
                          <p>{product.description}</p>
                          <p>가격: ₩{product.price.toLocaleString()}</p>
                          <p>재고: {product.stock}</p>
                          {/* 이미지 정보는 백엔드 응답에 따라 표시 */}
                        </IonLabel>
                        <IonButton 
                          slot="end" 
                          size="small" 
                          onClick={() => fetchProductDetail(product.id)}
                        >
                          상세
                        </IonButton>
                        <IonButton 
                          slot="end" 
                          size="small" 
                          color="danger"
                          onClick={() => deleteProduct(product.id)}
                        >
                          삭제
                        </IonButton>
                      </IonItem>
                    ))}
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* 선택된 상품 상세 */}
            {selectedProduct && (
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>상품 상세 정보</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonItem>
                      <IonInput
                        label="상품명"
                        value={selectedProduct.name}
                        onIonInput={(e) => setSelectedProduct(prev => prev ? { ...prev, name: e.detail.value! } : null)}
                      />
                    </IonItem>
                    <IonItem>
                      <IonTextarea
                        label="설명"
                        value={selectedProduct.description}
                        onIonInput={(e) => setSelectedProduct(prev => prev ? { ...prev, description: e.detail.value! } : null)}
                      />
                    </IonItem>
                    <IonItem>
                      <IonInput
                        type="number"
                        label="가격"
                        value={selectedProduct.price}
                        onIonInput={(e) => setSelectedProduct(prev => prev ? { ...prev, price: Number(e.detail.value!) } : null)}
                      />
                    </IonItem>
                    <IonButton 
                      expand="block" 
                      onClick={() => updateProduct(selectedProduct.id)}
                      disabled={loading}
                    >
                      {loading ? <IonSpinner /> : '상품 수정'}
                    </IonButton>
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

export default TestProductsPage
