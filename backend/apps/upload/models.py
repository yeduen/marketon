from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UploadedFile(models.Model):
    """
    Model for storing uploaded files
    """
    file = models.FileField(upload_to='uploads/files/%Y/%m/%d/')
    original_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    file_type = models.CharField(max_length=100)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'upload_uploadedfile'
        verbose_name = 'Uploaded File'
        verbose_name_plural = 'Uploaded Files'
    
    def __str__(self):
        return f"{self.original_name} ({self.file_size} bytes)"


class UploadedImage(models.Model):
    """
    Model for storing uploaded images
    """
    image = models.ImageField(upload_to='uploads/images/%Y/%m/%d/')
    original_name = models.CharField(max_length=255)
    image_size = models.PositiveIntegerField()
    width = models.PositiveIntegerField()
    height = models.PositiveIntegerField()
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'upload_uploadedimage'
        verbose_name = 'Uploaded Image'
        verbose_name_plural = 'Uploaded Images'
    
    def __str__(self):
        return f"{self.original_name} ({self.width}x{self.height})"
