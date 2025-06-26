from django.test import TestCase
from unittest.mock import patch
import pytest
from model_bakery.baker import make_recipe
from compliance.service.elicensing.elicensing_data_refresh_service import RefreshWrapperReturn
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from compliance.models import ComplianceReportVersion
from registration.models import Operation


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""

    @pytest.mark.django_db
    @patch(
        'compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id'
    )
    def test_get_compliance_obligation_payments_by_compliance_report_version_id(self, mock_refresh):
        payment_1 = make_recipe('compliance.tests.utils.elicensing_payment')
        payment_2 = make_recipe(
            'compliance.tests.utils.elicensing_payment', elicensing_line_item=payment_1.elicensing_line_item
        )
        obligation = make_recipe(
            'compliance.tests.utils.compliance_obligation',
            elicensing_invoice=payment_1.elicensing_line_item.elicensing_invoice,
        )
        mock_refresh.return_value = RefreshWrapperReturn(
            data_is_fresh=True, invoice=payment_1.elicensing_line_item.elicensing_invoice
        )
        returned_data = ComplianceDashboardService.get_compliance_obligation_payments_by_compliance_report_version_id(
            compliance_report_version_id=obligation.compliance_report_version_id
        )
        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.data.first() == payment_1
        assert returned_data.data.last() == payment_2

    @pytest.mark.django_db
    @patch(
        'compliance.service.compliance_report_version_service.ComplianceReportVersionService.get_compliance_report_versions_for_previously_owned_operations'
    )
    def test_get_compliance_report_versions_for_dashboard(self, mock_previously_owned):
        user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        operation = make_recipe(
            'registration.tests.utils.operation', operator=user_operator.operator, status=Operation.Statuses.REGISTERED
        )

        report = make_recipe('reporting.tests.utils.report', operator=user_operator.operator, operation=operation)
        compliance_report = make_recipe('compliance.tests.utils.compliance_report', report=report)
        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report
        )
        previous_compliance_report_version = make_recipe('compliance.tests.utils.compliance_report_version')
        mock_previously_owned.return_value = ComplianceReportVersion.objects.filter(
            id=previous_compliance_report_version.id
        )

        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user_operator.user.user_guid
        )

        # Returns the union of reports for currently owned operations & reports for previously owned operations
        assert result.count() == 2
        assert result.first() == compliance_report_version
        assert result.last() == previous_compliance_report_version
