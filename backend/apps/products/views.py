from rest_framework import viewsets, status, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models
from django.shortcuts import get_object_or_404

from .models import Product, ProductImage
from .serializers import (
    ProductSerializer, ProductCreateSerializer, ProductUpdateSerializer,
    ProductImageSerializer, ProductImageUpdateSerializer, ProductImageReorderSerializer
)


class ProductViewSet(viewsets.ModelViewSet):
    """
    상품 ViewSet
    """
    queryset = Product.objects.all()
    permission_classes = [IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ProductUpdateSerializer
        return ProductSerializer

    def get_queryset(self):
        queryset = Product.objects.all()
        
        # 검색 필터
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # 카테고리 필터
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
        
        # 활성화 상태 필터
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset.prefetch_related('images')

    @action(detail=True, methods=['post'], url_path='reorder-images')
    def reorder_images(self, request, pk=None):
        """이미지 순서 변경"""
        product = self.get_object()
        serializer = ProductImageReorderSerializer(data=request.data, many=True)
        
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    for item in serializer.validated_data:
                        image_id = item['image_id']
                        new_order = item['new_order']
                        
                        image = get_object_or_404(ProductImage, id=image_id, product=product)
                        
                        # 기존 순서와 같으면 건너뛰기
                        if image.order == new_order:
                            continue
                        
                        # 순서 변경
                        if image.order < new_order:
                            # 뒤로 이동: 중간 이미지들의 순서를 앞으로
                            ProductImage.objects.filter(
                                product=product,
                                order__gt=image.order,
                                order__lte=new_order
                            ).update(order=models.F('order') - 1)
                        else:
                            # 앞으로 이동: 중간 이미지들의 순서를 뒤로
                            ProductImage.objects.filter(
                                product=product,
                                order__gte=new_order,
                                order__lt=image.order
                            ).update(order=models.F('order') + 1)
                        
                        image.order = new_order
                        image.save()
                
                return Response({'message': '이미지 순서가 변경되었습니다.'})
            
            except Exception as e:
                return Response(
                    {'error': f'순서 변경 중 오류가 발생했습니다: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'], url_path='update-image/(?P<image_id>[^/.]+)')
    def update_image(self, request, pk=None, image_id=None):
        """개별 이미지 정보 수정"""
        product = self.get_object()
        image = get_object_or_404(ProductImage, id=image_id, product=product)
        
        serializer = ProductImageUpdateSerializer(image, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='delete-image/(?P<image_id>[^/.]+)')
    def delete_image(self, request, pk=None, image_id=None):
        """개별 이미지 삭제"""
        product = self.get_object()
        image = get_object_or_404(ProductImage, id=image_id, product=product)
        
        try:
            with transaction.atomic():
                # 이미지 삭제
                image.delete()
                
                # 남은 이미지들의 순서 재정렬
                remaining_images = product.images.order_by('order')
                for i, img in enumerate(remaining_images):
                    if img.order != i:
                        img.order = i
                        img.save()
                
                # 첫 번째 이미지를 메인으로 설정
                if remaining_images.exists() and not remaining_images.filter(is_main=True).exists():
                    first_image = remaining_images.first()
                    first_image.is_main = True
                    first_image.save()
            
            return Response({'message': '이미지가 삭제되었습니다.'})
        
        except Exception as e:
            return Response(
                {'error': f'이미지 삭제 중 오류가 발생했습니다: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'], url_path='set-main-image/(?P<image_id>[^/.]+)')
    def set_main_image(self, request, pk=None, image_id=None):
        """메인 이미지 설정"""
        product = self.get_object()
        image = get_object_or_404(ProductImage, id=image_id, product=product)
        
        try:
            with transaction.atomic():
                # 기존 메인 이미지 해제
                product.images.filter(is_main=True).update(is_main=False)
                
                # 새 메인 이미지 설정
                image.is_main = True
                image.save()
            
            return Response({'message': '메인 이미지가 설정되었습니다.'})
        
        except Exception as e:
            return Response(
                {'error': f'메인 이미지 설정 중 오류가 발생했습니다: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='categories')
    def categories(self, request):
        """사용 가능한 카테고리 목록"""
        categories = Product.objects.values_list('category', flat=True).distinct()
        return Response(list(categories))

    @action(detail=False, methods=['get'], url_path='search')
    def search(self, request):
        """상품 검색"""
        return self.list(request)
