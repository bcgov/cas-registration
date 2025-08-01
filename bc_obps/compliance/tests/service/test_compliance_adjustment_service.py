from datetime import timedelta
import uuid
from django.utils import timezone
from compliance.service.compliance_adjustment_service import ComplianceAdjustmentService
import pytest
from decimal import Decimal
from unittest.mock import patch
from model_bakery.baker import make_recipe

ELICENSING_REFRESH_DATA_BY_COMPLIANCE_REPORT_VERSION_ID_PATH = "compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
ELICENSING_ADJUST_FEES_PATH = "compliance.service.elicensing.elicensing_api_client.ELicensingAPIClient.adjust_fees"


class TestComplianceAdjustmentService:
    """Tests for the ComplianceAdjustmentService class"""

    @pytest.mark.django_db
    @patch(ELICENSING_REFRESH_DATA_BY_COMPLIANCE_REPORT_VERSION_ID_PATH)
    @patch(ELICENSING_ADJUST_FEES_PATH)
    def test_create_adjustment(self, mock_adjust_fees, mock_refresh_data_wrapper):
        """Test successful creation of a compliance adjustment"""

        # Set up
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
        )
        reporting_year = compliance_report_version.compliance_report.compliance_period.reporting_year
        make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=reporting_year,
            rate=Decimal("50.00"),
        )
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
        )
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            last_refreshed=timezone.now() - timedelta(seconds=30),
            elicensing_client_operator_id=client_operator.id,
        )
        elicensing_line_item = make_recipe(
            'compliance.tests.utils.elicensing_line_item',
            elicensing_invoice=invoice,
            line_item_type="Fee",
            object_id=9999,
        )
        make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        mock_response = {
            'adjustments': [
                {
                    'adjustmentGUID': '60196767-2433-4f19-a526-65097d5b324e',
                    'adjustmentObjectId': 999,
                    'feeGUID': '',
                    'feeObjectId': 9999,
                }
            ],
            'clientObjectId': client_operator.client_object_id,
        }
        mock_adjust_fees.return_value = mock_response

        # API call
        ComplianceAdjustmentService.create_adjustment(
            compliance_report_version_id=compliance_report_version.id, adjustment_total=Decimal('160')
        )

        # Assertions
        mock_adjust_fees.assert_called_once()
        call_args = mock_adjust_fees.call_args
        assert call_args[0][0] == client_operator.client_object_id

        request_body = call_args[0][1]
        assert "adjustments" in request_body
        assert len(request_body["adjustments"]) == 1
        adjustment = request_body["adjustments"][0]

        assert adjustment["feeObjectId"] == elicensing_line_item.object_id
        assert uuid.UUID(adjustment["adjustmentGUID"], version=4)
        assert adjustment["adjustmentTotal"] == Decimal("160.0")
        assert adjustment["reason"] == "Compliance Units and/or Payments Applied"
        assert adjustment["type"] == "Adjustment"

        mock_refresh_data_wrapper.assert_called_once_with(
            compliance_report_version_id=compliance_report_version.id, force_refresh=True
        )

    @pytest.mark.django_db
    @patch(ELICENSING_ADJUST_FEES_PATH)
    def test_create_adjustment_api_failure(self, mock_adjust_fees):
        """Test handling of API failure when creating adjustment"""
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
        )
        client_operator = make_recipe(
            'compliance.tests.utils.elicensing_client_operator',
        )
        invoice = make_recipe(
            'compliance.tests.utils.elicensing_invoice',
            last_refreshed=timezone.now() - timedelta(seconds=30),
            elicensing_client_operator_id=client_operator.id,
        )
        make_recipe('compliance.tests.utils.elicensing_line_item', elicensing_invoice=invoice, line_item_type="Fee")
        make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=invoice,
        )

        mock_adjust_fees.side_effect = Exception("API connection error")

        with pytest.raises(ValueError) as excinfo:
            ComplianceAdjustmentService.create_adjustment(
                compliance_report_version_id=compliance_report_version.id, adjustment_total=160
            )

        assert "Failed to adjust fees" in str(excinfo.value)

        mock_adjust_fees.assert_called_once()

    @pytest.mark.django_db
    def test_create_adjustment_no_invoice(self):
        """Test handling of missing invoice when creating adjustment"""
        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
        )
        make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version,
            elicensing_invoice=None,
        )

        with pytest.raises(ValueError) as excinfo:
            ComplianceAdjustmentService.create_adjustment(
                compliance_report_version_id=compliance_report_version.id, adjustment_total=160
            )

        assert "No elicensing invoice found" in str(excinfo.value)
