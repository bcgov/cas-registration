from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy
from compliance.dataclass import ObligationData, PaymentDataWithFreshnessFlag
from compliance.models import ElicensingPayment


class TestObligationByComplianceReportVersionEndpoint(CommonTestSetup):
    @staticmethod
    def _get_endpoint_url(compliance_report_version_id):
        return custom_reverse_lazy(
            "get_obligation_by_compliance_report_version_id",
            kwargs={"compliance_report_version_id": compliance_report_version_id},
        )

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id"
    )
    @patch(
        "compliance.service.compliance_obligation_service.ComplianceObligationService.get_obligation_data_by_report_version"
    )
    def test_successful_obligation_retrieval(self, mock_get_obligation_data, mock_get_payment_data):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=approved_user_operator.operator,
        )

        mock_obligation_data = ObligationData(
            reporting_year=2023,
            outstanding_balance=Decimal("1000.00"),
            equivalent_value=Decimal("40000.00"),
            fee_amount_dollars=Decimal("40000.00"),
            obligation_id="23-0001-1-1",
            penalty_status="NONE",
            data_is_fresh=True,
        )
        mock_get_obligation_data.return_value = mock_obligation_data

        mock_payment_data = PaymentDataWithFreshnessFlag(
            data_is_fresh=True,
            data=ElicensingPayment.objects.none(),
        )
        mock_get_payment_data.return_value = mock_payment_data

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["reporting_year"] == 2023
        assert response_data["outstanding_balance"] == "1000.00"
        assert response_data["equivalent_value"] == "40000.00"
        assert response_data["obligation_id"] == "23-0001-1-1"
        assert response_data["data_is_fresh"] is True
        assert response_data["payment_data"]["data_is_fresh"] is True
        assert response_data["payment_data"]["rows"] == []
        assert response_data["payment_data"]["row_count"] == 0

        # Verify services were called with correct parameters
        mock_get_obligation_data.assert_called_once_with(compliance_report_version.id)
        mock_get_payment_data.assert_called_once_with(compliance_report_version_id=compliance_report_version.id)

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id"
    )
    @patch(
        "compliance.service.compliance_obligation_service.ComplianceObligationService.get_obligation_data_by_report_version"
    )
    def test_obligation_with_zero_balance(self, mock_get_obligation_data, mock_get_payment_data):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=approved_user_operator.operator,
        )

        mock_obligation_data = ObligationData(
            reporting_year=2023,
            outstanding_balance=Decimal("0.00"),
            equivalent_value=Decimal("0.00"),
            fee_amount_dollars=Decimal("0.00"),
            obligation_id="23-0001-1-1",
            penalty_status="NONE",
            data_is_fresh=True,
        )
        mock_get_obligation_data.return_value = mock_obligation_data

        mock_payment_data = PaymentDataWithFreshnessFlag(
            data_is_fresh=True,
            data=ElicensingPayment.objects.none(),
        )
        mock_get_payment_data.return_value = mock_payment_data

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["reporting_year"] == 2023
        assert response_data["outstanding_balance"] == "0.00"
        assert response_data["equivalent_value"] == "0.00"
        assert response_data["obligation_id"] == "23-0001-1-1"

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id"
    )
    @patch(
        "compliance.service.compliance_obligation_service.ComplianceObligationService.get_obligation_data_by_report_version"
    )
    def test_obligation_with_large_amounts(self, mock_get_obligation_data, mock_get_payment_data):
        # Arrange
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=approved_user_operator.operator,
        )

        mock_obligation_data = ObligationData(
            reporting_year=2024,
            outstanding_balance=Decimal("999999.99"),
            equivalent_value=Decimal("39999999.60"),
            fee_amount_dollars=Decimal("39999999.60"),
            obligation_id="24-0999-999-999",
            penalty_status="NONE",
            data_is_fresh=True,
        )
        mock_get_obligation_data.return_value = mock_obligation_data

        mock_payment_data = PaymentDataWithFreshnessFlag(
            data_is_fresh=True,
            data=ElicensingPayment.objects.none(),
        )
        mock_get_payment_data.return_value = mock_payment_data

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 200
        response_data = response.json()
        assert response_data["reporting_year"] == 2024
        assert response_data["outstanding_balance"] == "999999.99"
        assert response_data["equivalent_value"] == "39999999.60"
        assert response_data["obligation_id"] == "24-0999-999-999"

    def test_invalid_compliance_report_version_id(self):
        # Arrange
        invalid_compliance_report_version_id = 99999  # Assuming this ID does not exist in the database

        # Act
        TestUtils.authorize_current_user_as_operator_user(
            self, operator=make_recipe('registration.tests.utils.operator')
        )
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(invalid_compliance_report_version_id),
        )

        # Assert
        assert response.status_code == 404
        assert response.json() == {'message': 'Not Found'}

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id"
    )
    @patch(
        "compliance.service.compliance_obligation_service.ComplianceObligationService.get_obligation_data_by_report_version"
    )
    def test_service_raises_does_not_exist_exception(self, mock_get_obligation_data, mock_get_payment_data):
        # Arrange
        from compliance.models import ComplianceObligation

        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=approved_user_operator.operator,
        )

        mock_get_obligation_data.side_effect = ComplianceObligation.DoesNotExist("No obligation found")

        # Act
        TestUtils.authorize_current_user_as_operator_user(self, operator=approved_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 404
        assert response.json() == {'message': 'Not Found'}

    def test_access_to_other_operators_obligation(self):
        # Arrange
        other_operator = make_recipe('registration.tests.utils.operator')
        current_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # Create compliance report version for other operator
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report__report__operation__operator=other_operator,
        )

        # Act - Try to access other operator's obligation
        TestUtils.authorize_current_user_as_operator_user(self, operator=current_user_operator.operator)
        response = TestUtils.mock_get_with_auth_role(
            self,
            "industry_user",
            self._get_endpoint_url(compliance_report_version.id),
        )

        # Assert
        assert response.status_code == 404
        assert response.json() == {'message': 'Not Found'}
