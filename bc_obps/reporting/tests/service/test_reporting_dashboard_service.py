from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, operator_baker, user_baker
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from reporting.tests.utils.bakers import report_version_baker, reporting_year_baker
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion
from typing import Optional
from reporting.schema.operation import ReportingDashboardOperationFilterSchema


@pytest.mark.django_db
class TestReportingDashboardService:
    @patch("service.data_access_service.operation_service.OperationDataAccessService.get_all_operations_for_user")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_operations_for_reporting_dashboard(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_operations_for_user: MagicMock | AsyncMock,
    ):
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=5)

        sort_field: Optional[str] = "name"
        sort_order: Optional[str] = "asc"
        filters = ReportingDashboardOperationFilterSchema()  # Provide actual test data

        # Create reports for first two operations
        r0_version1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0_version1 = ReportVersion.objects.get(id=r0_version1_id)
        r0_version1.status = "Submitted"
        r0_version1.save()

        r0 = ReportVersion.objects.get(pk=r0_version1_id).report
        latest_r0_revision = report_version_baker(report=r0)

        r1_version1_id = ReportService.create_report(operations[1].id, year.reporting_year)
        r1 = ReportVersion.objects.get(pk=r1_version1_id).report

        operations[0].status = Operation.Statuses.REGISTERED
        operations[1].status = Operation.Statuses.REGISTERED
        operations[2].status = Operation.Statuses.REGISTERED
        operations[3].status = Operation.Statuses.NOT_STARTED
        operations[4].registration_purpose = Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        for op in operations:
            op.save()

        result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, filters
        ).values()
        result_list = list(result)

        assert len(result_list) == 3

        # Create dictionaries for easy lookup by operation ID
        result_dict = {str(item["id"]): item for item in result_list}

        # Test operation with multiple versions
        op0_result = result_dict[str(operations[0].id)]
        assert op0_result["name"] == operations[0].name
        assert op0_result["bcghg_id_id"] == (operations[0].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op0_result["report_id"] == r0.id
        assert op0_result["report_version_id"] == latest_r0_revision.id
        assert op0_result["report_status"] == latest_r0_revision.status

        # Test operation with single version
        op1_result = result_dict[str(operations[1].id)]
        assert op1_result["name"] == operations[1].name
        assert op1_result["bcghg_id_id"] == (operations[1].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op1_result["report_id"] == r1.id
        assert op1_result["report_version_id"] == r1.report_versions.first().id
        assert op1_result["report_status"] == r1.report_versions.first().status

        # Test operation with no report
        op2_result = result_dict[str(operations[2].id)]
        assert op2_result["name"] == operations[2].name
        assert op2_result["bcghg_id_id"] == (operations[2].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert op2_result["report_id"] is None
        assert op2_result["report_version_id"] is None
        assert op2_result["report_status"] is None

    @patch("service.data_access_service.operation_service.OperationDataAccessService.get_all_operations_for_user")
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_sorting_and_filtering(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_operations_for_user: MagicMock | AsyncMock,
    ):

        # SETUP
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=4)

        # r0 orginal, report_version_id=1
        r0_version1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0_version1 = ReportVersion.objects.get(id=r0_version1_id)
        r0_version1.status = "Submitted"
        r0_version1.save()

        # r0 supplementary, report_version_id=2, status draft (default)
        r0 = ReportVersion.objects.get(pk=r0_version1_id).report
        report_version_baker(report=r0)  # latest_r0_revision

        # r1 original, report_version_id=3, status draft (default)
        r1_version1_id = ReportService.create_report(operations[1].id, year.reporting_year)
        ReportVersion.objects.get(pk=r1_version1_id)  # r1_version1

        # r2 original report_version_id=4, status submitted
        r2_version1_id = ReportService.create_report(operations[2].id, year.reporting_year)
        r2_version1 = ReportVersion.objects.get(pk=r2_version1_id)
        r2_version1.status = "Submitted"
        r2_version1.save()

        operations[0].status = Operation.Statuses.REGISTERED
        operations[1].status = Operation.Statuses.REGISTERED
        operations[2].status = Operation.Statuses.REGISTERED
        operations[3].status = Operation.Statuses.REGISTERED
        for op in operations:
            op.save()

        sort_field: Optional[str] = "name"
        sort_order: Optional[str] = "asc"

        # ASSERTIONS FOR FILTERING
        # Frontend status are Draft, Draft Supplementary, Not Started, Submitted
        draft_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema(report_status="draft")
        ).values()

        assert list(draft_filter_result.values_list('report_status', 'report_version_id')) == [
            ('Draft', 2),
            ('Draft', 3),
        ]

        draft_supplementary_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema(report_status="sup")
        ).values()
        assert len(draft_supplementary_filter_result) == 1

        submitted_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema(report_status="sub")
        ).values()
        # submitted reports don't show if there's a supplementary report, so we should only see the one for r2
        assert len(submitted_filter_result) == 1

        not_started_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema(report_status="not")
        ).values()
        assert len(not_started_filter_result) == 1

        # ASSERTIONS FOR SORTING
        sort_field: Optional[str] = "report_status"
        sort_order: Optional[str] = "asc"

        sorted_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema()
        ).values()

        assert list(sorted_result.values_list('id', 'report_status', 'report_version_id')) == [
            (operations[1].id, 'Draft', 3),
            (operations[0].id, 'Draft', 2),
            (operations[3].id, None, None),
            (operations[2].id, 'Submitted', 4),
        ]
