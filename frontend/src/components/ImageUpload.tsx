import React, { useState, useRef, useCallback } from 'react'
import {
  IonButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonCard,
  IonCardContent,
  IonToast,
  IonSpinner,
  IonChip,
  IonNote,
} from '@ionic/react'
import { 
  add, 
  trash, 
  reorderThree, 
  star, 
  starOutline,
  cloudUploadOutline 
} from 'ionicons/icons'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export interface ImageFile {
  id: string
  file: File
  preview: string
  altText: string
  order: number
  isMain: boolean
}

interface ImageUploadProps {
  images: ImageFile[]
  onImagesChange: (images: ImageFile[]) => void
  maxImages?: number
  accept?: string
  disabled?: boolean
  loading?: boolean
}

type SortableItemProps = {
  image: ImageFile;
  onRemove: (id: string) => void;
  onSetMain: (id: string) => void;
  onUpdateAltText: (id: string, altText: string) => void;
  loading: boolean;
};

// SortableItem 컴포넌트
function SortableItem({
  image,
  onRemove,
  onSetMain,
  onUpdateAltText,
  loading
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <IonCard style={{ width: '200px', margin: 0 }}>
        <IonCardContent style={{ padding: '8px' }}>
          {/* 이미지 헤더 */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <IonChip 
              color={image.isMain ? 'primary' : 'medium'}
            >
              {image.isMain ? '메인' : `${image.order + 1}번`}
            </IonChip>
            
            <div style={{ display: 'flex', gap: '4px' }}>
              <IonButton
                size="small"
                fill="clear"
                color={image.isMain ? 'primary' : 'medium'}
                onClick={() => onSetMain(image.id)}
                disabled={image.isMain}
              >
                <IonIcon icon={image.isMain ? star : starOutline} />
              </IonButton>
              
              <IonButton
                size="small"
                fill="clear"
                color="danger"
                onClick={() => onRemove(image.id)}
                disabled={loading}
              >
                <IonIcon icon={trash} />
              </IonButton>
            </div>
          </div>

          {/* 드래그 핸들 */}
          <div
            {...attributes}
            {...listeners}
            style={{ 
              cursor: 'grab',
              textAlign: 'center',
              marginBottom: '8px'
            }}
          >
            <IonIcon icon={reorderThree} color="medium" />
          </div>

          {/* 이미지 미리보기 */}
          <div style={{ 
            width: '100%', 
            height: '120px', 
            overflow: 'hidden',
            borderRadius: '4px',
            marginBottom: '8px'
          }}>
            <img
              src={image.preview}
              alt={image.altText}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>

          {/* 이미지 정보 입력 */}
          <IonItem style={{ '--padding-start': '0', '--padding-end': '0' }}>
            <IonInput
              label="설명"
              value={image.altText}
              onIonInput={(e) => onUpdateAltText(image.id, e.detail.value!)}
              placeholder="이미지 설명"
              style={{ fontSize: '12px' }}
            />
          </IonItem>

          {/* 파일 정보 */}
          <IonNote style={{ fontSize: '10px', color: '#666' }}>
            {image.file.name} ({(image.file.size / 1024).toFixed(1)}KB)
          </IonNote>
        </IonCardContent>
      </IonCard>
    </div>
  )
}

function ImageUpload({
  images,
  onImagesChange,
  maxImages = 10,
  accept = 'image/*',
  disabled = false,
  loading = false
}: ImageUploadProps) {
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showMessage = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
  }

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newImages: ImageFile[] = []
    const currentCount = images.length

    for (let i = 0; i < files.length && currentCount + newImages.length < maxImages; i++) {
      const file = files[i]
      if (!file) continue
      
      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        showMessage(`${file.name}은(는) 이미지 파일이 아닙니다.`)
        continue
      }

      // 파일 크기 검증 (5MB 제한)
      if (file.size > 5 * 1024 * 1024) {
        showMessage(`${file.name}의 크기가 너무 큽니다. (5MB 이하)`)
        continue
      }

      const imageFile: ImageFile = {
        id: `temp-${Date.now()}-${i}`,
        file,
        preview: URL.createObjectURL(file),
        altText: file.name.replace(/\.[^/.]+$/, ''), // 확장자 제거
        order: currentCount + newImages.length,
        isMain: currentCount + newImages.length === 0 // 첫 번째 이미지를 메인으로
      }

      newImages.push(imageFile)
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages]
      onImagesChange(updatedImages)
      showMessage(`${newImages.length}개의 이미지가 추가되었습니다.`)
    }

    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [images, maxImages, onImagesChange])

  const removeImage = useCallback((id: string) => {
    const updatedImages = images.filter(img => img.id !== id)
    
    // 메인 이미지가 삭제된 경우 첫 번째 이미지를 메인으로 설정
    if (updatedImages.length > 0 && !updatedImages.some(img => img.isMain)) {
      const firstImage = updatedImages[0]
      if (firstImage) {
        firstImage.isMain = true
      }
    }
    
    // 순서 재정렬
    updatedImages.forEach((img, index) => {
      img.order = index
    })
    
    onImagesChange(updatedImages)
    showMessage('이미지가 제거되었습니다.')
  }, [images, onImagesChange])

  const setMainImage = useCallback((id: string) => {
    const updatedImages = images.map(img => ({
      ...img,
      isMain: img.id === id
    }))
    onImagesChange(updatedImages)
    showMessage('메인 이미지가 설정되었습니다.')
  }, [images, onImagesChange])

  const updateAltText = useCallback((id: string, altText: string) => {
    const updatedImages = images.map(img =>
      img.id === id ? { ...img, altText } : img
    )
    onImagesChange(updatedImages)
  }, [images, onImagesChange])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = images.findIndex(img => img.id === active.id)
      const newIndex = images.findIndex(img => img.id === over?.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newImages = arrayMove(images, oldIndex, newIndex)
        
        // 순서 업데이트
        newImages.forEach((item, index) => {
          item.order = index
        })

        onImagesChange(newImages)
        showMessage('이미지 순서가 변경되었습니다.')
      }
    }
  }, [images, onImagesChange])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const remainingSlots = maxImages - images.length

  return (
    <>
      <IonCard>
        <IonCardContent>
          <div style={{ marginBottom: '16px' }}>
            <IonLabel>
              <h3>상품 이미지</h3>
              <p>최대 {maxImages}개까지 업로드 가능 ({remainingSlots}개 남음)</p>
            </IonLabel>
          </div>

          {/* 파일 업로드 영역 */}
          {remainingSlots > 0 && (
            <div
              style={{
                border: '2px dashed #ccc',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                marginBottom: '16px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                backgroundColor: '#f9f9f9'
              }}
              onClick={disabled ? undefined : openFileDialog}
            >
              <IonIcon 
                icon={cloudUploadOutline} 
                style={{ fontSize: '48px', color: '#666', marginBottom: '8px' }}
              />
              <p style={{ margin: '8px 0', color: '#666' }}>
                클릭하여 이미지 선택 또는 드래그 앤 드롭
              </p>
              <p style={{ fontSize: '12px', color: '#999' }}>
                지원 형식: JPG, PNG, GIF (최대 5MB)
              </p>
            </div>
          )}

          {/* 숨겨진 파일 입력 */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            disabled={disabled}
          />

          {/* 이미지 목록 */}
          {images.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map(img => img.id)}
                strategy={horizontalListSortingStrategy}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                  {images.map((image) => (
                    <SortableItem
                      key={image.id}
                      image={image}
                      onRemove={removeImage}
                      onSetMain={setMainImage}
                      onUpdateAltText={updateAltText}
                      loading={loading}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {/* 업로드 버튼 */}
          {remainingSlots > 0 && (
            <IonButton
              expand="block"
              fill="outline"
              onClick={openFileDialog}
              disabled={disabled || loading}
              style={{ marginTop: '16px' }}
            >
              <IonIcon icon={add} slot="start" />
              {loading ? <IonSpinner /> : `${remainingSlots}개 이미지 추가`}
            </IonButton>
          )}
        </IonCardContent>
      </IonCard>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
      />
    </>
  )
}

export default ImageUpload
