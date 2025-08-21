import React, { useState } from 'react'
import { IonButton, IonInput, IonItem, IonLabel, IonList, IonToast } from '@ionic/react'
import { authApi, LoginRequest } from '@/api/auth'

interface LoginFormProps {
  onSuccess?: (userData: any) => void
  onError?: (error: string) => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onError, ...rest }) => {
  const [formData, setFormData] = useState<LoginRequest>({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success')

  const handleInputChange = (field: keyof LoginRequest, value: string) => {
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

    setLoading(true)
    
    try {
      console.log('🔐 Attempting login with:', { username: formData.username })
      
      const response = await authApi.login(formData)
      
      console.log('✅ Login successful:', response.user)
      
      showToastMessage(`Welcome back, ${response.user.username}!`)
      
      // Call success callback
      onSuccess?.(response.user)
      
      // Reset form
      setFormData({ username: '', password: '' })
      
    } catch (error: any) {
      console.error('❌ Login error:', error)
      
      const errorMessage = error.message || 'Login failed. Please try again.'
      showToastMessage(errorMessage, 'danger')
      
      // Call error callback
      onError?.(errorMessage)
      
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} {...rest}>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Username</IonLabel>
            <IonInput
              type="text"
              value={formData.username}
              onIonChange={e => handleInputChange('username', e.detail.value || '')}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </IonItem>
          
          <IonItem>
            <IonLabel position="stacked">Password</IonLabel>
            <IonInput
              type="password"
              value={formData.password}
              onIonChange={e => handleInputChange('password', e.detail.value || '')}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </IonItem>
        </IonList>
        
        <div style={{ padding: '16px' }}>
          <IonButton
            type="submit"
            expand="block"
            disabled={loading}

          >
            {loading ? 'Logging in...' : 'Login'}
          </IonButton>
        </div>
      </form>

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
    </>
  )
}

export default LoginForm
