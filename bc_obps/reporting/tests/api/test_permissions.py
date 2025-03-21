from unittest.mock import MagicMock
from model_bakery.baker import make_recipe
import pytest
from reporting.api.permissions import (
    validate_operation_ownership_from_payload,
    validate_version_ownership_from_url,
)


pytestmark = pytest.mark.django_db

role_status_access_tuples = [
    ("pending", "Approved", False),
    ("pending", "Pending", False),
    ("pending", "Declined", False),
    ("admin", "Pending", False),
    ("admin", "Declined", False),
    ("reporter", "Pending", False),
    ("reporter", "Pending", False),
    ("admin", "Approved", True),
    ("reporter", "Approved", True),
]


class TestVersionOwnershipFromUrl:
    @pytest.mark.parametrize("role,status,expected_validity", role_status_access_tuples)
    def test_version_ownership_from_url(self, role, status, expected_validity):
        user_operator = make_recipe("registration.tests.utils.user_operator", role=role, status=status)
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = validate_version_ownership_from_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid == expected_validity

    def test_version_ownership_from_url_denies_access_if_no_user_operator_record(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        user = make_recipe("registration.tests.utils.industry_operator_user")

        validator_under_test = validate_version_ownership_from_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": report_version.id}
        mock_request.current_user = user

        is_valid = validator_under_test(mock_request)

        assert not is_valid

    def test_version_ownership_from_url_denies_access_if_wrong_url_parameter_name(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = validate_version_ownership_from_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"another_id": report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert not is_valid

    def test_version_ownership_from_url_denies_access_if_no_version_in_url(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        make_recipe(
            "reporting.tests.utils.report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = validate_version_ownership_from_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert not is_valid


class TestOperationOwnershipFromPayload:
    @pytest.mark.parametrize("role,status,expected_validity", role_status_access_tuples)
    def test_operation_ownership_from_payload(self, role, status, expected_validity):
        user_operator = make_recipe("registration.tests.utils.user_operator", role=role, status=status)
        operation = make_recipe("registration.tests.utils.operation", operator=user_operator.operator)

        validator_under_test = validate_operation_ownership_from_payload()

        mock_request = MagicMock()
        mock_request.body = f'{{"operation_id": "{operation.id}"}}'
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid == expected_validity

    def test_operation_ownership_from_payload_denies_if_no_user_operator_record(self):
        operation = make_recipe("registration.tests.utils.operation")
        user = make_recipe("registration.tests.utils.industry_operator_user")

        validator_under_test = validate_operation_ownership_from_payload()

        mock_request = MagicMock()
        mock_request.body = f'{{"operation_id": "{operation.id}"}}'
        mock_request.current_user = user

        is_valid = validator_under_test(mock_request)

        assert not is_valid

    def test_operation_ownership_from_payload_denies_access_if_missing_field_in_payload(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        operation = make_recipe("registration.tests.utils.operation", operator=user_operator.operator)

        validator_under_test = validate_operation_ownership_from_payload()

        mock_request = MagicMock()
        mock_request.body = f'{{"some_other_payload": "{operation.id}"}}'
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert not is_valid
