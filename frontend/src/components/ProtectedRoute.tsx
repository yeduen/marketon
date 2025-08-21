import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { IonLoading, IonContent, IonText } from '@ionic/react'

interface ProtectedRouteProps {
  component: React.ComponentType<any>
  fallbackPath?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  fallbackPath = '/login'
}) => {
  const { state } = useAuth()
  const { isAuthenticated, isLoading } = state
  const location = useLocation()

  // 로딩 중일 때
  if (isLoading) {
    return (
      <IonContent className="ion-padding">
        <IonLoading isOpen={true} message="Loading..." />
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <IonText color="medium">Initializing...</IonText>
        </div>
      </IonContent>
    )
  }

  // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    return (
      <Navigate
        to={fallbackPath}
        state={{ from: location }}
        replace
      />
    )
  }

  // 인증된 사용자는 컴포넌트 렌더링
  return <Component />
}

export default ProtectedRoute
