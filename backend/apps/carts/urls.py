from django.urls import path
from . import views

app_name = 'carts'

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.CartAddView.as_view(), name='cart_add'),
    path('remove/<int:pk>/', views.CartRemoveView.as_view(), name='cart_remove'),
]
