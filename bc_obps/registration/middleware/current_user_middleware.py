import json
from django.shortcuts import get_object_or_404
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
                request.current_user = user  # Attach user to request for access in API endpoints
            except Exception as e:
                print(e)

        response = self.get_response(request)
        return response
