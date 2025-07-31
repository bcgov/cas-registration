from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from registration.models.operation import Operation
from registration.tests.utils.bakers import operation_baker, operator_baker, user_baker
from model_bakery.baker import make_recipe
from reporting.models.report_operation import ReportOperation
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from reporting.tests.utils.bakers import report_version_baker, reporting_year_baker
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion
from typing import Optional
from reporting.schema.operation import ReportingDashboardOperationFilterSchema


@pytest.mark.django_db
class TestReportingDashboardService:
    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.get_all_current_operations_for_user"
    )
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_operations_for_reporting_dashboard(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_current_operations_for_user: MagicMock | AsyncMock,
    ):
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_current_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=5)

        # Change operation names so alphabetical sorting produces consistent results
        operations[0].name = "a"
        operations[1].name = "b"
        operations[2].name = "c"
        operations[3].name = "d"

        sort_field: Optional[str] = "name"
        sort_order: Optional[str] = "asc"
        filters = ReportingDashboardOperationFilterSchema()  # Provide actual test data

        # Create reports for first two operations
        r0_r1v1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0_version1 = ReportVersion.objects.get(id=r0_r1v1_id)
        r0_version1.status = "Submitted"
        r0_version1.save()

        r0 = ReportVersion.objects.get(pk=r0_r1v1_id).report
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

    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_past_reports_for_reporting_dashboard(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
    ):
        uo = make_recipe('registration.tests.utils.approved_user_operator')
        mock_get_by_guid.return_value = uo.user

        current_year = 2061
        last_year = current_year - 1
        years = [current_year - i for i in range(5)]
        reporting_years = [reporting_year_baker(reporting_year=year) for year in years]

        operations = operation_baker(operator_id=uo.operator.id, _quantity=5)
        # Change operation names so alphabetical sorting produces consistent results
        # operations[0].name = "a"
        # operations[1].name = "b"
        # operations[2].name = "c"
        # operations[3].name = "d"

        operations[0].status = Operation.Statuses.REGISTERED
        operations[1].status = Operation.Statuses.REGISTERED
        operations[2].status = Operation.Statuses.REGISTERED
        operations[3].status = Operation.Statuses.NOT_STARTED
        operations[4].registration_purpose = Operation.Purposes.POTENTIAL_REPORTING_OPERATION
        for op in operations:
            op.save()

        sort_field: Optional[str] = "operation_name"
        sort_order: Optional[str] = "asc"
        filters = ReportingDashboardOperationFilterSchema()

        # Create reports
        ## Create current year reports (the service should not return these)
        current_year_reports = [ReportService.create_report(operation.id, current_year) for operation in operations]

        ## Create past reports
        ### Create reports for the last 2 years
        o0_r1v1_id = ReportService.create_report(operations[0].id, last_year - 1)
        o0_r1v1 = ReportVersion.objects.get(pk=o0_r1v1_id)
        r1_report_operation = ReportOperation.objects.get(report_version=o0_r1v1_id)
        print(f"Report 1 created with ID: {o0_r1v1_id} and operation name {r1_report_operation.operation_name}")
        o0_r1v1.status = "Submitted"
        o0_r1v1.save()

        results = ReportingDashboardService.get_past_reports_for_reporting_dashboard(
            uo.user.user_guid, current_year, sort_field, sort_order, filters
        ).values()
        result_list = list(results)
        print("Result List before new version:", result_list)

        o0_r1 = ReportVersion.objects.get(pk=o0_r1v1_id).report
        latest_o0r1_revision = report_version_baker(report=o0_r1)
        r1_report_operation = ReportOperation.objects.get(report_version=latest_o0r1_revision)
        print(
            f"Report 1 updated with ID: {latest_o0r1_revision.id} and operation name {r1_report_operation.operation_name}"
        )
        results = ReportingDashboardService.get_past_reports_for_reporting_dashboard(
            uo.user.user_guid, current_year, sort_field, sort_order, filters
        ).values()
        result_list = list(results)
        print("Result List after new version:", result_list)

        o0_r2v1_id = ReportService.create_report(operations[0].id, last_year)
        o0_r2v1 = ReportVersion.objects.get(pk=o0_r2v1_id)
        o0_r2v1.status = "Draft"
        o0_r2v1.save()
        o0_r2 = ReportVersion.objects.get(pk=o0_r2v1_id).report
        latest_o0r2_revision = o0_r2v1
        r2_report_operation = ReportOperation.objects.get(report_version=latest_o0r2_revision)

        o1_r3v1_id = ReportService.create_report(operations[1].id, last_year)
        latest_o1r3_version = ReportVersion.objects.get(pk=o1_r3v1_id)
        o1_r3 = latest_o1r3_version.report
        r3_report_operation = ReportOperation.objects.get(report_version=latest_o1r3_version)

        result = ReportingDashboardService.get_past_reports_for_reporting_dashboard(
            uo.user.user_guid, current_year, sort_field, sort_order, filters
        ).values()
        result_list = list(result)
        print("Result List:", result_list)
        assert len(result_list) == 3

        # Create dictionaries for easy lookup by operation ID
        result_dict = {str(item["id"]): item for item in result_list}

        # Test report with multiple versions
        op0r1_result = result_dict[str(o0_r1.id)]
        assert op0r1_result["operation_name"] == r1_report_operation.operation_name
        assert op0r1_result["reporting_year_id"] == o0_r1.reporting_year_id
        assert op0r1_result["report_id"] == o0_r1.id
        assert op0r1_result["report_version_id"] == latest_o0r1_revision.id
        assert op0r1_result["report_status"] == latest_o0r1_revision.status

        # Test report from previous year
        op0r2_result = result_dict[str(o0_r2.id)]
        assert op0r2_result["operation_name"] == r2_report_operation.operation_name
        assert op0r2_result["reporting_year_id"] == o0_r2.reporting_year_id
        assert op0r2_result["report_id"] == o0_r2.id
        assert op0r2_result["report_version_id"] == latest_o0r2_revision.id
        assert op0r2_result["report_status"] == latest_o0r2_revision.status

        # Test report with single version
        op1_result = result_dict[str(o1_r3.id)]
        assert op1_result["operation_name"] == r3_report_operation.operation_name
        assert op1_result["reporting_year_id"] == o1_r3.reporting_year_id
        assert op1_result["report_id"] == o1_r3.id
        assert op1_result["report_version_id"] == latest_o1r3_version.id
        assert op1_result["report_status"] == latest_o1r3_version.status

    ###########################################################
    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.get_all_current_operations_for_user"
    )
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_sorting_and_filtering(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_current_operations_for_user: MagicMock | AsyncMock,
    ):

        # SETUP
        user = user_baker()
        mock_get_by_guid.return_value = user
        mock_get_all_current_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operator = operator_baker()
        operations = operation_baker(operator_id=operator.id, _quantity=4)

        # r0 orginal, report_version_id=1
        r0_r1v1_id = ReportService.create_report(operations[0].id, year.reporting_year)
        r0_version1 = ReportVersion.objects.get(id=r0_r1v1_id)
        r0_version1.status = "Submitted"
        r0_version1.save()

        # r0 supplementary, report_version_id=2, status draft (default)
        r0 = ReportVersion.objects.get(pk=r0_r1v1_id).report
        latest_r0_revision = report_version_baker(report=r0)

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
        # Change operation names so sorting by name produces consistent results
        operations[0].name = "a"
        operations[1].name = "b"
        operations[2].name = "c"
        operations[3].name = "d"
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
            ('Draft', latest_r0_revision.id),
            ('Draft', r1_version1_id),
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
            (operations[1].id, 'Draft', r1_version1_id),
            (operations[0].id, 'Draft', latest_r0_revision.id),
            (operations[3].id, None, None),
            (operations[2].id, 'Submitted', r2_version1_id),
        ]
