from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.


class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Mock login response
        return Response({
            'message': 'Login endpoint - Mock implementation',
            'token': 'mock_jwt_token_12345'
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Mock registration response
        return Response({
            'message': 'Registration endpoint - Mock implementation',
            'user_id': 1
        }, status=status.HTTP_201_CREATED)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Mock profile response
        return Response({
            'message': 'Profile endpoint - Mock implementation',
            'user': {
                'id': 1,
                'username': 'mock_user',
                'email': 'user@example.com'
            }
        }, status=status.HTTP_200_OK)


class TokenRefreshView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Mock token refresh response
        return Response({
            'message': 'Token refresh endpoint - Mock implementation',
            'new_token': 'mock_refreshed_token_67890'
        }, status=status.HTTP_200_OK)
