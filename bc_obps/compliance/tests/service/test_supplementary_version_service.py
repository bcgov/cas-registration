from decimal import Decimal
from reporting.models import ReportVersion
from compliance.service.supplementary_version_service import (
    NoChangeHandler,
    SupplementaryVersionService,
    IncreasedObligationHandler,
)
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
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_2, 2)

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

    def test_increased_obligation_handler(self):
        report_compliance_summary_1 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('500'),
            credited_emissions=0,
        )
        report_compliance_summary_2 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('100'),
            credited_emissions=0,
        )
        report_compliance_summary_3 = baker.make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            excess_emissions=Decimal('100'),
            credited_emissions=0,
        )
        # Increased Obligation Handler cannot handle a decreased obligation
        decrease_result = IncreasedObligationHandler().can_handle(
            report_compliance_summary_2, report_compliance_summary_1
        )
        assert decrease_result == False  # noqa: E712
        # Increased Obligation Handler cannot handle a static obligation
        decrease_result = IncreasedObligationHandler().can_handle(
            report_compliance_summary_2, report_compliance_summary_3
        )
        assert decrease_result == False  # noqa: E712
        # Increased Obligation Handler can handle an increased obligation
        decrease_result = IncreasedObligationHandler().can_handle(
            report_compliance_summary_1, report_compliance_summary_2
        )
        assert decrease_result == True  # noqa: E712

    def test_handle_no_change_success(self):
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
            excess_emissions=Decimal('500'),
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
        result = SupplementaryVersionService().handle_supplementary_version(compliance_report, report_version_2, 2)

        # Assert

        assert result.status == ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS
        assert result.report_compliance_summary_id == report_compliance_summary_2.id
        assert result.compliance_report_id == compliance_report.id
        assert result.excess_emissions_delta_from_previous == Decimal('0')
        assert result.is_supplementary == True  # noqa: E712

    def test_no_change_obligation_handler(self):
        # NoChange Obligation Handler cannot handle a change in excess emissions
        changed_excess_emissions = NoChangeHandler().can_handle(
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('700'),
                credited_emissions=0,
            ),
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('500'),
                credited_emissions=0,
            ),
        )
        assert changed_excess_emissions == False  # noqa: E712

        # NoChange Obligation Handler cannot handle a change in credited emissions
        changed_credited_emissions = NoChangeHandler().can_handle(
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),
            ),
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('150'),
            ),
        )
        assert changed_credited_emissions == False  # noqa: E712

        # NoChanges Obligation Handler can handle no changes when there are credited emissions
        unchanged_credited_emissions = NoChangeHandler().can_handle(
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),
            ),
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=0,
                credited_emissions=Decimal('100'),
            ),
        )
        assert unchanged_credited_emissions == True  # noqa: E712

        # NoChange Obligation Handler can handle no changes when there are excess emissions
        unchanged_excess_emissions = NoChangeHandler().can_handle(
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('30'),
                credited_emissions=0,
            ),
            baker.make_recipe(
                'reporting.tests.utils.report_compliance_summary',
                excess_emissions=Decimal('30'),
                credited_emissions=0,
            ),
        )
        assert unchanged_excess_emissions == True  # noqa: E712
