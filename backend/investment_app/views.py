from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Investment
from .serializers import InvestmentSerializer
from user_app.views import TokenReq
from django.db.models import Sum

class InvestmentListCreate(TokenReq):
    def get(self, request):
        investments = Investment.objects.filter(user=request.user)
        serializer = InvestmentSerializer(investments, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        data = request.data.copy()
        serializer = InvestmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InvestmentDetail(TokenReq):
    def get(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        serializer = InvestmentSerializer(investment)
        return Response(serializer.data)

    def patch(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        serializer = InvestmentSerializer(investment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        investment = get_object_or_404(Investment, id=pk, user=request.user)
        investment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class InvestmentSum(TokenReq):
    def get(self, request):
        # print("at the InvestmentSum View")
        total_value = Investment.objects.filter(user=request.user).aggregate(
            total=Sum("value")
        )["total"] or 0
        # print("total Value", total_value)
        return Response({"total_investment_value": total_value})