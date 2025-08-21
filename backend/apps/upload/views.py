import os
from PIL import Image
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import UploadedFile, UploadedImage
from .serializers import (
    UploadedFileSerializer, 
    UploadedImageSerializer,
    FileUploadSerializer,
    ImageUploadSerializer
)


class FileUploadView(APIView):
    """
    File upload endpoint for testing media directory
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = FileUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_file = request.FILES['file']
            
            # Create UploadedFile instance
            uploaded_file_obj = UploadedFile.objects.create(
                file=uploaded_file,
                original_name=uploaded_file.name,
                file_size=uploaded_file.size,
                file_type=uploaded_file.content_type,
                uploaded_by=request.user if request.user.is_authenticated else None
            )
            
            # Return response
            file_serializer = UploadedFileSerializer(uploaded_file_obj)
            return Response({
                'message': 'File uploaded successfully',
                'file': file_serializer.data,
                'media_url': request.build_absolute_uri(uploaded_file_obj.file.url)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ImageUploadView(APIView):
    """
    Image upload endpoint for testing media directory
    """
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = ImageUploadSerializer(data=request.data)
        if serializer.is_valid():
            uploaded_image = request.FILES['image']
            
            # Get image dimensions
            try:
                with Image.open(uploaded_image) as img:
                    width, height = img.size
            except Exception:
                width, height = 0, 0
            
            # Create UploadedImage instance
            uploaded_image_obj = UploadedImage.objects.create(
                image=uploaded_image,
                original_name=uploaded_image.name,
                image_size=uploaded_image.size,
                width=width,
                height=height,
                uploaded_by=request.user if request.user.is_authenticated else None
            )
            
            # Return response
            image_serializer = UploadedImageSerializer(uploaded_image_obj)
            return Response({
                'message': 'Image uploaded successfully',
                'image': image_serializer.data,
                'media_url': request.build_absolute_uri(uploaded_image_obj.image.url)
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FileListView(APIView):
    """
    List all uploaded files
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        files = UploadedFile.objects.all().order_by('-uploaded_at')
        serializer = UploadedFileSerializer(files, many=True)
        return Response({
            'files': serializer.data,
            'count': files.count()
        })


class ImageListView(APIView):
    """
    List all uploaded images
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        images = UploadedImage.objects.all().order_by('-uploaded_at')
        serializer = UploadedImageSerializer(images, many=True)
        return Response({
            'images': serializer.data,
            'count': images.count()
        })


@api_view(['GET'])
def media_info(request):
    """
    Get media directory information for testing
    """
    media_root = settings.MEDIA_ROOT
    static_root = settings.STATIC_ROOT if hasattr(settings, 'STATIC_ROOT') else None
    
    # Check if directories exist
    media_exists = os.path.exists(media_root)
    static_exists = os.path.exists(static_root) if static_root else False
    
    # Get file counts
    media_files = 0
    static_files = 0
    
    if media_exists:
        media_files = len([f for f in os.listdir(media_root) if os.path.isfile(os.path.join(media_root, f))])
    
    if static_exists:
        static_files = len([f for f in os.listdir(static_root) if os.path.isfile(os.path.join(static_root, f))])
    
    return Response({
        'media_root': str(media_root),
        'media_exists': media_exists,
        'media_files_count': media_files,
        'static_root': str(static_root) if static_root else None,
        'static_exists': static_exists,
        'static_files_count': static_files,
        'media_url': settings.MEDIA_URL,
        'static_url': settings.STATIC_URL,
    })
