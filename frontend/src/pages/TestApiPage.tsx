import React from 'react'
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonNote,
} from '@ionic/react'
import { cube, cart, receipt, storefront, settings } from 'ionicons/icons'
import { useNavigate } from 'react-router-dom'

const TestApiPage: React.FC = () => {
  const navigate = useNavigate()

  const apiModules = [
    {
      title: 'Products API',
      description: '상품 관리 API 테스트',
      icon: cube,
      path: '/test/products',
      features: [
        '상품 목록 조회',
        '상품 상세 조회',
        '상품 생성/수정/삭제',
        '상품 검색 및 필터링'
      ]
    },
    {
      title: 'Carts API',
      description: '장바구니 관리 API 테스트',
      icon: cart,
      path: '/test/carts',
      features: [
        '장바구니 조회',
        '상품 추가/삭제',
        '수량 변경',
        '일괄 작업'
      ]
    },
    {
      title: 'Orders API',
      description: '주문 관리 API 테스트',
      icon: receipt,
      path: '/test/orders',
      features: [
        '주문 생성',
        '주문 내역 조회',
        '주문 상태 변경',
        '주문 취소'
      ]
    }
  ]

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>API Test Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent fullscreen>
        <div style={{ padding: '20px' }}>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={storefront} style={{ marginRight: '8px' }} />
                      MarketOn API 테스트 센터
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonNote>
                      각 API 모듈의 기능을 테스트할 수 있는 페이지들입니다. 
                      백엔드 서버가 실행 중인지 확인하세요. (http://localhost:8000)
                    </IonNote>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow>
              {apiModules.map((module, index) => (
                <IonCol key={index} size="12" sizeMd="6" sizeLg="4">
                  <IonCard button onClick={() => navigate(module.path)}>
                    <IonCardHeader>
                      <IonCardTitle>
                        <IonIcon 
                          icon={module.icon} 
                          style={{ marginRight: '8px', color: '#3880ff' }} 
                        />
                        {module.title}
                      </IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p style={{ marginBottom: '12px', color: '#666' }}>
                        {module.description}
                      </p>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <strong>주요 기능:</strong>
                        <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                          {module.features.map((feature, featureIndex) => (
                            <li key={featureIndex} style={{ fontSize: '14px', margin: '4px 0' }}>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <IonButton 
                        expand="block" 
                        fill="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(module.path)
                        }}
                      >
                        테스트 시작
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>

            <IonRow>
              <IonCol size="12">
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      <IonIcon icon={settings} style={{ marginRight: '8px' }} />
                      API 설정 정보
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <h4>백엔드 설정</h4>
                          <IonNote>
                            <p><strong>Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/'}</p>
                            <p><strong>인증:</strong> JWT Token 기반</p>
                            <p><strong>CORS:</strong> 개발환경에서 허용</p>
                          </IonNote>
                        </IonCol>
                        <IonCol size="12" sizeMd="6">
                          <h4>프론트엔드 설정</h4>
                          <IonNote>
                            <p><strong>Framework:</strong> React + Ionic</p>
                            <p><strong>HTTP Client:</strong> Axios</p>
                            <p><strong>State Management:</strong> React Hooks</p>
                          </IonNote>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default TestApiPage
