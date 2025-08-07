from rest_framework import serializers
from .models import Goal

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['id', 'user', 'goal_name', 'is_favorite', 'is_complete', 'is_long_term']
        read_only_fields = ['user']