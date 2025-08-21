import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
  IonToast,
  IonLoading,
  IonIcon
} from '@ionic/react'
import { person, lockClosed, logInOutline } from 'ionicons/icons'
import { useAuth } from '@/contexts/AuthContext'

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success')

  const { state, login, clearError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

        // 이미 로그인된 경우 리다이렉트
      useEffect(() => {
        if (state.isAuthenticated) {
          const from = (location.state as any)?.from?.pathname || '/dashboard'
          navigate(from, { replace: true })
        }
      }, [state.isAuthenticated, navigate, location])

  // 에러가 있을 때 토스트 표시
  useEffect(() => {
    if (state.error) {
      setToastMessage(state.error)
      setToastColor('danger')
      setShowToast(true)
      clearError()
    }
  }, [state.error, clearError])

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const showToastMessage = (message: string, color: 'success' | 'danger' = 'success') => {
    setToastMessage(message)
    setToastColor(color)
    setShowToast(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.username || !formData.password) {
      showToastMessage('Please fill in all fields', 'danger')
      return
    }

    try {
      await login(formData.username, formData.password)
      showToastMessage('Login successful!')
      
      // 로그인 성공 시 이전 페이지로 리다이렉트
      const from = (location.state as any)?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: any) {
      // 에러는 이미 context에서 처리됨
      console.error('Login error:', error)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          minHeight: '100%',
          padding: '20px'
        }}>
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <IonIcon 
                  icon={logInOutline} 
                  style={{ fontSize: '48px', color: 'var(--ion-color-primary)' }}
                />
                <h2>Welcome Back</h2>
                <p>Please sign in to continue</p>
              </div>

              <form onSubmit={handleSubmit}>
                <IonItem>
                  <IonIcon icon={person} slot="start" />
                  <IonLabel position="stacked">Username</IonLabel>
                  <IonInput
                    type="text"
                    value={formData.username}
                    onIonChange={e => handleInputChange('username', e.detail.value || '')}
                    placeholder="Enter your username"
                    required
                    disabled={state.isLoading}
                  />
                </IonItem>
                
                <IonItem>
                  <IonIcon icon={lockClosed} slot="start" />
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    value={formData.password}
                    onIonChange={e => handleInputChange('password', e.detail.value || '')}
                    placeholder="Enter your password"
                    required
                    disabled={state.isLoading}
                  />
                </IonItem>
                
                <div style={{ padding: '16px 0' }}>
                  <IonButton
                    type="submit"
                    expand="block"
                    disabled={state.isLoading}

                  >
                    {state.isLoading ? 'Signing in...' : 'Sign In'}
                  </IonButton>
                </div>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <IonText color="medium">
                  Don't have an account?{' '}
                  <IonButton 
                    fill="clear" 
                    size="small"
                    onClick={() => navigate('/register')}
                  >
                    Sign up
                  </IonButton>
                </IonText>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Toast for notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="top"
          buttons={[
            {
              text: 'Dismiss',
              role: 'cancel'
            }
          ]}
        />

        {/* Loading indicator */}
        <IonLoading isOpen={state.isLoading} message="Signing in..." />
      </IonContent>
    </IonPage>
  )
}

export default LoginPage
