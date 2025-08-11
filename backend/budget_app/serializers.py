from rest_framework import serializers
from .models import Income, Expense, Deduction, CostOfLiving


class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ['id', 'name', 'amount']


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ['id', 'name', 'amount']


class DeductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deduction
        fields = ['id', 'name', 'amount']


class CostOfLivingSerializer(serializers.ModelSerializer):
    class Meta:
        model = CostOfLiving
        fields = ['id', 'col_zip']
