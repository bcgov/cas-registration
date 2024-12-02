from django.db import connection
from uuid import UUID
import json


class RlsMiddleware(object):
    def __init__(self, get_response):  # type: ignore
        self.get_response = get_response

    def __call__(self, request):  # type: ignore
        auth_header = request.headers.get('Authorization')
        if auth_header:
            user_guid = UUID(json.loads(auth_header).get('user_guid'), version=4)
            with connection.cursor() as cursor:
                cursor.execute(f'SET my.guid = "{user_guid}" ')
                cursor.execute("select app_role_id from erc.user")
                role = cursor.fetchone()
                cursor.execute(f'SET role "{role[0]}" ')

            response = self.get_response(request)
            with connection.cursor() as cursor:
                cursor.execute("select current_setting('my.guid', true)")
                x = cursor.fetchone()
                print("GUID: ", x)
                cursor.execute("select current_role")
                y = cursor.fetchone()
                print("ROLE: ", y)
            return response
        response = self.get_response(request)
        return response
