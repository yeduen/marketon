from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Product(models.Model):
    """
    상품 모델
    """
    name = models.CharField(max_length=200, verbose_name="상품명")
    description = models.TextField(verbose_name="상품 설명")
    price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="가격")
    category = models.CharField(max_length=100, verbose_name="카테고리")
    stock = models.PositiveIntegerField(default=0, verbose_name="재고")
    is_active = models.BooleanField(default=True, verbose_name="활성화")
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="생성자")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일")

    class Meta:
        db_table = 'products_product'
        verbose_name = '상품'
        verbose_name_plural = '상품들'
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def main_image(self):
        """메인 이미지 (첫 번째 이미지)"""
        return self.images.first()

    @property
    def image_count(self):
        """이미지 개수"""
        return self.images.count()


class ProductImage(models.Model):
    """
    상품 이미지 모델 (M2O)
    """
    product = models.ForeignKey(
        Product, 
        on_delete=models.CASCADE, 
        related_name='images',
        verbose_name="상품"
    )
    image = models.ImageField(
        upload_to='products/%Y/%m/%d/', 
        verbose_name="이미지"
    )
    alt_text = models.CharField(
        max_length=200, 
        blank=True, 
        verbose_name="대체 텍스트"
    )
    order = models.PositiveIntegerField(
        default=0, 
        verbose_name="순서"
    )
    is_main = models.BooleanField(
        default=False, 
        verbose_name="메인 이미지 여부"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일")

    class Meta:
        db_table = 'products_productimage'
        verbose_name = '상품 이미지'
        verbose_name_plural = '상품 이미지들'
        ordering = ['order', 'created_at']
        unique_together = ['product', 'order']

    def __str__(self):
        return f"{self.product.name} - 이미지 {self.order}"

    def save(self, *args, **kwargs):
        # 메인 이미지가 변경되면 기존 메인 이미지 해제
        if self.is_main:
            ProductImage.objects.filter(
                product=self.product, 
                is_main=True
            ).exclude(id=self.id).update(is_main=False)
        super().save(*args, **kwargs)
