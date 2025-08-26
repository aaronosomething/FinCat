from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication

from .models import Income, Expense, Deduction, CostOfLiving
from .serializers import (
    IncomeSerializer, ExpenseSerializer, DeductionSerializer, CostOfLivingSerializer
)
from user_app.views import TokenReq



# --- INCOME VIEWS ---
class IncomeListCreate(TokenReq):
    def get(self, request):
        incomes = Income.objects.filter(user=request.user)
        serializer = IncomeSerializer(incomes, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = IncomeSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class IncomeDelete(TokenReq):
    def delete(self, request, pk):
        income = get_object_or_404(Income, id=pk, user=request.user)
        income.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- EXPENSE VIEWS ---
class ExpenseListCreate(TokenReq):
    def get(self, request):
        expenses = Expense.objects.filter(user=request.user)
        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = ExpenseSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseDelete(TokenReq):
    def delete(self, request, pk):
        expense = get_object_or_404(Expense, id=pk, user=request.user)
        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- DEDUCTION VIEWS ---
class DeductionListCreate(TokenReq):
    def get(self, request):
        deductions = Deduction.objects.filter(user=request.user)
        serializer = DeductionSerializer(deductions, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = DeductionSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeductionDelete(TokenReq):
    def delete(self, request, pk):
        deduction = get_object_or_404(Deduction, id=pk, user=request.user)
        deduction.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- COST OF LIVING VIEWS ---
class CostOfLivingListCreate(TokenReq):
    def get(self, request):
        col_entries = CostOfLiving.objects.filter(user=request.user)
        serializer = CostOfLivingSerializer(col_entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        serializer = CostOfLivingSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
