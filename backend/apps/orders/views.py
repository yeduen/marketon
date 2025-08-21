from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.


class OrderListView(APIView):
    def get(self, request):
        # Mock order list response
        return Response({
            'message': 'Order list endpoint - Mock implementation',
            'orders': [
                {'id': 1, 'status': 'pending', 'total': 30000},
                {'id': 2, 'status': 'completed', 'total': 45000},
            ]
        }, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    def get(self, request, pk):
        # Mock order detail response
        return Response({
            'message': f'Order detail endpoint - Mock implementation for order {pk}',
            'order': {
                'id': pk,
                'status': 'pending',
                'total': pk * 15000,
                'items': [f'Mock item {pk}']
            }
        }, status=status.HTTP_200_OK)


class OrderCreateView(APIView):
    def post(self, request):
        # Mock order creation response
        return Response({
            'message': 'Order creation endpoint - Mock implementation',
            'order_id': 999,
            'status': 'created'
        }, status=status.HTTP_201_CREATED)
