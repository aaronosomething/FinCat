from rest_framework import serializers
from .models import RetirementPlan, RetirementIncomeSource

class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetirementPlan
        fields = ['id', 'current_age', 'retirement_age', 'projected_expenses', 'withdrawal_rate']

class IncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RetirementIncomeSource
        fields = ['id', 'income_source', 'age_available', 'amount']

