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
from .models import App_user

class TestEndpoint(APIView):
    def get(self, request):
        return Response("Hello world")

# Create your views here.
class Sign_up(APIView):
    def post(self, request):
        data = request.data.copy()
        data['username'] = request.data.get("username", request.data.get("email"))
        # data['display_name'] = request.data.get('display_name', data['username'])
        new_user = App_user(**data)
        try:
            new_user.full_clean()
            new_user.save()
            new_user.set_password(data.get("password"))
            new_user.save()
            login(request, new_user)
            token = Token.objects.create(user = new_user)
            return Response({"user":new_user.email, "token":token.key}, status=HTTP_201_CREATED)
        except ValidationError as e:
            print(e)
            print("the program has gotten to the sign_up API")
            return Response(e, status=HTTP_400_BAD_REQUEST)

class Log_in(APIView):
    def post(self, request):
        data = request.data.copy()
        data['username'] = request.data.get("username", request.data.get("email"))
        user = authenticate(username=data.get("username"), password=data.get("password"))
        print(user)
        if user:
            login(request, user)
            # if
            # return SELECT * token WHERE user = user
            # else
            # return INSERT token (user) VALUES (user)
            token, created = Token.objects.get_or_create(user = user)
            return Response({"user":user.email, "token":token.key}, status=HTTP_200_OK)
        return Response("No user matching credentials", status=HTTP_400_BAD_REQUEST)
    
class TokenReq(APIView):

    authentication_classes=[TokenAuthentication]
    permission_classes = [IsAuthenticated]

class Log_out(TokenReq):
    def post(self, request):
        request.user.auth_token.delete()
        logout(request)
        return Response(status=HTTP_204_NO_CONTENT)
    
class Info(TokenReq):
    def get(self, request):
        return Response({"user": request.user.display_name})

    def put(self, request):
        try:
            data = request.data.copy()
            ruser = request.user
            # check for display_name, age, address
            ruser.display_name = data.get("display_name", ruser.display_name)
            ruser.age = data.get("age", ruser.age)
            ruser.address = data.get("address", ruser.address)
            # authenticate credential
            cur_pass = data.get("password")
            if cur_pass and data.get("new_password"):
                auth_user = authenticate(username = ruser.username, password = cur_pass)
                if auth_user == ruser:
                    ruser.set_password(data.get("new_password"))
                    
            # if credentials match the user
            # update password and save it
            ruser.full_clean()
            ruser.save()
            return Response({"display_name":ruser.display_name, "age":ruser.age, "address":ruser.address})
        except ValidationError as e:
            print(e)
            return Response(e, status=HTTP_400_BAD_REQUEST)