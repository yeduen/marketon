from rest_framework import serializers
from .models import UploadedFile, UploadedImage


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ['id', 'file', 'original_name', 'file_size', 'file_type', 'uploaded_at']
        read_only_fields = ['id', 'original_name', 'file_size', 'file_type', 'uploaded_at']


class UploadedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedImage
        fields = ['id', 'image', 'original_name', 'image_size', 'width', 'height', 'uploaded_at']
        read_only_fields = ['id', 'original_name', 'image_size', 'width', 'height', 'uploaded_at']


class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField(max_length=100, allow_empty_file=False)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField(max_length=100, allow_empty_file=False)
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
