import json
import logging
from common.tests.utils.call_endpoint import call_endpoint
import pytest
from unittest.mock import patch, MagicMock, ANY
from django.urls import get_resolver
from django.test import Client, override_settings, TestCase
from registration.utils import custom_reverse_lazy
from registration.models import User
from common.tests.endpoints.auth.constants import ENDPOINTS
from common.permissions import get_permission_configs
from registration.models import AppRole


@pytest.fixture(autouse=True)
def suppress_django_request_logs(caplog):
    caplog.set_level(logging.ERROR, logger="django.request")


@override_settings(MIDDLEWARE=[])  # Remove middleware to prevent checking the user in the database
class TestEndpointPermissions(TestCase):
    client = Client()
    endpoints_to_test = ENDPOINTS

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
                call_endpoint(cls.client, method, endpoint)
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
            # Below are endpoints that are accessible to all users so new users can be created
            "create_user_profile",
            "get_user_profile",
            "get_user_role",
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

    def test_no_duplicate_endpoints(self):
        """Check that there are no duplicate endpoints in the test data"""
        for role, endpoints in ENDPOINTS.items():
            seen = set()
            duplicates = set()
            for endpoint in endpoints:
                endpoint_key = (endpoint["method"], endpoint["endpoint_name"])
                if endpoint_key in seen:
                    duplicates.add(endpoint_key)
                else:
                    seen.add(endpoint_key)
            self.assertFalse(duplicates, f"Duplicate endpoints found in role '{role}': {duplicates}")

    @classmethod
    @patch("common.permissions.check_permission_for_role")
    def test_role_access_restrictions(cls, mock_check_permission_for_role):
        """
        Test that each role has the correct access restrictions for each endpoint.

        This test verifies that:
        - Each role can only access the endpoints they are authorized for.
        - Unauthorized roles receive a 401 status code when attempting to access restricted endpoints.

        Methods:
            get_authorized_roles(permission): Retrieves the roles authorized for a given permission.
            permission_side_effect(request, permission): Side effect function to simulate permission checks.

        Assertions:
            - Ensures unauthorized roles receive a 401 status code.
            - Verifies the permission check function is called with the correct parameters.
        """

        def get_authorized_roles(permission):
            permission_config = get_permission_configs(permission)
            return next(iter(permission_config.values()), [])

        def permission_side_effect(request, permission):
            auth_header = json.loads(request.headers.get("Authorization", "{}"))
            user = User.objects.get(user_guid=auth_header.get('user_guid'))
            request.current_user = user
            return user.app_role_id in get_authorized_roles(permission)

        mock_check_permission_for_role.side_effect = permission_side_effect

        for current_app_role in AppRole.get_all_app_roles():
            for permission_group, configs in cls.endpoints_to_test.items():
                authorized_app_roles = get_authorized_roles(permission_group)

                for config in configs:
                    endpoint = custom_reverse_lazy(config["endpoint_name"], kwargs=config.get("kwargs", {}))
                    method = config.get("method")
                    response = call_endpoint(cls.client, method, endpoint, current_app_role)

                    if current_app_role not in authorized_app_roles:
                        assert (
                            response.status_code == 401
                        ), f"Got {response.status_code} but expected 401 for unauthorized role {current_app_role} for endpoint {endpoint}"
                    mock_check_permission_for_role.assert_called_once_with(ANY, permission_group)
                    mock_check_permission_for_role.reset_mock()
