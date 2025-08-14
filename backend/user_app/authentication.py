from rest_framework.authentication import TokenAuthentication
import logging

logger = logging.getLogger(__name__)

class HttpOnlyTokenAuthentication(TokenAuthentication):
    def get_auth_token_from_cookie(self, request):
            token = request.COOKIES.get('token')
            logger.debug("Request.COOKIES: %s", request.COOKIES)
            logger.debug("Token from cookie: %s", token)
            return token

    def authenticate(self, request):
        auth_token = self.get_auth_token_from_cookie(request)
        if not auth_token:
            logger.debug("No token found in cookie")
            return None
        try:
            user_auth_tuple = self.authenticate_credentials(auth_token)
            logger.debug("authenticate_credentials returned user: %s", getattr(user_auth_tuple[0], 'username', None))
            return user_auth_tuple
        except Exception as e:
            logger.exception("authenticate_credentials failed")
            raise
