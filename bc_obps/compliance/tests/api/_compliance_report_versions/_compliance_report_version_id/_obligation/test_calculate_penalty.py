from datetime import date
from decimal import Decimal
from urllib.parse import urlencode
from unittest.mock import patch

from compliance.models import CompliancePenalty
from compliance.schema.calculated_penalty import (
    CalculatedPenaltyOut,
    PenaltyAccrual,
    PenaltyTypeStatus,
)
from compliance.tests.utils.compliance_test_helper import ComplianceTestHelper
from registration.tests.utils.helpers import CommonTestSetup, TestUtils
from registration.utils import custom_reverse_lazy

CALCULATE_PENALTY_SERVICE_METHOD = (
    "compliance.service.penalty_calculation_service.PenaltyCalculationService.calculate_penalty_for_obligation"
)


class TestCalculatePenaltyEndpoint(CommonTestSetup):
    @staticmethod
    def _get_endpoint_url(compliance_report_version_id, **query_params):
        url = custom_reverse_lazy(
            "get_calculated_penalty_for_obligation",
            kwargs={"compliance_report_version_id": compliance_report_version_id},
        )
        return f"{url}?{urlencode(query_params)}" if query_params else url

    @staticmethod
    def _calculated_penalty(**overrides):
        defaults = {
            "automatic_overdue_penalty_status": PenaltyTypeStatus.ACCRUING,
            "ggeapar_interest_status": PenaltyTypeStatus.NONE,
            "penalty_type": CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
            "days_late": 3,
            "total_penalty": Decimal("30.00"),
            "daily_accumulated_list": [
                PenaltyAccrual(
                    date="2025-01-01",
                    interest_rate=Decimal("0.38"),
                    daily_penalty=Decimal("10.00"),
                    daily_compounded=Decimal("1.00"),
                    accumulated_penalty=Decimal("10.00"),
                    accumulated_compounded=Decimal("1.00"),
                )
            ],
        }
        return CalculatedPenaltyOut(**{**defaults, **overrides})

    @patch(CALCULATE_PENALTY_SERVICE_METHOD)
    def test_returns_calculated_automatic_overdue_penalty(self, mock_calculate_penalty_for_obligation):
        mock_calculate_penalty_for_obligation.return_value = self._calculated_penalty()
        compliance_report_version = ComplianceTestHelper.build_test_data().compliance_report_version

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            self._get_endpoint_url(
                compliance_report_version.id,
                requested_penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
                end_date="2025-01-10",
            ),
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data["penalty_type"] == CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE
        assert response_data["days_late"] == 3
        assert response_data["total_penalty"] == "30.00"
        assert response_data["automatic_overdue_penalty_status"] == PenaltyTypeStatus.ACCRUING.value
        assert len(response_data["daily_accumulated_list"]) == 1
        assert response_data["daily_accumulated_list"][0]["date"] == "2025-01-01"
        assert response_data["daily_accumulated_list"][0]["daily_penalty"] == "10.00"

    @patch(CALCULATE_PENALTY_SERVICE_METHOD)
    def test_passes_requested_penalty_type_and_end_date_through_to_the_service(
        self, mock_calculate_penalty_for_obligation
    ):
        mock_calculate_penalty_for_obligation.return_value = self._calculated_penalty(
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
            ggeapar_interest_status=PenaltyTypeStatus.ACCRUING,
        )
        compliance_report_version = ComplianceTestHelper.build_test_data().compliance_report_version

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            self._get_endpoint_url(
                compliance_report_version.id,
                requested_penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
                end_date="2025-01-10",
            ),
        )

        assert response.status_code == 200
        _, kwargs = mock_calculate_penalty_for_obligation.call_args
        assert kwargs["compliance_report_version_id"] == compliance_report_version.id
        assert kwargs["requested_penalty_type"] == CompliancePenalty.PenaltyType.LATE_SUBMISSION
        assert kwargs["end_date"] == date(2025, 1, 10)

    @patch(CALCULATE_PENALTY_SERVICE_METHOD)
    def test_reports_an_inapplicable_penalty_type_as_a_status_with_zeroed_figures(
        self, mock_calculate_penalty_for_obligation
    ):
        mock_calculate_penalty_for_obligation.return_value = CalculatedPenaltyOut(
            automatic_overdue_penalty_status=PenaltyTypeStatus.ACCRUING,
            ggeapar_interest_status=PenaltyTypeStatus.NOT_APPLICABLE,
            penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
        )
        compliance_report_version = ComplianceTestHelper.build_test_data().compliance_report_version

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            self._get_endpoint_url(
                compliance_report_version.id,
                requested_penalty_type=CompliancePenalty.PenaltyType.LATE_SUBMISSION,
                end_date="2025-01-10",
            ),
        )

        assert response.status_code == 200
        response_data = response.json()
        assert response_data["ggeapar_interest_status"] == PenaltyTypeStatus.NOT_APPLICABLE.value
        assert response_data["days_late"] == 0
        assert response_data["total_penalty"] == "0.00"
        assert response_data["daily_accumulated_list"] == []

    @patch(CALCULATE_PENALTY_SERVICE_METHOD)
    def test_rejects_an_unrecognized_penalty_type(self, mock_calculate_penalty_for_obligation):
        compliance_report_version = ComplianceTestHelper.build_test_data().compliance_report_version

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            self._get_endpoint_url(
                compliance_report_version.id,
                requested_penalty_type="ggeapar",
                end_date="2025-01-10",
            ),
        )

        assert response.status_code == 422
        mock_calculate_penalty_for_obligation.assert_not_called()

    @patch(CALCULATE_PENALTY_SERVICE_METHOD)
    def test_rejects_a_malformed_end_date(self, mock_calculate_penalty_for_obligation):
        compliance_report_version = ComplianceTestHelper.build_test_data().compliance_report_version

        response = TestUtils.mock_get_with_auth_role(
            self,
            "cas_analyst",
            self._get_endpoint_url(
                compliance_report_version.id,
                requested_penalty_type=CompliancePenalty.PenaltyType.AUTOMATIC_OVERDUE,
                end_date="not-a-date",
            ),
        )

        assert response.status_code == 422
        mock_calculate_penalty_for_obligation.assert_not_called()
