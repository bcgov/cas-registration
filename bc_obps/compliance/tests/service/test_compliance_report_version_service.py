from decimal import Decimal
from compliance.service.compliance_report_version_service import ComplianceReportVersionService
import pytest
from unittest.mock import patch
from compliance.models import ComplianceReportVersion, ComplianceEarnedCredit
from model_bakery import baker

pytestmark = pytest.mark.django_db  # This is used to mark a test function as requiring the database


class TestComplianceReportVersionService:
    @patch(
        'compliance.service.compliance_report_version_service.ComplianceObligationService.create_compliance_obligation'
    )
    def test_create_compliance_report_version_with_excess_emissions(self, mock_create_obligation):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', excess_emissions=Decimal('10'), credited_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )

        # Assert
        mock_create_obligation.assert_called_once()

        assert result.status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id

    def test_determine_compliance_status(self):
        # Test OBLIGATION_NOT_MET
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('10.0'), Decimal('0.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET

        # Test EARNED_CREDITS
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('0.0'), Decimal('10.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS

        # Test OBLIGATION_FULLY_MET
        status = ComplianceReportVersionService._determine_compliance_status(Decimal('0.0'), Decimal('0.0'))
        assert status == ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET

    def test_create_compliance_report_version_with_credited_emissions(self):
        # Arrange
        report_compliance_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary', credited_emissions=Decimal('10.6'), excess_emissions=0
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report', report_id=report_compliance_summary.report_version.report_id
        )

        # Act
        result = ComplianceReportVersionService.create_compliance_report_version(
            compliance_report, report_compliance_summary.report_version.id
        )
        earned_credits_record = ComplianceEarnedCredit.objects.get(compliance_report_version_id=result.id)

        # Assert
        assert result.status == ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS
        assert result.report_compliance_summary_id == report_compliance_summary.id
        assert result.compliance_report_id == compliance_report.id
        assert earned_credits_record.earned_credits_amount == 10
