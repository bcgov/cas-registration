from decimal import Decimal
from unittest.mock import patch
from compliance.schema.compliance_report_version import ComplianceReportVersionFilterSchema
import pytest
from model_bakery.baker import make_recipe
from compliance.dataclass import RefreshWrapperReturn
from compliance.service.compliance_dashboard_service import ComplianceDashboardService
from compliance.models import ComplianceReportVersion, ComplianceEarnedCredit
from registration.models import Operation
from django.core.exceptions import ObjectDoesNotExist


pytestmark = pytest.mark.django_db

# ------------------------------
# Patch target paths
# ------------------------------
DASHBOARD_BASE_PATH = "compliance.service.compliance_dashboard_service"

# Services referenced inside ComplianceDashboardService
ELICENSING_DATA_REFRESH_SERVICE_PATH = f"{DASHBOARD_BASE_PATH}.ElicensingDataRefreshService"
COMPLIANCE_REPORT_VERSION_SERVICE_PATH = f"{DASHBOARD_BASE_PATH}.ComplianceReportVersionService"
COMPLIANCE_CHARGE_RATE_SERVICE_PATH = f"{DASHBOARD_BASE_PATH}.ComplianceChargeRateService"

# Specific methods to patch
ELICENSING_DATA_REFRESH_WRAPPER_PATH = (
    f"{ELICENSING_DATA_REFRESH_SERVICE_PATH}.refresh_data_wrapper_by_compliance_report_version_id"
)
GET_PREVIOUSLY_OWNED_CRV_PATH = (
    f"{COMPLIANCE_REPORT_VERSION_SERVICE_PATH}.get_compliance_report_versions_for_previously_owned_operations"
)
CALCULATE_OUTSTANDING_TCO2E_PATH = f"{COMPLIANCE_REPORT_VERSION_SERVICE_PATH}.calculate_outstanding_balance_tco2e"
GET_RATE_FOR_YEAR_PATH = f"{COMPLIANCE_CHARGE_RATE_SERVICE_PATH}.get_rate_for_year"


@pytest.fixture
def mock_refresh():
    with patch(ELICENSING_DATA_REFRESH_WRAPPER_PATH) as mock:
        yield mock


@pytest.fixture
def mock_previously_owned():
    with patch(GET_PREVIOUSLY_OWNED_CRV_PATH) as mock:
        yield mock


@pytest.fixture
def mock_get_rate():
    with patch(GET_RATE_FOR_YEAR_PATH) as mock:
        yield mock


@pytest.fixture
def mock_calculate_tco2e():
    with patch(CALCULATE_OUTSTANDING_TCO2E_PATH) as mock:
        yield mock


# --- No-op filters stub used by the service in tests ---
class _NoopFilters:
    """Minimal stub that satisfies the service's filters argument."""

    def filter(self, qs):
        return qs


class TestComplianceDashboardService:
    """Tests for the ComplianceDashboardService class"""

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

    def test_get_penalty_payments_by_compliance_report_version_id(self, mock_refresh):
        """Test retrieval of penalty payments linked to a compliance report version"""
        # Create two payments on the same invoice, both after the invoice due date
        payment_1 = make_recipe(
            'compliance.tests.utils.elicensing_payment',
            received_date='2024-12-02',
        )
        payment_2 = make_recipe(
            'compliance.tests.utils.elicensing_payment',
            elicensing_line_item=payment_1.elicensing_line_item,
            received_date='2024-12-03',
        )

        # Create a penalty tied to the same invoice
        penalty = make_recipe(
            'compliance.tests.utils.compliance_penalty',
            elicensing_invoice=payment_1.elicensing_line_item.elicensing_invoice,
        )

        # Mock the elicensing data refresh service to return our invoice
        mock_refresh.return_value = RefreshWrapperReturn(
            data_is_fresh=True,
            invoice=payment_1.elicensing_line_item.elicensing_invoice,
        )

        returned_data = ComplianceDashboardService.get_penalty_payments_by_compliance_report_version_id(
            compliance_report_version_id=penalty.compliance_obligation.compliance_report_version_id
        )

        assert returned_data.data_is_fresh == True  # noqa: E712
        assert returned_data.data.first() == payment_1
        assert returned_data.data.last() == payment_2

    def test_get_compliance_report_versions_for_dashboard_excludes_versions_correctly(
        self,
        mock_previously_owned,
    ):
        user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        operation = make_recipe(
            'registration.tests.utils.operation', operator=user_operator.operator, status=Operation.Statuses.REGISTERED
        )

        report = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation,
        )
        compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for the first compliance report version
        report_version_1 = make_recipe('reporting.tests.utils.report_version', report=report)
        report_compliance_summary_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1
        )

        compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary_1,
        )

        # Create a separate operation, report and compliance report for the previous version
        operation_2 = make_recipe(
            'registration.tests.utils.operation', operator=user_operator.operator, status=Operation.Statuses.REGISTERED
        )
        report_2 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_2,
        )
        compliance_report_2 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_2,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for the second compliance report version
        report_version_2 = make_recipe('reporting.tests.utils.report_version', report=report_2)
        report_compliance_summary_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2
        )

        previous_compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report_2,
            report_compliance_summary=report_compliance_summary_2,
        )
        mock_previously_owned.return_value = ComplianceReportVersion.objects.filter(
            id=previous_compliance_report_version.id
        )

        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user_operator.user.user_guid,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
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
            'registration.tests.utils.operation',
            operator=current_operator,
            status=Operation.Statuses.REGISTERED,
        )

        # Define the compliance period
        make_recipe(
            'compliance.tests.utils.compliance_period',
            id=2026,
            reporting_year_id=2026,
            start_date='2026-01-01',
            end_date='2026-12-31',
            compliance_deadline='2027-11-30',  # Nov 30 of following year
        )

        # TRANSFERRED DATA
        # Transferred reports should not be viewed by the current owning operator

        # Use a DIFFERENT base operation for the transferred path to avoid
        # the (operation, reporting_year) uniqueness constraint on Report.
        xferred_base_operation = make_recipe(
            'registration.tests.utils.operation',
            operator=previous_operator,
            status=Operation.Statuses.REGISTERED,
        )

        xferred_operation = make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=xferred_base_operation,
            start_date="2024-01-01 01:46:20.789146",
            end_date="2026-02-27 01:46:20.789146",
            operator=previous_operator,
        )

        xferred_emissions_report = make_recipe(
            'reporting.tests.utils.report',
            operation=xferred_operation.operation,
            operator=previous_operator,
        )

        xferred_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report',
            compliance_period_id=2026,  # same year as active
            report=xferred_emissions_report,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for transferred report
        xferred_report_version = make_recipe('reporting.tests.utils.report_version', report=xferred_emissions_report)
        xferred_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=xferred_report_version
        )

        xferred_crv = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=xferred_compliance_report,
            report_compliance_summary=xferred_compliance_summary,
        )

        # ACTIVE DATA
        active_operation = make_recipe(
            'registration.tests.utils.operation_designated_operator_timeline',
            operation=operation,
            end_date=None,  # still current
            # operator defaults to the operation's current operator; explicit set optional
            # operator=current_operator,
        )

        active_emissions_report = make_recipe(
            'reporting.tests.utils.report',
            operation=active_operation.operation,
            operator=current_operator,
        )

        active_compliance_report = make_recipe(
            'compliance.tests.utils.compliance_report',
            compliance_period_id=2026,
            report=active_emissions_report,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for active report
        active_report_version = make_recipe('reporting.tests.utils.report_version', report=active_emissions_report)
        active_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=active_report_version
        )

        active_compliance_report_version = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=active_compliance_report,
            report_compliance_summary=active_compliance_summary,
        )

        active_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=current_user_operator.user.user_guid,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
        )

        # Does not return the report associated to the previous owning operator
        assert active_result.count() == 1
        assert active_result.first() == active_compliance_report_version
        assert xferred_crv not in active_result  # explicit ownership-check

    def test_get_compliance_report_versions_for_dashboard_excludes_supplementary_reports_with_no_obligation_and_no_credits(
        self,
        mock_previously_owned,
    ):
        user_operator = make_recipe("registration.tests.utils.approved_user_operator")

        # Create a registered operation with a compliance report version with earned credits status
        operation_1 = make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )

        report_1 = make_recipe(
            "reporting.tests.utils.report",
            operator=user_operator.operator,
            operation=operation_1,
        )
        compliance_report_1 = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=report_1,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for report_1
        report_version_1 = make_recipe('reporting.tests.utils.report_version', report=report_1)
        report_compliance_summary_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1
        )

        # Include: earned credits (non-supplementary)
        compliance_report_version_1_1 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report_1,
            report_compliance_summary=report_compliance_summary_1,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        # Create a separate report for the supplementary version to avoid immutability constraints
        operation_1_supplementary = make_recipe(
            "registration.tests.utils.operation", operator=user_operator.operator, status=Operation.Statuses.REGISTERED
        )
        report_1_supplementary = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_1_supplementary,
        )
        compliance_report_1_supplementary = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=report_1_supplementary,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for the supplementary version
        report_version_1_2 = make_recipe('reporting.tests.utils.report_version', report=report_1_supplementary)
        report_compliance_summary_1_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1_2
        )

        # Exclude: create a supplementary compliance report version with no obligation and no earned credits
        make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report_1_supplementary,
            report_compliance_summary=report_compliance_summary_1_2,
            is_supplementary=True,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
        )

        # Create a registered operation with a compliance report version with no obligation and no earned credits
        operation_2 = make_recipe(
            "registration.tests.utils.operation",
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_2 = make_recipe(
            "reporting.tests.utils.report",
            operator=user_operator.operator,
            operation=operation_2,
        )
        compliance_report_2 = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=report_2,
        )
        # Create properly linked ReportVersion and ReportComplianceSummary for report_2
        report_version_2 = make_recipe('reporting.tests.utils.report_version', report=report_2)
        report_compliance_summary_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2
        )

        # Include: original (non-supplementary) NO_OBL/credits
        compliance_report_version_2_1 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report_2,
            report_compliance_summary=report_compliance_summary_2,
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
        )

        # Mock the previously owned operations to return a an original and supplementary report with no obligation and no earned credits
        previous_compliance_report_version_1 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            is_supplementary=False,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
        )
        previous_compliance_report_version_2 = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            is_supplementary=True,
            status=ComplianceReportVersion.ComplianceStatus.NO_OBLIGATION_OR_EARNED_CREDITS,
        )

        mock_previously_owned.return_value = ComplianceReportVersion.objects.filter(
            id__in=[previous_compliance_report_version_1.id, previous_compliance_report_version_2.id]
        )

        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user_operator.user.user_guid,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
        )

        # Expect union of:
        #  - op1: earned credits (included)
        #  - op1: supplementary NO_OBL (excluded)
        #  - op2: original NO_OBL (included)
        #  - prev: original NO_OBL (included), supplementary NO_OBL (excluded)
        assert result.count() == 3

        # Make ordering deterministic for comparison
        ids = list(result.order_by("id").values_list("id", flat=True))
        expected_ids = sorted(
            [
                compliance_report_version_1_1.id,
                compliance_report_version_2_1.id,
                previous_compliance_report_version_1.id,
            ]
        )
        assert ids == expected_ids

    def test_user_access_control_for_compliance_report_versions(
        self,
    ):
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
        # Create reporting year first to ensure consistency
        reporting_year = make_recipe('reporting.tests.utils.reporting_year')

        report_1 = make_recipe(
            'reporting.tests.utils.report', operator=operator_1, operation=operation_1, reporting_year=reporting_year
        )
        report_2 = make_recipe(
            'reporting.tests.utils.report', operator=operator_2, operation=operation_2, reporting_year=reporting_year
        )
        compliance_report_1 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_1,
            compliance_period__reporting_year=reporting_year,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for report_1
        report_version_1 = make_recipe('reporting.tests.utils.report_version', report=report_1)
        report_compliance_summary_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1
        )

        compliance_report_version_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_1,
            report_compliance_summary=report_compliance_summary_1,
        )
        compliance_report_2 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_2,
            compliance_period__reporting_year=reporting_year,  # Ensures the same year
        )
        # Create properly linked ReportVersion and ReportComplianceSummary for report_2
        report_version_2 = make_recipe('reporting.tests.utils.report_version', report=report_2)
        report_compliance_summary_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2
        )

        compliance_report_version_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2,
            report_compliance_summary=report_compliance_summary_2,
        )

        make_recipe(
            "compliance.tests.utils.compliance_charge_rate",
            reporting_year=reporting_year,
            rate=Decimal("50.00"),
        )

        # Test CAS director can see all compliance report versions
        cas_director_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=cas_director.user_guid,
            sort_field=None,
            sort_order=None,
            filters=_NoopFilters(),
        )

        assert cas_director_result.count() == 2
        assert compliance_report_version_1 in cas_director_result
        assert compliance_report_version_2 in cas_director_result

        # Test industry user 1 can only see their own compliance report versions
        industry_user_1_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator_1.user.user_guid,
            sort_field=None,
            sort_order=None,
            filters=_NoopFilters(),
        )

        assert industry_user_1_result.count() == 1
        assert compliance_report_version_1 in industry_user_1_result
        assert compliance_report_version_2 not in industry_user_1_result

        # Test industry user 2 can only see their own compliance report versions
        industry_user_2_result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator_2.user.user_guid,
            sort_field=None,
            sort_order=None,
            filters=_NoopFilters(),
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

    def test_get_compliance_report_version_by_id_sets_calculated_fields(
        self,
        mock_refresh,
        mock_get_rate,
        mock_calculate_tco2e,
    ):
        # --- User & operator
        user_operator = make_recipe("registration.tests.utils.approved_user_operator")
        operator = user_operator.operator
        user_guid = user_operator.user.user_guid

        # --- Report chain
        operation = make_recipe("registration.tests.utils.operation", operator=operator)
        report = make_recipe(
            "reporting.tests.utils.report",
            operator=operator,
            operation=operation,
        )
        compliance_report = make_recipe(
            "compliance.tests.utils.compliance_report",
            report=report,
        )

        # --- Compliance_report_version
        # Create properly linked ReportVersion and ReportComplianceSummary
        report_version = make_recipe('reporting.tests.utils.report_version', report=report)
        report_compliance_summary = make_recipe(
            'reporting.tests.utils.report_compliance_summary',
            report_version=report_version,
            excess_emissions=Decimal("4.0"),
        )

        compliance_report_version = make_recipe(
            "compliance.tests.utils.compliance_report_version",
            compliance_report=compliance_report,
            report_compliance_summary=report_compliance_summary,
        )

        # --- Invoice & obligation
        invoice = make_recipe("compliance.tests.utils.elicensing_invoice", outstanding_balance=Decimal("20.0"))
        make_recipe(
            "compliance.tests.utils.compliance_obligation",
            elicensing_invoice=invoice,
            compliance_report_version=compliance_report_version,
        )

        # --- Mocks
        mock_get_rate.return_value = Decimal("2.00")
        mock_calculate_tco2e.return_value = Decimal("10.0")
        mock_refresh.return_value = RefreshWrapperReturn(data_is_fresh=True, invoice=invoice)

        # --- Act
        result = ComplianceDashboardService.get_compliance_report_version_by_id(
            user_guid=user_guid,
            compliance_report_version_id=compliance_report_version.id,
        )

        # --- Assert
        assert result is not None
        assert result.id == compliance_report_version.id

        assert result.report_compliance_summary.excess_emissions == Decimal("4.0")
        assert result.compliance_charge_rate == Decimal("2.00")
        assert result.equivalent_value == Decimal("8.00")

        assert hasattr(result, "outstanding_balance_tco2e")
        assert hasattr(result, "outstanding_balance_equivalent_value")

        assert result.outstanding_balance_tco2e == Decimal("10.0")
        assert result.outstanding_balance_equivalent_value == Decimal("20.0")

        mock_refresh.assert_called_once_with(compliance_report_version_id=compliance_report_version.id)
        mock_get_rate.assert_called_once()
        mock_calculate_tco2e.assert_called_once_with(result)

    def test_get_compliance_report_versions_for_dashboard_sets_calculated_fields(
        self,
    ):
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
        # Create reporting year first to ensure consistency
        reporting_year = make_recipe('reporting.tests.utils.reporting_year')

        make_recipe(
            'compliance.tests.utils.compliance_charge_rate',
            reporting_year=reporting_year,
        )

        report_1 = make_recipe(
            'reporting.tests.utils.report',
            operator=approved_user_operator.operator,
            operation=operation_1,
            reporting_year=reporting_year,
        )
        report_2 = make_recipe(
            'reporting.tests.utils.report',
            operator=approved_user_operator.operator,
            operation=operation_2,
            reporting_year=reporting_year,
        )
        compliance_report_1 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_1,
            compliance_period__reporting_year=reporting_year,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for report_1
        report_version_1 = make_recipe('reporting.tests.utils.report_version', report=report_1)
        report_compliance_summary_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1
        )

        # v1 report for report 1
        compliance_report_version_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_1,
            report_compliance_summary=report_compliance_summary_1,
            excess_emissions_delta_from_previous=Decimal("0.0"),
        )
        compliance_report_version_1.report_compliance_summary.excess_emissions = Decimal("10.0")
        compliance_report_version_1.report_compliance_summary.save()

        # v1 report for report 2
        compliance_report_2 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_2,
            compliance_period__reporting_year=reporting_year,  # Ensures the same year
        )
        # Create properly linked ReportVersion and ReportComplianceSummary for report_2 version 1
        report_version_2_1 = make_recipe('reporting.tests.utils.report_version', report=report_2)
        report_compliance_summary_2_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2_1
        )

        compliance_report_version_2_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
            report_compliance_summary=report_compliance_summary_2_1,
            excess_emissions_delta_from_previous=Decimal("0.0"),
        )

        # Initial version needs an invoice or else it will be superceded, voiding this test
        invoice = make_recipe('compliance.tests.utils.elicensing_invoice')
        make_recipe(
            'compliance.tests.utils.compliance_obligation',
            compliance_report_version=compliance_report_version_2_1,
            elicensing_invoice=invoice,
        )
        compliance_report_version_2_1.report_compliance_summary.excess_emissions = Decimal("20.0")
        compliance_report_version_2_1.report_compliance_summary.save()
        # Create a separate report for version 2 to avoid immutability constraints
        operation_2_v2 = make_recipe(
            'registration.tests.utils.operation',
            operator=approved_user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_2_v2 = make_recipe(
            'reporting.tests.utils.report',
            operator=approved_user_operator.operator,
            operation=operation_2_v2,
            reporting_year=reporting_year,
        )
        compliance_report_2_v2 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_2_v2,
            compliance_period__reporting_year=reporting_year,
        )

        # Create properly linked ReportVersion and ReportComplianceSummary for report_2 version 2
        report_version_2_2 = make_recipe('reporting.tests.utils.report_version', report=report_2_v2)
        report_compliance_summary_2_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2_2
        )

        # v2 report for report 2
        compliance_report_version_2_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2_v2,
            report_compliance_summary=report_compliance_summary_2_2,
            excess_emissions_delta_from_previous=Decimal("5.0"),
            is_supplementary=True,
            previous_version_id=compliance_report_version_2_1.id,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )
        compliance_report_version_2_2.report_compliance_summary.excess_emissions = Decimal("25.0")
        compliance_report_version_2_2.report_compliance_summary.save()

        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=approved_user_operator.user_id,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
        )

        assert result[0].id == compliance_report_version_1.id
        assert result[0].report_compliance_summary.excess_emissions == Decimal("10.0")
        assert result[1].id == compliance_report_version_2_1.id
        assert result[1].report_compliance_summary.excess_emissions == Decimal("20.0")
        assert result[2].id == compliance_report_version_2_2.id
        assert result[2].report_compliance_summary.excess_emissions == Decimal("5.0")

    def test_get_compliance_report_versions_for_dashboard_sorts_and_filters(
        self,
    ):

        user = make_recipe('registration.tests.utils.cas_analyst')

        # Create enough rows for multiple pages; deterministic names for stable sort
        versions = []
        for i in range(45):
            v = make_recipe(
                "compliance.tests.utils.compliance_report_version",
                report_compliance_summary__report_version__report_operation__operation_name=f"Plant {i:03d}",
            )
            versions.append(v)

        # Sort
        result_asc = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user.user_guid,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
        )

        result_desc = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user.user_guid,
            sort_field="id",
            sort_order="desc",
            filters=_NoopFilters(),
        )

        assert result_asc.first() != result_desc.first()

        # Filter
        result_filtered = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user.user_guid,
            sort_field="id",
            sort_order="asc",
            filters=ComplianceReportVersionFilterSchema(operation_name='01'),
        )
        assert result_filtered.count() == 11  # 001 and 010-019

    def test_get_compliance_report_versions_annotates_status_correctly(
        self,
    ):
        # setup
        user_operator = make_recipe('registration.tests.utils.approved_user_operator')

        # 1 - not met
        operation_1 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        reporting_year = make_recipe('reporting.tests.utils.reporting_year')

        report_1 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_1,
            reporting_year=reporting_year,
        )
        compliance_report_1 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_1,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_1 = make_recipe('reporting.tests.utils.report_version', report=report_1)
        report_compliance_summary_1 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_1
        )
        compliance_report_version_1 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_1,
            report_compliance_summary=report_compliance_summary_1,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_NOT_MET,
        )

        # 2 - met
        operation_2 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_2 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_2,
            reporting_year=reporting_year,
        )
        compliance_report_2 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_2,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_2 = make_recipe('reporting.tests.utils.report_version', report=report_2)
        report_compliance_summary_2 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_2
        )
        compliance_report_version_2 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_2,
            report_compliance_summary=report_compliance_summary_2,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_FULLY_MET,
        )

        # 3 - pending invoice creation
        operation_3 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_3 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_3,
            reporting_year=reporting_year,
        )
        compliance_report_3 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_3,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_3 = make_recipe('reporting.tests.utils.report_version', report=report_3)
        report_compliance_summary_3 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_3
        )
        compliance_report_version_3 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_3,
            report_compliance_summary=report_compliance_summary_3,
            status=ComplianceReportVersion.ComplianceStatus.OBLIGATION_PENDING_INVOICE_CREATION,
        )

        # 4 - not requested
        operation_4 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_4 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_4,
            reporting_year=reporting_year,
        )
        compliance_report_4 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_4,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_4 = make_recipe('reporting.tests.utils.report_version', report=report_4)
        report_compliance_summary_4 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_4
        )
        compliance_report_version_4 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_4,
            report_compliance_summary=report_compliance_summary_4,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CREDITS_NOT_ISSUED,
            compliance_report_version_id=compliance_report_version_4.id,
        )

        # 5 - issuance requested
        operation_5 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_5 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_5,
            reporting_year=reporting_year,
        )
        report_version_5 = make_recipe('reporting.tests.utils.report_version', report=report_5)
        report_compliance_summary_5 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_5
        )
        compliance_report_5 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_5,
            compliance_period__reporting_year=reporting_year,
        )
        compliance_report_version_5 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_5,
            report_compliance_summary=report_compliance_summary_5,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.ISSUANCE_REQUESTED,
            compliance_report_version_id=compliance_report_version_5.id,
            bccr_trading_name="test bccr trading name",
            bccr_holding_account_id="12346",
        )

        # 6 - approved
        operation_6 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_6 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_6,
            reporting_year=reporting_year,
        )
        compliance_report_6 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_6,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_6 = make_recipe('reporting.tests.utils.report_version', report=report_6)
        report_compliance_summary_6 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_6
        )
        compliance_report_version_6 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_6,
            report_compliance_summary=report_compliance_summary_6,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.APPROVED,
            compliance_report_version_id=compliance_report_version_6.id,
            bccr_trading_name="test bccr trading name 2",
            bccr_holding_account_id="12347",
        )

        # 7 - declined
        operation_7 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_7 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_7,
            reporting_year=reporting_year,
        )
        compliance_report_7 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_7,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_7 = make_recipe('reporting.tests.utils.report_version', report=report_7)
        report_compliance_summary_7 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_7
        )
        compliance_report_version_7 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_7,
            report_compliance_summary=report_compliance_summary_7,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.DECLINED,
            compliance_report_version_id=compliance_report_version_7.id,
            bccr_trading_name="test bccr trading name 3",
            bccr_holding_account_id="12348",
        )

        # 8 - changes required
        operation_8 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_8 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_8,
            reporting_year=reporting_year,
        )
        compliance_report_8 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_8,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_8 = make_recipe('reporting.tests.utils.report_version', report=report_8)
        report_compliance_summary_8 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_8
        )
        compliance_report_version_8 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_8,
            report_compliance_summary=report_compliance_summary_8,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )
        make_recipe(
            'compliance.tests.utils.compliance_earned_credit',
            issuance_status=ComplianceEarnedCredit.IssuanceStatus.CHANGES_REQUIRED,
            compliance_report_version_id=compliance_report_version_8.id,
            bccr_trading_name="test bccr trading name 4",
            bccr_holding_account_id="12349",
        )

        # 9 - earned credits
        operation_9 = make_recipe(
            'registration.tests.utils.operation',
            operator=user_operator.operator,
            status=Operation.Statuses.REGISTERED,
        )
        report_9 = make_recipe(
            'reporting.tests.utils.report',
            operator=user_operator.operator,
            operation=operation_9,
            reporting_year=reporting_year,
        )
        compliance_report_9 = make_recipe(
            'compliance.tests.utils.compliance_report',
            report=report_9,
            compliance_period__reporting_year=reporting_year,
        )
        report_version_9 = make_recipe('reporting.tests.utils.report_version', report=report_9)
        report_compliance_summary_9 = make_recipe(
            'reporting.tests.utils.report_compliance_summary', report_version=report_version_9
        )
        compliance_report_version_9 = make_recipe(
            'compliance.tests.utils.compliance_report_version',
            compliance_report=compliance_report_9,
            report_compliance_summary=report_compliance_summary_9,
            status=ComplianceReportVersion.ComplianceStatus.EARNED_CREDITS,
        )

        # checks
        result = ComplianceDashboardService.get_compliance_report_versions_for_dashboard(
            user_guid=user_operator.user_id,
            sort_field="id",
            sort_order="asc",
            filters=_NoopFilters(),
        )

        assert result[0].id == compliance_report_version_1.id
        assert result[0].display_status == "Obligation - not met"
        assert result[1].id == compliance_report_version_2.id
        assert result[1].display_status == "Obligation - met"
        assert result[2].id == compliance_report_version_3.id
        assert result[2].display_status == "Obligation - pending invoice creation"
        assert result[3].id == compliance_report_version_4.id
        assert result[3].display_status == "Earned credits - not requested"
        assert result[4].id == compliance_report_version_5.id
        assert result[4].display_status == "Earned credits - issuance requested"
        assert result[5].id == compliance_report_version_6.id
        assert result[5].display_status == "Earned credits - approved"
        assert result[6].id == compliance_report_version_7.id
        assert result[6].display_status == "Earned credits - declined"
        assert result[7].id == compliance_report_version_8.id
        assert result[7].display_status == "Earned credits - changes required"
        assert result[8].id == compliance_report_version_9.id
        assert result[8].display_status == "Earned credits"
