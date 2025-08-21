import React from 'react'
import { IonList, IonItem, IonLabel, IonThumbnail, IonButton } from '@ionic/react'

interface Product {
  id: number
  name: string
  price: number
  description?: string
}

interface ProductListProps {
  products: Product[]
}

export const ProductList: React.FC<ProductListProps> = ({ products, ...rest }) => {
  return (
    <IonList {...rest}>
      {products.map((product) => (
        <IonItem key={product.id}>
          <IonThumbnail slot="start">
            <img 
              src={`https://picsum.photos/100/100?random=${product.id}`} 
              alt={product.name}
            />
          </IonThumbnail>
          <IonLabel>
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>₩{product.price.toLocaleString()}</p>
          </IonLabel>
          <IonButton slot="end" fill="clear">
            View
          </IonButton>
        </IonItem>
      ))}
    </IonList>
  )
}
