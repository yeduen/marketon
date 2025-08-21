import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,

  IonAvatar,
  IonIcon,
  IonButtons,
  IonText,
  IonToast
} from '@ionic/react'
import { 
  logOutOutline, 
  personOutline, 
  mailOutline, 
  settingsOutline,
  homeOutline,
  cartOutline,
  heartOutline,
  codeSlashOutline
} from 'ionicons/icons'
import { useAuth } from '@/contexts/AuthContext'

const DashboardPage: React.FC = () => {
  const { state, logout } = useAuth()
  const navigate = useNavigate()
  const [showToast, setShowToast] = useState(false)

  const handleLogout = () => {
    logout()
    setShowToast(true)
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  if (!state.user) {
    return null
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        {/* Welcome Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome back, {state.user.first_name || state.user.username}!</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <IonAvatar style={{ width: '60px', height: '60px' }}>
                {state.user.profile_image ? (
                  <img src={state.user.profile_image} alt="Profile" />
                ) : (
                  <IonIcon icon={personOutline} style={{ fontSize: '24px' }} />
                )}
              </IonAvatar>
              <div>
                <h3>{state.user.first_name && state.user.last_name 
                  ? `${state.user.first_name} ${state.user.last_name}`
                  : state.user.username
                }</h3>
                <IonText color="medium">
                  <IonIcon icon={mailOutline} style={{ marginRight: '8px' }} />
                  {state.user.email}
                </IonText>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Quick Actions */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Quick Actions</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '16px' 
            }}>
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleNavigation('/products')}
              >
                <IonIcon icon={homeOutline} slot="start" />
                Browse Products
              </IonButton>
              
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleNavigation('/cart')}
              >
                <IonIcon icon={cartOutline} slot="start" />
                View Cart
              </IonButton>
              
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleNavigation('/wishlist')}
              >
                <IonIcon icon={heartOutline} slot="start" />
                Wishlist
              </IonButton>
              
              <IonButton
                expand="block"
                fill="outline"
                onClick={() => handleNavigation('/profile')}
              >
                <IonIcon icon={settingsOutline} slot="start" />
                Profile
              </IonButton>
              
              <IonButton
                expand="block"
                fill="outline"
                color="secondary"
                onClick={() => handleNavigation('/test')}
              >
                <IonIcon icon={codeSlashOutline} slot="start" />
                API Test
              </IonButton>
            </div>
          </IonCardContent>
        </IonCard>

        {/* User Stats */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Your Activity</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '16px',
              textAlign: 'center'
            }}>
              <div>
                <h3 style={{ margin: '0', color: 'var(--ion-color-primary)' }}>0</h3>
                <IonText color="medium">Orders</IonText>
              </div>
              <div>
                <h3 style={{ margin: '0', color: 'var(--ion-color-success)' }}>0</h3>
                <IonText color="medium">Wishlist Items</IonText>
              </div>
              <div>
                <h3 style={{ margin: '0', color: 'var(--ion-color-warning)' }}>0</h3>
                <IonText color="medium">Cart Items</IonText>
              </div>
              <div>
                <h3 style={{ margin: '0', color: 'var(--ion-color-secondary)' }}>0</h3>
                <IonText color="medium">Reviews</IonText>
              </div>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Recent Activity */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Recent Activity</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="medium">
              No recent activity to display.
            </IonText>
          </IonCardContent>
        </IonCard>

        {/* Toast for logout confirmation */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="You have been logged out successfully"
          duration={2000}
          color="success"
          position="top"
        />
      </IonContent>
    </IonPage>
  )
}

export default DashboardPage
