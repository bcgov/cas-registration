from decimal import Decimal
import pytest
import common.lib.pgtrigger as pgtrigger
from model_bakery import baker
from compliance.models import ComplianceReportVersion, ComplianceReportVersionManualHandling
from compliance.service.supplementary_version_service.manual_handler import ManualHandler
from compliance.tests.service.supplementary_version_service.utils import BaseSupplementaryVersionServiceTest

pytestmark = pytest.mark.django_db(transaction=True)


class TestManualHandler(BaseSupplementaryVersionServiceTest):
    def test_can_handle_report_that_previously_required_manual_handling(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )

        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Previous CRV that *does* have a manual-handling record
        previous_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version_manual_handling',
            compliance_report_version=previous_crv,
            handling_type=ComplianceReportVersionManualHandling.HandlingType.OBLIGATION,
            context=ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH,
        )

        # Act
        can_handle = ManualHandler.can_handle(
            new_summary=new_summary,
            previous_summary=previous_summary,
        )

        # Assert
        assert can_handle is True

    def test_cannot_handle_report_that_did_not_previously_require_manual_handling(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )

        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Previous CRV but NO manual-handling record attached
        baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        # Act
        can_handle = ManualHandler.can_handle(
            new_summary=new_summary,
            previous_summary=previous_summary,
        )

        # Assert
        assert can_handle is False

    def test_handle_creates_compliance_report_version(self):
        # Arrange
        with pgtrigger.ignore('reporting.ReportComplianceSummary:immutable_report_version'):
            previous_summary = baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
                report_version=self.report_version_1,
            )

        new_summary = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('800'),
            credited_emissions=0,
            report_version=self.report_version_2,
        )
        compliance_report = baker.make_recipe(
            'compliance.tests.utils.compliance_report',
            report=self.report,
            compliance_period_id=1,
        )

        # Previous CRV that *does* have a manual-handling record
        previous_crv = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=previous_summary,
        )

        previous_manual = baker.make_recipe(
            'compliance.tests.utils.compliance_report_version_manual_handling',
            compliance_report_version=previous_crv,
            handling_type=ComplianceReportVersionManualHandling.HandlingType.OBLIGATION,
            context=ComplianceReportVersionManualHandling.Context.OBLIGATION_REFUND_POOL_CASH,
        )

        # Act
        result = ManualHandler.handle(
            compliance_report=compliance_report,
            new_summary=new_summary,
            previous_summary=previous_summary,
            version_count=2,
        )

        # Assert – new CRV created with expected attributes
        assert isinstance(result, ComplianceReportVersion)
        assert result.compliance_report == compliance_report
        assert result.report_compliance_summary == new_summary
        assert result.is_supplementary is True
        assert result.previous_version == previous_crv
        assert result.status == ComplianceReportVersion.ComplianceStatus.REQUIRES_MANUAL_HANDLING

        # And a new manual-handling record carrying forward handling_type/context
        new_manual = ComplianceReportVersionManualHandling.objects.get(compliance_report_version=result)
        assert new_manual.handling_type == previous_manual.handling_type
        assert new_manual.context == previous_manual.context
        # Comments/dates should *not* be copied over
        assert new_manual.analyst_comment in ("", None)
        assert new_manual.analyst_submitted_date is None
        assert new_manual.analyst_submitted_by is None
        assert new_manual.director_decision == (
            ComplianceReportVersionManualHandling.DirectorDecision.PENDING_MANUAL_HANDLING
        )
        assert new_manual.director_decision_date is None
        assert new_manual.director_decision_by is None
