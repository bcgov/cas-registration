from decimal import Decimal
from reporting.models import ReportVersion
from compliance.service.supplementary_version_service import SupplementaryVersionService
import pytest
from unittest.mock import patch
from compliance.models import ComplianceReportVersion, ComplianceObligation, ComplianceChargeRate
from model_bakery import baker
import common.lib.pgtrigger as pgtrigger
from registration.models import Operation

pytestmark = pytest.mark.django_db(transaction=True)  # This is used to mark a test function as requiring the database


class TestSupplementaryVersionService:
    @patch(
        'compliance.service.compliance_report_version_service.ComplianceReportVersionService._process_obligation_integration'
    )
    def test_handle_increased_obligation_success(self, mock_integration):
        # Arrange

        operator = baker.make_recipe('registration.tests.utils.operator')

        operation = baker.make_recipe(
            'registration.tests.utils.operation',
            bc_obps_regulated_operation=baker.make_recipe("registration.tests.utils.boro_id"),
            status=Operation.Statuses.REGISTERED,
            operator=operator,
        )

        report = baker.make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=operation, operator=operator
        )
        report_version_1 = baker.make_recipe(
            'reporting.tests.utils.report_version', report=report, status=ReportVersion.ReportVersionStatus.Submitted
        )
        report_version_2 = baker.make_recipe('reporting.tests.utils.report_version', report=report)
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            report_compliance_summary_1 = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=report_version_1,
            )
        report_compliance_summary_2 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report=report, compliance_period_id=1
        )
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary_1,
        )

        # Act
        result = SupplementaryVersionService.handle_supplementary_version(compliance_report, report_version_2, 2)

        # Assert
        mock_integration.assert_called_once()

        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.report_compliance_summary_id == report_compliance_summary_2.id
        assert result.compliance_report_id == compliance_report.id
        assert result.excess_emissions_delta_from_previous == Decimal('300')
        assert result.is_supplementary == True  # noqa: E712
        assert (
            ComplianceObligation.objects.get(compliance_report_version_id=result.id).fee_amount_dollars
            == Decimal('300') * ComplianceChargeRate.objects.get(reporting_year_id=2025).rate
        )
