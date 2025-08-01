from decimal import Decimal
from django.test import TestCase
from unittest.mock import patch
import pytest
from model_bakery.baker import make_recipe
from compliance.dataclass import RefreshWrapperReturn
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from compliance.models import ComplianceReportVersion
from registration.models import Operation
from django.core.exceptions import ObjectDoesNotExist

pytestmark = pytest.mark.django_db


class TestComplianceDashboardService(TestCase):
    """Tests for the ComplianceDashboardService class"""

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

    @patch(
        'compliance.service.compliance_report_version_service.ComplianceReportVersionService.get_compliance_report_versions_for_previously_owned_operations'
    )
    def test_get_compliance_report_versions_for_dashboard_excludes_versions_correctly(self, mock_previously_owned):
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

    def test_get_compliance_report_versions_for_dashboard_unions_results(self):

        current_operator = make_recipe('registration.tests.utils.operator')
        previous_operator = make_recipe('registration.tests.utils.operator')
        current_user_operator = make_recipe(
            'registration.tests.utils.approved_user_operator', operator=current_operator
        )
        make_recipe('registration.tests.utils.approved_user_operator', operator=previous_operator)
        operation = make_recipe(
            'registration.tests.utils.operation', operator=current_operator, status=Operation.Statuses.REGISTERED
        )
        make_recipe(
            'compliance.tests.utils.compliance_period',
            id=2025,
            reporting_year_id=2025,
            start_date='2025-01-01',
            end_date='2025-12-31',
        )
        make_recipe(
            'compliance.tests.utils.compliance_period',
            id=2026,
            reporting_year_id=2026,
            start_date='2026-01-01',
            end_date='2026-12-31',
        )

        # TRANSFERRED DATA
        # Transferred reports should not be viewed by the current owning operator
        xferred_operation = make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            start_date="2024-01-01 01:46:20.789146",
            end_date="2026-02-27 01:46:20.789146",
            operator=previous_operator,
        )

        xferred_emissions_report = make_recipe(
            'reporting.tests.utils.report', reporting_year_id=2025, operation=xferred_operation.operation
        )

        xferred_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2025, report=xferred_emissions_report
        )

        make_recipe('compliance.tests.utils.compliance_report_version', compliance_report=xferred_compliance_report)

        # ACTIVE DATA
        active_operation = make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            end_date=None,
        )

        active_emissions_report = make_recipe(
            'reporting.tests.utils.report',
            reporting_year_id=2026,
            operation=active_operation.operation,
            operator=current_operator,
        )

        active_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report', compliance_period_id=2026, report=active_emissions_report
        )

        active_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=active_compliance_report
        )

        active_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=current_user_operator.user.user_guid
        )

        # Does not return the report associated to the previous owning operator
        assert active_result.count() == 1
        assert active_result.first() == active_compliance_report_version

    def test_user_access_control_for_compliance_report_versions(self):
        """Test that CAS director can see all compliance report versions while industry users can only see their own"""
        cas_director = make_recipe('registration.tests.utils.cas_director')
        approved_user_operator_1 = make_recipe('registration.tests.utils.approved_user_operator')
        approved_user_operator_2 = make_recipe('registration.tests.utils.approved_user_operator')

        operator_1 = approved_user_operator_1.operator
        operator_2 = approved_user_operator_2.operator

        operation_1 = make_recipe(
            'registration.tests.utils.operation', operator=operator_1, status=Operation.Statuses.REGISTERED
        )
        operation_2 = make_recipe(
            'registration.tests.utils.operation', operator=operator_2, status=Operation.Statuses.REGISTERED
        )
        report_1 = make_recipe('reporting.tests.utils.report', operator=operator_1, operation=operation_1)
        report_2 = make_recipe('reporting.tests.utils.report', operator=operator_2, operation=operation_2)
        compliance_report_1 = make_recipe('compliance.tests.utils.compliance_report', report=report_1)
        compliance_report_2 = make_recipe('compliance.tests.utils.compliance_report', report=report_2)
        compliance_report_version_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report_1
        )
        compliance_report_version_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version', compliance_report=compliance_report_2
        )

        make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=compliance_report_version_1.compliance_report.compliance_period.reporting_year,
            rate=Decimal("50.00"),
        )
        make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=compliance_report_version_2.compliance_report.compliance_period.reporting_year,
            rate=Decimal("50.00"),
        )

        # Test CAS director can see all compliance report versions
        cas_director_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=cas_director.user_guid
        )

        assert cas_director_result.count() == 2
        assert compliance_report_version_1 in cas_director_result
        assert compliance_report_version_2 in cas_director_result

        # Test industry user 1 can only see their own compliance report versions
        industry_user_1_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator_1.user.user_guid
        )

        assert industry_user_1_result.count() == 1
        assert compliance_report_version_1 in industry_user_1_result
        assert compliance_report_version_2 not in industry_user_1_result

        # Test industry user 2 can only see their own compliance report versions
        industry_user_2_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator_2.user.user_guid
        )

        assert industry_user_2_result.count() == 1
        assert compliance_report_version_2 in industry_user_2_result
        assert compliance_report_version_1 not in industry_user_2_result

        # Test CAS director can access any compliance report version by ID
        cas_director_result_1 = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=cas_director.user_guid, compliance_report_version_id=compliance_report_version_1.id
        )
        cas_director_result_2 = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=cas_director.user_guid, compliance_report_version_id=compliance_report_version_2.id
        )

        assert cas_director_result_1 is not None
        assert cas_director_result_1.id == compliance_report_version_1.id
        assert cas_director_result_2 is not None
        assert cas_director_result_2.id == compliance_report_version_2.id

        # Test industry user 1 can only access their own compliance report version by ID
        industry_user_1_result_by_id = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=approved_user_operator_1.user.user_guid,
            compliance_report_version_id=compliance_report_version_1.id,
        )

        assert industry_user_1_result_by_id is not None
        assert industry_user_1_result_by_id.id == compliance_report_version_1.id

        # Test industry user 1 cannot access industry user 2's compliance report version by ID
        with pytest.raises(ObjectDoesNotExist):
            ComplianceDashboardService.get_compliance_report_version_by_id(
                user_guid=approved_user_operator_1.user.user_guid,
                compliance_report_version_id=compliance_report_version_2.id,
            )

        # Test industry user 2 can only access their own compliance report version by ID
        industry_user_2_result_by_id = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=approved_user_operator_2.user.user_guid,
            compliance_report_version_id=compliance_report_version_2.id,
        )

        assert industry_user_2_result_by_id is not None
        assert industry_user_2_result_by_id.id == compliance_report_version_2.id

        # Test industry user 2 cannot access industry user 1's compliance report version by ID
        with pytest.raises(ObjectDoesNotExist):
            ComplianceDashboardService.get_compliance_report_version_by_id(
                user_guid=approved_user_operator_2.user.user_guid,
                compliance_report_version_id=compliance_report_version_1.id,
            )

    @patch(
        "compliance.service.compliance_dashboard_service.ComplianceReportVersionService.calculate_outstanding_balance_tco2e"
    )
    @patch("compliance.service.compliance_dashboard_service.ComplianceChargeRateService.get_rate_for_year")
    @patch(
        "compliance.service.elicensing.elicensing_data_refresh_service.ElicensingDataRefreshService.refresh_data_wrapper_by_compliance_report_version_id"
    )
    def test_get_compliance_report_version_by_id_sets_calculated_fields(
        self,
        mock_refresh_data,
        mock_get_rate,
        mock_calculate_tco2e,
    ):
        # Setup user and operator
        user_operator = make_recipe("registration.tests.utils.approved_user_operator")
        operator = user_operator.operator
        user_guid = user_operator.user.user_guid

        # Mock values
        mock_get_rate.return_value = Decimal("25.00")
        mock_calculate_tco2e.return_value = Decimal("2.0")

        # Report chain
        operation = make_recipe("registration.tests.utils.operation", operator=operator)
        report = make_recipe("reporting.tests.utils.report", operator=operator, operation=operation)
        compliance_report = make_recipe("compliance.tests.utils.compliance_report", report=report)

        # Invoice and obligation
        invoice = make_recipe("compliance.tests.utils.elicensing_invoice", outstanding_balance=Decimal("2.0"))
        obligation = make_recipe("compliance.tests.utils.compliance_obligation", elicensing_invoice=invoice)

        # Compliance report version
        version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            obligation=obligation,
            report_compliance_summary__excess_emissions=Decimal("4.0"),
        )

        # Set calculated field manually after creation
        version.outstanding_balance_tco2e = Decimal("2.0")
        version.outstanding_balance_equivalent_value = Decimal("50.0")

        mock_refresh_data.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=invoice)

        # Act
        result = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=user_guid,
            compliance_report_version_id=version.id,
        )

        # Assert
        assert result is not None
        assert result.id == version.id

        assert result.report_compliance_summary.excess_emissions == Decimal(4.0)
        assert result.compliance_charge_rate == Decimal("25.00")
        assert result.equivalent_value == Decimal("100.00")  # 4.0 * 25.0
        # assert result.outstanding_balance_tco2e == Decimal("2.0")
        # assert result.outstanding_balance_equivalent_value == Decimal("50.0")  # 2.0 * 25.0

    def test_get_compliance_report_versions_for_dashboard_sets_calculated_fields(self):
        """Test that the service sets calculated fields correctly for compliance report versions"""
        approved_user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        operation_1 = make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        operation_2 = make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_1 = make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator, operation=operation_1
        )
        report_2 = make_recipe(
            'reporting.tests.utils.report', operator=approved_user_operator.operator, operation=operation_2
        )
        compliance_report_1 = make_recipe('compliance.tests.utils.compliance_report', report=report_1)
        compliance_report_2 = make_recipe('compliance.tests.utils.compliance_report', report=report_2)
        # v1 report for report 1
        compliance_report_version_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_1,
            excess_emissions_delta_from_previous=Decimal("0.0"),
        )
        compliance_report_version_1.report_compliance_summary.excess_emissions = Decimal("10.0")
        compliance_report_version_1.report_compliance_summary.save()
        # v1 report for report 2
        compliance_report_version_2_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2,
            excess_emissions_delta_from_previous=Decimal("0.0"),
        )
        compliance_report_version_2_1.report_compliance_summary.excess_emissions = Decimal("20.0")
        compliance_report_version_2_1.report_compliance_summary.save()
        # v2 report for report 2
        compliance_report_version_2_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2,
            excess_emissions_delta_from_previous=Decimal("5.0"),
            is_supplementary=True,
        )
        compliance_report_version_2_2.report_compliance_summary.excess_emissions = Decimal("25.0")
        compliance_report_version_2_2.report_compliance_summary.save()
        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator.user_id
        )

        assert result[0].id == compliance_report_version_1.id
        assert result[0].report_compliance_summary.excess_emissions == Decimal("10.0")
        assert result[1].id == compliance_report_version_2_1.id
        assert result[1].report_compliance_summary.excess_emissions == Decimal("20.0")
        assert result[2].id == compliance_report_version_2_2.id
        assert result[2].report_compliance_summary.excess_emissions == Decimal("5.0")
