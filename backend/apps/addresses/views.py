from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class AddressListView(APIView):
    def get(self, request):
        # Mock address list response
        return Response({
            'message': 'Address list endpoint - Mock implementation',
            'addresses': [
                {'id': 1, 'street': 'Mock Street 1', 'city': 'Mock City'},
                {'id': 2, 'street': 'Mock Street 2', 'city': 'Mock City'},
            ]
        }, status=status.HTTP_200_OK)


class AddressDetailView(APIView):
    def get(self, request, pk):
        # Mock address detail response
        return Response({
            'message': f'Address detail endpoint - Mock implementation for address {pk}',
            'address': {
                'id': pk,
                'street': f'Mock Street {pk}',
                'city': 'Mock City',
                'postal_code': f'1234{pk}'
            }
        }, status=status.HTTP_200_OK)


class AddressCreateView(APIView):
    def post(self, request):
        # Mock address creation response
        return Response({
            'message': 'Address creation endpoint - Mock implementation',
            'address_id': 999,
            'street': 'New Mock Street',
            'city': 'New Mock City'
        }, status=status.HTTP_201_CREATED)
