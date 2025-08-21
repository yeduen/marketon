from django.urls import path
from . import views

app_name = 'addresses'

urlpatterns = [
    path('', views.AddressListView.as_view(), name='address_list'),
    path('<int:pk>/', views.AddressDetailView.as_view(), name='address_detail'),
    path('create/', views.AddressCreateView.as_view(), name='address_create'),
]
