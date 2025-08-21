from django.contrib import admin
from .models import Product, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ['image', 'alt_text', 'order', 'is_main']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'stock', 'is_active', 'created_by', 'created_at']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    list_editable = ['is_active', 'stock']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProductImageInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('name', 'description', 'category')
        }),
        ('가격 및 재고', {
            'fields': ('price', 'stock')
        }),
        ('상태', {
            'fields': ('is_active', 'created_by')
        }),
        ('시간 정보', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image', 'order', 'is_main', 'created_at']
    list_filter = ['is_main', 'created_at']
    list_editable = ['order', 'is_main']
    search_fields = ['product__name', 'alt_text']
    readonly_fields = ['created_at']
