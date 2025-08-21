from django.urls import path
from . import views

app_name = 'upload'

urlpatterns = [
    path('file/', views.FileUploadView.as_view(), name='file_upload'),
    path('image/', views.ImageUploadView.as_view(), name='image_upload'),
    path('files/', views.FileListView.as_view(), name='file_list'),
    path('images/', views.ImageListView.as_view(), name='image_list'),
    path('info/', views.media_info, name='media_info'),
]
