from unittest.mock import MagicMock
from model_bakery.baker import make_recipe
import pytest
from reporting.api.permissions import (
    check_operation_ownership,
    check_version_ownership_in_url,
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

        validator_under_test = check_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid == expected_validity

    def test_version_ownership_from_url_denies_access_if_no_user_operator_record(self):
        report_version = make_recipe("reporting.tests.utils.report_version")
        user = make_recipe("registration.tests.utils.industry_operator_user")

        validator_under_test = check_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": report_version.id}
        mock_request.current_user = user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_version_ownership_from_url_denies_access_if_wrong_url_parameter_name(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        report_version = make_recipe(
            "reporting.tests.utils.report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = check_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"another_id": report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_version_ownership_from_url_denies_access_if_no_version_in_url(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        make_recipe(
            "reporting.tests.utils.report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = check_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False


class TestOperationOwnershipFromPayload:
    @pytest.mark.parametrize("role,status,expected_validity", role_status_access_tuples)
    def test_operation_ownership_from_payload(self, role, status, expected_validity):
        user_operator = make_recipe("registration.tests.utils.user_operator", role=role, status=status)
        operation = make_recipe("registration.tests.utils.operation", operator=user_operator.operator)
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=user_operator.operator,
            start_date="2023-01-01",
            end_date=None,
        )

        validator_under_test = check_operation_ownership()

        mock_request = MagicMock()
        mock_request.body = f'{{"operation_id": "{operation.id}", "reporting_year": 2024}}'
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid == expected_validity

    def test_operation_ownership_from_payload_denies_if_no_user_operator_record(self):
        operation = make_recipe("registration.tests.utils.operation")
        user = make_recipe("registration.tests.utils.industry_operator_user")
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=operation.operator,
            start_date="2023-01-01",
            end_date=None,
        )

        validator_under_test = check_operation_ownership()

        mock_request = MagicMock()
        mock_request.body = f'{{"operation_id": "{operation.id}", "reporting_year": 2024}}'
        mock_request.current_user = user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_operation_ownership_from_payload_denies_access_if_missing_field_in_payload(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        operation = make_recipe("registration.tests.utils.operation", operator=user_operator.operator)

        validator_under_test = check_operation_ownership()

        mock_request = MagicMock()
        mock_request.body = f'{{"some_other_payload": "{operation.id}", "reporting_year": 2024}}'
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

        mock_request.body = f'{{"operation_id": "{operation.id}", "some_other_year": 2024}}'

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_operation_ownership_from_payload_allows_access_for_previous_operator(self):
        old_user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        new_user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        operation = make_recipe("registration.tests.utils.operation", operator=new_user_operator.operator)

        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=old_user_operator.operator,
            start_date="2024-01-01",
            end_date="2025-01-31",
        )
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=new_user_operator.operator,
            start_date="2025-02-01",
            end_date=None,
        )

        validator_under_test = check_operation_ownership()

        mock_request = MagicMock()
        mock_request.body = f'{{"operation_id": "{operation.id}", "reporting_year": 2024}}'
        mock_request.current_user = old_user_operator.user

        is_valid = validator_under_test(mock_request)
        # When reporting year is 2024, old operator has access and new operator does not
        assert is_valid is True

        mock_request.current_user = new_user_operator.user
        is_valid = validator_under_test(mock_request)
        assert is_valid is False

        mock_request.body = f'{{"operation_id": "{operation.id}", "reporting_year": 2025}}'
        is_valid = validator_under_test(mock_request)

        # When reporting year is 2025, new operator has access and old operator does not
        assert is_valid is True

        mock_request.current_user = old_user_operator.user
        is_valid = validator_under_test(mock_request)

        assert is_valid is False
