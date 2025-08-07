from django.shortcuts import render
from django.core.exceptions import ValidationError
from django.contrib.auth import login, logout, authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_204_NO_CONTENT,
    HTTP_201_CREATED,
    HTTP_400_BAD_REQUEST
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from .models import Goal

class TokenReq(APIView):
    authentication_classes=[TokenAuthentication]
    permission_classes = [IsAuthenticated]


class All_goals(TokenReq):
    def get(self, request):
        all_goals = Goal.objects.all()
        return Response(all_goals.data)
    pass

class Fav_goals(TokenReq):
    def get(self, request):
        fav_goals = Goal.objects.filter(is_favorite=True)
        return Response(fav_goals.data)
    pass