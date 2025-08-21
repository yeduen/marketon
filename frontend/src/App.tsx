import React from 'react'
import { IonApp, setupIonicReact } from '@ionic/react'
import { Route, Routes, Navigate } from 'react-router-dom'

// Context
import { AuthProvider } from '@/contexts/AuthContext'

// Components
import { ProtectedRoute } from '@/components/ProtectedRoute'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import TestApiPage from '@/pages/TestApiPage'
import TestProductsPage from '@/pages/TestProductsPage'
import TestCartsPage from '@/pages/TestCartsPage'
import TestOrdersPage from '@/pages/TestOrdersPage'

// Styles are imported in main.tsx

setupIonicReact()

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute component={DashboardPage} />} />
          <Route path="/profile" element={<ProtectedRoute component={() => <div>Profile Page</div>} />} />
          <Route path="/products" element={<ProtectedRoute component={() => <div>Products Page</div>} />} />
          <Route path="/cart" element={<ProtectedRoute component={() => <div>Cart Page</div>} />} />
          <Route path="/wishlist" element={<ProtectedRoute component={() => <div>Wishlist Page</div>} />} />
          
          {/* API Test Routes */}
          <Route path="/test" element={<TestApiPage />} />
          <Route path="/test/products" element={<TestProductsPage />} />
          <Route path="/test/carts" element={<TestCartsPage />} />
          <Route path="/test/orders" element={<TestOrdersPage />} />
          
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </IonApp>
  )
}

export default App
