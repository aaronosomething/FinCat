from rest_framework import serializers
from .models import Investment

class InvestmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Investment
        fields = ['id', 'investment_name', 'value', 'rate_of_return', 'contribution', 'contribution_timeline_years']