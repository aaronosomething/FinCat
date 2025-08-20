# from django.shortcuts import render
# from django.core.exceptions import ValidationError
# from django.contrib.auth import login, logout, authenticate
# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.status import (
#     HTTP_200_OK,
#     HTTP_204_NO_CONTENT,
#     HTTP_201_CREATED,
#     HTTP_400_BAD_REQUEST,
# )
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.authentication import TokenAuthentication
# from rest_framework.exceptions import AuthenticationFailed
# from rest_framework.authtoken.models import Token
# from .models import App_user
# from datetime import timedelta, datetime
# from django.views.decorators.csrf import ensure_csrf_cookie
# from django.utils.decorators import method_decorator


# class TestEndpoint(APIView):
#     def get(self, request):
#         return Response("Hello world")


# # Create your views here.
# @method_decorator(ensure_csrf_cookie, name="dispatch")
# class Sign_up(APIView):
#     def post(self, request):
#         data = request.data.copy()
#         data["username"] = request.data.get("username", request.data.get("email"))
#         # data['display_name'] = request.data.get('display_name', data['username'])
#         new_user = App_user(**data)
#         try:
#             new_user.full_clean()
#             new_user.save()
#             new_user.set_password(data.get("password"))
#             new_user.save()
#             login(request, new_user)
#             token = Token.objects.create(user=new_user)
#             life_time = datetime.now() + timedelta(days=7)
#             format_life_time = life_time.strftime("%a, %d %b %Y %H:%M:S GMT")
#             response = Response({"user": new_user.email}, status=HTTP_200_OK)
#             http_only = False
#             response.set_cookie(
#                 key="token",
#                 value=token.key,
#                 httponly=True,
#                 secure=False,  # True in production with HTTPS
#                 samesite="Lax",  # Or 'None' if cross-site
#                 expires=life_time,
#             )
#             print("cookie Created")

#             return response
#             # return Response({"user":new_user.email, "token":token.key}, status=HTTP_201_CREATED)
#         except ValidationError as e:
#             print(e)
#             print("the program has gotten to the sign_up API")
#             return Response(e, status=HTTP_400_BAD_REQUEST)


# @method_decorator(ensure_csrf_cookie, name="dispatch")
# class Log_in(APIView):
#     def post(self, request):
#         data = request.data.copy()
#         data["username"] = request.data.get("username", request.data.get("email"))
#         user = authenticate(
#             username=data.get("username"), password=data.get("password")
#         )
#         print(user)
#         if user:
#             login(request, user)
#             # if
#             # return SELECT * token WHERE user = user
#             # else
#             # return INSERT token (user) VALUES (user)
#             token, created = Token.objects.get_or_create(user=user)
#             # Create Cookie
#             life_time = datetime.now() + timedelta(days=7)
#             format_life_time = life_time.strftime("%a, %d %b %Y %H:%M:S GMT")
#             response = Response({"user": user.email}, status=HTTP_200_OK)
#             http_only = False
#             response.set_cookie(
#                 key="token",
#                 value=token.key,
#                 httponly=True,
#                 secure=False,  # True in production with HTTPS
#                 samesite="Lax",  # Or 'None' if cross-site
#                 expires=life_time,
#             )

#             return response
#         return Response("No user matching credentials", status=HTTP_400_BAD_REQUEST)


# class HttpOnlyTokenAuthentication(TokenAuthentication):
#     def get_auth_token_from_cookie(self, request):
#         # Extract the token from the 'auth_token' HttpOnly cookie
#         return request.COOKIES.get("token")

#     def authenticate(self, request):
#         # Get the token from the HttpOnly cookie
#         auth_token = self.get_auth_token_from_cookie(request)

#         if not auth_token:
#             # If the token is not found, return None and let other authentication classes handle the authentication
#             return None

#         # The original TokenAuthentication class handles token validation and user retrieval
#         return self.authenticate_credentials(auth_token)


# class TokenReq(APIView):

#     authentication_classes = [HttpOnlyTokenAuthentication]
#     permission_classes = [IsAuthenticated]


# class Log_out(TokenReq):
#     def post(self, request):
#         request.user.auth_token.delete()
#         response = Response(status=HTTP_204_NO_CONTENT)
#         response.delete_cookie("token")
#         logout(request)
#         return response


# class Info(TokenReq):
#     def get(self, request):
#         return Response({"user": request.user.username})

#     def put(self, request):
#         try:
#             data = request.data.copy()
#             ruser = request.user
#             # check for display_name, age, address
#             ruser.username = data.get("display_name", ruser.username)
#             # authenticate credential
#             cur_pass = data.get("password")
#             if cur_pass and data.get("new_password"):
#                 auth_user = authenticate(username=ruser.username, password=cur_pass)
#                 if auth_user == ruser:
#                     ruser.set_password(data.get("new_password"))

#             # if credentials match the user
#             # update password and save it
#             ruser.full_clean()
#             ruser.save()
#             return Response(
#                 {
#                     "username": ruser.username,
#                 }
#             )
#         except ValidationError as e:
#             print(e)
#             return Response(e, status=HTTP_400_BAD_REQUEST)

from django.shortcuts import render
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.contrib.auth import login, logout, authenticate
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
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.authtoken.models import Token
from .models import App_user
from datetime import timedelta, datetime
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
import logging

logger = logging.getLogger(__name__)


class TestEndpoint(APIView):
    def get(self, request):
        return Response("Hello world")


# Create your views here.
@method_decorator(ensure_csrf_cookie, name="dispatch")
class Sign_up(APIView):
    def post(self, request):
        data = request.data.copy()
        data["username"] = request.data.get("username", request.data.get("email"))
        # Build the user instance
        new_user = App_user(**data)

        try:
            # set password before saving so it's hashed on first save
            password = data.get("password")
            if password:
                new_user.set_password(password)

            # run model validators
            new_user.full_clean()

            # attempt to save (may raise IntegrityError for unique constraints)
            new_user.save()

            # log the user in and create token/cookie
            login(request, new_user)
            token = Token.objects.create(user=new_user)
            life_time = datetime.now() + timedelta(days=7)
            response = Response({"user": new_user.email, "code": "created"}, status=HTTP_200_OK)
            response.set_cookie(
                key="token",
                value=token.key,
                httponly=True,
                secure=False,  # True in production with HTTPS
                samesite="Lax",
                expires=life_time,
            )
            logger.info("User created and cookie set for %s", new_user.email)
            return response

        except ValidationError as e:
            # Normalize ValidationError into a predictable JSON shape with a code
            logger.debug("Sign_up validation error: %s", e)

            # e.message_dict is preferred (field -> [messages])
            msg_dict = getattr(e, "message_dict", None)
            messages = getattr(e, "messages", None)

            # default response payload
            payload = {"code": "validation_error", "error": messages or msg_dict or str(e)}

            try:
                # If we have field-level messages, check email/username specifically
                if isinstance(msg_dict, dict):
                    email_errs = msg_dict.get("email") or []
                    username_errs = msg_dict.get("username") or []

                    # detect invalid email format
                    if any("Enter a valid email address" in str(m) for m in email_errs):
                        payload = {"code": "invalid_email", "error": "Please enter a valid email address"}
                    # detect uniqueness/existence messaging
                    elif any("already" in str(m).lower() or "exists" in str(m).lower() for m in email_errs + username_errs):
                        payload = {"code": "email_exists", "error": "User with this Email already exists."}
                    else:
                        payload = {"code": "validation_error", "error": msg_dict}
                else:
                    # If message list contains known phrases, map them
                    flat_msgs = []
                    if isinstance(messages, (list, tuple)):
                        flat_msgs = [str(m) for m in messages]
                    else:
                        flat_msgs = [str(messages)] if messages else []

                    joined = " ".join(flat_msgs).lower()
                    if "enter a valid email address" in joined:
                        payload = {"code": "invalid_email", "error": "Please enter a valid email address"}
                    elif "already exists" in joined or "user with this email" in joined or "unique" in joined:
                        payload = {"code": "email_exists", "error": "User with this Email already exists."}
                    else:
                        payload = {"code": "validation_error", "error": flat_msgs or str(e)}
            except Exception as parse_e:
                logger.exception("Error parsing ValidationError: %s", parse_e)
                payload = {"code": "validation_error", "error": messages or str(e)}

            return Response(payload, status=HTTP_400_BAD_REQUEST)

        except IntegrityError as ie:
            # This often happens for unique constraint violations at the DB level
            logger.warning("Sign_up IntegrityError: %s", ie)
            payload = {"code": "email_exists", "error": "User with this Email already exists."}
            return Response(payload, status=HTTP_400_BAD_REQUEST)

        except Exception as ex:
            # Unexpected errors: log and return a generic validation response
            logger.exception("Unexpected error in Sign_up: %s", ex)
            return Response({"code": "validation_error", "error": "Signup failed. Please try again."}, status=HTTP_400_BAD_REQUEST)


@method_decorator(ensure_csrf_cookie, name="dispatch")
class Log_in(APIView):
    def post(self, request):
        data = request.data.copy()
        data["username"] = request.data.get("username", request.data.get("email"))
        user = authenticate(username=data.get("username"), password=data.get("password"))
        logger.debug("Log_in authenticate returned: %s", user)
        if user:
            login(request, user)
            token, created = Token.objects.get_or_create(user=user)
            life_time = datetime.now() + timedelta(days=7)
            response = Response({"user": user.email}, status=HTTP_200_OK)
            response.set_cookie(
                key="token",
                value=token.key,
                httponly=True,
                secure=False,  # True in production with HTTPS
                samesite="Lax",
                expires=life_time,
            )
            return response
        return Response({"code": "bad_credentials", "error": "No user matching credentials"}, status=HTTP_400_BAD_REQUEST)


class HttpOnlyTokenAuthentication(TokenAuthentication):
    def get_auth_token_from_cookie(self, request):
        # Extract the token from the 'auth_token' HttpOnly cookie
        return request.COOKIES.get("token")

    def authenticate(self, request):
        # Get the token from the HttpOnly cookie
        auth_token = self.get_auth_token_from_cookie(request)
        if not auth_token:
            # If the token is not found, return None and let other authentication classes handle the authentication
            return None
        # The original TokenAuthentication class handles token validation and user retrieval
        return self.authenticate_credentials(auth_token)


class TokenReq(APIView):
    authentication_classes = [HttpOnlyTokenAuthentication]
    permission_classes = [IsAuthenticated]


class Log_out(TokenReq):
    def post(self, request):
        request.user.auth_token.delete()
        response = Response(status=HTTP_204_NO_CONTENT)
        response.delete_cookie("token")
        logout(request)
        return response


class Info(TokenReq):
    def get(self, request):
        return Response({"user": request.user.username})

    def put(self, request):
        try:
            data = request.data.copy()
            ruser = request.user
            # check for display_name, age, address
            ruser.username = data.get("display_name", ruser.username)
            # authenticate credential
            cur_pass = data.get("password")
            if cur_pass and data.get("new_password"):
                auth_user = authenticate(username=ruser.username, password=cur_pass)
                if auth_user == ruser:
                    ruser.set_password(data.get("new_password"))

            # if credentials match the user
            # update password and save it
            ruser.full_clean()
            ruser.save()
            return Response({"username": ruser.username})
        except ValidationError as e:
            logger.debug("Info PUT validation error: %s", e)
            return Response({"code": "validation_error", "error": getattr(e, "message_dict", e.messages)}, status=HTTP_400_BAD_REQUEST)
