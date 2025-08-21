from rest_framework import serializers
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    """상품 이미지 시리얼라이저"""
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = [
            'id', 'image', 'image_url', 'thumbnail_url', 
            'alt_text', 'order', 'is_main', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None

    def get_thumbnail_url(self, obj):
        if obj.image:
            # 썸네일 URL 생성 (실제로는 썸네일 생성 로직 필요)
            return self.context['request'].build_absolute_uri(obj.image.url)
        return None


class ProductImageCreateSerializer(serializers.ModelSerializer):
    """상품 이미지 생성 시리얼라이저"""
    class Meta:
        model = ProductImage
        fields = ['image', 'alt_text', 'order', 'is_main']


class ProductSerializer(serializers.ModelSerializer):
    """상품 시리얼라이저 (읽기 전용)"""
    images = ProductImageSerializer(many=True, read_only=True)
    main_image = ProductImageSerializer(read_only=True)
    image_count = serializers.ReadOnlyField()
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'stock',
            'is_active', 'created_by', 'created_at', 'updated_at',
            'images', 'main_image', 'image_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """상품 생성 시리얼라이저"""
    images = ProductImageCreateSerializer(many=True, required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'stock', 
            'is_active', 'images'
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        validated_data['created_by'] = self.context['request'].user
        
        # 상품 생성
        product = Product.objects.create(**validated_data)
        
        # 이미지들 생성
        for i, image_data in enumerate(images_data):
            if not image_data.get('order'):
                image_data['order'] = i
            if i == 0 and not image_data.get('is_main'):
                image_data['is_main'] = True
            
            ProductImage.objects.create(product=product, **image_data)
        
        return product


class ProductUpdateSerializer(serializers.ModelSerializer):
    """상품 수정 시리얼라이저"""
    images = ProductImageCreateSerializer(many=True, required=False)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'category', 'stock', 
            'is_active', 'images'
        ]

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # 상품 정보 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 이미지 업데이트 (기존 이미지 모두 삭제 후 새로 생성)
        if images_data is not None:
            instance.images.all().delete()
            
            for i, image_data in enumerate(images_data):
                if not image_data.get('order'):
                    image_data['order'] = i
                if i == 0 and not image_data.get('is_main'):
                    image_data['is_main'] = True
                
                ProductImage.objects.create(product=instance, **image_data)
        
        return instance


class ProductImageReorderSerializer(serializers.Serializer):
    """이미지 순서 변경 시리얼라이저"""
    image_id = serializers.IntegerField()
    new_order = serializers.IntegerField(min_value=0)


class ProductImageUpdateSerializer(serializers.ModelSerializer):
    """이미지 개별 수정 시리얼라이저"""
    class Meta:
        model = ProductImage
        fields = ['alt_text', 'order', 'is_main']
