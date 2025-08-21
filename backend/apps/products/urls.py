from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'products'

router = DefaultRouter()
router.register(r'', views.ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]
