from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Asset, Liability
from .serializers import AssetSerializer, LiabilitySerializer
from user_app.views import TokenReq


# --- ASSET VIEWS ---
class AssetListCreate(TokenReq):
    def get(self, request):
        assets = Asset.objects.filter(user=request.user)
        serializer = AssetSerializer(assets, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()
        serializer = AssetSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class AssetDelete(TokenReq):
    def delete(self, request, pk):
        asset = get_object_or_404(Asset, id=pk, user=request.user)
        asset.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- LIABLITY VIEWS ---
class LiabilityListCreate(TokenReq):
    def get(self, request):
        liabilities = Liability.objects.filter(user=request.user)
        serializer = LiabilitySerializer(liabilities, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()
        serializer = LiabilitySerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)
    
class LiabilityDelete(TokenReq):
    def delete(self, request, pk):
        liability = get_object_or_404(Liability, id=pk, user=request.user)
        liability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
