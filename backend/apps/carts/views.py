from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


# Create your views here.


class CartView(APIView):
    def get(self, request):
        # Mock cart view response
        return Response({
            'message': 'Cart view endpoint - Mock implementation',
            'cart': {
                'items': [
                    {'id': 1, 'name': 'Mock Cart Item 1', 'quantity': 2, 'price': 10000},
                    {'id': 2, 'name': 'Mock Cart Item 2', 'quantity': 1, 'price': 20000},
                ],
                'total': 40000
            }
        }, status=status.HTTP_200_OK)


class CartAddView(APIView):
    def post(self, request):
        # Mock cart add response
        return Response({
            'message': 'Cart add endpoint - Mock implementation',
            'added_item': {
                'id': 3,
                'name': 'New Mock Item',
                'quantity': 1,
                'price': 15000
            }
        }, status=status.HTTP_200_OK)


class CartRemoveView(APIView):
    def delete(self, request, pk):
        # Mock cart remove response
        return Response({
            'message': f'Cart remove endpoint - Mock implementation for item {pk}',
            'removed_item_id': pk
        }, status=status.HTTP_200_OK)
