from unittest.mock import patch

from common.tests.utils.call_endpoint import call_endpoint
from django.test import Client
from registration.utils import custom_reverse_lazy

client = Client()

#
# Testing utility to verify that an endpoint validates its report version with our
# auth=authorize(..., validators) method
#
# params:
#   reverse_api_function_name: the name of the function defined, the endpoint will be resolved by
#                              calling custom_reverse_lazy on it.
#   method: HTTP verb, lowercase
#   version_id_param_name: the key containing the report version id in the URL
#                          example: "submit" for an endpoint "report-version/{version_id}/submit"
#   role: the user role to test with
#
def assert_report_version_ownership_is_validated(
    reverse_api_function_name: str,
    method="get",
    version_id_param_name: str = "version_id",
    role: str = "industry_user",
):
    with patch("common.permissions.check_permission_for_role") as mock_check_permissions, patch(
        "reporting.api.permissions._validate_version_ownership_in_url"
    ) as mock_validate_version_ownership:
        mock_check_permissions.return_value = True

        endpoint = custom_reverse_lazy(reverse_api_function_name, kwargs={version_id_param_name: 1234})
        call_endpoint(client, method, endpoint, role)

        mock_validate_version_ownership.assert_called_once()
