import json
from model_bakery import baker
from registration.models.user import User


def call_endpoint(client, method, endpoint, app_role=None):
    client_method = getattr(client, method)
    kwargs = {
        'path': endpoint,
    }

    if app_role:
        user = baker.make(
            User, app_role_id=app_role, _fill_optional=True
        )  # Passing _fill_optional to fill all fields with random data
        auth_header = {'user_guid': str(user.user_guid)}
        kwargs['HTTP_AUTHORIZATION'] = json.dumps(auth_header)

    if method.lower() != "get":
        kwargs.update({'content_type': "application/json", 'data': {}})

    return client_method(**kwargs)
