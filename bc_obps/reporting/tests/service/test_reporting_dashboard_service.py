from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from registration.models.operation import Operation
from model_bakery.baker import make_recipe
from reporting.models.report_operation import ReportOperation
from registration.models.user import User
from registration.models.app_role import AppRole
from registration.models.user_operator import UserOperator
from registration.tests.utils.bakers import operation_baker, operator_baker, user_operator_baker
from reporting.service.reporting_dashboard_service import ReportingDashboardService
from reporting.tests.utils.bakers import report_version_baker, reporting_year_baker
from service.report_service import ReportService
from reporting.models.report_version import ReportVersion
from typing import Optional
from reporting.schema.dashboard import (
    ReportingDashboardOperationFilterSchema,
    ReportingDashboardReportFilterSchema,
    ReportsPeriod,
)
from model_bakery import baker


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
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        user_operator = user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        mock_get_by_guid.return_value = user_operator.user
        mock_get_all_current_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operations = operation_baker(operator_id=user_operator.operator.id, _quantity=5)

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
            user_operator.user.user_guid, 5091, sort_field, sort_order, filters
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
        rep3_result = result_dict[str(operations[1].id)]
        assert rep3_result["name"] == operations[1].name
        assert rep3_result["bcghg_id_id"] == (operations[1].bcghg_id.id if operations[0].bcghg_id is not None else None)
        assert rep3_result["report_id"] == r1.id
        assert rep3_result["report_version_id"] == r1.report_versions.first().id
        assert rep3_result["report_status"] == r1.report_versions.first().status

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
        laster_year = current_year - 2
        years = [current_year, last_year, laster_year]
        [reporting_year_baker(reporting_year=year) for year in years]

        operations = operation_baker(operator_id=uo.operator.id, _quantity=3)

        sort_field: Optional[str] = "operation_name"
        sort_order: Optional[str] = "asc"
        filters = ReportingDashboardReportFilterSchema()

        # Create reports
        ## Create current year reports (the service should not return these)
        current_report_version_ids = [
            ReportService.create_report(operation.id, current_year) for operation in operations
        ]

        ## Create past reports
        ### Report 1 - Operation 1: Laster year Report Version 1
        rep1_op1_v1_version_id = ReportService.create_report(operations[0].id, laster_year)
        rep1_op1_v1_version = ReportVersion.objects.get(pk=rep1_op1_v1_version_id)
        rep1_report_operation = ReportOperation.objects.get(report_version=rep1_op1_v1_version_id)
        rep1_op1_v1_version.status = "Submitted"
        rep1_op1_v1_version.save()
        ### Report 1 - Operation 1: Laster year Report Version 2
        rep1_op1_report = ReportVersion.objects.get(pk=rep1_op1_v1_version_id).report
        rep1_op1_latest_version = report_version_baker(report=rep1_op1_report)
        rep1_report_operation = ReportOperation.objects.get(report_version=rep1_op1_latest_version)

        ### Report 2 - Operation 1: Last year Report Version 1
        rep2_op1_v1_version_id = ReportService.create_report(operations[0].id, last_year)
        rep2_op1_v1_version = ReportVersion.objects.get(pk=rep2_op1_v1_version_id)
        rep2_op1_report = ReportVersion.objects.get(pk=rep2_op1_v1_version_id).report
        rep2_op1_latest_version = rep2_op1_v1_version
        rep2_report_operation = ReportOperation.objects.get(report_version=rep2_op1_latest_version)

        ### Report 3 - Operation 2: Last year Report Version 1
        rep3_op2_v1_version_id = ReportService.create_report(operations[1].id, last_year)
        rep3_op2_latest_version = ReportVersion.objects.get(pk=rep3_op2_v1_version_id)
        rep3_op2_report = rep3_op2_latest_version.report
        rep3_report_operation = ReportOperation.objects.get(report_version=rep3_op2_latest_version)

        # PAST REPORTS
        past_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            uo.user.user_guid, current_year, ReportsPeriod.PAST, sort_field, sort_order, filters
        ).values()
        result_list = list(past_result)
        assert len(result_list) == 3

        # Create dictionaries for easy lookup by report ID
        result_dict = {str(item["id"]): item for item in result_list}

        # Test report with multiple versions
        rep1_result = result_dict[str(rep1_op1_report.id)]
        assert rep1_result["operation_name"] == rep1_report_operation.operation_name
        assert rep1_result["reporting_year_id"] == rep1_op1_report.reporting_year_id
        assert rep1_result["report_id"] == rep1_op1_report.id
        assert rep1_result["report_version_id"] == rep1_op1_latest_version.id
        assert rep1_result["report_status"] == rep1_op1_latest_version.status

        # Test report from previous year
        rep2_result = result_dict[str(rep2_op1_report.id)]
        assert rep2_result["operation_name"] == rep2_report_operation.operation_name
        assert rep2_result["reporting_year_id"] == rep2_op1_report.reporting_year_id
        assert rep2_result["report_id"] == rep2_op1_report.id
        assert rep2_result["report_version_id"] == rep2_op1_latest_version.id
        assert rep2_result["report_status"] == rep2_op1_latest_version.status

        # Test report with single version
        rep3_result = result_dict[str(rep3_op2_report.id)]
        assert rep3_result["operation_name"] == rep3_report_operation.operation_name
        assert rep3_result["reporting_year_id"] == rep3_op2_report.reporting_year_id
        assert rep3_result["report_id"] == rep3_op2_report.id
        assert rep3_result["report_version_id"] == rep3_op2_latest_version.id
        assert rep3_result["report_status"] == rep3_op2_latest_version.status

        # CURRENT REPORTS
        current_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            uo.user.user_guid, current_year, ReportsPeriod.CURRENT, sort_field, sort_order, filters
        ).values()
        result_list = list(current_result)
        assert len(result_list) == 3
        result_dict = {str(item["id"]): item for item in result_list}
        for id in current_report_version_ids:
            expected = ReportVersion.objects.get(id=id)
            result = result_dict[str(expected.report.id)]
            assert result["operation_name"] == expected.report_operation.operation_name
            assert result["reporting_year_id"] == expected.report.reporting_year_id
            assert result["report_id"] == expected.report.id
            assert result["report_version_id"] == expected.id
            assert result["report_status"] == expected.status

    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_get_all_reports_for_internal_reporting_dashboard(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
    ):
        user = make_recipe('registration.tests.utils.cas_admin')
        mock_get_by_guid.return_value = user

        current_year = 2061
        last_year = current_year - 1
        laster_year = current_year - 2
        years = [current_year, last_year, laster_year]
        [reporting_year_baker(reporting_year=year) for year in years]
        operators = [operator_baker() for _ in range(2)]
        operations = [operation_baker(operator_id=op.id) for op in operators for _ in range(2)]
        report_versions = [
            report_version_baker(report__operation=op, report__operator=op.operator, report__reporting_year=year)
            for op in operations
            for year in years
        ]
        skip_id = report_versions[0].id
        for rv in report_versions:
            if rv.id == skip_id:
                continue
            rv.status = "Submitted"
            rv.is_latest_submitted = True
            rv.save()

        result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid, current_year, ReportsPeriod.ALL, filters=ReportingDashboardReportFilterSchema()
        ).values()
        result_list = list(result)
        assert (
            len(result_list) == len(report_versions) - 1
        )  # one report version was not submitted so should not be included
        result_dict = {str(item["id"]): item for item in result_list}
        for rv in report_versions:
            if rv.id == skip_id:
                assert str(rv.report.id) not in result_dict
                continue
            res = result_dict.get(str(rv.report.id))
            assert res is not None
            assert res["report_id"] == rv.report.id
            assert res["report_version_id"] == rv.id
            assert res["report_status"] == rv.status
            assert res["operation_name"] == rv.report_operation.operation_name
            assert res["reporting_year_id"] == rv.report.reporting_year_id

    @patch(
        "service.data_access_service.operation_service.OperationDataAccessService.get_all_current_operations_for_user"
    )
    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_operations_sorting_and_filtering(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
        mock_get_all_current_operations_for_user: MagicMock | AsyncMock,
    ):

        # SETUP
        user = baker.make(User, app_role=AppRole.objects.get(role_name="industry_user"))
        operator = operator_baker()
        user_operator = user_operator_baker(
            {
                "user": user,
                "operator": operator,
                "status": UserOperator.Statuses.APPROVED,
                "role": UserOperator.Roles.ADMIN,
            }
        )
        mock_get_by_guid.return_value = user_operator.user
        mock_get_all_current_operations_for_user.side_effect = lambda user: Operation.objects.all()

        year = reporting_year_baker(reporting_year=5091)
        operations = operation_baker(operator_id=user_operator.operator.id, _quantity=4)

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
            user_operator.user.user_guid,
            5091,
            sort_field,
            sort_order,
            ReportingDashboardOperationFilterSchema(report_status="draft"),
        ).values()
        assert list(draft_filter_result.values_list('report_status', 'report_version_id')) == [
            ('Draft', latest_r0_revision.id),
            ('Draft', r1_version1_id),
        ]

        draft_supplementary_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user_operator.user.user_guid,
            5091,
            sort_field,
            sort_order,
            ReportingDashboardOperationFilterSchema(report_status="sup"),
        ).values()
        assert len(draft_supplementary_filter_result) == 1

        submitted_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user_operator.user.user_guid,
            5091,
            sort_field,
            sort_order,
            ReportingDashboardOperationFilterSchema(report_status="sub"),
        ).values()
        # submitted reports don't show if there's a supplementary report, so we should only see the one for r2
        assert len(submitted_filter_result) == 1

        not_started_filter_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user_operator.user.user_guid,
            5091,
            sort_field,
            sort_order,
            ReportingDashboardOperationFilterSchema(report_status="not"),
        ).values()
        assert len(not_started_filter_result) == 1

        # ASSERTIONS FOR SORTING
        sort_field: Optional[str] = "report_status"
        sort_order: Optional[str] = "asc"

        sorted_result = ReportingDashboardService.get_operations_for_reporting_dashboard(
            user_operator.user.user_guid, 5091, sort_field, sort_order, ReportingDashboardOperationFilterSchema()
        ).values()

        assert list(sorted_result.values_list('id', 'report_status', 'report_version_id')) == [
            (operations[1].id, 'Draft', r1_version1_id),
            (operations[0].id, 'Draft', latest_r0_revision.id),
            (operations[3].id, None, None),
            (operations[2].id, 'Submitted', r2_version1_id),
        ]

    @patch("service.data_access_service.user_service.UserDataAccessService.get_by_guid")
    def test_reports_sorting_and_filtering(
        self,
        mock_get_by_guid: MagicMock | AsyncMock,
    ):
        # ARRANGE
        user = make_recipe('registration.tests.utils.cas_admin')
        mock_get_by_guid.return_value = user

        current_year = 2061
        last_year = current_year - 1
        laster_year = current_year - 2
        years = [current_year, last_year, laster_year]
        [reporting_year_baker(reporting_year=year) for year in years]
        operation1 = operation_baker(name="a")
        operation2 = operation_baker(name="b")
        operations = [operation1, operation2]
        # Change operation names so sorting by name produces consistent results
        report_version_ids = [ReportService.create_report(op.id, year) for op in operations for year in years]

        report_versions = ReportVersion.objects.filter(id__in=report_version_ids)

        # Set all report versions except the skipped one to "Submitted"
        for rv in report_versions:
            rv.status = "Submitted"
            rv.is_latest_submitted = True
            rv.save()

        # ASSERTIONS FOR FILTERING
        sort_field: Optional[str] = "reporting_year"
        sort_order: Optional[str] = "asc"

        unfiltered_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid, 5091, ReportsPeriod.ALL, sort_field, sort_order, ReportingDashboardReportFilterSchema()
        ).values()
        assert len(unfiltered_result) == 6
        ## Filter by reporting_year

        filtered_result = list(
            ReportingDashboardService.get_reports_for_reporting_dashboard(
                user.user_guid,
                5091,
                ReportsPeriod.ALL,
                sort_field,
                sort_order,
                ReportingDashboardReportFilterSchema(reporting_year=last_year),
            ).values()
        )
        assert len(filtered_result) == 2
        for res in filtered_result:
            assert res['reporting_year_id'] == last_year

        ## Filter by operation name
        filtered_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid,
            5091,
            ReportsPeriod.ALL,
            sort_field,
            sort_order,
            ReportingDashboardReportFilterSchema(operation_name=operation2.name),
        ).values()
        assert len(filtered_result) == 3
        for res in filtered_result:
            assert res['operation_name'] == operation2.name

        # ASSERTIONS FOR SORTING
        ## Sort by reporting_year
        sort_field: Optional[str] = "reporting_year"
        sort_order: Optional[str] = "asc"

        sorted_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid,
            5091,
            ReportsPeriod.ALL,
            sort_field,
            sort_order,
            ReportingDashboardReportFilterSchema(operation_name=operation2.name),
        ).values()
        assert list(sorted_result.values_list('reporting_year', 'operation_name')) == [
            (laster_year, operation2.name),
            (last_year, operation2.name),
            (current_year, operation2.name),
        ]
        ## Sort by operation_name
        sort_field: Optional[str] = "operation_name"
        sort_order: Optional[str] = "asc"

        sorted_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid,
            5091,
            ReportsPeriod.ALL,
            sort_field,
            sort_order,
            ReportingDashboardReportFilterSchema(reporting_year=last_year),
        ).values()

        assert list(sorted_result.values_list('reporting_year', 'operation_name')) == [
            (last_year, operation1.name),
            (last_year, operation2.name),
        ]

        ## Sort by report_version
        sort_field: Optional[str] = "report_version_id"
        sort_order: Optional[str] = "desc"

        sorted_result = ReportingDashboardService.get_reports_for_reporting_dashboard(
            user.user_guid,
            5091,
            ReportsPeriod.ALL,
            sort_field,
            sort_order,
            ReportingDashboardReportFilterSchema(operation_name=operation2.name),
        ).values()
        testing_version = (
            ReportVersion.objects.filter(report__operation=operation2).order_by('-id').values_list('id', flat=True)
        )

        assert list(sorted_result.values_list('report_version_id', 'operation_name', 'reporting_year')) == [
            (testing_version[0], operation2.name, laster_year),
            (testing_version[1], operation2.name, last_year),
            (testing_version[2], operation2.name, current_year),
        ]
    def test_report_retrieval_after_transfer(self):
        # TODO
        pass
