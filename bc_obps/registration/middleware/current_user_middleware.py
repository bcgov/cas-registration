import json
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from registration.constants import USER_CACHE_PREFIX
from registration.models import User


class CurrentUserMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                user_guid = json.loads(auth_header).get('user_guid')
                user = get_object_or_404(User, user_guid=user_guid)

                # # Try to get the user from cache
                # cache_key = f"{USER_CACHE_PREFIX}{user_guid}"
                # user = cache.get(cache_key)

                # if not user:
                #     # If user is not in cache, fetch from database
                #     user = get_object_or_404(User, user_guid=user_guid)

                #     # Cache the user for 5 minutes
                #     cache.set(cache_key, user, 300)

                request.current_user = user  # Attach user to request for access in API endpoints

            except Exception as e:
                print(e)

        response = self.get_response(request)
        return response
