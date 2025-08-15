from unittest.mock import MagicMock
from model_bakery.baker import make_recipe
import pytest
from compliance.api.permissions import (
    check_compliance_version_ownership_in_url,
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
    def test_compliance_version_ownership_from_url_success(self, role, status, expected_validity):
        # Setup
        user_operator = make_recipe("registration.tests.utils.user_operator", role=role, status=status)

        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operator=user_operator.operator,
        )

        validator_under_test = check_compliance_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": compliance_report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid == expected_validity

    def test_version_ownership_from_url_denies_access_if_report_not_owned_by_operator(self):
        compliance_report_version = make_recipe("compliance.tests.utils.compliance_report_version")
        user = make_recipe("registration.tests.utils.industry_operator_user")

        validator_under_test = check_compliance_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": compliance_report_version.id}
        mock_request.current_user = user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_version_ownership_from_url_denies_access_if_operation_transferred(self):
        old_user_operator = make_recipe("registration.tests.utils.approved_user_operator")
        new_user_operator = make_recipe("registration.tests.utils.approved_user_operator")
        operation = make_recipe("registration.tests.utils.operation", operator=new_user_operator.operator)
        # timeline
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=old_user_operator.operator,
            start_date="2023-05-01",
            end_date="2023-12-31",
        )
        make_recipe(
            "registration.tests.utils.operation_designated_operator_timeline",
            operation=operation,
            operator=new_user_operator.operator,
            start_date="2024-01-01",
            end_date=None,
        )

        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            report__operator=new_user_operator.operator,
            compliance_report__created_at='2024-06-15',
            compliance_report__report__operation=operation,
        )

        validator_under_test = check_compliance_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"test_id": compliance_report_version.id}
        mock_request.current_user = old_user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_version_ownership_from_url_denies_access_if_wrong_url_parameter_name(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = check_compliance_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {"another_id": compliance_report_version.id}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False

    def test_version_ownership_from_url_denies_access_if_no_version_in_url(self):
        user_operator = make_recipe("registration.tests.utils.user_operator", role="admin", status="Approved")
        make_recipe(
            "compliance.tests.utils.compliance_report_version",
            report__operator=user_operator.operator,
        )

        validator_under_test = check_compliance_version_ownership_in_url("test_id")

        mock_request = MagicMock()
        mock_request.resolver_match.kwargs = {}
        mock_request.current_user = user_operator.user

        is_valid = validator_under_test(mock_request)

        assert is_valid is False
