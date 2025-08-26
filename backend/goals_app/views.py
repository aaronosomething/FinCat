from django.shortcuts import render, get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_204_NO_CONTENT,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from .models import Goal
from .serializers import GoalSerializer
from user_app.views import TokenReq



class All_goals(TokenReq):
    def get(self, request):
        goals = Goal.objects.filter(user=request.user)
        serializer = GoalSerializer(goals, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


class A_goal(TokenReq):
    def post(self, request):
        serializer = GoalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    def delete(self, request, goal_id):
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        goal.delete()
        return Response({"message": "Goal deleted."}, status=HTTP_204_NO_CONTENT)


class Fav_goals(TokenReq):
    def get(self, request):
        fav_goals = Goal.objects.filter(user=request.user, is_favorite=True)
        serializer = GoalSerializer(fav_goals, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request, goal_id):
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        if (
            not goal.is_favorite
            and Goal.objects.filter(user=request.user, is_favorite=True).count() >= 5
        ):
            return Response(
                {"error": "You can only have 5 favorite goals."},
                status=HTTP_400_BAD_REQUEST,
            )
        goal.is_favorite = (
            not goal.is_favorite
        )  # swaps favorite value over post request
        goal.save()
        return Response(
            {"goal_id": goal.id, "is_favorite": goal.is_favorite}, status=HTTP_200_OK
        )


class Comp_goals(TokenReq):
    def get(self, request):
        completed_goals = Goal.objects.filter(user=request.user, is_complete=True)
        serializer = GoalSerializer(completed_goals, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    def post(self, request, goal_id):
        goal = get_object_or_404(Goal, id=goal_id, user=request.user)
        goal.is_complete = (
            not goal.is_complete
        )  # swaps completed value over post request
        goal.save()
        return Response(
            {"goal_id": goal.id, "is_complete": goal.is_complete}, status=HTTP_200_OK
        )
