import json
import logging
import pytest
from unittest.mock import patch, MagicMock, ANY
from django.urls import get_resolver
from django.test import Client, override_settings, TestCase
from registration.utils import custom_reverse_lazy
from registration.models import User
from common.tests.endpoints.auth.test_endpoints_list import ENDPOINTS, mock_uuid
from common.permissions import get_permission_configs
from registration.models import AppRole, UserOperator, Operator, Operation, Facility
from registration.tests.utils.bakers import operator_baker, operation_baker, user_operator_baker
from model_bakery import baker


@pytest.fixture(autouse=True)
def suppress_django_request_logs(caplog):
    caplog.set_level(logging.ERROR, logger="django.request")


@override_settings(MIDDLEWARE=[])  # Remove middleware to prevent checking the user in the database
class TestEndpointPermissions(TestCase):
    client = Client()
    endpoints_to_test = ENDPOINTS
    auth_headers = {}

    @classmethod
    def setup(cls, app_role):

        if app_role in cls.auth_headers:
            return cls.auth_headers[app_role]
        else:
            Operation.objects.filter(id=mock_uuid).delete()
            Operation.objects.filter(operator_id=mock_uuid).delete()
            Operator.objects.filter(id=mock_uuid).delete()  # Clear first
            Facility.objects.filter(id=mock_uuid).delete()
            UserOperator.objects.filter(id=mock_uuid).delete()
            User.objects.filter(user_guid=mock_uuid).delete()
            user = baker.make(User, user_guid=mock_uuid, app_role_id=app_role)
            if app_role != 'cas_pending':
                operator = operator_baker({'id': mock_uuid})
                user_operator = user_operator_baker(
                    {
                        'id': mock_uuid,
                        'user': user,
                        'operator': operator,
                        'status': UserOperator.Statuses.APPROVED,
                        'role': UserOperator.Roles.ADMIN,
                    }
                )
                operation_baker(user_operator.operator.id, id=mock_uuid)
            baker.make_recipe('registration.tests.utils.facility', id=mock_uuid)
            auth_header = {'user_guid': str(user.user_guid)}
            auth_header_dumps = json.dumps(auth_header)
            cls.auth_headers[app_role] = auth_header_dumps

        return cls.auth_headers[app_role]

    @classmethod
    def _call_endpoint(cls, method, endpoint, app_role=None):
        client_method = getattr(cls.client, method)
        kwargs = {
            'path': endpoint,
        }

        if app_role:
            kwargs['HTTP_AUTHORIZATION'] = cls.setup(app_role)

        if method.lower() != "get":
            kwargs.update({'content_type': "application/json", 'data': {}})

        return client_method(**kwargs)

    @classmethod
    @patch("common.permissions.check_permission_for_role")
    def test_endpoint_permissions_by_role(
        cls,
        mock_check_permission_for_role: MagicMock,
    ):
        for role, configs in cls.endpoints_to_test.items():
            for config in configs:
                endpoint = custom_reverse_lazy(config["endpoint_name"], kwargs=config.get("kwargs", {}))
                method = config.get("method")
                cls._call_endpoint(method, endpoint)
                # Assert that the correct role check is called
                mock_check_permission_for_role.assert_called_once_with(ANY, role)
                # Reset mock after each subtest to isolate calls
                mock_check_permission_for_role.reset_mock()

    @classmethod
    def test_all_api_endpoints_are_permission_tested(cls):
        # these are the endpoints that we don't want to test
        exclusion_list = [
            "api-root",
            "openapi-json",
            "openapi-view",
            "setup",
            "v1_setup",
            # Below are endpoints that are accessible to all users so new users can be created
            "create_user_profile",
            "v1_create_user_profile",
            "get_user_profile",
            "v1_get_user_profile",
            "get_user_role",
            "v1_get_user_role",
            # TODO: Pending on the answer from Reporting Team
            "get_activities",
            "get_fuel_data",
        ]
        all_url_patterns = get_resolver().url_patterns[1].url_patterns  # index 1 is the API route
        valid_urls = [pattern.name for pattern in all_url_patterns if pattern.name not in exclusion_list]
        # Flatten endpoints_to_test to extract all endpoint names that are permission-tested
        tested_endpoints = {
            item["endpoint_name"] for role, configs in cls.endpoints_to_test.items() for item in configs
        }
        untested_endpoints = [url for url in valid_urls if url not in tested_endpoints]
        # Assert that all endpoints are tested; if not, raise an error with each endpoint on a new line
        assert not untested_endpoints, (
            f"The following endpoints (COUNT:{len(untested_endpoints)}) are not covered by permission tests:\n"
            + "\n".join(f"- {endpoint}" for endpoint in untested_endpoints)
        )

    @patch("common.permissions.check_permission_for_role")
    def test_role_access_restrictions(cls, mock_check_permission_for_role):
        app_roles = AppRole.get_all_app_roles()

        def get_authorized_roles(permission):
            permission_config = get_permission_configs(permission)
            return next(iter(permission_config.values()), [])

        def permission_side_effect(request, permission):
            authorized_app_roles = get_authorized_roles(permission)
            auth_header = json.loads(request.META.get('HTTP_AUTHORIZATION', '{}'))
            user = User.objects.get(user_guid=auth_header.get('user_guid'))

            request.current_user = user
            return user.app_role_id in authorized_app_roles

        mock_check_permission_for_role.side_effect = permission_side_effect

        for current_app_role in app_roles:
            for role, configs in cls.endpoints_to_test.items():
                authorized_app_roles = get_authorized_roles(role)

                for config in configs:
                    endpoint = custom_reverse_lazy(config["endpoint_name"], kwargs=config.get("kwargs", {}))
                    method = config.get("method")
                    response = cls._call_endpoint(method, endpoint, current_app_role)

                    if current_app_role not in authorized_app_roles:
                        assert (
                            response.status_code == 401
                        ), f"Got {response.status_code} but expected 401 for unauthorized role {current_app_role} for endpoint {endpoint}"
                    mock_check_permission_for_role.assert_called_once_with(ANY, role)
                    mock_check_permission_for_role.reset_mock()
